import { BarChart3 } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Báo cáo</h1>
        <p className="text-muted-foreground">Báo cáo doanh thu, lãi/lỗ, và phân tích tài chính</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium text-foreground">Module đang phát triển</h3>
        <p className="mt-2 text-sm text-muted-foreground">Báo cáo tài chính sẽ được migrate từ CRM</p>
      </div>
    </div>
  )
}
