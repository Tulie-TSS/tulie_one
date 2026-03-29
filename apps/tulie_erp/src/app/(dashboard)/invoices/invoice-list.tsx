'use client'

import { Invoice } from '@/types'
import { Badge } from "@repo/ui"
import { format } from 'date-fns'
import Link from 'next/link'
import { FileText, Eye, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui'
import { Button } from '@repo/ui'

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Nháp', variant: 'secondary' },
  sent: { label: 'Đã gửi', variant: 'default' },
  paid: { label: 'Đã thanh toán', variant: 'default' },
  partial: { label: 'Thanh toán một phần', variant: 'outline' },
  overdue: { label: 'Quá hạn', variant: 'destructive' },
  cancelled: { label: 'Đã hủy', variant: 'secondary' },
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center rounded-md border border-dashed text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium">Chưa có hóa đơn nào</h3>
        <p className="mt-2 text-sm text-muted-foreground mb-4">Tạo hóa đơn đầu tiên để bắt đầu quản lý</p>
      </div>
    )
  }

  // Stats
  const totalRevenue = invoices.filter(i => i.type === 'output' && i.status === 'paid').reduce((s, i) => s + i.total_amount, 0)
  const totalPending = invoices.filter(i => i.status === 'sent' || i.status === 'partial').reduce((s, i) => s + (i.total_amount - i.paid_amount), 0)
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + (i.total_amount - i.paid_amount), 0)

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Đã thu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-emerald-600">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Chờ thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-amber-600">{formatCurrency(totalPending)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Quá hạn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-destructive">{formatCurrency(totalOverdue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Số hóa đơn</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Khách hàng / NCC</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Đã thanh toán</TableHead>
              <TableHead>Hạn thanh toán</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => {
              const status = statusConfig[invoice.status] || { label: invoice.status, variant: 'secondary' as const }
              return (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium text-foreground">
                    {invoice.invoice_number}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1">
                      {invoice.type === 'output' ? (
                        <><ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" /> <span className="text-emerald-600 text-xs font-medium">Đầu ra</span></>
                      ) : (
                        <><ArrowDownLeft className="h-3.5 w-3.5 text-blue-500" /> <span className="text-blue-600 text-xs font-medium">Đầu vào</span></>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    {invoice.customer?.company_name || invoice.vendor?.name || '—'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(invoice.total_amount)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(invoice.paid_amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(invoice.due_date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant} className="whitespace-nowrap font-medium">
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/invoices/${invoice.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Xem</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
