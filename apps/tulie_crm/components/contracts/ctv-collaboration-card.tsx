'use client'

import { useState } from 'react'
import {
    Card, CardContent, CardHeader,
    Badge,
    Separator,
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
    Button,
    Collapsible, CollapsibleContent, CollapsibleTrigger
} from '@repo/ui'
import {
    Phone, Mail, Landmark, FileText, ChevronDown, ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { Contract } from '@/types'
import { ContractCellAction } from './contract-cell-action'
import { cn } from '@/lib/utils'

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

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    draft:     { label: 'Nháp',           variant: 'secondary' },
    active:    { label: 'Đang thực hiện', variant: 'default' },
    completed: { label: 'Hoàn thành',     variant: 'outline' },
    cancelled: { label: 'Đã hủy',         variant: 'destructive' },
    signed:    { label: 'Đã ký',          variant: 'outline' },
    sent:      { label: 'Đã gửi',         variant: 'secondary' },
}

export function CtvCollaborationCard({ group }: { group: CtvGroup }) {
    const [isOpen, setIsOpen] = useState(false)
    const activeCount = group.contracts.filter(c => c.status === 'active').length
    const completedCount = group.contracts.filter(c => c.status === 'completed').length

    return (
        <Card className="overflow-hidden">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CardHeader className="p-0">
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-bold">
                                    {group.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-base">{group.name}</h3>
                                        {!group.hasInfo && (
                                            <Badge variant="outline" className="text-[10px] h-4">
                                                Chưa có thông tin
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                        {group.phone && (
                                            <span className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" />{group.phone}
                                            </span>
                                        )}
                                        {group.email && (
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />{group.email}
                                            </span>
                                        )}
                                        {group.bank_name && (
                                            <span className="flex items-center gap-1">
                                                <Landmark className="h-3 w-3" />{group.bank_name} · {group.bank_account}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-foreground">{formatCurrency(group.totalValue)}</p>
                                    <p className="text-[11px] text-muted-foreground">
                                        {group.contracts.length} hợp đồng
                                        {activeCount > 0 && ` · ${activeCount} đang thực hiện`}
                                    </p>
                                </div>
                                <div className="h-8 w-8 rounded-full border flex items-center justify-center bg-background">
                                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </div>
                            </div>
                        </div>
                    </CollapsibleTrigger>
                </CardHeader>

                <CollapsibleContent>
                    <Separator />
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="pl-6 text-[11px] font-bold text-muted-foreground h-10">Mã hợp đồng</TableHead>
                                        <TableHead className="text-[11px] font-bold text-muted-foreground h-10">Dự án / Nội dung</TableHead>
                                        <TableHead className="text-[11px] font-bold text-muted-foreground h-10">Giá trị</TableHead>
                                        <TableHead className="text-[11px] font-bold text-muted-foreground h-10 text-center">Thuế TNCN</TableHead>
                                        <TableHead className="text-[11px] font-bold text-muted-foreground h-10">Thực nhận</TableHead>
                                        <TableHead className="text-[11px] font-bold text-muted-foreground h-10">Thời hạn</TableHead>
                                        <TableHead className="text-[11px] font-bold text-muted-foreground h-10">Trạng thái</TableHead>
                                        <TableHead className="pr-6 text-[11px] font-bold text-muted-foreground h-10 text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {group.contracts.map((c) => {
                                        const tax = (c.total_amount || 0) * 0.1
                                        const net = (c.total_amount || 0) - tax
                                        const statusCfg = STATUS_CONFIG[c.status] ?? { label: c.status, variant: 'secondary' as const }
                                        return (
                                            <TableRow key={c.id} className="group transition-colors">
                                                <TableCell className="pl-6">
                                                    <Link
                                                        href={`/contracts/${c.id}`}
                                                        className="font-mono text-[11px] font-bold hover:text-primary transition-colors"
                                                    >
                                                        {c.contract_number || '—'}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-xs font-medium max-w-[200px] truncate">{c.title}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs font-semibold">{formatCurrency(c.total_amount)}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="text-[10px] text-muted-foreground">- {formatCurrency(tax)}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(net)}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-[10px] text-muted-foreground leading-tight">
                                                        <div>{c.start_date ? formatDate(c.start_date) : '—'}</div>
                                                        {c.end_date && <div className="text-[9px] opacity-70">đến {formatDate(c.end_date)}</div>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={statusCfg.variant} className="text-[9px] px-1.5 h-4 font-bold uppercase">
                                                        {statusCfg.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="pr-6 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button asChild variant="outline" size="icon" className="h-7 w-7">
                                                            <Link href={`/contracts/${c.id}`}>
                                                                <FileText className="h-3.5 w-3.5" />
                                                            </Link>
                                                        </Button>
                                                        <ContractCellAction data={c} />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    )
}
