import { Metadata } from 'next'
import { getQuotePortals } from '@/lib/supabase/services/quote-portal-service'
import { DataTable } from '@/components/shared/data-table'
import { columns } from './columns'
import { Globe, Plus } from 'lucide-react'
import { Button } from '@repo/ui'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@repo/ui'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Portal Báo giá | Tulie CRM',
    description: 'Quản lý danh sách portal hiện thị nhiều phương án báo giá',
}

export default async function PortalsPage() {
    const data = await getQuotePortals()

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center border border-border">
                        <Globe className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold">Portal Báo giá</h1>
                        <p className="text-sm font-medium text-muted-foreground mt-1">
                            Quản lý các trang portal (chia sẻ nhiều phương án báo giá) cho khách hàng
                        </p>
                    </div>
                </div>
                <Button asChild size="default" className="rounded-md">
                    <Link href="/quotations/portals/new">
                        <Plus className="h-4 w-4" />
                        Tạo Portal
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="active">Đang hoạt động</SelectItem>
                        <SelectItem value="inactive">Đã vô hiệu hóa</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Data Table */}
            <DataTable 
                columns={columns} 
                data={data} 
                searchKey="title" 
                searchPlaceholder="Tìm theo tên Portal..." 
            />
        </div>
    )
}
