import { getInvoices } from '@/lib/supabase/services/invoice-service'
import { CreditCard, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react'
import { Badge } from "@repo/ui"
import { format } from 'date-fns'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export default async function PaymentsPage() {
  const invoices = await getInvoices()

  // Extract payments from invoices
  const allPayments = invoices
    .flatMap(inv => (inv.payments || []).map(p => ({ ...p, invoice: inv })))
    .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())

  const totalReceived = allPayments
    .filter(p => p.invoice.type === 'output')
    .reduce((s, p) => s + p.amount, 0)
  const totalPaid = allPayments
    .filter(p => p.invoice.type === 'input')
    .reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Thanh toán</h1>
        <p className="text-muted-foreground">Theo dõi thanh toán và đối soát công nợ</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng đã thu</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalReceived)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <ArrowUpRight className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng đã chi</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(totalPaid)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Số giao dịch</p>
              <p className="text-xl font-bold text-foreground">{allPayments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment list */}
      {allPayments.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-foreground">Chưa có giao dịch nào</h3>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Ngày</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Hóa đơn</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Khách hàng / NCC</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Phương thức</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Số tiền</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allPayments.slice(0, 50).map((payment) => (
                <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-foreground">
                    {format(new Date(payment.payment_date), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {payment.invoice.invoice_number}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {payment.invoice.customer?.company_name || payment.invoice.vendor?.name || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{payment.payment_method}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    <span className={payment.invoice.type === 'output' ? 'text-emerald-600' : 'text-red-600'}>
                      {payment.invoice.type === 'output' ? '+' : '-'}{formatCurrency(payment.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground truncate max-w-[200px]">
                    {payment.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
