import { StatsCard } from '@/components/dashboard/stats-card'
import { getContracts } from '@/lib/supabase/services/contract-service'
import { formatCurrency } from '@/lib/utils/format'
import { Contract } from '@/types'
import { CtvCollaborationCard } from '@/components/contracts/ctv-collaboration-card'
import { Card, CardContent, Button } from '@repo/ui'
import { Plus, Users, UserRound } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
    title: 'Hợp đồng Cộng tác viên | Tulie CRM',
    description: 'Quản lý hợp đồng freelancer / CTV theo từng cộng tác viên',
}

type FreelancerMeta = {
    name?: string
    phone?: string
    email?: string
    bank_name?: string
    bank_account?: string
}

type CtvGroup = {
    key: string
    name: string
    phone: string
    email: string
    bank_name: string
    bank_account: string
    hasInfo: boolean
    contracts: Contract[]
    totalValue: number
}

function groupByCTV(contracts: Contract[]): CtvGroup[] {
    const map = new Map<string, CtvGroup>()

    for (const c of contracts) {
        const meta = (c.freelancer_metadata as FreelancerMeta) || {}
        const name = meta.name?.trim() || ''
        const email = meta.email?.trim() || ''
        const key = email || `no-info-${c.id}`
        const label = name || email || 'Chưa có thông tin'

        if (!map.has(key)) {
            map.set(key, {
                key, name: label,
                phone: meta.phone || '',
                email,
                bank_name: meta.bank_name || '',
                bank_account: meta.bank_account || '',
                hasInfo: !!(name && email),
                contracts: [],
                totalValue: 0,
            })
        }
        const group = map.get(key)!
        group.contracts.push(c)
        group.totalValue += c.total_amount || 0
        if (name && !group.hasInfo) {
            group.name = label
            group.phone = meta.phone || group.phone
            group.email = email || group.email
            group.bank_name = meta.bank_name || group.bank_name
            group.bank_account = meta.bank_account || group.bank_account
            group.hasInfo = !!(name && email)
        }
    }

    return Array.from(map.values()).sort((a, b) => b.contracts.length - a.contracts.length)
}

export default async function CtvContractsPage() {
    const contracts = await getContracts(undefined, undefined, undefined, 'freelancer')
    const groups = groupByCTV(contracts)

    const totalValue = contracts.reduce((s, c) => s + (c.total_amount || 0), 0)
    const activeCount = contracts.filter(c => c.status === 'active').length
    const pendingInfo = groups.filter(g => !g.hasInfo).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center border border-border">
                        <Users className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Hợp đồng Cộng tác viên</h1>
                        <p className="text-sm font-medium text-muted-foreground mt-1">
                            {groups.length} CTV · {contracts.length} hợp đồng
                        </p>
                    </div>
                </div>
                <Button asChild>
                    <Link href="/contracts/ctv/new">
                        <Plus className="h-4 w-4" />
                        Tạo hợp đồng CTV
                    </Link>
                </Button>
            </div>

            {/* Stats Summary */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Tổng CTV" value={groups.length} />
                <StatsCard title="Đang thực hiện" value={activeCount} />
                <StatsCard title="Tổng giá trị chi trả" value={formatCurrency(totalValue)} />
                <StatsCard title="Chờ điền thông tin" value={pendingInfo} />
            </div>

            {/* CTV List */}
            <div className="space-y-6">
                {groups.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <UserRound className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground text-sm font-medium">Chưa có hợp đồng cộng tác viên nào.</p>
                            <Button asChild size="sm" className="mt-4">
                                <Link href="/contracts/ctv/new">Tạo hợp đồng CTV đầu tiên</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    groups.map((group) => (
                        <CtvCollaborationCard key={group.key} group={group} />
                    ))
                )}
            </div>
        </div>
    )
}
