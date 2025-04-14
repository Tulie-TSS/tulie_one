import { getDashboardStats, getRevenueChartData } from '@/lib/supabase/services/dashboard-service'
import { getInvoices } from '@/lib/supabase/services/invoice-service'
import {
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import Link from 'next/link'
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction, CardFooter,
  Progress, Badge,
} from '@repo/ui'
import { cn } from '@/lib/utils'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export default async function DashboardPage() {
  let stats = null
  let invoices: any[] = []
  let revenueData: any[] = []

  try {
    stats = await getDashboardStats()
  } catch {}
  try {
    invoices = await getInvoices()
  } catch {}
  try {
    revenueData = await getRevenueChartData()
  } catch {}

  const paidInvoices = invoices.filter(i => i.type === 'output' && i.status === 'paid')
  const pendingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'partial')
  const overdueInvoices = invoices.filter(i => i.status === 'overdue')

  const totalRevenue = paidInvoices.reduce((s, i) => s + i.total_amount, 0)
  const totalPending = pendingInvoices.reduce((s, i) => s + (i.total_amount - i.paid_amount), 0)
  const totalOverdue = overdueInvoices.reduce((s, i) => s + (i.total_amount - i.paid_amount), 0)
  const totalInvoices = invoices.length

  const recoveryRate = totalRevenue + totalPending + totalOverdue > 0
    ? Math.round((totalRevenue / (totalRevenue + totalPending + totalOverdue)) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Tổng quan tài chính</h1>
        <p className="text-sm text-muted-foreground">Quản lý tài chính và vận hành doanh nghiệp</p>
      </div>

      {/* KPI Grid — shadcn dashboard-01 pattern */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Doanh thu (đã thu)</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {formatCurrency(stats?.revenue?.total ?? totalRevenue)}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">Tổng doanh thu đã ghi nhận</div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Chờ thanh toán</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {formatCurrency(totalPending)}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">{pendingInvoices.length} hóa đơn</div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Quá hạn thanh toán</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {formatCurrency(totalOverdue)}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">
              {overdueInvoices.length > 0 ? `${overdueInvoices.length} cần xử lý` : 'Không có'}
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Tổng giao dịch</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {totalInvoices}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">Hóa đơn mua & bán</div>
          </CardFooter>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Hóa đơn gần đây</CardTitle>
            <CardAction>
              <Link href="/invoices" className="text-xs font-semibold text-primary hover:underline">Xem tất cả</Link>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Chưa có hóa đơn nào</p>
            ) : (
              <div className="space-y-4 px-6 pb-2">
                {invoices.slice(0, 5).map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{inv.invoice_number}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{inv.customer?.company_name || inv.vendor?.name || '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">{formatCurrency(inv.total_amount)}</p>
                      <Badge variant={inv.status === 'paid' ? 'default' : inv.status === 'overdue' ? 'destructive' : 'secondary'} className="text-xs">
                        {inv.status === 'paid' ? 'Đã thanh toán' : inv.status === 'overdue' ? 'Quá hạn' : inv.status === 'sent' ? 'Chờ TT' : inv.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Health */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 grid-cols-2">
                {[
                  { name: 'Tạo hóa đơn', href: '/invoices/new' },
                  { name: 'Xem thanh toán', href: '/payments' },
                  { name: 'Sản phẩm', href: '/products' },
                  { name: 'Nhà cung cấp', href: '/vendors' },
                ].map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Sức khỏe tài chính</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Tỷ lệ thu hồi</span>
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">
                    {recoveryRate}%
                  </span>
                </div>
                <Progress value={recoveryRate} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Hóa đơn quá hạn</span>
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">
                    {overdueInvoices.length} / {totalInvoices}
                  </span>
                </div>
                <Progress value={totalInvoices > 0 ? (overdueInvoices.length / totalInvoices) * 100 : 0} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
