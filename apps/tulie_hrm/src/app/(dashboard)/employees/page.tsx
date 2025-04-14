'use client'

import { useState } from 'react'
import { Users, Search, Plus, Filter, MoreHorizontal, Mail, Phone } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Button, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Avatar, AvatarFallback } from '@repo/ui'
import { formatVND } from '@repo/vietnam'

const EMPLOYEES = [
  { id: 'NV001', name: 'Nguyễn Văn A', email: 'a.nguyen@tulie.vn', phone: '0901234567', department: 'Kỹ thuật', position: 'Senior Developer', salary: 25000000, startDate: '2024-01-15', status: 'ACTIVE', contractType: 'FULL_TIME' },
  { id: 'NV002', name: 'Trần Thị B', email: 'b.tran@tulie.vn', phone: '0912345678', department: 'Marketing', position: 'Marketing Manager', salary: 22000000, startDate: '2024-03-01', status: 'ACTIVE', contractType: 'FULL_TIME' },
  { id: 'NV003', name: 'Lê Hoàng C', email: 'c.le@tulie.vn', phone: '0923456789', department: 'Kinh doanh', position: 'Sales Executive', salary: 18000000, startDate: '2024-06-15', status: 'ACTIVE', contractType: 'FULL_TIME' },
  { id: 'NV004', name: 'Phạm Minh D', email: 'd.pham@tulie.vn', phone: '0934567890', department: 'Design', position: 'UI Designer', salary: 20000000, startDate: '2025-01-10', status: 'ACTIVE', contractType: 'FULL_TIME' },
  { id: 'NV005', name: 'Hoàng Thị E', email: 'e.hoang@tulie.vn', phone: '0945678901', department: 'Kế toán', position: 'Kế toán trưởng', salary: 28000000, startDate: '2023-08-01', status: 'ACTIVE', contractType: 'FULL_TIME' },
  { id: 'NV006', name: 'Vũ Đức F', email: 'f.vu@tulie.vn', phone: '0956789012', department: 'Kỹ thuật', position: 'Backend Developer', salary: 22000000, startDate: '2025-02-01', status: 'PROBATION', contractType: 'FULL_TIME' },
  { id: 'NV007', name: 'Đỗ Quang G', email: 'g.do@tulie.vn', phone: '0967890123', department: 'Kỹ thuật', position: 'DevOps Engineer', salary: 24000000, startDate: '2024-09-15', status: 'ACTIVE', contractType: 'FULL_TIME' },
  { id: 'NV008', name: 'Ngô Thị H', email: 'h.ngo@tulie.vn', phone: '0978901234', department: 'Hành chính', position: 'HR Manager', salary: 20000000, startDate: '2024-04-01', status: 'ACTIVE', contractType: 'FULL_TIME' },
]

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Đang làm', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  PROBATION: { label: 'Thử việc', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  ON_LEAVE: { label: 'Tạm nghỉ', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  RESIGNED: { label: 'Đã nghỉ', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
}

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')

  const filtered = EMPLOYEES.filter(emp => {
    if (deptFilter !== 'all' && emp.department !== deptFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return emp.name.toLowerCase().includes(q) || emp.id.toLowerCase().includes(q) || emp.email.toLowerCase().includes(q)
    }
    return true
  })

  const departments = [...new Set(EMPLOYEES.map(e => e.department))]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Quản lý Nhân viên</h1>
          <p className="text-sm text-muted-foreground">{EMPLOYEES.length} nhân viên · {EMPLOYEES.filter(e => e.status === 'ACTIVE').length} đang làm việc</p>
        </div>
        <Button size="sm"><Plus className="mr-2 h-4 w-4" />Thêm nhân viên</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Tìm theo tên, mã NV, email..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Phòng ban" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phòng ban</SelectItem>
                {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[70px]">Mã NV</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Phòng ban</TableHead>
                <TableHead className="hidden md:table-cell">Chức vụ</TableHead>
                <TableHead className="hidden lg:table-cell text-right">Lương</TableHead>
                <TableHead className="hidden md:table-cell">Ngày vào</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(emp => {
                const statusCfg = STATUS_MAP[emp.status]
                return (
                  <TableRow key={emp.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{emp.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{emp.name.split(' ').pop()?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{emp.department}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{emp.position}</TableCell>
                    <TableCell className="hidden lg:table-cell text-right font-mono text-sm">{formatVND(emp.salary)}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{emp.startDate}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${statusCfg?.color || ''}`} variant="secondary">{statusCfg?.label || emp.status}</Badge>
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
