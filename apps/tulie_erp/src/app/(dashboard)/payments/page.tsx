import { getInvoices } from '@/lib/supabase/services/invoice-service'
import { CreditCard, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react'
import { Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@repo/ui"
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
        <h1 className="text-2xl text-foreground">Thanh toán</h1>
        <p className="text-muted-foreground">Theo dõi thanh toán và đối soát công nợ</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng đã thu</p>
              <p className="text-xl text-emerald-600">{formatCurrency(totalReceived)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-md border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <ArrowUpRight className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng đã chi</p>
              <p className="text-xl text-red-600">{formatCurrency(totalPaid)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-md border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Số giao dịch</p>
              <p className="text-xl text-foreground">{allPayments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment list */}
      {allPayments.length === 0 ? (
        <div className="rounded-md border border-border p-12 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-foreground">Chưa có giao dịch nào</h3>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Hóa đơn</TableHead>
                <TableHead>Khách hàng / NCC</TableHead>
                <TableHead>Phương thức</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead>Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPayments.slice(0, 50).map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-foreground">
                    {format(new Date(payment.payment_date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {payment.invoice.invoice_number}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {payment.invoice.customer?.company_name || payment.invoice.vendor?.name || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{payment.payment_method}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <span className={payment.invoice.type === 'output' ? 'text-emerald-600' : 'text-red-600'}>
                      {payment.invoice.type === 'output' ? '+' : '-'}{formatCurrency(payment.amount)}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground truncate max-w-[200px]">
                    {payment.notes || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
