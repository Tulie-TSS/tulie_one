'use server'

import { createClient } from '../server'
import { Contract, ContractMilestone } from '@/types'
import { revalidatePath } from 'next/cache'
import { logActivity, logDestructiveAction } from './activity-service'
import { generateDocumentBundle } from './document-template-service'
import { notifyContractCreated, notifyContractStatusChanged, notifyContractSigned, notifyMilestonePaymentConfirmed } from './notification-service'
import { v4 as uuidv4 } from 'uuid'

export async function getContracts(customerId?: string, type?: string, brand?: string, category?: string) {
    try {
        const supabase = await createClient()
        let query = supabase
            .from('contracts')
            .select('*, customer:customers(id, company_name)')
            .order('created_at', { ascending: false })

        if (customerId) {
            query = query.eq('customer_id', customerId)
        }

        if (type) {
            query = query.eq('type', type)
        }

        if (brand) {
            query = query.eq('brand', brand)
        }

        if (category) {
            query = query.eq('category', category)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching contracts:', error)
            return []
        }

        return data as Contract[]
    } catch (err) {
        console.error('Fatal error in getContracts:', err)
        return []
    }
}

export async function getContractById(id: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('contracts')
            .select('*, customer:customers!customer_id(*), creator:users(*), milestones:contract_milestones(*), quotation:quotations(id, quotation_number, deal_id, type)')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching contract by id:', error)
            return null
        }

        return data as Contract
    } catch (err) {
        console.error('Fatal error in getContractById:', err)
        return null
    }
}

export async function createContract(contract: Partial<Contract>, milestones: Partial<ContractMilestone>[]) {
    const supabase = await createClient()

    // Auto-snapshot customer info if customer_id is provided and no snapshot exists
    if (contract.customer_id && !contract.customer_snapshot) {
        const { data: custData } = await supabase
            .from('customers')
            .select('company_name, tax_code, email, phone, address, invoice_address, representative, position')
            .eq('id', contract.customer_id)
            .single()
        if (custData) {
            contract.customer_snapshot = custData
        }
    }

    if (!contract.created_by) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            contract.created_by = user.id
        }
    }

    if (!contract.type) {
        contract.type = 'contract'
    }

    // Try to get brand if missing
    if (!contract.brand && contract.customer_id) {
        const { data: custData } = await supabase.from('customers').select('brand').eq('id', contract.customer_id).single()
        if (custData && custData.brand) {
            contract.brand = custData.brand
        }
    }

    // Auto-generate contract_number server-side if client did not provide one
    // Uses DB count to ensure uniqueness — safer than Math.random() on client
    if (!contract.contract_number) {
        const year = new Date().getFullYear()
        const { count } = await supabase
            .from('contracts')
            .select('id', { count: 'exact', head: true })
            .eq('type', contract.type || 'contract')
        const nextNum = ((count || 0) + 1).toString().padStart(3, '0')
        contract.contract_number = `HD-${year}-${nextNum}`
    }

    // Generate public_token
    const publicToken = 'ct_' + uuidv4().replace(/-/g, '')
    
    // 1. Insert contract
    const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .insert([{ ...contract, public_token: publicToken }])
        .select()
        .single()

    if (contractError) {
        console.error('Error creating contract:', contractError)
        throw contractError
    }

    // 2. Insert milestones
    if (milestones && milestones.length > 0) {
        const contractMilestones = milestones.map(m => ({
            ...m,
            contract_id: contractData.id
        }))

        const { error: milestoneError } = await supabase
            .from('contract_milestones')
            .insert(contractMilestones)

        if (milestoneError) {
            console.error('Error creating milestones:', milestoneError)
            throw milestoneError
        }
    }

    // 3. Auto-link work items: if contract was created from a quotation,
    // update any work items that reference that quotation to also point to this contract
    if (contract.quotation_id) {
        await supabase
            .from('project_work_items')
            .update({ contract_id: contractData.id })
            .eq('quotation_id', contract.quotation_id)
            .is('contract_id', null)
    }

    revalidatePath('/contracts')

    await logActivity({
        action: 'create',
        entity_type: contract.type || 'contract',
        entity_id: contractData.id,
        description: `Tạo hợp đồng mới: ${contract.title}`
    })

    // In-app notification
    if (contractData.created_by) {
        notifyContractCreated({
            ...contractData,
            customer: contract.customer_snapshot ? { company_name: (contract.customer_snapshot as any).company_name } : null,
        }).catch(() => {})
    }

    // 4. Auto-generate document bundle (fire-and-forget)
    generateDocumentBundle(contractData.id).catch(err => {
        console.error('Error auto-generating document bundle:', err)
    })

    return contractData
}

