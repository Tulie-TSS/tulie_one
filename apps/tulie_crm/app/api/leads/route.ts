import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, isAuthError } from '@/lib/security/auth-guard'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter'
import { sanitizeText, isValidEmail, isValidPhone } from '@/lib/security/sanitize'
import { validateBody, createLeadSchema, updateLeadSchema } from '@/lib/security/validation'
import { applyScopeFilter } from '@/lib/security/permissions'
import { sendTelegramNotification, formatNewLead } from '@/lib/supabase/services/telegram-service'

// CORS: Allow landing page form submissions from tulie.app (and legacy tulie.agency)
const ALLOWED_ORIGINS = [
    'https://tulie.app',
    'https://www.tulie.app',
    'https://tulie.agency',
    'https://www.tulie.agency',
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
 * OPTIONS /api/leads — CORS preflight
 */
export async function OPTIONS(req: Request) {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) })
}


/**
 * POST /api/leads — Public endpoint for landing page form
 * Rate limited to prevent spam
 */
export async function POST(req: Request) {
    try {
        // Rate limit: 5 submissions per minute per IP
        const ip = getClientIp(req)
        const rateLimitResult = await checkRateLimit(ip, {
            maxRequests: 5,
            windowSeconds: 60,
            keyPrefix: 'leads:post',
        })
        if (rateLimitResult) return rateLimitResult

        const raw = await req.json()
        const validation = validateBody(raw, createLeadSchema)
        if (!validation.success) {
            return NextResponse.json({ error: validation.error }, { status: 400 })
        }
        const { full_name, company_name, phone, email, business_type, message, source } = validation.data

        // Additional sanitization
        const cleanName = sanitizeText(full_name, 200)
        const cleanPhone = sanitizeText(phone, 20)

        // SECURITY: Use admin client for public form inserts (no user session available)
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('leads')
            .insert({
                full_name: cleanName,
                company_name: sanitizeText(company_name || '', 200) || null,
                phone: cleanPhone,
                email: email ? sanitizeText(email, 320) : null,
                business_type: sanitizeText(business_type || '', 100) || null,
                message: sanitizeText(message || '', 2000) || null,
                status: 'new',
                source: source,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating lead:', error)
            return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500, headers: getCorsHeaders(req) })
        }

        // Send Telegram notification synchronously or using waitUntil to prevent 
        // Vercel from killing the process before the request finishes.
        try {
            const msg = await formatNewLead(data)
            await sendTelegramNotification(msg)
        } catch (err) {
            console.error('Telegram error:', err)
        }

        return NextResponse.json({ success: true, data }, { headers: getCorsHeaders(req) })
    } catch (error: any) {
        console.error('Lead API error:', error)
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500, headers: getCorsHeaders(req) })
    }
}

/**
 * GET /api/leads — Authenticated endpoint for listing leads
 * Data scoped by role (admin=all, leader=team, staff=own)
 */
export async function GET() {
    try {
        const authResult = await requirePermission('leads', 'view')
        if (isAuthError(authResult)) return authResult

        const { supabase, user, teamMemberIds } = authResult

        let query = supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false })

        query = applyScopeFilter(query, user, 'leads', teamMemberIds)

        const { data, error } = await query

        if (error) {
            console.error('Error fetching leads:', error)
            return NextResponse.json([], { status: 500 })
        }

        return NextResponse.json(data || [])
    } catch (error: any) {
        console.error('Lead API error:', error)
        return NextResponse.json([], { status: 500 })
    }
}

/**
 * PATCH /api/leads — Authenticated endpoint for updating leads
 * Requires 'edit' permission on leads resource
 */
export async function PATCH(req: Request) {
    try {
        const authResult = await requirePermission('leads', 'edit')
        if (isAuthError(authResult)) return authResult

        const { supabase, user } = authResult

        const raw = await req.json()
        const validation = validateBody(raw, updateLeadSchema)
        if (!validation.success) {
            return NextResponse.json({ error: validation.error }, { status: 400 })
        }
        const { id, status, notes } = validation.data

        const updates: Record<string, any> = { updated_at: new Date().toISOString() }
        if (status) updates.status = status
        if (notes !== undefined) updates.notes = sanitizeText(notes, 5000)

        const { data, error } = await supabase
            .from('leads')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating lead:', error)
            return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
        }

        // --- Lead Conversion Logic ---
        if (status === 'converted' && data) {
            try {
                // 1. Check if customer exists by phone
                const { data: existingCust } = await supabase
                    .from('customers')
                    .select('id')
                    .eq('phone', data.phone)
                    .single()
                
                let customerId = existingCust?.id
                
                // 2. Create customer if not exists
                if (!customerId) {
                    const { data: newCust, error: custErr } = await supabase
                        .from('customers')
                        .insert({
                            company_name: data.company_name || data.full_name,
                            phone: data.phone,
                            email: data.email,
                            representative: data.full_name,
                            industry: data.business_type,
                            customer_type: data.company_name ? 'business' : 'individual',
                            status: 'lead',
                            created_by: user.id,
                            assigned_to: user.id
                        })
                        .select()
                        .single()
                        
                    if (!custErr && newCust) {
                        customerId = newCust.id
                    }
                }
                
                // 3. Create a deal (opportunity)
                if (customerId) {
                    await supabase
                        .from('deals')
                        .insert({
                            title: `Cơ hội từ Lead: ${data.company_name || data.full_name}`,
                            customer_id: customerId,
                            description: data.message,
                            status: 'new',
                            priority: 'medium',
                            brand: 'agency', // Default
                            created_by: user.id,
                            assigned_to: user.id
                        })
                }
            } catch (err) {
                console.error('Error in lead conversion process:', err)
                // Continue without failing the request
            }
        }

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        console.error('Lead API error:', error)
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 })
    }
}
