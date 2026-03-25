import { TrendingUp } from 'lucide-react'

export default function CashFlowPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dòng tiền</h1>
        <p className="text-muted-foreground">Theo dõi dòng tiền, đối soát ngân hàng và dự báo</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium text-foreground">Module mới</h3>
        <p className="mt-2 text-sm text-muted-foreground">Quản lý dòng tiền, đối soát SePay tự động, dự báo cash flow</p>
      </div>
    </div>
  )
}
