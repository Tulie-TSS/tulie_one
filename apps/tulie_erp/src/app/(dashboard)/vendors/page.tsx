import { Building2 } from 'lucide-react'

export default function VendorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nhà cung cấp</h1>
        <p className="text-muted-foreground">Quản lý thông tin nhà cung cấp và đối tác</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium text-foreground">Module đang phát triển</h3>
        <p className="mt-2 text-sm text-muted-foreground">Tính năng quản lý nhà cung cấp sẽ được migrate từ CRM</p>
      </div>
    </div>
  )
}
