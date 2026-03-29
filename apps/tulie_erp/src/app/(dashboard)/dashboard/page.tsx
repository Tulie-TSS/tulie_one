import { getDashboardStats, getRevenueChartData } from '@/lib/supabase/services/dashboard-service'
import { getInvoices } from '@/lib/supabase/services/invoice-service'
import {
  DollarSign,
  FileText,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, Progress } from '@repo/ui'
import { cn } from '@/lib/utils'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

function StatCard({
  title, value, subtitle, icon: Icon, href
}: {
  title: string; value: string; subtitle?: string; icon: React.ElementType; href?: string;
}) {
  const content = (
    <Card className={cn("shadow-sm h-full flex flex-col justify-between transition-colors", href && "hover:bg-muted/50")}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(subtitle || href) && (
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">{subtitle}</p>
            {href && <ArrowUpRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        )}
      </CardContent>
    </Card>
  )
  return href ? <Link href={href} className="block">{content}</Link> : content
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

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Doanh thu (đã thu)"
          value={formatCurrency(stats?.revenue?.total ?? totalRevenue)}
          icon={DollarSign}
          href="/reports"
        />
        <StatCard
          title="Chờ thanh toán"
          value={formatCurrency(totalPending)}
          subtitle={`${pendingInvoices.length} hóa đơn`}
          icon={FileText}
          href="/invoices"
        />
        <StatCard
          title="Quá hạn thanh toán"
          value={formatCurrency(totalOverdue)}
          subtitle={overdueInvoices.length > 0 ? `${overdueInvoices.length} cần xử lý` : 'Không có'}
          icon={AlertTriangle}
          href="/invoices"
        />
        <StatCard
          title="Tổng giao dịch"
          value={String(totalInvoices)}
          subtitle="Hóa đơn mua & bán"
          icon={CreditCard}
          href="/payments"
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent invoices */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-medium">Hóa đơn gần đây</CardTitle>
            <Link href="/invoices" className="text-xs font-semibold text-primary">Xem tất cả</Link>
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
                      <p className="text-sm font-semibold">{formatCurrency(inv.total_amount)}</p>
                      <p className={`text-xs font-medium ${inv.status === 'paid' ? 'text-emerald-500' : inv.status === 'overdue' ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {inv.status === 'paid' ? 'Đã thanh toán' : inv.status === 'overdue' ? 'Quá hạn' : inv.status === 'sent' ? 'Chờ TT' : inv.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Health */}
        <div className="flex flex-col gap-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 grid-cols-2">
                {[
                  { name: 'Tạo hóa đơn', href: '/invoices/new', icon: FileText },
                  { name: 'Xem thanh toán', href: '/payments', icon: CreditCard },
                  { name: 'Sản phẩm', href: '/products', icon: TrendingUp },
                  { name: 'Nhà cung cấp', href: '/vendors', icon: TrendingDown },
                ].map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Sức khỏe tài chính</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Tỷ lệ thu hồi</span>
                  <span className="text-xs font-medium text-emerald-500">
                    {recoveryRate}%
                  </span>
                </div>
                <Progress value={recoveryRate} className="h-2 [&>div]:bg-emerald-500" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Hóa đơn quá hạn</span>
                  <span className={`text-xs font-medium ${overdueInvoices.length > 0 ? 'text-destructive' : 'text-emerald-500'}`}>
                    {overdueInvoices.length} / {totalInvoices}
                  </span>
                </div>
                <Progress value={totalInvoices > 0 ? (overdueInvoices.length / totalInvoices) * 100 : 0} className="h-2 [&>div]:bg-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
