import { NextResponse } from 'next/server'
import { requirePermission, isAuthError } from '@/lib/security/auth-guard'
import { getDocumentTemplates, getDefaultTemplates } from '@/lib/supabase/services/document-template-service'

export async function GET() {
    try {
        const authResult = await requirePermission('templates', 'view')
        if (isAuthError(authResult)) return authResult

        const templates = await getDocumentTemplates()
        return NextResponse.json(templates)
    } catch (error: any) {
        console.error('Error fetching templates:', error)
        // Fallback: always return at least default templates
        try {
            const defaults = await getDefaultTemplates()
            return NextResponse.json(defaults)
        } catch {
            return NextResponse.json([], { status: 200 })
        }
    }
}
