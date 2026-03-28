'use client'

import { Invoice } from '@/types'
import { Badge } from "@repo/ui"
import { format } from 'date-fns'
import Link from 'next/link'
import { FileText, Eye, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

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
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium text-foreground">Chưa có hóa đơn nào</h3>
        <p className="mt-2 text-sm text-muted-foreground">Tạo hóa đơn đầu tiên để bắt đầu</p>
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
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Đã thu</p>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Chờ thanh toán</p>
          <p className="text-xl font-bold text-amber-600">{formatCurrency(totalPending)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Quá hạn</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(totalOverdue)}</p>
        </div>
      </div>

      {/* Invoice table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Số hóa đơn</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Loại</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Khách hàng / NCC</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tổng tiền</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Đã thanh toán</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Hạn thanh toán</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Trạng thái</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invoices.map((invoice) => {
              const status = statusConfig[invoice.status] || { label: invoice.status, variant: 'secondary' as const }
              return (
                <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">{invoice.invoice_number}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-sm">
                      {invoice.type === 'output' ? (
                        <><ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" /> <span className="text-emerald-600">Đầu ra</span></>
                      ) : (
                        <><ArrowDownLeft className="h-3.5 w-3.5 text-blue-500" /> <span className="text-blue-600">Đầu vào</span></>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {invoice.customer?.company_name || invoice.vendor?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {formatCurrency(invoice.total_amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {formatCurrency(invoice.paid_amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {format(new Date(invoice.due_date), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Xem
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
