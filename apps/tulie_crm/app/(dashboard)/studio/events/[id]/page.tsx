import { getEventSaleById } from '@/lib/supabase/services/event-sale-service'
import { EventSaleForm } from './form'
import { notFound } from 'next/navigation'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@repo/ui'

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
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild className="shrink-0 w-8 h-8 rounded-md">
                    <Link href="/studio/events">
                        <span className="sr-only">Quay lại</span>
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">
                    {isNew ? 'Tạo Sự kiện (Landing Page) mới' : `Chỉnh sửa: ${initialData?.name}`}
                </h1>
            </div>
            
            <div>
                <EventSaleForm initialData={initialData} />
            </div>
        </div>
    )
}
