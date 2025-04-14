import { NextResponse, NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/portal-feedback?project_id=xxx
 * Public endpoint for portal — returns feedback items for a project
 */
export async function GET(request: NextRequest) {
    try {
        const projectId = request.nextUrl.searchParams.get('project_id')
        if (!projectId) {
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
 * Body: { project_id, customer_id, title, content, attachments, created_by_name, created_by_role }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { project_id, customer_id, title, content, attachments, created_by_name, created_by_role, priority } = body

        if (!project_id || !title) {
            return NextResponse.json({ error: 'project_id and title are required' }, { status: 400 })
        }

        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('portal_feedback_items')
            .insert([{
                project_id,
                customer_id: customer_id || null,
                title,
                content: content || null,
                attachments: attachments || [],
                created_by_name: created_by_name || 'Khách hàng',
                created_by_role: created_by_role || 'customer',
                priority: priority || 'normal',
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
 * Update feedback item status/response (for admin or portal user)
 * Body: { id, status?, response_content?, responded_by? }
 */
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, ...updates } = body

        if (!id) {
            return NextResponse.json({ error: 'id required' }, { status: 400 })
        }

        // If responding, auto-set responded_at
        if (updates.response_content || updates.responded_by) {
            updates.responded_at = new Date().toISOString()
        }

        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('portal_feedback_items')
            .update(updates)
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
 * Delete a feedback item
 */
export async function DELETE(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get('id')
        if (!id) {
            return NextResponse.json({ error: 'id required' }, { status: 400 })
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
