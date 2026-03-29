import { Receipt } from 'lucide-react'

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Chi phí</h1>
        <p className="text-muted-foreground">Quản lý chi phí vận hành và kiểm soát ngân sách</p>
      </div>
      <div className="rounded-md border border-border bg-card p-12 text-center">
        <Receipt className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium text-foreground">Module mới</h3>
        <p className="mt-2 text-sm text-muted-foreground">Quản lý chi phí, phê duyệt chi, theo dõi budget</p>
      </div>
    </div>
  )
}
