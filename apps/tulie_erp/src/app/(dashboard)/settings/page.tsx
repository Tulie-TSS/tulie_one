import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cài đặt</h1>
        <p className="text-muted-foreground">Cấu hình hệ thống ERP</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <Settings className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium text-foreground">Cài đặt hệ thống</h3>
        <p className="mt-2 text-sm text-muted-foreground">Cấu hình thanh toán, thuế, Telegram, và tích hợp</p>
      </div>
    </div>
  )
}
