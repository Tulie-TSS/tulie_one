import { NextResponse, NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
const BUCKET_NAME = 'id-photos'

const ALLOWED_ORIGINS = [
    'https://tulie.app',
    'https://www.tulie.app',
    'https://hoptac.tulie.app',
    'https://affiliate.tulie.app',
    // Legacy domains (backward compatibility)
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
 * OPTIONS /api/partner-upload — CORS preflight
 */
export async function OPTIONS(req: Request) {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) })
}

/**
 * POST /api/partner-upload
 * Upload CCCD limits 10MB, supports PDF and images
 */
export async function POST(request: NextRequest) {
    try {
        // Rate limit: 10 submissions per minute per IP for uploads
        const ip = getClientIp(request)
        const rateLimitResult = await checkRateLimit(ip, {
            maxRequests: 10,
            windowSeconds: 60,
            keyPrefix: 'partner-upload:post',
        })
        if (rateLimitResult instanceof NextResponse) {
            // we need to append CORS headers to the rate limit response
            const headers = new Headers(rateLimitResult.headers)
            const corsHeaders = getCorsHeaders(request)
            for (const [key, value] of Object.entries(corsHeaders)) {
                headers.set(key, value)
            }
            return new NextResponse(rateLimitResult.body, {
                status: rateLimitResult.status,
                headers
            })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400, headers: getCorsHeaders(request) })
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: `Loại file không được hỗ trợ. Chỉ chấp nhận: ${ALLOWED_TYPES.join(', ')}` },
                { status: 400, headers: getCorsHeaders(request) }
            )
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `File quá lớn. Giới hạn tối đa ${MAX_FILE_SIZE / 1024 / 1024}MB` },
                { status: 400, headers: getCorsHeaders(request) }
            )
        }

        const supabase = createAdminClient()

        // Generate unique file path
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(2, 8)
        const ext = file.name?.split('.').pop() || 'tmp'
        const filePath = `cccd/${timestamp}-${random}.${ext}`

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
            return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500, headers: getCorsHeaders(request) })
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(data.path)

        return NextResponse.json({
            url: urlData.publicUrl,
            name: file.name || `file-${timestamp}.${ext}`,
            type: file.type,
            size: file.size,
        }, { headers: getCorsHeaders(request) })
    } catch (error: any) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: getCorsHeaders(request) })
    }
}
