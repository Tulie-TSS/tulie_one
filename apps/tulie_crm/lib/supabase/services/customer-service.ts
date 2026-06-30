'use server'
import { createClient } from '../server'
import { Customer } from '@/types'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notification-service'
import { logActivity, logDestructiveAction, logStatusChange, logReassign } from './activity-service'

export async function getCustomers(type?: 'individual' | 'business') {
    try {
        const supabase = await createClient()
        let query = supabase
            .from('customers')
            .select('*, assigned_user:users!assigned_to(*), quotations(total_amount, status), contracts(total_amount, status), retail_orders(id, total_amount, paid_amount, payment_status, order_status)')

        if (type) {
            query = query.eq('customer_type', type)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) {
            console.error('[getCustomers] Error fetching customers:', error)
            return []
        }

        // For individual customers, also fetch retail_orders by phone to catch
        // orders that weren't linked via customer_id FK
        const individualCustomers = (data || []).filter((c: any) => c.customer_type === 'individual' && c.phone)
        const phoneNumbers = individualCustomers.map((c: any) => c.phone).filter(Boolean)
        
        let ordersByPhone: Record<string, any[]> = {}
        if (phoneNumbers.length > 0) {
            const { data: phoneOrders } = await supabase
                .from('retail_orders')
                .select('id, customer_phone, total_amount, paid_amount, payment_status, order_status, customer_id')
                .in('customer_phone', phoneNumbers)
            
            if (phoneOrders) {
                for (const order of phoneOrders) {
                    const phone = order.customer_phone
                    if (!ordersByPhone[phone]) ordersByPhone[phone] = []
                    ordersByPhone[phone].push(order)
                }
            }
        }

        const customersWithRevenue = (data || []).map((customer: any) => {
            const quotations = customer.quotations || []
            const contracts = customer.contracts || []
            
            let quotationRevenue = 0
            let actualRevenue = 0
            
            if (customer.customer_type === 'individual') {
                // Merge orders from FK join and phone matching (deduplicate by id)
                const fkOrders = customer.retail_orders || []
                const phoneMatchedOrders = customer.phone ? (ordersByPhone[customer.phone] || []) : []
                
                const mergedOrders = [...fkOrders, ...phoneMatchedOrders]
                const uniqueOrdersMap = new Map()
                mergedOrders.forEach(o => {
                    if (o.id) uniqueOrdersMap.set(o.id, o)
                })
                
                const allOrders = Array.from(uniqueOrdersMap.values())
                
                quotationRevenue = allOrders
                    .filter((o: any) => o.order_status !== 'cancelled')
                    .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0)
                
                actualRevenue = allOrders
                    .filter((o: any) => o.order_status !== 'cancelled')
                    .reduce((sum: number, o: any) => sum + (o.paid_amount || 0), 0)
            } else {
                quotationRevenue = quotations
                    .filter((q: any) => ['sent', 'accepted', 'converted'].includes(q.status))
                    .reduce((sum: number, q: any) => sum + (q.total_amount || 0), 0)
                    
                actualRevenue = contracts
                    .filter((c: any) => ['signed', 'active', 'completed'].includes(c.status))
                    .reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0)
            }
                
            return {
                ...customer,
                quotation_revenue: quotationRevenue,
                actual_revenue: actualRevenue
            }
        })

        return customersWithRevenue as Customer[]
    } catch (err) {
        console.error('[getCustomers] Fatal error:', err)
        return []
    }
}

export async function getCustomerById(id: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('customers')
            .select('*, assigned_user:users!assigned_to(*), quotations(total_amount, status), contracts(total_amount, status), retail_orders(id, total_amount, paid_amount, payment_status, order_status)')
            .eq('id', id)
            .single()

        if (error) {
            console.error('[getCustomerById] Error fetching customer by id:', error)
            return null
        }

        if (data) {
            const quotations = data.quotations || []
            const contracts = data.contracts || []
            
            let quotationRevenue = 0
            let actualRevenue = 0
            
            if (data.customer_type === 'individual') {
                // Also fetch orders by phone to catch unlinked orders
                const fkOrders = data.retail_orders || []
                let allOrders = fkOrders
                
                if (data.phone) {
                    const { data: phoneOrders } = await supabase
                        .from('retail_orders')
                        .select('id, total_amount, paid_amount, payment_status, order_status')
                        .eq('customer_phone', data.phone)
                    
                    if (phoneOrders && phoneOrders.length > 0) {
                        const mergedOrders = [...fkOrders, ...phoneOrders]
                        const uniqueOrdersMap = new Map()
                        mergedOrders.forEach((o: any) => {
                            if (o.id) uniqueOrdersMap.set(o.id, o)
                        })
                        allOrders = Array.from(uniqueOrdersMap.values())
                    }
                }
                
                quotationRevenue = allOrders
                    .filter((o: any) => o.order_status !== 'cancelled')
                    .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0)
                
                actualRevenue = allOrders
                    .filter((o: any) => o.order_status !== 'cancelled')
                    .reduce((sum: number, o: any) => sum + (o.paid_amount || 0), 0)
            } else {
                quotationRevenue = quotations
                    .filter((q: any) => ['sent', 'accepted', 'converted'].includes(q.status))
                    .reduce((sum: number, q: any) => sum + (q.total_amount || 0), 0)
                    
                actualRevenue = contracts
                    .filter((c: any) => ['signed', 'active', 'completed'].includes(c.status))
                    .reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0)
            }
                
            return {
                ...data,
                quotation_revenue: quotationRevenue,
                actual_revenue: actualRevenue
            } as Customer
        }

        return null
    } catch (err) {
        console.error('[getCustomerById] Fatal error:', err)
        return null
    }
}

