import { FileText } from 'lucide-react'

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hóa đơn</h1>
          <p className="text-muted-foreground">Quản lý hóa đơn đầu ra và đầu vào</p>
        </div>
        <a
          href="/invoices/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <FileText className="h-4 w-4" />
          Tạo hóa đơn
        </a>
      </div>
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium text-foreground">Module đang phát triển</h3>
        <p className="mt-2 text-sm text-muted-foreground">Tính năng quản lý hóa đơn sẽ được migrate từ CRM</p>
      </div>
    </div>
  )
}
