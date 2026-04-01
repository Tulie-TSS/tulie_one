import Link from 'next/link'
import { BarChart3, Users, TrendingUp, DollarSign, ArrowUpRight } from 'lucide-react'

// Main reports page now serves as a hub:
// - Sales & Customer reports → stay in CRM
// - Financial reports → redirect to ERP

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Báo cáo</h1>
        <p className="text-muted-foreground">Chọn loại báo cáo cần xem</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* CRM Reports */}
        <Link
          href="/reports/sales"
          className="group rounded-md border border-border p-6 hover: hover:border-primary/20 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Báo cáo Bán hàng</h3>
          <p className="text-sm text-muted-foreground mt-1">Pipeline, deals, conversion rate</p>
        </Link>

        <Link
          href="/reports/customers"
          className="group rounded-md border border-border p-6 hover: hover:border-primary/20 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Báo cáo Khách hàng</h3>
          <p className="text-sm text-muted-foreground mt-1">Phân tích khách hàng, segments, LTV</p>
        </Link>

        <Link
          href="/reports/performance"
          className="group rounded-md border border-border p-6 hover: hover:border-primary/20 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Hiệu suất Team</h3>
          <p className="text-sm text-muted-foreground mt-1">KPI nhân viên, target, activities</p>
        </Link>

        {/* ERP Financial Reports */}
        <a
          href="http://localhost:3003/reports"
          className="group rounded-md border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-950/20 p-6 hover: transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex w-10 items-center justify-center rounded-lg bg-orange-500/10">
              <DollarSign className="h-5 w-5 text-orange-600" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-orange-400 group-hover:text-orange-600" />
          </div>
          <h3 className="font-semibold text-foreground">Báo cáo Tài chính</h3>
          <p className="text-sm text-muted-foreground mt-1">Doanh thu, P&L, công nợ, thuế → Tulie ERP</p>
        </a>
      </div>
    </div>
  )
}
