import { NextResponse, NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth, isAuthError } from '@/lib/security/auth-guard'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter'

const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB
const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/webp',
]
// Safe extension map derived from MIME — never trust client filename extension
const MIME_TO_EXT: Record<string, string> = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
}
const BUCKET_NAME = 'documents'

export async function POST(request: NextRequest) {
    // Auth required — only logged-in users can upload documents
    const authResult = await requireAuth()
    if (isAuthError(authResult)) return authResult

    // Rate limit: 20 uploads/hour per user
    const ip = getClientIp(request)
    const limited = await checkRateLimit(authResult.user.id || ip, {
        maxRequests: 20,
        windowSeconds: 3600,
        keyPrefix: 'documents:upload',
    })
    if (limited) return limited

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate MIME type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Loại file không được hỗ trợ. Vui lòng upload PDF, Word, Excel hoặc Hình ảnh.' },
                { status: 400 }
            )
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `File quá lớn. Giới hạn tối đa ${MAX_FILE_SIZE / 1024 / 1024}MB` },
                { status: 400 }
            )
        }

        const supabase = createAdminClient()

        // Derive extension from MIME — never from client filename
        const ext = MIME_TO_EXT[file.type] || 'bin'
        const filePath = `quotations/${authResult.user.id}/${crypto.randomUUID()}.${ext}`

        const arrayBuffer = await file.arrayBuffer()
        const fileBuffer = new Uint8Array(arrayBuffer)

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, fileBuffer, {
                contentType: file.type,
                upsert: false,
            })

        if (error) {
            console.error('Storage upload error:', error)
            return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 })
        }

        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path)

        return NextResponse.json({
            url: urlData.publicUrl,
            path: data.path,
            name: file.name,
            type: file.type,
            size: file.size,
        })
    } catch (error: any) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    // Auth required — only logged-in users can delete documents
    const authResult = await requireAuth()
    if (isAuthError(authResult)) return authResult

    try {
        const { searchParams } = new URL(request.url)
        const path = searchParams.get('path')

        if (!path) {
            return NextResponse.json({ error: 'No path provided' }, { status: 400 })
        }

        // Prevent path traversal — only allow paths within known prefixes
        if (!path.startsWith('quotations/') || path.includes('..')) {
            return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
        }

        const supabase = createAdminClient()
        const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])

        if (error) {
            console.error('Storage delete error:', error)
            return NextResponse.json({ error: `Delete failed: ${error.message}` }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Delete error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
