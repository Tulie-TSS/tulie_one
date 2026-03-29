'use client'
import { UserPlus, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui'

const POSITIONS = [
  { title: 'Senior Frontend Developer', department: 'Kỹ thuật', location: 'Hà Nội', applications: 12, status: 'OPEN', deadline: '2026-04-15' },
  { title: 'Content Marketing Specialist', department: 'Marketing', location: 'TP.HCM', applications: 8, status: 'OPEN', deadline: '2026-04-10' },
  { title: 'UX/UI Designer', department: 'Design', location: 'Remote', applications: 15, status: 'INTERVIEWING', deadline: '2026-03-31' },
  { title: 'Sales Manager', department: 'Kinh doanh', location: 'Hà Nội', applications: 5, status: 'CLOSED', deadline: '2026-03-15' },
]

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Đang tuyển', color: 'bg-green-100 text-green-700' },
  INTERVIEWING: { label: 'Phỏng vấn', color: 'bg-blue-100 text-blue-700' },
  CLOSED: { label: 'Đã đóng', color: 'bg-gray-100 text-gray-700' },
}

export default function RecruitmentPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tuyển dụng</h1>
          <p className="text-sm text-muted-foreground">Quản lý tin tuyển dụng và ứng viên</p>
        </div>
        <Button size="sm"><Plus className="mr-2 h-4 w-4" />Đăng tin tuyển</Button>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Vị trí đang tuyển</p><p className="text-2xl font-bold text-green-600">{POSITIONS.filter(p => p.status === 'OPEN').length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Tổng ứng viên</p><p className="text-2xl font-bold">{POSITIONS.reduce((s, p) => s + p.applications, 0)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Đang phỏng vấn</p><p className="text-2xl font-bold text-blue-600">{POSITIONS.filter(p => p.status === 'INTERVIEWING').length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Đã đóng</p><p className="text-2xl font-bold text-muted-foreground">{POSITIONS.filter(p => p.status === 'CLOSED').length}</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Vị trí tuyển dụng</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Vị trí</TableHead><TableHead>Phòng ban</TableHead><TableHead>Địa điểm</TableHead>
              <TableHead className="text-center">Ứng viên</TableHead><TableHead>Hạn</TableHead><TableHead>Trạng thái</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {POSITIONS.map(p => (
                <TableRow key={p.title}><TableCell className="font-medium">{p.title}</TableCell><TableCell className="text-sm text-muted-foreground">{p.department}</TableCell><TableCell className="text-sm">{p.location}</TableCell><TableCell className="text-center font-bold">{p.applications}</TableCell><TableCell className="text-sm text-muted-foreground">{p.deadline}</TableCell><TableCell><Badge className={`text-xs ${STATUS_MAP[p.status]?.color}`} variant="secondary">{STATUS_MAP[p.status]?.label}</Badge></TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
