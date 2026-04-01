import { Metadata } from 'next'
import { getQuotePortals } from '@/lib/supabase/services/quote-portal-service'
import { Button } from '@repo/ui'
import { DataTable } from '@/components/shared/data-table'
import { columns } from './columns'

export const metadata: Metadata = {
    title: 'Portal Báo giá | Tulie CRM',
    description: 'Quản lý danh sách portal hiện thị nhiều phương án báo giá',
}

export default async function PortalsPage() {
    const data = await getQuotePortals()

    return (
        <div className="container py-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Portal Báo giá</h1>
                <p className="text-muted-foreground">Quản lý các trang portal (chia sẻ nhiều phương án báo giá) cho khách hàng</p>
            </div>
            <DataTable columns={columns} data={data} searchKey="title" />
        </div>
    )
}
