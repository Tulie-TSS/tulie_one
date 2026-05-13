import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@repo/ui'
import { formatCurrency } from '@/lib/utils/format'
import { FileSignature, Clock, CheckCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import { getContracts, deleteContracts } from '@/lib/supabase/services/contract-service'
import { Button } from '@repo/ui'
import { DataTable } from '@/components/shared/data-table'
import { contractColumns } from '@/components/contracts/contract-columns'

export default async function ContractsPage() {
    // Filter by type 'contract', exclude freelancer category
    const allContracts = await getContracts(undefined, 'contract', 'agency')
    const contracts = allContracts.filter(c => c.category !== 'freelancer')

    const activeContracts = contracts.filter((c) => c.status === 'active').length
    const completedContracts = contracts.filter((c) => c.status === 'completed').length
    const totalValue = contracts.reduce((sum, c) => sum + (c.total_amount || 0), 0)

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center border border-border">
                        <FileSignature className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Hợp đồng</h1>
                        <p className="text-sm font-medium text-muted-foreground mt-1">
                            Quản lý và theo dõi các hợp đồng dịch vụ
                        </p>
                    </div>
                </div>
                <Button asChild>
                    <Link href="/contracts/new">
                        <Plus className="h-4 w-4" />
                        Tạo hợp đồng
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
                        <SelectItem value="active">Đang thực hiện</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Data Table */}
            <ContractTableInitialData data={contracts} />
        </div>
    )
}

async function ContractTableInitialData({ data }: { data: any[] }) {
    const handleDelete = async (rows: any[]) => {
        'use server'
        const ids = rows.map((r) => r.id)
        await deleteContracts(ids)
    }

    return (
        <DataTable
            columns={contractColumns}
            data={data}
            searchKey="contract_number"
            searchPlaceholder="Tìm theo số hợp đồng..."
            onDelete={handleDelete}
        />
    )
}
