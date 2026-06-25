import { DataTable } from '@/components/shared/data-table'
import { quotationColumns } from '@/components/quotations/quotation-columns'
import { Button } from '@repo/ui'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@repo/ui'
import { Plus, FileText } from 'lucide-react'
import Link from 'next/link'
import { getQuotations, deleteQuotations } from '@/lib/supabase/services/quotation-service'

export default async function QuotationsPage() {
    const quotations = await getQuotations()

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center border border-border">
                        <FileText className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Báo giá</h1>
                        <p className="text-sm font-medium text-muted-foreground mt-1">
                            Quản lý và theo dõi các báo giá gửi cho khách hàng
                        </p>
                    </div>
                </div>
                <Button asChild size="default" className="rounded-md">
                    <Link href="/quotations/new">
                        <Plus className="h-4 w-4" />
                        Tạo báo giá
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
                        <SelectItem value="draft">Bản nháp</SelectItem>
                        <SelectItem value="sent">Đã gửi</SelectItem>
                        <SelectItem value="viewed">Đã xem</SelectItem>
                        <SelectItem value="accepted">Đã chấp nhận</SelectItem>
                        <SelectItem value="rejected">Từ chối</SelectItem>
                        <SelectItem value="expired">Hết hạn</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Data Table */}
            <QuotationTableInitialData data={quotations} />
        </div>
    )
}

async function QuotationTableInitialData({ data }: { data: any[] }) {
    const handleDelete = async (rows: any[]) => {
        'use server'
        const ids = rows.map((r) => r.id)
        await deleteQuotations(ids)
    }

    return (
        <DataTable
            columns={quotationColumns}
            data={data}
            searchKey="quotation_number"
            searchPlaceholder="Tìm theo mã báo giá..."
            onDelete={handleDelete}
        />
    )
}