export async function createCustomer(customer: Partial<Customer>) {
    try {
        const supabase = await createClient()

        const userId = customer.created_by || customer.assigned_to
        if (userId) {
            // Check if user exists in public.users
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('id', userId)
                .single()

            if (!existingUser) {
                // Try to get auth user to sync
                const { data: { user: authUser } } = await supabase.auth.getUser()
                if (authUser && authUser.id === userId) {
                    await supabase.from('users').upsert([{
                        id: authUser.id,
                        email: authUser.email,
                        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
                        role: 'staff',
                        is_active: true
                    }], { onConflict: 'id' })
                }
            }
        }

        const { data, error } = await supabase
            .from('customers')
            .insert([customer])
            .select()

        if (error) {
            console.error('[createCustomer] Insert error:', error)
            throw error
        }

        if (data && data.length > 0) {
            revalidatePath('/customers')

            await logActivity({
                action: 'create',
                entity_type: 'customer',
                entity_id: data[0].id,
                description: `Thêm khách hàng mới: ${data[0].company_name}`
            })

            // Create a notification for the person assigned to the customer
            if (data[0].assigned_to) {
                try {
                    await createNotification({
                        user_id: data[0].assigned_to,
                        type: 'new_customer',
                        title: 'Khách hàng mới',
                        message: `${data[0].company_name} vừa được thêm vào hệ thống`,
                        link: `/customers/${data[0].id}`
                    })
                } catch (notifErr) {
                    console.error('[createCustomer] Notification error:', notifErr)
                }
            }

            return data[0]
        }

        throw new Error('Không có dữ liệu trả về sau khi tạo khách hàng')
    } catch (err: any) {
        console.error('[createCustomer] Fatal error:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi tạo khách hàng')
    }
}

export async function updateCustomer(id: string, customer: Partial<Customer>) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('customers')
            .update(customer)
            .eq('id', id)
            .select()

        if (error) {
            console.error('[updateCustomer] Error:', error)
            throw error
        }

        revalidatePath('/customers')
        revalidatePath(`/customers/${id}`)

        await logActivity({
            action: 'update',
            entity_type: 'customer',
            entity_id: id,
            description: `Cập nhật thông tin khách hàng: ${data[0].company_name}`
        })
        return data[0] as Customer
    } catch (err: any) {
        console.error('[updateCustomer] Fatal error:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi cập nhật khách hàng')
    }
}

export async function deleteCustomer(id: string) {
    try {
        const supabase = await createClient()

        // Get customer name for audit log before deleting
        const { data: customer } = await supabase.from('customers').select('company_name').eq('id', id).single()

        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('[deleteCustomer] Error:', error)
            throw error
        }

        revalidatePath('/customers')
        await logDestructiveAction('customer', id, 'delete', { entity_name: customer?.company_name })
        return true
    } catch (err: any) {
        console.error('[deleteCustomer] Fatal error:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi xóa khách hàng')
    }
}

export async function deleteCustomers(ids: string[]) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('customers')
            .delete()
            .in('id', ids)

        if (error) {
            console.error('[deleteCustomers] Error:', error)
            throw error
        }

        revalidatePath('/customers')
        await logDestructiveAction('customer', ids[0], 'bulk_delete', { affected_count: ids.length })
        return true
    } catch (err: any) {
        console.error('[deleteCustomers] Fatal error:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi xóa nhiều khách hàng')
    }
}

export async function updateCustomersStatus(ids: string[], status: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('customers')
            .update({ status })
            .in('id', ids)

        if (error) {
            console.error('[updateCustomersStatus] Error:', error)
            throw error
        }

        revalidatePath('/customers')
        return true
    } catch (err: any) {
        console.error('[updateCustomersStatus] Fatal error:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi cập nhật trạng thái nhiều khách hàng')
    }
}

export async function reassignCustomers(ids: string[], userId: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('customers')
            .update({ assigned_to: userId })
            .in('id', ids)

        if (error) {
            console.error('[reassignCustomers] Error:', error)
            throw error
        }

        revalidatePath('/customers')
        await logReassign('customer', ids, userId)
        return true
    } catch (err: any) {
        console.error('[reassignCustomers] Fatal error:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi chuyển người phụ trách nhiều khách hàng')
    }
}
