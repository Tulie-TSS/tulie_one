import { NextResponse, NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter'

/**
 * GET /api/portal-feedback?project_id=xxx
 * Public endpoint for portal — returns feedback items for a project
 */
export async function GET(request: NextRequest) {
    // Rate limit: 60 reads/min per IP
    const ip = getClientIp(request)
    const limited = await checkRateLimit(ip, { maxRequests: 60, windowSeconds: 60, keyPrefix: 'feedback:get' })
    if (limited) return limited

    try {
        const projectId = request.nextUrl.searchParams.get('project_id')
        if (!projectId || !/^[0-9a-f-]{36}$/.test(projectId)) {
            return NextResponse.json({ error: 'project_id required' }, { status: 400 })
        }

        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('portal_feedback_items')
            .select('*')
            .eq('project_id', projectId)
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching feedback:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data || [])
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * POST /api/portal-feedback
 * Public endpoint for portal — creates a new feedback item
 * Rate limited: 5 submissions per 10 minutes per IP to prevent spam
 */
export async function POST(request: NextRequest) {
    // Rate limit: 5 posts/10min per IP — prevents spam flooding
    const ip = getClientIp(request)
    const limited = await checkRateLimit(ip, { maxRequests: 5, windowSeconds: 600, keyPrefix: 'feedback:post' })
    if (limited) return limited

    try {
        const body = await request.json()
        const { project_id, customer_id, title, content, attachments, created_by_name, created_by_role, priority } = body

        if (!project_id || !title) {
            return NextResponse.json({ error: 'project_id and title are required' }, { status: 400 })
        }

        // Validate project_id is a UUID to prevent injection
        if (!/^[0-9a-f-]{36}$/.test(project_id)) {
            return NextResponse.json({ error: 'Invalid project_id' }, { status: 400 })
        }

        // Sanitize text fields — truncate to prevent huge payloads
        const safeName = String(created_by_name || 'Khách hàng').slice(0, 100)
        const safeTitle = String(title).slice(0, 200)
        const safeContent = content ? String(content).slice(0, 5000) : null

        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('portal_feedback_items')
            .insert([{
                project_id,
                customer_id: customer_id || null,
                title: safeTitle,
                content: safeContent,
                attachments: Array.isArray(attachments) ? attachments.slice(0, 10) : [],
                created_by_name: safeName,
                created_by_role: ['customer', 'admin', 'team'].includes(created_by_role) ? created_by_role : 'customer',
                priority: ['low', 'normal', 'high', 'urgent'].includes(priority) ? priority : 'normal',
                status: 'pending',
            }])
            .select()
            .single()

        if (error) {
            console.error('Error creating feedback:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * PATCH /api/portal-feedback
 * Update feedback item status/response
 * Rate limited: 20 updates/min per IP
 */
export async function PATCH(request: NextRequest) {
    const ip = getClientIp(request)
    const limited = await checkRateLimit(ip, { maxRequests: 20, windowSeconds: 60, keyPrefix: 'feedback:patch' })
    if (limited) return limited

    try {
        const body = await request.json()
        const { id, ...updates } = body

        if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
            return NextResponse.json({ error: 'valid id required' }, { status: 400 })
        }

        // Whitelist allowed update fields
        const allowedFields = ['status', 'response_content', 'responded_by', 'sort_order', 'priority']
        const safeUpdates: Record<string, unknown> = {}
        for (const field of allowedFields) {
            if (updates[field] !== undefined) safeUpdates[field] = updates[field]
        }

        if (safeUpdates.response_content || safeUpdates.responded_by) {
            safeUpdates.responded_at = new Date().toISOString()
        }

        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('portal_feedback_items')
            .update(safeUpdates)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating feedback:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * DELETE /api/portal-feedback?id=xxx
 * Delete a feedback item — requires higher rate limit protection
 */
export async function DELETE(request: NextRequest) {
    // Strict rate limit on DELETE: 10/min
    const ip = getClientIp(request)
    const limited = await checkRateLimit(ip, { maxRequests: 10, windowSeconds: 60, keyPrefix: 'feedback:delete' })
    if (limited) return limited

    try {
        const id = request.nextUrl.searchParams.get('id')
        if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
            return NextResponse.json({ error: 'valid id required' }, { status: 400 })
        }

        const supabase = createAdminClient()
        const { error } = await supabase
            .from('portal_feedback_items')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting feedback:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
