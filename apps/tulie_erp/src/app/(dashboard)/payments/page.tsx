import { CreditCard } from 'lucide-react'

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Thanh toán</h1>
        <p className="text-muted-foreground">Theo dõi thanh toán và đối soát công nợ</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium text-foreground">Module đang phát triển</h3>
        <p className="mt-2 text-sm text-muted-foreground">Tính năng quản lý thanh toán sẽ được migrate từ CRM</p>
      </div>
    </div>
  )
}
