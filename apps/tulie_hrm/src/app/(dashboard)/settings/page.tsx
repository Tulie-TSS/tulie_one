'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { Settings } from 'lucide-react'
export default function SettingsPage() {
  return (<div className="space-y-6"><div><h1 className="text-2xl font-semibold tracking-tight">Cài đặt</h1><p className="text-sm text-muted-foreground">Cấu hình hệ thống HRM</p></div>
    <div className="grid gap-4 md:grid-cols-2">
      {[{ title: 'Phòng ban & Chức vụ', desc: 'Quản lý cơ cấu tổ chức' },
        { title: 'Giờ làm việc', desc: 'Cấu hình ca, giờ check-in/out' },
        { title: 'Chính sách nghỉ phép', desc: 'Số ngày phép, quy định nghỉ' },
        { title: 'Tham số lương', desc: 'Mức lương cơ sở, phụ cấp, thuế' },
      ].map(s => (
        <Card key={s.title} className="cursor-pointer hover:border-primary/50 transition-colors"><CardContent className="p-4 flex items-start gap-3"><Settings className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" /><div><p className="font-medium text-sm">{s.title}</p><p className="text-xs text-muted-foreground mt-1">{s.desc}</p></div></CardContent></Card>
      ))}
    </div></div>)
}
