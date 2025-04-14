'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { BarChart3 } from 'lucide-react'
export default function ReportsPage() {
  return (<div className="space-y-6"><div><h1 className="text-2xl font-semibold tracking-tight">Báo cáo</h1><p className="text-sm text-muted-foreground">Báo cáo nhân sự tổng hợp</p></div>
    <div className="grid gap-4 md:grid-cols-2">
      {[{ title: 'BC Nhân sự phòng ban', desc: 'Thống kê nhân sự theo phòng ban, vị trí' },
        { title: 'BC Lương & Thu nhập', desc: 'Tổng hợp lương, phụ cấp, thuế TNCN' },
        { title: 'BC Bảo hiểm', desc: 'BHXH/BHYT/BHTN theo tháng' },
        { title: 'BC Chấm công', desc: 'Ngày công, OT, nghỉ phép theo tháng' },
        { title: 'BC Biến động nhân sự', desc: 'Tuyển mới, nghỉ việc, thuyên chuyển' },
        { title: 'BC KPI đánh giá', desc: 'Tổng hợp đánh giá hiệu suất theo quý' },
      ].map(r => (
        <Card key={r.title} className="cursor-pointer hover:border-primary/50 transition-colors"><CardContent className="p-4 flex items-start gap-3"><BarChart3 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" /><div><p className="font-medium text-sm">{r.title}</p><p className="text-xs text-muted-foreground mt-1">{r.desc}</p></div></CardContent></Card>
      ))}
    </div></div>)
}
