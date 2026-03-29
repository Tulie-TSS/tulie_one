'use client'

import { FileSignature, Plus, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui'
import { formatVND } from '@repo/vietnam'

const CONTRACTS = [
  { id: 'HD001', employee: 'Nguyễn Văn A', type: 'Không xác định', startDate: '2024-01-15', endDate: '—', salary: 25000000, status: 'ACTIVE' },
  { id: 'HD002', employee: 'Trần Thị B', type: '2 năm', startDate: '2024-03-01', endDate: '2026-03-01', salary: 22000000, status: 'EXPIRING' },
  { id: 'HD003', employee: 'Lê Hoàng C', type: '1 năm', startDate: '2024-06-15', endDate: '2025-06-15', salary: 18000000, status: 'EXPIRED' },
  { id: 'HD004', employee: 'Phạm Minh D', type: '1 năm', startDate: '2025-01-10', endDate: '2026-01-10', salary: 20000000, status: 'ACTIVE' },
  { id: 'HD005', employee: 'Hoàng Thị E', type: 'Không xác định', startDate: '2023-08-01', endDate: '—', salary: 28000000, status: 'ACTIVE' },
  { id: 'HD006', employee: 'Vũ Đức F', type: 'Thử việc', startDate: '2025-02-01', endDate: '2025-04-01', salary: 22000000, status: 'PROBATION' },
  { id: 'HD007', employee: 'Đỗ Quang G', type: '1 năm', startDate: '2024-09-15', endDate: '2025-09-15', salary: 24000000, status: 'ACTIVE' },
  { id: 'HD008', employee: 'Ngô Thị H', type: '2 năm', startDate: '2024-04-01', endDate: '2026-04-01', salary: 20000000, status: 'EXPIRING' },
]

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Hiệu lực', color: 'bg-green-100 text-green-700' },
  PROBATION: { label: 'Thử việc', color: 'bg-blue-100 text-blue-700' },
  EXPIRING: { label: 'Sắp hết hạn', color: 'bg-amber-100 text-amber-700' },
  EXPIRED: { label: 'Hết hạn', color: 'bg-red-100 text-red-700' },
  TERMINATED: { label: 'Chấm dứt', color: 'bg-gray-100 text-gray-700' },
}

export default function ContractsPage() {
  const expiring = CONTRACTS.filter(c => c.status === 'EXPIRING').length
  const probation = CONTRACTS.filter(c => c.status === 'PROBATION').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Hợp đồng Lao động</h1>
          <p className="text-sm text-muted-foreground">Quản lý hợp đồng theo Bộ Luật Lao động 2019</p>
        </div>
        <Button size="sm"><Plus className="mr-2 h-4 w-4" />Tạo hợp đồng</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Tổng HĐ</p>
          <p className="text-2xl font-bold">{CONTRACTS.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Hiệu lực</p>
          <p className="text-2xl font-bold text-green-600">{CONTRACTS.filter(c => c.status === 'ACTIVE').length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-xs text-muted-foreground">Sắp hết hạn</p>
          </div>
          <p className="text-2xl font-bold text-amber-600">{expiring}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Thử việc</p>
          <p className="text-2xl font-bold text-blue-600">{probation}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Danh sách hợp đồng</CardTitle>
          <CardDescription>{CONTRACTS.length} hợp đồng</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Mã HĐ</TableHead>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Loại HĐ</TableHead>
                <TableHead>Ngày bắt đầu</TableHead>
                <TableHead>Ngày kết thúc</TableHead>
                <TableHead className="text-right">Mức lương</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CONTRACTS.map(c => {
                const statusCfg = STATUS_MAP[c.status]
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm">{c.id}</TableCell>
                    <TableCell className="font-medium text-sm">{c.employee}</TableCell>
                    <TableCell className="text-sm">{c.type}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.startDate}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.endDate}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{formatVND(c.salary)}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${statusCfg?.color || ''}`} variant="secondary">{statusCfg?.label || c.status}</Badge>
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
