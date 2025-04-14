import { NextResponse, NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB
const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'image/jpeg',
    'image/png',
    'image/webp'
]
const BUCKET_NAME = 'documents'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: `Loại file không được hỗ trợ. Vui lòng upload PDF, Word, Excel hoặc Hình ảnh.` },
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

        // Generate unique file path
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(2, 8)
        const ext = file.name?.split('.').pop() || 'tmp'
        // Avoid spaces and special characters in path
        const safeName = (file.name || 'file').replace(/[^a-zA-Z0-9.-]/g, '_')
        const filePath = `quotations/${timestamp}-${random}-${safeName}`

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
            path: data.path, // Store path for deletion later
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
    try {
        const { searchParams } = new URL(request.url)
        const path = searchParams.get('path')

        if (!path) {
            return NextResponse.json({ error: 'No path provided' }, { status: 400 })
        }

        const supabase = createAdminClient()

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([path])

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
