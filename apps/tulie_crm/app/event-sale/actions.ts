'use server'

import { createPublicRetailOrder } from '@/lib/supabase/services/retail-order-service'
import { z } from 'zod'

const orderSchema = z.object({
  fullname: z.string().min(2, 'Tên quá ngắn'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  email: z.string().optional().nullable().transform(v => v ?? undefined),
  refCode: z.string().optional().nullable().transform(v => v ?? undefined),
  note: z.string().optional().nullable().transform(v => v ?? undefined),
  serviceKey: z.string(),
  price: z.coerce.number(),
  originalPrice: z.coerce.number(),
  saving: z.coerce.number(),
  serviceName: z.string(),
  eventName: z.string().default("Sự kiện"),
  eventCode: z.string().default("EVENT")
})

export async function submitEventSaleOrder(formData: FormData) {
  try {
    const rawData = {
      fullname: formData.get('fullname') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') ?? undefined,
      refCode: formData.get('refCode') ?? undefined,
      note: formData.get('note') ?? undefined,
      serviceKey: formData.get('serviceKey') as string,
      price: formData.get('price') as string,
      originalPrice: formData.get('originalPrice') as string,
      saving: formData.get('saving') as string,
      serviceName: formData.get('serviceName') as string,
      eventName: formData.get('eventName') as string,
      eventCode: formData.get('eventCode') as string,
    }

    const val = orderSchema.parse(rawData)

    const items: any[] = []

    // 1. Thêm gói dịch vụ gốc
    items.push({
      product_name: val.serviceName,
      quantity: 1,
      unit_price: val.originalPrice,
      total_price: val.originalPrice,
    })

    // 2. Thêm hạng mục giảm giá Sự kiện nếu có
    if (val.saving > 0) {
      items.push({
        product_name: `Giảm giá ưu đãi ${val.eventName}`,
        quantity: 1,
        unit_price: -val.saving,
        total_price: -val.saving,
      })
    }
    
    // 3. Nếu có mã Ref Code thì thêm vào note
    let finalNote = val.note ? `Ghi chú khách hàng: ${val.note}` : `Đơn đặt từ ${val.eventName}`
    if (val.refCode && val.refCode.trim().length > 0) {
      finalNote += `\n[Có mã giới thiệu: ${val.refCode.trim()}]`
    }

    const publicToken = crypto.randomUUID()

    const orderPayload = {
      customer_name: val.fullname,
      customer_phone: val.phone,
      customer_email: val.email || '',
      total_amount: val.price,
      paid_amount: 0,
      payment_status: 'pending' as const,
      order_status: 'pending' as const,
      source_system: 'event_sale',
      brand: 'studio' as const,
      notes: finalNote,
      public_token: publicToken,
      metadata: {
        form_type: 'event_sale',
        serviceKey: val.serviceKey,
        refCode: val.refCode,
        eventName: val.eventName,
        eventCode: val.eventCode
      },
      items,
    }

    const newOrder = await createPublicRetailOrder(orderPayload)
    return { success: true, orderId: newOrder.id, token: publicToken, orderNumber: newOrder.order_number }
  } catch (error: any) {
    console.error('Submit ISME order error:', error)
    return { success: false, error: error.message || 'Có lỗi xảy ra, vui lòng thử lại sau.' }
  }
}
