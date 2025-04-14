'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction, CardFooter,
  Badge,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Progress,
} from '@repo/ui'
import { formatVND } from '@repo/vietnam'

const stats = [
  { label: 'Tổng nhân viên', value: '48', change: '+3', trendUp: true },
  { label: 'Tổng quỹ lương', value: formatVND(720000000), change: '+5%', trendUp: true },
  { label: 'Đi làm hôm nay', value: '45/48', change: '94%', trendUp: true },
  { label: 'HĐ sắp hết hạn', value: '4', change: 'tháng 4', trendUp: false },
]

const recentHires = [
  { name: 'Nguyễn Thị Mai', department: 'Marketing', position: 'Content Creator', startDate: '2026-03-15', status: 'THỬ VIỆC' },
  { name: 'Trần Văn Hùng', department: 'Kỹ thuật', position: 'Frontend Developer', startDate: '2026-03-10', status: 'THỬ VIỆC' },
  { name: 'Lê Hoàng Anh', department: 'Kinh doanh', position: 'Sales Executive', startDate: '2026-03-01', status: 'CHÍNH THỨC' },
]

const upcomingBirthdays = [
  { name: 'Phạm Minh Tú', department: 'Design', date: '01/04' },
  { name: 'Hoàng Thị Lan', department: 'Kế toán', date: '05/04' },
  { name: 'Đỗ Quang Vinh', department: 'Kỹ thuật', date: '12/04' },
]

const leaveRequests = [
  { name: 'Vũ Thị Hoa', type: 'Phép năm', from: '2026-04-01', to: '2026-04-03', days: 3, status: 'PENDING' },
  { name: 'Ngô Đức Thắng', type: 'Nghỉ ốm', from: '2026-03-29', to: '2026-03-30', days: 2, status: 'APPROVED' },
]

const departments = [
  { dept: 'Kỹ thuật', count: 15 },
  { dept: 'Kinh doanh', count: 12 },
  { dept: 'Marketing', count: 8 },
  { dept: 'Design', count: 6 },
  { dept: 'Kế toán', count: 4 },
  { dept: 'Hành chính', count: 3 },
]

export default function HRMDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard Nhân sự</h1>
        <p className="text-sm text-muted-foreground">Tổng quan quản trị nhân sự tháng 3/2026</p>
      </div>

      {/* Stats — shadcn dashboard-01 pattern */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
        {stats.map(stat => (
          <Card key={stat.label} className="@container/card">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {stat.value}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  {stat.trendUp ? <TrendingUp /> : <TrendingDown />}
                  {stat.change}
                </Badge>
              </CardAction>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Hires */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Nhân viên mới</CardTitle>
            <CardDescription>Tuyển dụng gần nhất</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>Ngày vào</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentHires.map(emp => (
                  <TableRow key={emp.name}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{emp.department}</TableCell>
                    <TableCell className="text-sm tabular-nums">{emp.startDate}</TableCell>
                    <TableCell>
                      <Badge variant={emp.status === 'CHÍNH THỨC' ? 'default' : 'secondary'} className="text-xs">
                        {emp.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Leave Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Đơn nghỉ phép</CardTitle>
            <CardDescription>Cần phê duyệt</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Số ngày</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveRequests.map(lr => (
                  <TableRow key={lr.name}>
                    <TableCell className="font-medium">{lr.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{lr.type}</TableCell>
                    <TableCell className="text-sm tabular-nums">{lr.days} ngày</TableCell>
                    <TableCell>
                      <Badge variant={lr.status === 'APPROVED' ? 'default' : 'outline'} className="text-xs">
                        {lr.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Upcoming birthdays */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">🎂 Sinh nhật sắp tới</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingBirthdays.map(b => (
                <div key={b.name} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.department}</p>
                  </div>
                  <Badge variant="outline" className="text-xs tabular-nums">{b.date}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Phân bổ nhân sự</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {departments.map((d, i) => (
                <div key={d.dept} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>{d.dept}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{d.count} người</span>
                  </div>
                  <Progress value={(d.count / 48) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
