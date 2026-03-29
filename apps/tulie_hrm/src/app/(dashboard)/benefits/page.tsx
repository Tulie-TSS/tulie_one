'use client'
import { Card, CardContent } from '@repo/ui'
import { Heart, Gift, Coffee, Plane } from 'lucide-react'
export default function BenefitsPage() {
  return (<div className="space-y-6"><div><h1 className="text-2xl font-semibold tracking-tight">Phúc lợi</h1><p className="text-sm text-muted-foreground">Chương trình phúc lợi nhân viên</p></div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[{ icon: Heart, title: 'Bảo hiểm sức khỏe', desc: 'Bảo hiểm PVI Premium cho NV & gia đình', active: 48 },
        { icon: Coffee, title: 'Ăn trưa', desc: 'Phụ cấp 40.000đ/ngày', active: 48 },
        { icon: Gift, title: 'Sinh nhật', desc: 'Quà tặng 500.000đ + 1/2 ngày nghỉ', active: 48 },
        { icon: Plane, title: 'Du lịch công ty', desc: 'Team building 2 lần/năm', active: 48 },
      ].map(b => (
        <Card key={b.title}><CardContent className="p-6"><b.icon className="h-8 w-8 mb-3 text-muted-foreground" /><h3 className="font-medium">{b.title}</h3><p className="text-xs text-muted-foreground mt-1">{b.desc}</p><p className="text-xs text-green-600 mt-2">{b.active} NV tham gia</p></CardContent></Card>
      ))}
    </div></div>)
}
