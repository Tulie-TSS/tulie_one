import { NextResponse } from 'next/server'
import { requirePermission, isAuthError } from '@/lib/security/auth-guard'
import { getDocumentTemplates } from '@/lib/supabase/services/document-template-service'

/**
 * GET /api/templates — Requires 'view' permission on templates
 * Returns all document templates
 */
export async function GET() {
    try {
        const authResult = await requirePermission('templates', 'view')
        if (isAuthError(authResult)) return authResult

        const templates = await getDocumentTemplates()
        return NextResponse.json(templates)
    } catch (error: any) {
        console.error('Error fetching templates:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
