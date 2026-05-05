import {
    Card, CardContent, CardHeader,
    Badge,
    Separator,
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@repo/ui'
import {
    UserRound, Plus, FileText, Phone, Mail,
    Landmark, TrendingUp, Clock, CheckCircle2, FileWarning
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@repo/ui'
import { getContracts } from '@/lib/supabase/services/contract-service'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { Contract } from '@/types'

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

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    draft:     { label: 'Nháp',           variant: 'secondary' },
    active:    { label: 'Đang thực hiện', variant: 'default' },
    completed: { label: 'Hoàn thành',     variant: 'outline' },
    cancelled: { label: 'Đã hủy',         variant: 'destructive' },
    signed:    { label: 'Đã ký',          variant: 'outline' },
    sent:      { label: 'Đã gửi',         variant: 'secondary' },
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
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center border">
                        <UserRound className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Hợp đồng Cộng tác viên</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {groups.length} CTV · {contracts.length} hợp đồng
                        </p>
                    </div>
                </div>
                <Button asChild size="sm">
                    <Link href="/contracts/ctv/new">
                        <Plus className="h-4 w-4" />
                        Tạo hợp đồng CTV
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground font-medium">Tổng CTV</p>
                        <p className="text-2xl font-bold mt-1">{groups.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground font-medium">Đang thực hiện</p>
                        <p className="text-2xl font-bold mt-1">{activeCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground font-medium">Tổng giá trị</p>
                        <p className="text-lg font-bold mt-1">{formatCurrency(totalValue)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground font-medium">Chờ điền thông tin</p>
                        <p className="text-2xl font-bold mt-1">{pendingInfo}</p>
                    </CardContent>
                </Card>
            </div>

            {/* CTV List */}
            <div className="space-y-4">
                {groups.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <UserRound className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground text-sm">Chưa có hợp đồng cộng tác viên nào.</p>
                            <Button asChild size="sm" className="mt-4">
                                <Link href="/contracts/ctv/new">Tạo hợp đồng CTV đầu tiên</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    groups.map((group) => (
                        <CtvCard key={group.key} group={group} />
                    ))
                )}
            </div>
        </div>
    )
}

function CtvCard({ group }: { group: CtvGroup }) {
    const activeCount = group.contracts.filter(c => c.status === 'active').length
    const completedCount = group.contracts.filter(c => c.status === 'completed').length

    return (
        <Card>
            <CardHeader className="pb-0 pt-4 px-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-muted border flex items-center justify-center shrink-0">
                            <span className="text-sm font-semibold">
                                {group.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-sm">{group.name}</h3>
                                {!group.hasInfo && (
                                    <Badge variant="outline" className="text-xs">
                                        Chưa có thông tin
                                    </Badge>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                                {group.phone && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Phone className="h-3 w-3" />{group.phone}
                                    </span>
                                )}
                                {group.email && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Mail className="h-3 w-3" />{group.email}
                                    </span>
                                )}
                                {group.bank_name && group.bank_account && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Landmark className="h-3 w-3" />{group.bank_name} · {group.bank_account}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">{formatCurrency(group.totalValue)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {group.contracts.length} hợp đồng
                            {activeCount > 0 && ` · ${activeCount} đang thực hiện`}
                            {completedCount > 0 && ` · ${completedCount} hoàn thành`}
                        </p>
                    </div>
                </div>
            </CardHeader>

            <Separator className="mt-4" />

            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="pl-5 text-xs">Mã hợp đồng</TableHead>
                            <TableHead className="text-xs">Tiêu đề dự án</TableHead>
                            <TableHead className="text-xs">Giá trị</TableHead>
                            <TableHead className="text-xs">Thuế TNCN 10%</TableHead>
                            <TableHead className="text-xs">Nhận thực tế</TableHead>
                            <TableHead className="text-xs">Thời hạn</TableHead>
                            <TableHead className="text-xs">Trạng thái</TableHead>
                            <TableHead className="pr-5 text-xs text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {group.contracts.map((c) => {
                            const tax = (c.total_amount || 0) * 0.1
                            const net = (c.total_amount || 0) - tax
                            const statusCfg = STATUS_CONFIG[c.status] ?? { label: c.status, variant: 'secondary' as const }
                            return (
                                <TableRow key={c.id}>
                                    <TableCell className="pl-5">
                                        <Link
                                            href={`/contracts/${c.id}`}
                                            className="font-mono text-xs font-semibold hover:underline"
                                        >
                                            {c.contract_number || '—'}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs line-clamp-2 max-w-[180px] block">{c.title}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs">{formatCurrency(c.total_amount)}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs text-muted-foreground">- {formatCurrency(tax)}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs font-medium">{formatCurrency(net)}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs text-muted-foreground space-y-0.5">
                                            <div>{c.start_date ? formatDate(c.start_date) : '—'}</div>
                                            {c.end_date && <div>→ {formatDate(c.end_date)}</div>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={statusCfg.variant} className="text-xs">
                                            {statusCfg.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="pr-5 text-right">
                                        <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                                            <Link href={`/contracts/${c.id}`}>
                                                <FileText className="h-3.5 w-3.5 mr-1" />
                                                Chi tiết
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
