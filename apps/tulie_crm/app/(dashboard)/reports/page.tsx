import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '@repo/ui'
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/* CRM Reports */}
        <Link href="/reports/sales" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
          <Card className="h-full group transition-colors hover:bg-muted/40 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <CardTitle className="text-base text-foreground mt-2">Báo cáo Bán hàng</CardTitle>
              <CardDescription className="text-sm mt-1">Pipeline, deals, conversion rate</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/reports/customers" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
          <Card className="h-full group transition-colors hover:bg-muted/40 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <CardTitle className="text-base text-foreground mt-2">Báo cáo Khách hàng</CardTitle>
              <CardDescription className="text-sm mt-1">Phân tích khách hàng, segments, LTV</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/reports/performance" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
          <Card className="h-full group transition-colors hover:bg-muted/40 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <CardTitle className="text-base text-foreground mt-2">Hiệu suất Team</CardTitle>
              <CardDescription className="text-sm mt-1">KPI nhân viên, target, activities</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/* ERP Financial Reports */}
        <a href={process.env.NEXT_PUBLIC_ERP_URL ? `${process.env.NEXT_PUBLIC_ERP_URL}/reports` : 'http://localhost:3003/reports'} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
          <Card className="h-full group transition-colors hover:bg-muted/40 shadow-sm relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <CardTitle className="text-base text-foreground mt-2 flex items-center gap-2">
                Báo cáo Tài chính
              </CardTitle>
              <CardDescription className="text-sm mt-1">Doanh thu, P&L, công nợ, thuế → Tulie ERP</CardDescription>
            </CardHeader>
          </Card>
        </a>
      </div>
    </div>
  )
}
