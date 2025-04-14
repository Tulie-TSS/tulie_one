'use server'

import { createPublicRetailOrder } from '@/lib/supabase/services/retail-order-service'
import { z } from 'zod'

const orderItemSchema = z.object({
  serviceId: z.string(),
  serviceName: z.string(),
  originalPrice: z.coerce.number(),
  salePrice: z.coerce.number(),
  lineTotal: z.coerce.number(),
})

const orderSchema = z.object({
  fullname: z.string().min(2, 'Tên quá ngắn'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  email: z.string().optional().nullable().transform(v => v ?? undefined),
  refCode: z.string().optional().nullable().transform(v => v ?? undefined),
  note: z.string().optional().nullable().transform(v => v ?? undefined),
  eventName: z.string().default("Sự kiện"),
  eventCode: z.string().default("EVENT"),
  orderItems: z.string().transform(v => JSON.parse(v)).pipe(z.array(orderItemSchema)),
  subtotal: z.coerce.number(),
  comboDiscount: z.coerce.number().default(0),
  comboLabel: z.string().optional().nullable().transform(v => v ?? undefined),
  total: z.coerce.number(),
  originalTotal: z.coerce.number(),
  totalSaving: z.coerce.number().default(0),
  bankInfo: z.string().optional().nullable().transform(v => {
    if (!v) return undefined;
    try { return JSON.parse(v); } catch { return undefined; }
  }),
})

export async function submitEventSaleOrder(formData: FormData) {
  try {
    const rawData = {
      fullname: formData.get('fullname') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') ?? undefined,
      refCode: formData.get('refCode') ?? undefined,
      note: formData.get('note') ?? undefined,
      eventName: formData.get('eventName') as string,
      eventCode: formData.get('eventCode') as string,
      orderItems: formData.get('orderItems') as string,
      subtotal: formData.get('subtotal') as string,
      comboDiscount: formData.get('comboDiscount') as string,
      comboLabel: formData.get('comboLabel') ?? undefined,
      total: formData.get('total') as string,
      originalTotal: formData.get('originalTotal') as string,
      totalSaving: formData.get('totalSaving') as string,
      bankInfo: formData.get('bankInfo') as string | null,
    }

    const val = orderSchema.parse(rawData)

    const items: any[] = []

    // Add each selected service as a line item
    for (const item of val.orderItems) {
      items.push({
        product_name: item.serviceName,
        quantity: 1,
        unit_price: item.salePrice,
        total_price: item.salePrice,
      })
    }

    // Add combo discount line if applicable
    if (val.comboDiscount > 0) {
      items.push({
        product_name: val.comboLabel || `Ưu đãi Combo Ảnh + Website`,
        quantity: 1,
        unit_price: -val.comboDiscount,
        total_price: -val.comboDiscount,
      })
    }

    // Build note with referral code
    let finalNote = val.note ? `Ghi chú khách hàng: ${val.note}` : `Đơn đặt từ ${val.eventName}`
    if (val.refCode && val.refCode.trim().length > 0) {
      finalNote += `\n[Mã đơn hàng giới thiệu: ${val.refCode.trim()}]`
    }

    const publicToken = crypto.randomUUID()

    const orderPayload = {
      customer_name: val.fullname,
      customer_phone: val.phone,
      customer_email: val.email || '',
      total_amount: val.total,
      paid_amount: 0,
      payment_status: 'pending' as const,
      order_status: 'pending' as const,
      source_system: 'event_sale',
      brand: 'studio' as const,
      notes: finalNote,
      public_token: publicToken,
      metadata: {
        form_type: 'event_sale',
        refCode: val.refCode,
        eventName: val.eventName,
        eventCode: val.eventCode,
        comboDiscount: val.comboDiscount,
        comboLabel: val.comboLabel,
        originalTotal: val.originalTotal,
        totalSaving: val.totalSaving,
        services: val.orderItems.map(i => ({
          id: i.serviceId,
          name: i.serviceName,
        })),
        bank_info: val.bankInfo,
      },
      items,
    }

    const newOrder = await createPublicRetailOrder(orderPayload)
    return { success: true, orderId: newOrder.id, token: publicToken, orderNumber: newOrder.order_number }
  } catch (error: any) {
    console.error('Submit event sale order error:', error)
    return { success: false, error: error.message || 'Có lỗi xảy ra, vui lòng thử lại sau.' }
  }
}
