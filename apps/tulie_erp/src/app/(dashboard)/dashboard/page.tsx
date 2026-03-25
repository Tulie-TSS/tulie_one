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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

function StatCard({
  title, value, subtitle, icon: Icon, color, href, gradient
}: {
  title: string; value: string; subtitle?: string; icon: React.ElementType; color: string; href?: string; gradient?: string
}) {
  const content = (
    <>
      {gradient && (
        <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${gradient}`} />
      )}
      <div className="relative z-10 flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {href && <ArrowUpRight className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="relative z-10 mt-4">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </>
  )
  const cls = "relative group overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow block"
  return href ? <Link href={href} className={cls}>{content}</Link> : <div className={cls}>{content}</div>
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

  // Calculate from invoices as fallback
  const paidInvoices = invoices.filter(i => i.type === 'output' && i.status === 'paid')
  const pendingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'partial')
  const overdueInvoices = invoices.filter(i => i.status === 'overdue')

  const totalRevenue = paidInvoices.reduce((s, i) => s + i.total_amount, 0)
  const totalPending = pendingInvoices.reduce((s, i) => s + (i.total_amount - i.paid_amount), 0)
  const totalOverdue = overdueInvoices.reduce((s, i) => s + (i.total_amount - i.paid_amount), 0)
  const totalInvoices = invoices.length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tổng quan tài chính</h1>
        <p className="text-muted-foreground">Quản lý tài chính và vận hành doanh nghiệp</p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Doanh thu (đã thu)"
          value={formatCurrency(stats?.revenue?.total ?? totalRevenue)}
          icon={DollarSign}
          color="bg-emerald-500"
          href="/reports"
          gradient="from-emerald-500/20 to-teal-500/5"
        />
        <StatCard
          title="Chờ thanh toán"
          value={formatCurrency(totalPending)}
          subtitle={`${pendingInvoices.length} hóa đơn`}
          icon={FileText}
          color="bg-amber-500"
          href="/invoices"
          gradient="from-amber-500/20 to-orange-500/5"
        />
        <StatCard
          title="Quá hạn thanh toán"
          value={formatCurrency(totalOverdue)}
          subtitle={overdueInvoices.length > 0 ? `${overdueInvoices.length} hóa đơn cần xử lý` : 'Không có'}
          icon={AlertTriangle}
          color={totalOverdue > 0 ? 'bg-red-500' : 'bg-gray-400'}
          href="/invoices"
          gradient="from-rose-500/20 to-pink-500/5"
        />
        <StatCard
          title="Tổng giao dịch"
          value={String(totalInvoices)}
          subtitle="Hóa đơn đầu ra + đầu vào"
          icon={CreditCard}
          color="bg-blue-500"
          href="/payments"
          gradient="from-sky-500/20 to-blue-500/5"
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent invoices */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Hóa đơn gần đây</h2>
            <Link href="/invoices" className="text-sm text-primary hover:underline">Xem tất cả</Link>
          </div>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Chưa có hóa đơn nào</p>
          ) : (
            <div className="space-y-3">
              {invoices.slice(0, 5).map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{inv.invoice_number}</p>
                    <p className="text-xs text-muted-foreground">{inv.customer?.company_name || inv.vendor?.name || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{formatCurrency(inv.total_amount)}</p>
                    <p className={`text-xs ${inv.status === 'paid' ? 'text-emerald-600' : inv.status === 'overdue' ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {inv.status === 'paid' ? 'Đã thanh toán' : inv.status === 'overdue' ? 'Quá hạn' : inv.status === 'sent' ? 'Chờ TT' : inv.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Thao tác nhanh</h2>
          <div className="grid gap-3 grid-cols-2">
            {[
              { name: 'Tạo hóa đơn', href: '/invoices/new', icon: FileText, color: 'bg-blue-500' },
              { name: 'Xem thanh toán', href: '/payments', icon: CreditCard, color: 'bg-emerald-500' },
              { name: 'Sản phẩm', href: '/products', icon: TrendingUp, color: 'bg-purple-500' },
              { name: 'Nhà cung cấp', href: '/vendors', icon: TrendingDown, color: 'bg-amber-500' },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center gap-3 rounded-xl border border-border p-4 hover:shadow-md hover:border-primary/20 transition-all"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.color} text-white`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Health indicators */}
          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Sức khỏe tài chính</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Tỷ lệ thu hồi</span>
                <span className="text-sm font-medium text-emerald-600">
                  {totalRevenue + totalPending + totalOverdue > 0
                    ? Math.round((totalRevenue / (totalRevenue + totalPending + totalOverdue)) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Hóa đơn quá hạn</span>
                <span className={`text-sm font-medium ${overdueInvoices.length > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                  {overdueInvoices.length} / {totalInvoices}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
