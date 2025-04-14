'use client'

import { CalendarCheck, Check, X, Clock, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Avatar, AvatarFallback } from '@repo/ui'

const ATTENDANCE_TODAY = [
  { name: 'Nguyễn Văn A', department: 'Kỹ thuật', checkIn: '08:02', checkOut: '17:35', status: 'ON_TIME', hours: 8.5 },
  { name: 'Trần Thị B', department: 'Marketing', checkIn: '08:15', checkOut: '17:30', status: 'LATE', hours: 8.25 },
  { name: 'Lê Hoàng C', department: 'Kinh doanh', checkIn: '07:55', checkOut: '—', status: 'WORKING', hours: 0 },
  { name: 'Phạm Minh D', department: 'Design', checkIn: '08:30', checkOut: '—', status: 'LATE', hours: 0 },
  { name: 'Hoàng Thị E', department: 'Kế toán', checkIn: '08:00', checkOut: '17:30', status: 'ON_TIME', hours: 8.5 },
  { name: 'Vũ Đức F', department: 'Kỹ thuật', checkIn: '—', checkOut: '—', status: 'ABSENT', hours: 0 },
  { name: 'Đỗ Quang G', department: 'Kỹ thuật', checkIn: '08:05', checkOut: '—', status: 'WORKING', hours: 0 },
  { name: 'Ngô Thị H', department: 'Hành chính', checkIn: '—', checkOut: '—', status: 'ON_LEAVE', hours: 0 },
]

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof Check }> = {
  ON_TIME: { label: 'Đúng giờ', color: 'bg-green-100 text-green-700', icon: Check },
  LATE: { label: 'Đi muộn', color: 'bg-amber-100 text-amber-700', icon: Clock },
  WORKING: { label: 'Đang làm', color: 'bg-blue-100 text-blue-700', icon: CalendarCheck },
  ABSENT: { label: 'Vắng mặt', color: 'bg-red-100 text-red-700', icon: X },
  ON_LEAVE: { label: 'Nghỉ phép', color: 'bg-purple-100 text-purple-700', icon: AlertTriangle },
}

export default function AttendancePage() {
  const present = ATTENDANCE_TODAY.filter(a => !['ABSENT', 'ON_LEAVE'].includes(a.status)).length
  const late = ATTENDANCE_TODAY.filter(a => a.status === 'LATE').length
  const absent = ATTENDANCE_TODAY.filter(a => a.status === 'ABSENT').length
  const onLeave = ATTENDANCE_TODAY.filter(a => a.status === 'ON_LEAVE').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Chấm công</h1>
        <p className="text-sm text-muted-foreground">Hôm nay — Thứ Bảy, 29/03/2026</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Tổng NV</p>
          <p className="text-2xl font-bold">{ATTENDANCE_TODAY.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Có mặt</p>
          <p className="text-2xl font-bold text-green-600">{present}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Đi muộn</p>
          <p className="text-2xl font-bold text-amber-600">{late}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Vắng</p>
          <p className="text-2xl font-bold text-red-600">{absent}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Nghỉ phép</p>
          <p className="text-2xl font-bold text-purple-600">{onLeave}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Bảng chấm công hôm nay</CardTitle>
          <CardDescription>Giờ làm việc: 08:00 - 17:30</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Phòng ban</TableHead>
                <TableHead className="text-center w-[100px]">Check-in</TableHead>
                <TableHead className="text-center w-[100px]">Check-out</TableHead>
                <TableHead className="text-center w-[80px]">Giờ làm</TableHead>
                <TableHead className="w-[120px]">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ATTENDANCE_TODAY.map(att => {
                const statusCfg = STATUS_MAP[att.status]
                return (
                  <TableRow key={att.name}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{att.name.split(' ').pop()?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{att.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{att.department}</TableCell>
                    <TableCell className="text-center font-mono text-sm">{att.checkIn}</TableCell>
                    <TableCell className="text-center font-mono text-sm">{att.checkOut}</TableCell>
                    <TableCell className="text-center font-mono text-sm">{att.hours > 0 ? `${att.hours}h` : '—'}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${statusCfg?.color || ''}`} variant="secondary">
                        {statusCfg?.label || att.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
