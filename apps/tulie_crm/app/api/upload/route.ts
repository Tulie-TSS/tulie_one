import { NextResponse, NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth, isAuthError } from '@/lib/security/auth-guard'
import { checkRateLimit } from '@/lib/security/rate-limiter'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
// Extension map derived from MIME — never trust client-provided extension
const MIME_TO_EXT: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
}
const BUCKET_NAME = 'feedback-attachments'

/**
 * POST /api/upload
 * Upload an image file to Supabase Storage — requires authentication
 * Accepts FormData with 'file' field
 * Returns { url, name, type, size }
 */
export async function POST(request: NextRequest) {
    try {
        // Require authentication — no anonymous uploads
        const authResult = await requireAuth()
        if (isAuthError(authResult)) return authResult

        // Rate limit: 20 uploads per minute per user
        const rateLimitResult = await checkRateLimit(authResult.user.id, {
            maxRequests: 20,
            windowSeconds: 60,
            keyPrefix: 'upload:file',
        })
        if (rateLimitResult) return rateLimitResult

        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: `Loại file không được hỗ trợ. Chỉ chấp nhận: ${ALLOWED_TYPES.join(', ')}` },
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

        // Ensure bucket exists
        const { data: buckets } = await supabase.storage.listBuckets()
        const bucketExists = buckets?.some(b => b.name === BUCKET_NAME)
        
        if (!bucketExists) {
            await supabase.storage.createBucket(BUCKET_NAME, {
                public: true,
                fileSizeLimit: MAX_FILE_SIZE,
                allowedMimeTypes: ALLOWED_TYPES,
            })
        }

        // Generate safe file path — extension derived from MIME, not client filename
        const timestamp = Date.now()
        const random = crypto.randomUUID().substring(0, 8)
        const ext = MIME_TO_EXT[file.type] || 'bin'
        const filePath = `uploads/${authResult.user.id}/${timestamp}-${random}.${ext}`

        // Read file as ArrayBuffer for upload
        const arrayBuffer = await file.arrayBuffer()
        const fileBuffer = new Uint8Array(arrayBuffer)

        // Upload to Supabase Storage
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

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(data.path)

        return NextResponse.json({
            url: urlData.publicUrl,
            name: `image-${timestamp}.${ext}`,
            type: file.type,
            size: file.size,
        })
    } catch (error: any) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
