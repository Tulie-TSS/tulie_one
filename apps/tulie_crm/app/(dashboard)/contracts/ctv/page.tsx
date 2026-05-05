import { Card, CardContent } from '@repo/ui'
import { UserRound, Plus, CheckCircle, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'
import { getContracts, deleteContracts } from '@/lib/supabase/services/contract-service'
import { Button } from '@repo/ui'
import { DataTable } from '@/components/shared/data-table'
import { contractColumns } from '@/components/contracts/contract-columns'
import { formatCurrency } from '@/lib/utils/format'

export const metadata = {
    title: 'Hợp đồng Cộng tác viên | Tulie CRM',
    description: 'Quản lý hợp đồng cộng tác viên freelancer',
}

export default async function CtvContractsPage() {
    const contracts = await getContracts(undefined, undefined, undefined, 'freelancer')

    const active = contracts.filter((c) => c.status === 'active').length
    const completed = contracts.filter((c) => c.status === 'completed').length
    const cancelled = contracts.filter((c) => c.status === 'cancelled').length
    const totalValue = contracts.reduce((sum, c) => sum + (c.total_amount || 0), 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center border border-border">
                        <UserRound className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Hợp đồng Cộng tác viên</h1>
                        <p className="text-sm font-medium text-muted-foreground mt-1">
                            Quản lý hợp đồng freelancer — khấu trừ thuế TNCN 10%
                        </p>
                    </div>
                </div>
                <Button asChild>
                    <Link href="/contracts/new?category=freelancer">
                        <Plus className="h-4 w-4" />
                        Tạo hợp đồng CTV
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-5">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Tổng hợp đồng</p>
                        <p className="text-2xl font-bold mt-1">{contracts.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 flex items-start gap-2">
                        <Clock className="h-4 w-4 text-blue-500 mt-1 shrink-0" />
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Đang thực hiện</p>
                            <p className="text-2xl font-bold mt-1">{active}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Hoàn thành</p>
                            <p className="text-2xl font-bold mt-1">{completed}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Tổng giá trị</p>
                        <p className="text-lg font-bold mt-1 text-blue-600">{formatCurrency(totalValue)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <CtvTableSection data={contracts} />
        </div>
    )
}

async function CtvTableSection({ data }: { data: any[] }) {
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
            searchPlaceholder="Tìm theo số hợp đồng hoặc tên CTV..."
            onDelete={handleDelete}
        />
    )
}
