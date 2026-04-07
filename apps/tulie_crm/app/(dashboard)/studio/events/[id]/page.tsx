import { getEventSaleById } from '@/lib/supabase/services/event-sale-service'
import { EventSaleForm } from './form'
import { notFound } from 'next/navigation'

export default async function EventSaleEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const isNew = id === 'new'
    let initialData = null

    if (!isNew) {
        initialData = await getEventSaleById(id)
        if (!initialData) {
            notFound()
        }
    }

    return (
        <div className="max-w-5xl mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">
                {isNew ? 'Tạo Sự kiện (Event Sale) mới' : `Chỉnh sửa: ${initialData?.name}`}
            </h1>
            <EventSaleForm initialData={initialData} />
        </div>
    )
}
