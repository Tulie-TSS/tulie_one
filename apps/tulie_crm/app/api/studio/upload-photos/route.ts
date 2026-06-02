import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter'
import { validateBody, uploadPhotosSchema } from '@/lib/security/validation'
import { sendTelegramNotification } from '@/lib/supabase/services/telegram-service'

/**
 * POST /api/studio/upload-photos — Public endpoint for updating order photos
 * 
 * Security: Token-based auth (public_token) + rate limiting + URL verification
 * Only allows photos residing in our official Supabase 'id-photos' bucket.
 */
export async function POST(req: NextRequest) {
    try {
        // Rate limit: 20 requests per minute per IP
        const ip = getClientIp(req)
        const rateLimitResult = await checkRateLimit(ip, {
            maxRequests: 20,
            windowSeconds: 60,
            keyPrefix: 'upload-photos:post',
        })
        if (rateLimitResult) return rateLimitResult

        const raw = await req.json()
        const validation = validateBody(raw, uploadPhotosSchema)
        if (!validation.success) {
            return NextResponse.json({ error: validation.error }, { status: 400 })
        }
        const { token, photo_urls } = validation.data

        // SECURITY: Verify all URLs belong to our Supabase Storage 'id-photos' bucket
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
        const bucketUrlPrefix = supabaseUrl
            ? `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/id-photos/`
            : null

        if (bucketUrlPrefix) {
            for (const url of photo_urls) {
                if (!url.startsWith(bucketUrlPrefix)) {
                    return NextResponse.json({ 
                        error: 'Đường dẫn ảnh không hợp lệ. Chỉ cho phép các ảnh được tải lên hệ thống lưu trữ Tulie.' 
                    }, { status: 400 })
                }
            }
        }

        const { createAdminClient } = await import('@/lib/supabase/admin')
        const supabase = createAdminClient()

        // SECURITY: Token-based lookup only (prevents IDOR via guessing order IDs)
        const { data: order, error: findError } = await supabase
            .from('retail_orders')
            .select('*')
            .eq('public_token', token)
            .single()

        if (findError || !order) {
            return NextResponse.json({ error: 'Đơn hàng không tồn tại' }, { status: 404 })
        }

        // Prevent modification of completed/cancelled orders
        if (order.order_status === 'completed' || order.order_status === 'cancelled') {
            return NextResponse.json({ 
                error: 'Không thể cập nhật ảnh cho đơn hàng đã hoàn thành hoặc đã hủy.' 
            }, { status: 400 })
        }

        const currentMetadata = order.metadata || {}
        const currentPhotos = currentMetadata.photo_urls || []
        
        // Calculate newly added photos
        const newPhotos = photo_urls.filter((url: string) => !currentPhotos.includes(url))
        
        // Update metadata
        const updatedMetadata = {
            ...currentMetadata,
            photo_urls: photo_urls
        }

        // Save to Database
        const { error: updateError } = await supabase
            .from('retail_orders')
            .update({ metadata: updatedMetadata })
            .eq('id', order.id)

        if (updateError) throw updateError

        // Send Telegram notification if new photos are uploaded
        if (newPhotos.length > 0) {
            try {
                const message = `
<b>📸 KHÁCH CẬP NHẬT ẢNH MỚI (STUDIO)</b>
━━━━━━━━━━━━━━━━━━
🆔 Mã đơn: <code>${order.order_number}</code>
👤 Khách hàng: <b>${order.customer_name}</b>
📞 SĐT: <code>${order.customer_phone || 'N/A'}</code>
🔄 Số ảnh mới upload: <b>${newPhotos.length} ảnh</b>
🖼️ Tổng số ảnh hiện tại: <b>${photo_urls.length} ảnh</b>
━━━━━━━━━━━━━━━━━━
<i>Khách hàng đã gửi thêm ảnh trên portal. Vui lòng kiểm tra lại!</i>`

                await sendTelegramNotification(message)
            } catch (notifErr) {
                console.error('Telegram notification failed:', notifErr)
            }
        }

        return NextResponse.json({ message: 'Đã cập nhật danh sách ảnh thành công' })
    } catch (err: any) {
        console.error('Error in upload-photos API:', err)
        return NextResponse.json({ error: err.message || 'Lỗi hệ thống' }, { status: 500 })
    }
}
