'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { Badge } from '@repo/ui'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@repo/ui'
import { Receipt, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import type { InvoiceReconciliationItem } from '@/lib/supabase/services/invoice-tracker-service'

const statusConfig = {
    ok: { label: 'OK', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
    missing_output: { label: 'Chưa xuất HĐ', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: AlertTriangle },
    unpaid: { label: 'Chưa thu tiền', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle },
    gap: { label: 'Chênh lệch', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle },
    missing_input: { label: 'Thiếu HĐ đầu vào', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle },
}

const formatVND = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`
    return amount.toLocaleString('vi-VN')
}

interface InvoiceTrackerPanelProps {
    reconciliation: InvoiceReconciliationItem[]
    unissuedInvoices: {
        id: string
        contract_number: string
        title: string
        total_amount: number
        customer_name: string
    }[]
}

export default function InvoiceTrackerPanel({ reconciliation, unissuedInvoices }: InvoiceTrackerPanelProps) {
    const problems = reconciliation.filter(r => r.status !== 'ok')

    return (
        <div className="space-y-4">
            {/* Unissued Invoices */}
            {unissuedInvoices.length > 0 && (
                <Card className="border-rose-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-rose-700">
                            <AlertTriangle className="h-4 w-4" />
                            Hợp đồng B2B chưa xuất hoá đơn ({unissuedInvoices.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {unissuedInvoices.map(inv => (
                                <Link
                                    key={inv.id}
                                    href={`/contracts/${inv.id}`}
                                    className="flex items-center justify-between p-3 rounded-lg bg-rose-50/50 border border-red-100 hover:bg-rose-50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{inv.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {inv.contract_number} — {inv.customer_name}
                                        </p>
                                    </div>
                                    <span className="text-sm font-medium text-rose-700 shrink-0 ml-2">
                                        {formatVND(inv.total_amount)}₫
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Reconciliation Table */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-blue-600" />
                        Đối soát hoá đơn
                        {problems.length > 0 && (
                            <Badge variant="secondary" className="bg-amber-50 text-amber-700">
                                {problems.length} cần xử lý
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {reconciliation.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Chưa có dữ liệu hoá đơn
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Dự án</TableHead>
                                        <TableHead className="text-right">HĐ Đầu ra</TableHead>
                                        <TableHead className="text-right">Đã thu</TableHead>
                                        <TableHead className="text-right">HĐ Đầu vào</TableHead>
                                        <TableHead className="text-right">Chênh lệch</TableHead>
                                        <TableHead className="text-center">Trạng thái</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reconciliation.slice(0, 20).map(item => {
                                        const config = statusConfig[item.status]
                                        return (
                                            <TableRow key={item.project_id}>
                                                <TableCell>
                                                    <Link href={`/projects/${item.project_id}`} className="hover:underline">
                                                        <p className="font-medium truncate max-w-[200px]">{item.project_title}</p>
                                                        <p className="text-xs text-muted-foreground">{item.customer_name}</p>
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-right">{formatVND(item.output_invoiced)}₫</TableCell>
                                                <TableCell className="text-right font-medium text-green-700">{formatVND(item.output_paid)}₫</TableCell>
                                                <TableCell className="text-right">{formatVND(item.input_invoiced)}₫</TableCell>
                                                <TableCell className={`text-right font-medium ${item.gap > 0 ? 'text-green-700' : 'text-rose-700'}`}>
                                                    {item.gap > 0 ? '+' : ''}{formatVND(item.gap)}₫
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className={`text-xs ${config.color}`}>
                                                        {config.label}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
