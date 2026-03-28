import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/security/auth-guard'
import { getDocumentTemplates } from '@/lib/supabase/services/document-template-service'

export async function GET() {
    try {
        const authResult = await requireAuth()
        if (isAuthError(authResult)) return authResult

        const templates = await getDocumentTemplates()
        return NextResponse.json(templates)
    } catch (error: any) {
        console.error('Error fetching templates:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
