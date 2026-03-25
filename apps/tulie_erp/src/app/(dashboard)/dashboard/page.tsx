import {
  FileText,
  CreditCard,
  Package,
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
} from 'lucide-react'

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
}: {
  title: string
  value: string
  change: string
  icon: React.ElementType
  trend: 'up' | 'down' | 'neutral'
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <span
          className={`flex items-center gap-1 text-xs font-medium ${
            trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
          }`}
        >
          {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : trend === 'down' ? <TrendingDown className="h-3 w-3" /> : null}
          {change}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tổng quan tài chính</h1>
        <p className="text-muted-foreground">Quản lý tài chính và vận hành doanh nghiệp</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Doanh thu tháng"
          value="--"
          change="Đang tải..."
          icon={DollarSign}
          trend="neutral"
        />
        <StatCard
          title="Hóa đơn chờ thanh toán"
          value="--"
          change="Đang tải..."
          icon={FileText}
          trend="neutral"
        />
        <StatCard
          title="Thanh toán đã nhận"
          value="--"
          change="Đang tải..."
          icon={CreditCard}
          trend="neutral"
        />
        <StatCard
          title="Hóa đơn quá hạn"
          value="--"
          change="Cần xử lý"
          icon={AlertTriangle}
          trend="neutral"
        />
      </div>

      {/* Placeholder sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Doanh thu theo tháng</h2>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <p className="text-sm">Kết nối dữ liệu để hiển thị biểu đồ</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Hoạt động gần đây</h2>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <p className="text-sm">Chưa có hoạt động nào</p>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { name: 'Tạo hóa đơn', icon: FileText, href: '/invoices/new', color: 'bg-blue-500' },
          { name: 'Quản lý sản phẩm', icon: Package, href: '/products', color: 'bg-emerald-500' },
          { name: 'Nhà cung cấp', icon: Building2, href: '/vendors', color: 'bg-amber-500' },
          { name: 'Dòng tiền', icon: TrendingUp, href: '/cash-flow', color: 'bg-purple-500' },
        ].map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.color} text-white`}>
              <item.icon className="h-5 w-5" />
            </div>
            <span className="font-medium text-foreground group-hover:text-primary transition-colors">{item.name}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
