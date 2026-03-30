import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter'
import { sanitizeText } from '@/lib/security/sanitize'
import { validateBody, createPartnerRegistrationSchema } from '@/lib/security/validation'
import { sendTelegramNotification, formatNewPartnerRegistration } from '@/lib/supabase/services/telegram-service'

const ALLOWED_ORIGINS = [
    'https://tulie.app',
    'https://www.tulie.app',
    'https://tulie.agency',
    'https://www.tulie.agency',
    'https://hoptac.tulie.agency',
    'https://affiliate.tulie.agency',
    'http://localhost:3000',
    'http://localhost:3001',
]

function getCorsHeaders(req: Request) {
    const origin = req.headers.get('origin') || ''
    const isAllowed = ALLOWED_ORIGINS.includes(origin)
    return {
        'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    }
}

/**
 * OPTIONS /api/partner-register — CORS preflight
 */
export async function OPTIONS(req: Request) {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) })
}

/**
 * POST /api/partner-register — Public endpoint for partner registration form
 */
export async function POST(req: Request) {
    try {
        // Rate limit: 3 submissions per minute per IP
        const ip = getClientIp(req)
        const rateLimitResult = await checkRateLimit(ip, {
            maxRequests: 3,
            windowSeconds: 60,
            keyPrefix: 'partner-register:post',
        })
        if (rateLimitResult instanceof NextResponse) {
            const headers = new Headers(rateLimitResult.headers)
            const corsHeaders = getCorsHeaders(req)
            for (const [key, value] of Object.entries(corsHeaders)) {
                headers.set(key, value)
            }
            return new NextResponse(rateLimitResult.body, {
                status: rateLimitResult.status,
                headers
            })
        }

        const raw = await req.json()
        const validation = validateBody(raw, createPartnerRegistrationSchema)
        if (!validation.success) {
            return NextResponse.json({ error: validation.error }, { status: 400, headers: getCorsHeaders(req) })
        }
        
        const data = validation.data

        // Additional sanitization
        const cleanName = sanitizeText(data.full_name, 200)

        // SECURITY: Use admin client for public form inserts
        const supabase = createAdminClient()

        const { data: insertedData, error } = await supabase
            .from('partner_registrations')
            .insert({
                full_name: cleanName,
                phone: data.phone,
                email: data.email ? sanitizeText(data.email, 320) : null,
                address: data.address ? sanitizeText(data.address, 500) : null,
                
                id_card_type: data.id_card_type,
                id_card_front_url: data.id_card_front_url || null,
                id_card_back_url: data.id_card_back_url || null,
                id_card_pdf_url: data.id_card_pdf_url || null,
                
                bank_account_number: data.bank_account_number ? sanitizeText(data.bank_account_number, 30) : null,
                bank_account_name: data.bank_account_name ? sanitizeText(data.bank_account_name, 200) : null,
                bank_name: data.bank_name ? sanitizeText(data.bank_name, 200) : null,
                
                preferred_role: data.preferred_role,
                experience: data.experience ? sanitizeText(data.experience, 2000) : null,
                referral_source: data.referral_source ? sanitizeText(data.referral_source, 200) : null,
                note: data.note ? sanitizeText(data.note, 2000) : null,
                
                status: 'pending'
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating partner registration:', error)
            return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500, headers: getCorsHeaders(req) })
        }

        // Send Telegram notification
        try {
            const msg = await formatNewPartnerRegistration(insertedData)
            await sendTelegramNotification(msg)
        } catch (err) {
            console.error('Telegram error:', err)
        }

        return NextResponse.json({ success: true, data: insertedData }, { headers: getCorsHeaders(req) })
    } catch (error: any) {
        console.error('Partner register API error:', error)
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500, headers: getCorsHeaders(req) })
    }
}
