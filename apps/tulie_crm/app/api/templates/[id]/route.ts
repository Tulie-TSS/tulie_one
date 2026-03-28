import { NextResponse } from 'next/server'
import { requirePermission, isAuthError } from '@/lib/security/auth-guard'
import { getTemplateById, updateDocumentTemplate, deleteDocumentTemplate, duplicateDocumentTemplate } from '@/lib/supabase/services/document-template-service'

/**
 * GET /api/templates/[id] — Requires 'view' permission on templates
 * Returns a single document template by ID
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requirePermission('templates', 'view')
        if (isAuthError(authResult)) return authResult

        const { id } = await params
        const template = await getTemplateById(id)

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 })
        }

        return NextResponse.json(template)
    } catch (error: any) {
        console.error('Error fetching template:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * PUT /api/templates/[id] — Requires 'edit' permission on templates
 * Updates a document template
 */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requirePermission('templates', 'edit')
        if (isAuthError(authResult)) return authResult

        const { id } = await params
        const body = await request.json()

        const updated = await updateDocumentTemplate(id, {
            name: body.name,
            content: body.content,
            variables: body.variables,
        })

        return NextResponse.json(updated)
    } catch (error: any) {
        console.error('Error updating template:', error)
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}

/**
 * DELETE /api/templates/[id] — Requires 'delete' permission on templates
 * Deletes a document template
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requirePermission('templates', 'delete')
        if (isAuthError(authResult)) return authResult

        const { id } = await params
        await deleteDocumentTemplate(id)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error deleting template:', error)
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}

/**
 * POST /api/templates/[id] — Requires 'create' permission on templates
 * Duplicates a template
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requirePermission('templates', 'create')
        if (isAuthError(authResult)) return authResult

        const { id } = await params
        const duplicate = await duplicateDocumentTemplate(id)

        return NextResponse.json(duplicate, { status: 201 })
    } catch (error: any) {
        console.error('Error duplicating template:', error)
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}