export async function updateContract(id: string, contract: Partial<Contract>, milestones: Partial<ContractMilestone>[]): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient()

        // Strip undefined values from payload (Supabase + Next.js Server Actions can't handle undefined)
        const cleanContract = Object.fromEntries(
            Object.entries(contract).filter(([_, v]) => v !== undefined)
        )

        // Get current contract for status change detection
        const { data: currentContract } = await supabase
            .from('contracts')
            .select('status, created_by, contract_number, title, signed_date')
            .eq('id', id)
            .single()

        // Auto-promote contract status to 'active' if there is any completed milestone
        const hasCompletedMilestone = milestones?.some(m => m.status === 'completed')
        if (hasCompletedMilestone) {
            const targetStatus = cleanContract.status || currentContract?.status
            if (targetStatus === 'draft' || targetStatus === 'sent' || targetStatus === 'viewed') {
                cleanContract.status = 'active'
            }
            if (!cleanContract.signed_date && !currentContract?.signed_date) {
                cleanContract.signed_date = new Date().toISOString().split('T')[0]
            }
        }

        // 1. Update contract
        const { error: contractError } = await supabase
            .from('contracts')
            .update(cleanContract)
            .eq('id', id)

        if (contractError) {
            console.error('Error updating contract:', contractError)
            return { success: false, error: contractError.message }
        }

        // 2. Manage milestones
        if (milestones) {
            // Get current milestones to identify which ones to delete
            const { data: currentMilestones } = await supabase
                .from('contract_milestones')
                .select('id')
                .eq('contract_id', id)
            
            const currentIds = currentMilestones?.map(m => m.id) || []
            const newIds = milestones.map(m => m.id).filter(mid => mid && !mid.startsWith('temp-'))
            
            // Delete milestones that are removed
            const idsToDelete = currentIds.filter(cid => !newIds.includes(cid))
            if (idsToDelete.length > 0) {
                const { error: deleteError } = await supabase
                    .from('contract_milestones')
                    .delete()
                    .in('id', idsToDelete)
                if (deleteError) console.error('Error deleting removed milestones:', deleteError)
            }

            if (milestones.length > 0) {
                // Separate new vs existing milestones
                const existingMilestones: Record<string, any>[] = []
                const newMilestones: Record<string, any>[] = []

                for (const m of milestones) {
                    const row: Record<string, any> = {
                        contract_id: id,
                        name: m.name || '',
                        amount: m.amount || 0,
                        status: m.status || 'pending',
                        type: m.type || 'payment',
                        percentage: m.percentage || null,
                        due_date: m.due_date || null,
                        completed_at: m.completed_at || null,
                        delay_reason: m.delay_reason || null,
                        description: m.description || null,
                    }
                    if (m.id && !m.id.startsWith('temp-')) {
                        row.id = m.id
                        existingMilestones.push(row)
                    } else {
                        newMilestones.push(row)
                    }
                }

                // Update existing milestones
                if (existingMilestones.length > 0) {
                    const { error: upsertError } = await supabase
                        .from('contract_milestones')
                        .upsert(existingMilestones, { onConflict: 'id' })
                    if (upsertError) {
                        console.error('Error updating milestones:', upsertError)
                        return { success: false, error: upsertError.message }
                    }
                }

                // Insert new milestones (let DB generate UUID)
                if (newMilestones.length > 0) {
                    const { error: insertError } = await supabase
                        .from('contract_milestones')
                        .insert(newMilestones)
                    if (insertError) {
                        console.error('Error inserting new milestones:', insertError)
                        return { success: false, error: insertError.message }
                    }
                }

                // 3. Auto-sync: link payment milestones to the project (for customer portal)
                const { data: linkedProject } = await supabase
                    .from('projects')
                    .select('id')
                    .eq('contract_id', id)
                    .maybeSingle()

                if (linkedProject) {
                    await supabase
                        .from('contract_milestones')
                        .update({ project_id: linkedProject.id })
                        .eq('contract_id', id)
                        .eq('type', 'payment')
                }
            }
        }

        revalidatePath('/contracts')
        revalidatePath(`/contracts/${id}`)
        revalidatePath(`/contracts/${id}/edit`)

        try {
            await logActivity({
                action: 'update',
                entity_type: 'contract',
                entity_id: id,
                description: `Cập nhật hợp đồng: ${contract.title || id}`
            })
        } catch (logErr) {
            // Don't fail the whole save if logging fails
            console.error('Error logging activity:', logErr)
        }

        // Notify on status changes
        if (cleanContract.status && currentContract && cleanContract.status !== currentContract.status) {
            const contractForNotify = {
                id,
                contract_number: contract.contract_number || currentContract.contract_number,
                title: contract.title || currentContract.title,
                created_by: currentContract.created_by || '',
            }
            if (cleanContract.status === 'signed') {
                notifyContractSigned(contractForNotify as any).catch(() => {})
            } else {
                notifyContractStatusChanged(contractForNotify, currentContract.status, cleanContract.status as string).catch(() => {})
            }
        }

        // Auto-regenerate document bundle (all draft docs)
        generateDocumentBundle(id).catch(err => {
            console.error('Error regenerating document bundle:', err)
        })

        return { success: true }
    } catch (err: any) {
        console.error('Fatal error in updateContract:', err)
        return { success: false, error: err.message || 'Lỗi hệ thống khi cập nhật hợp đồng' }
    }
}

