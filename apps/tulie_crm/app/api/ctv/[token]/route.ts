import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter'
import { verifyTurnstile } from '@/lib/security/turnstile'
import { z } from 'zod'

const freelancerInfoSchema = z.object({
    name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(100, 'Tên quá dài'),
    cccd: z.string().min(9, 'Số CCCD/CMND không hợp lệ').max(12, 'Số CCCD/CMND không hợp lệ'),
    cccd_date: z.string().min(6, 'Vui lòng nhập ngày cấp'),
    cccd_place: z.string().min(3, 'Nơi cấp quá ngắn').max(200, 'Nơi cấp quá dài'),
    dob: z.string().min(6, 'Vui lòng nhập ngày sinh'),
    address: z.string().min(5, 'Địa chỉ thường trú quá ngắn (ít nhất 5 ký tự)').max(300, 'Địa chỉ quá dài'),
    contact_address: z.string().max(300).optional(),
    phone: z.string().min(9, 'Số điện thoại không hợp lệ').max(15, 'Số điện thoại không hợp lệ'),
    email: z.string().email('Email không hợp lệ').max(200),
    bank_account: z.string().min(6, 'Số tài khoản không hợp lệ').max(30),
    bank_account_name: z.string().min(2, 'Tên tài khoản không hợp lệ').max(100),
    bank_name: z.string().min(2, 'Vui lòng chọn ngân hàng').max(100),
    turnstile_token: z.string().optional(), // Cloudflare Turnstile bot challenge
})

/**
 * GET /api/ctv/[token]
 * Returns public contract info for the CTV to fill in their details
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params

    try {
        const supabase = createAdminClient()

        const { data: contract, error } = await supabase
            .from('contracts')
            .select(`
                id, title, contract_number, total_amount, category,
                freelancer_metadata, start_date, end_date, status,
                customer:customers(id, company_name)
            `)
            .eq('public_token', token)
            .eq('category', 'freelancer')
            .single()

        if (error || !contract) {
            return NextResponse.json({ error: 'Không tìm thấy hợp đồng' }, { status: 404 })
        }

        // Only allow editing if contract is in draft/active state
        if (contract.status === 'cancelled') {
            return NextResponse.json({ error: 'Hợp đồng đã hủy' }, { status: 403 })
        }

        // Return safe public fields only
        const fMeta = (contract.freelancer_metadata as Record<string, string>) || {}
        return NextResponse.json({
            contract_id: contract.id,
            title: contract.title,
            contract_number: contract.contract_number,
            total_amount: contract.total_amount,
            start_date: contract.start_date,
            end_date: contract.end_date,
            status: contract.status,
            // Pre-filled info if exists
            freelancer_info: {
                name: fMeta.name || '',
                cccd: fMeta.cccd || '',
                cccd_date: fMeta.cccd_date || '',
                cccd_place: fMeta.cccd_place || '',
                dob: fMeta.dob || '',
                address: fMeta.address || '',
                contact_address: fMeta.contact_address || '',
                phone: fMeta.phone || '',
                email: fMeta.email || '',
                bank_account: fMeta.bank_account || '',
                bank_account_name: fMeta.bank_account_name || '',
                bank_name: fMeta.bank_name || '',
            },
            is_submitted: !!(fMeta.name && fMeta.cccd && fMeta.bank_account),
        })
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * POST /api/ctv/[token]
 * Freelancer submits their personal info to fill the contract
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params

    try {
        // Rate limit: 5 submissions per 10 minutes per IP
        const clientIp = getClientIp(request)
        const rateLimitResult = await checkRateLimit(clientIp, {
            maxRequests: 5,
            windowSeconds: 600,
            keyPrefix: 'ctv:submit',
        })
        if (rateLimitResult) return rateLimitResult

        const body = await request.json()

        // Turnstile bot verification (skipped if TURNSTILE_SECRET_KEY not configured)
        const turnstileResult = await verifyTurnstile(body?.turnstile_token)
        if (!turnstileResult.success) {
            return NextResponse.json({ error: turnstileResult.error }, { status: 400 })
        }

        // Validate input
        const parsed = freelancerInfoSchema.safeParse(body)
        if (!parsed.success) {
            const firstError = parsed.error.issues[0]
            return NextResponse.json(
                { error: firstError?.message || 'Dữ liệu không hợp lệ' },
                { status: 400 }
            )
        }

        const data = parsed.data
        const supabase = createAdminClient()

        // Verify token belongs to a freelancer contract
        const { data: contract, error } = await supabase
            .from('contracts')
            .select('id, status, category, freelancer_metadata')
            .eq('public_token', token)
            .eq('category', 'freelancer')
            .single()

        if (error || !contract) {
            return NextResponse.json({ error: 'Hợp đồng không tồn tại hoặc không hợp lệ' }, { status: 404 })
        }

        if (contract.status === 'cancelled') {
            return NextResponse.json({ error: 'Hợp đồng đã hủy, không thể cập nhật' }, { status: 403 })
        }

        // Merge with existing metadata (don't overwrite admin-set fields like deposit_percent, project_name)
        const existingMeta = (contract.freelancer_metadata as Record<string, unknown>) || {}
        const updatedMeta = {
            ...existingMeta,
            name: data.name,
            cccd: data.cccd,
            cccd_date: data.cccd_date,
            cccd_place: data.cccd_place,
            dob: data.dob,
            address: data.address,
            contact_address: data.contact_address || data.address,
            phone: data.phone,
            email: data.email,
            bank_account: data.bank_account,
            bank_account_name: data.bank_account_name,
            bank_name: data.bank_name,
            submitted_at: new Date().toISOString(),
        }

        const { error: updateError } = await supabase
            .from('contracts')
            .update({ freelancer_metadata: updatedMeta })
            .eq('id', contract.id)

        if (updateError) {
            console.error('[CTV Submit] Update error:', updateError)
            return NextResponse.json({ error: 'Không thể lưu thông tin' }, { status: 500 })
        }

        // Regenerate contract documents with new info
        try {
            const { generateDocumentBundle } = await import('@/lib/supabase/services/document-template-service')
            await generateDocumentBundle(contract.id)
        } catch (genErr) {
            console.error('[CTV Submit] Document regeneration failed:', genErr)
            // Don't fail the response — data is saved, documents regenerate on next view
        }

        return NextResponse.json({ success: true, message: 'Thông tin đã được lưu thành công' })
    } catch (err: any) {
        console.error('[CTV Submit] Error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
