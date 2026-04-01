import { Metadata } from 'next'
import { getQuotePortals } from '@/lib/supabase/services/quote-portal-service'
import { PageHeader, PageTitle, PageDescription, PageActions } from '@repo/ui'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Portal Báo giá | Tulie CRM',
    description: 'Quản lý danh sách portal hiện thị nhiều phương án báo giá',
}

export default async function PortalsPage() {
    const data = await getQuotePortals()

    return (
        <div className="container py-8 max-w-7xl mx-auto space-y-8">
            <PageHeader>
                <div>
                    <PageTitle>Portal Báo giá</PageTitle>
                    <PageDescription>Quản lý các trang portal (chia sẻ nhiều phương án báo giá) cho khách hàng</PageDescription>
                </div>
            </PageHeader>
            <DataTable columns={columns} data={data} searchKey="title" />
        </div>
    )
}