export async function deleteContract(id: string) {
    try {
        const supabase = await createClient()

        // 1. Find linked quotation and reset its status
        const { data: contract } = await supabase
            .from('contracts')
            .select('quotation_id')
            .eq('id', id)
            .single()

        // 2. Delete the contract
        const { error } = await supabase
            .from('contracts')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting contract:', error)
            throw error
        }

        // 3. Reset quotation status so it can be re-converted
        if (contract?.quotation_id) {
            await supabase
                .from('quotations')
                .update({ status: 'accepted' })
                .eq('id', contract.quotation_id)
                .eq('status', 'converted')
            revalidatePath('/quotations')
        }

        revalidatePath('/contracts')
        await logDestructiveAction('contract', id, 'delete')
        return true
    } catch (err: any) {
        console.error('Fatal error in deleteContract:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi xóa hợp đồng')
    }
}

export async function deleteContracts(ids: string[]) {
    try {
        const supabase = await createClient()

        // 1. Find linked quotations before deletion
        const { data: contracts } = await supabase
            .from('contracts')
            .select('quotation_id')
            .in('id', ids)
        const quotationIds = (contracts || [])
            .map(c => c.quotation_id)
            .filter(Boolean) as string[]

        // 2. Delete contracts
        const { error } = await supabase
            .from('contracts')
            .delete()
            .in('id', ids)

        if (error) {
            console.error('Error deleting contracts:', error)
            throw error
        }

        // 3. Reset linked quotation statuses
        if (quotationIds.length > 0) {
            await supabase
                .from('quotations')
                .update({ status: 'accepted' })
                .in('id', quotationIds)
                .eq('status', 'converted')
            revalidatePath('/quotations')
        }

        revalidatePath('/contracts')
        await logDestructiveAction('contract', ids[0], 'bulk_delete', { affected_count: ids.length })
        return true
    } catch (err: any) {
        console.error('Fatal error in deleteContracts:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi xóa nhiều hợp đồng')
    }
}
export async function convertQuotationToOrder(quotationId: string, type: 'contract' | 'order' = 'order') {
    try {
        const supabase = await createClient()

        // 1. Get quotation details
        const { data: quotation, error: qError } = await supabase
            .from('quotations')
            .select('*, customer:customers!customer_id(*), items:quotation_items(*)')
            .eq('id', quotationId)
            .single()

        if (qError) {
            console.error('Error fetching quotation for conversion:', qError)
            throw new Error('Lỗi truy vấn báo giá: ' + qError.message)
        }
        if (!quotation) {
            throw new Error('Không tìm thấy báo giá (dữ liệu rỗng)')
        }
        // Guard: check if quotation is already converted and has a contract
        if (quotation.status === 'converted') {
            // Check if there's still a linked contract
            const { count } = await supabase
                .from('contracts')
                .select('id', { count: 'exact', head: true })
                .eq('quotation_id', quotationId)
            if (count && count > 0) {
                throw new Error('Báo giá này đã được chuyển thành hợp đồng/đơn hàng. Xóa hợp đồng cũ trước khi tạo mới.')
            }
            // If no contract exists (was deleted), reset status so conversion can proceed
            await supabase.from('quotations').update({ status: 'accepted' }).eq('id', quotationId)
        }

        // 2. Generate number — use yyyymmdd/HDKT-TL-XXX if abbreviation exists
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
        const customerAbbr = quotation.customer?.abbreviation || ''
        let formattedNum: string
        if (customerAbbr) {
            const typePrefix = type === 'order' ? 'DH' : 'HDKT'
            formattedNum = `${dateStr}/${typePrefix}-TL-${customerAbbr.toUpperCase()}`
        } else {
            const prefix = type === 'order' ? 'DH' : 'HD'
            const countRes = await supabase.from('contracts').select('id', { count: 'exact', head: true }).eq('type', type)
            const nextNum = (countRes.count || 0) + 1
            formattedNum = `${prefix}-${dateStr}-${nextNum.toString().padStart(3, '0')}`
        }

        // 3. Snapshot customer info from quotation join
        const customerSnapshot = quotation.customer ? {
            company_name: quotation.customer.company_name,
            tax_code: quotation.customer.tax_code,
            email: quotation.customer.email,
            phone: quotation.customer.phone,
            address: quotation.customer.address,
            invoice_address: quotation.customer.invoice_address,
            representative: quotation.customer.representative,
            position: quotation.customer.position,
        } : null

        const authUserResponse = await supabase.auth.getUser()
        const authUser = authUserResponse.data.user

        const contractPayload: any = {
            contract_number: formattedNum,
            customer_id: quotation.customer_id,
            quotation_id: quotation.id,
            title: quotation.title || `Đơn hàng từ ${quotation.quotation_number}`,
            total_amount: quotation.total_amount,
            status: 'draft',
            type: type,
            start_date: new Date().toISOString().split('T')[0],
            terms: quotation.terms,
            created_by: authUser?.id || undefined,
            brand: quotation.brand,
            project_id: quotation.project_id,
            customer_snapshot: customerSnapshot,
            vat_exempt_status: quotation.vat_exempt_status || quotation.proposal_content?.vat_exempt_status || null,
            product_name_in_contract: quotation.product_name_in_contract || quotation.proposal_content?.product_name_in_contract || null,
            public_token: 'ct_' + uuidv4().replace(/-/g, '')
        }

        if (type === 'order') {
            contractPayload.order_number = formattedNum
        }

        const { data: contract, error: cError } = await supabase
            .from('contracts')
            .insert([contractPayload])
            .select()
            .single()

        if (cError) throw cError

        // 4. Create default milestones if it's an order
        const defaultMilestones = [
            { name: 'Khởi tạo & Xác nhận', description: 'Tiếp nhận đơn hàng và chuẩn bị triển khai', due_date: new Date().toISOString(), status: 'completed', type: 'work', amount: 0 },
            { name: 'Triển khai thực tế', description: 'Quá trình thực hiện dịch vụ/sản phẩm', due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending', type: 'work', amount: 0 },
            { name: 'Nghiệm thu & Bàn giao', description: 'Hoàn thiện và gửi kết quả cho khách hàng', due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending', type: 'work', amount: 0 }
        ]

        await supabase.from('contract_milestones').insert(
            defaultMilestones.map(m => ({ ...m, contract_id: contract.id }))
        )

        // 5. Create or Link Project
        if (quotation.project_id) {
            // Project already exists, just make sure contract is linked (done above in insert)
            // Optionally update project milestones or metadata if needed
        } else {
            // Create Project automatically
            const { data: project, error: pError } = await supabase.from('projects').insert([{
                contract_id: contract.id,
                customer_id: quotation.customer_id,
                title: `Dự án: ${contract.title}`,
                description: `Dự án triển khai từ ${type === 'order' ? 'đơn hàng' : 'hợp đồng'} ${contract.contract_number}`,
                status: 'todo',
                start_date: contract.start_date,
                assigned_to: contract.created_by,
                brand: quotation.brand,
                metadata: {
                    quotation_number: quotation.quotation_number,
                    source_link: '',
                    hosting_info: '',
                    domain_info: '',
                    ai_folder_link: ''
                }
            }]).select().single()

            if (!pError && project) {
                // Link quotation and contract to the new project
                await supabase.from('quotations').update({ project_id: project.id }).eq('id', quotation.id)
                await supabase.from('contracts').update({ project_id: project.id }).eq('id', contract.id)

                // Sync payment milestones to project for customer portal
                await supabase
                    .from('contract_milestones')
                    .update({ project_id: project.id })
                    .eq('contract_id', contract.id)
                    .eq('type', 'payment')
            }
        }

        // 6. Update quotation status
        await supabase.from('quotations').update({ status: 'converted' }).eq('id', quotationId)

        // 7. If linked to a deal, update deal status to closed_won
        if (quotation.deal_id) {
            await supabase.from('deals').update({ status: 'closed_won' }).eq('id', quotation.deal_id)
        }

        revalidatePath('/quotations')
        revalidatePath('/contracts')
        revalidatePath('/projects')
        revalidatePath('/deals')

        await logActivity({
            action: 'convert',
            entity_type: type,
            entity_id: contract.id,
            description: `Chuyển đổi báo giá ${quotation.quotation_number} thành ${type === 'order' ? 'đơn hàng' : 'hợp đồng'} ${contract.contract_number}`
        })

        // In-app notification
        if (authUser?.id) {
            notifyContractCreated({
                id: contract.id,
                contract_number: contract.contract_number,
                title: contract.title,
                customer: quotation.customer ? { company_name: quotation.customer.company_name } : null,
                created_by: authUser.id,
                total_amount: contract.total_amount,
            }).catch(() => {})
        }

        // 8. Auto-generate document bundle (fire-and-forget)
        generateDocumentBundle(contract.id).catch(err => {
            console.error('Error auto-generating document bundle in convertQuotationToOrder:', err)
        })

        return { success: true, id: contract.id }
    } catch (err: any) {
        console.error('Conversion error:', err)
        return { success: false, error: err.message }
    }
}
/**
 * Confirm a milestone payment: marks milestone as completed,
 * auto-creates an output invoice, and records full payment.
 * This ensures the amount is counted in dashboard revenue.
 */
export async function confirmMilestonePayment(
    milestoneId: string,
    options?: { payment_date?: string; notes?: string }
): Promise<{ success: boolean; invoice_id?: string; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // 1. Get milestone with contract info
        const { data: milestone, error: msError } = await supabase
            .from('contract_milestones')
            .select('*, contract:contracts(id, contract_number, customer_id, brand, title, total_amount)')
            .eq('id', milestoneId)
            .single()

        if (msError || !milestone) {
            return { success: false, error: 'Không tìm thấy milestone' }
        }

        if (milestone.status === 'completed') {
            return { success: false, error: 'Milestone này đã được xác nhận thanh toán' }
        }

        const contract = milestone.contract as any
        if (!contract) {
            return { success: false, error: 'Milestone không liên kết với hợp đồng' }
        }

        const paymentDate = options?.payment_date || new Date().toISOString()

        // 2. Update milestone status to completed
        const { error: updateMsError } = await supabase
            .from('contract_milestones')
            .update({
                status: 'completed',
                completed_at: paymentDate
            })
            .eq('id', milestoneId)

        if (updateMsError) {
            return { success: false, error: updateMsError.message }
        }

        // Auto-transition contract status to 'active' when a milestone is paid/completed
        const { data: currentContract } = await supabase
            .from('contracts')
            .select('status, signed_date')
            .eq('id', contract.id)
            .single()

        if (currentContract) {
            const updates: any = {}
            if (['draft', 'sent', 'viewed'].includes(currentContract.status)) {
                updates.status = 'active'
            }
            if (!currentContract.signed_date) {
                updates.signed_date = new Date(paymentDate).toISOString().split('T')[0]
            }
            if (Object.keys(updates).length > 0) {
                await supabase
                    .from('contracts')
                    .update(updates)
                    .eq('id', contract.id)
            }
        }

        // 3. Auto-create output invoice
        const dateStr = new Date(paymentDate).toISOString().slice(0, 10).replace(/-/g, '')
        const { count: invoiceCount } = await supabase
            .from('invoices')
            .select('id', { count: 'exact', head: true })

        const invoiceNumber = `HD-${dateStr}-${((invoiceCount || 0) + 1).toString().padStart(3, '0')}`
        const milestoneAmount = milestone.amount || 0

        const { data: invoice, error: invError } = await supabase
            .from('invoices')
            .insert([{
                invoice_number: invoiceNumber,
                type: 'output',
                contract_id: contract.id,
                project_id: milestone.project_id || null,
                customer_id: contract.customer_id,
                created_by: user?.id,
                status: 'paid',
                issue_date: paymentDate,
                due_date: paymentDate,
                subtotal: milestoneAmount,
                vat_percent: 0,
                vat_amount: 0,
                total_amount: milestoneAmount,
                paid_amount: milestoneAmount,
                notes: options?.notes || `Thanh toán milestone: ${milestone.name}`,
                brand: contract.brand,
            }])
            .select()
            .single()

        if (invError) {
            // Rollback milestone status
            await supabase
                .from('contract_milestones')
                .update({ status: 'pending', completed_at: null })
                .eq('id', milestoneId)
            return { success: false, error: `Lỗi tạo hóa đơn: ${invError.message}` }
        }

        // 4. Record payment entry
        await supabase.from('invoice_payments').insert([{
            invoice_id: invoice.id,
            amount: milestoneAmount,
            payment_date: paymentDate,
            payment_method: 'Bank Transfer',
            notes: options?.notes || `Milestone: ${milestone.name}`,
            created_by: user?.id
        }])

        // 5. Log activity
        await logActivity({
            action: 'confirm_payment',
            entity_type: 'contract',
            entity_id: contract.id,
            description: `Xác nhận thanh toán milestone "${milestone.name}" — ${milestoneAmount.toLocaleString()}đ → Hóa đơn ${invoiceNumber}`
        })

        // 6. Telegram notification
        try {
            const { sendTelegramNotification } = await import('./telegram-service')
            const message = `<b>💰 XÁC NHẬN THANH TOÁN</b>\n━━━━━━━━━━━━━━━━━━\n📋 HĐ: <b>${contract.contract_number}</b>\n📌 Milestone: <b>${milestone.name}</b>\n💵 Số tiền: <b>${milestoneAmount.toLocaleString()}đ</b>\n🧾 Hóa đơn: <b>${invoiceNumber}</b>\n━━━━━━━━━━━━━━━━━━\n<i>Đã ghi nhận vào doanh thu.</i>`
            await sendTelegramNotification(message, 'notify_b2b_payment')
        } catch {}

        // In-app notification for milestone payment
        if (user?.id) {
            notifyMilestonePaymentConfirmed(
                user.id,
                { name: milestone.name, amount: milestoneAmount },
                { id: contract.id, contract_number: contract.contract_number }
            ).catch(() => {})
        }

        revalidatePath('/contracts')
        revalidatePath(`/contracts/${contract.id}`)
        revalidatePath('/invoices')
        revalidatePath('/dashboard')

        return { success: true, invoice_id: invoice.id }
    } catch (err: any) {
        console.error('Error in confirmMilestonePayment:', err)
        return { success: false, error: err.message || 'Lỗi hệ thống' }
    }
}

export async function getAcceptanceReportsByProjectId(projectId: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('acceptance_reports')
            .select(`
                *,
                created_by_user:users!created_by(full_name),
                contract:contracts(contract_number)
            `)
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    } catch (err) {
        console.error('Error fetching acceptance reports:', err)
        return []
    }
}

export async function getUniqueFreelancers() {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('contracts')
            .select('freelancer_metadata')
            .eq('category', 'freelancer')
            .not('freelancer_metadata', 'is', null)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching freelancers:', error)
            return []
        }

        const freelancersMap = new Map()
        data?.forEach(item => {
            const meta = item.freelancer_metadata as any
            if (!meta) return

            // Key by email or phone
            const key = meta.email || meta.phone
            if (key && !freelancersMap.has(key)) {
                freelancersMap.set(key, {
                    name: meta.name || '',
                    email: meta.email || '',
                    phone: meta.phone || '',
                    cccd: meta.cccd || '',
                    bank_name: meta.bank_name || '',
                    bank_account: meta.bank_account || '',
                    address: meta.address || '',
                })
            }
        })

        return Array.from(freelancersMap.values())
    } catch (err) {
        console.error('Fatal error in getUniqueFreelancers:', err)
        return []
    }
}
