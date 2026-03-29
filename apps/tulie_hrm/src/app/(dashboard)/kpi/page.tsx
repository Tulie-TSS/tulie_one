'use client'
import { Card, CardContent, CardHeader, CardTitle, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui'
import { Target } from 'lucide-react'
const KPI_DATA = [
  { name: 'Nguyễn Văn A', department: 'Kỹ thuật', q1: 92, q2: 88, q3: 95, rating: 'A' },
  { name: 'Trần Thị B', department: 'Marketing', q1: 85, q2: 90, q3: 87, rating: 'B+' },
  { name: 'Lê Hoàng C', department: 'Kinh doanh', q1: 78, q2: 82, q3: 85, rating: 'B' },
  { name: 'Phạm Minh D', department: 'Design', q1: 90, q2: 93, q3: 91, rating: 'A' },
  { name: 'Hoàng Thị E', department: 'Kế toán', q1: 88, q2: 86, q3: 90, rating: 'B+' },
]
const RATING_COLORS: Record<string, string> = { 'A': 'bg-green-100 text-green-700', 'B+': 'bg-blue-100 text-blue-700', 'B': 'bg-amber-100 text-amber-700', 'C': 'bg-red-100 text-red-700' }
export default function KPIPage() {
  return (<div className="space-y-6"><div><h1 className="text-2xl font-semibold tracking-tight">KPI / Đánh giá</h1><p className="text-sm text-muted-foreground">Đánh giá hiệu suất nhân viên theo quý</p></div>
    <Card><CardHeader className="pb-3"><CardTitle className="text-base">Bảng đánh giá KPI 2026</CardTitle></CardHeader><CardContent className="p-0">
      <Table><TableHeader><TableRow><TableHead>Nhân viên</TableHead><TableHead>Phòng ban</TableHead><TableHead className="text-center">Q1</TableHead><TableHead className="text-center">Q2</TableHead><TableHead className="text-center">Q3</TableHead><TableHead className="text-center">Xếp loại</TableHead></TableRow></TableHeader>
        <TableBody>{KPI_DATA.map(k => (<TableRow key={k.name}><TableCell className="font-medium">{k.name}</TableCell><TableCell className="text-sm text-muted-foreground">{k.department}</TableCell><TableCell className="text-center font-mono">{k.q1}</TableCell><TableCell className="text-center font-mono">{k.q2}</TableCell><TableCell className="text-center font-mono">{k.q3}</TableCell><TableCell className="text-center"><Badge className={`text-xs ${RATING_COLORS[k.rating]}`} variant="secondary">{k.rating}</Badge></TableCell></TableRow>))}</TableBody></Table>
    </CardContent></Card></div>)
}
