'use client'

import { PiggyBank, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui'
import { formatVND } from '@repo/vietnam'

const DEMO_BUDGETS = [
  { name: 'Ngân sách hoạt động 2026', year: 2026, type: 'OPERATING', totalAmount: 5000000000, usedAmount: 1200000000, status: 'ACTIVE' },
  { name: 'Ngân sách Marketing Q1', year: 2026, type: 'DEPARTMENT', totalAmount: 500000000, usedAmount: 180000000, status: 'ACTIVE' },
  { name: 'Dự án mở rộng văn phòng', year: 2026, type: 'CAPITAL', totalAmount: 2000000000, usedAmount: 0, status: 'APPROVED' },
  { name: 'Ngân sách IT Q1', year: 2026, type: 'DEPARTMENT', totalAmount: 300000000, usedAmount: 95000000, status: 'ACTIVE' },
]

const TYPE_LABELS: Record<string, string> = { OPERATING: 'Hoạt động', CAPITAL: 'Đầu tư', PROJECT: 'Dự án', DEPARTMENT: 'Phòng ban' }
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Nháp', color: 'bg-gray-100 text-gray-700' },
  APPROVED: { label: 'Đã duyệt', color: 'bg-blue-100 text-blue-700' },
  ACTIVE: { label: 'Đang thực hiện', color: 'bg-green-100 text-green-700' },
  CLOSED: { label: 'Đã đóng', color: 'bg-gray-100 text-gray-700' },
}

export default function BudgetPage() {
  const totalBudget = DEMO_BUDGETS.reduce((s, b) => s + b.totalAmount, 0)
  const totalUsed = DEMO_BUDGETS.reduce((s, b) => s + b.usedAmount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ngân sách</h1>
          <p className="text-sm text-muted-foreground">Quản lý ngân sách hoạt động, đầu tư, phòng ban</p>
        </div>
        <Button size="sm"><Plus className="mr-2 h-4 w-4" />Tạo ngân sách</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Tổng ngân sách</p>
          <p className="text-2xl font-bold">{formatVND(totalBudget)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Đã sử dụng</p>
          <p className="text-2xl font-bold text-amber-600">{formatVND(totalUsed)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Còn lại</p>
          <p className="text-2xl font-bold text-green-600">{formatVND(totalBudget - totalUsed)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Tỷ lệ sử dụng</p>
          <p className="text-2xl font-bold">{Math.round((totalUsed / totalBudget) * 100)}%</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Danh sách ngân sách</CardTitle>
          <CardDescription>{DEMO_BUDGETS.length} ngân sách</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên ngân sách</TableHead>
                <TableHead className="w-[80px]">Năm</TableHead>
                <TableHead className="w-[120px]">Loại</TableHead>
                <TableHead className="text-right w-[150px]">Tổng NS</TableHead>
                <TableHead className="text-right w-[150px]">Đã dùng</TableHead>
                <TableHead className="w-[100px] text-center">% Dùng</TableHead>
                <TableHead className="w-[130px]">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_BUDGETS.map((b, i) => {
                const pct = b.totalAmount > 0 ? Math.round((b.usedAmount / b.totalAmount) * 100) : 0
                const statusCfg = STATUS_LABELS[b.status]
                return (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell className="text-sm">{b.year}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{TYPE_LABELS[b.type]}</Badge></TableCell>
                    <TableCell className="text-right font-mono text-sm">{formatVND(b.totalAmount)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{formatVND(b.usedAmount)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-muted">
                          <div className={`h-full rounded-full ${pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-mono w-[30px] text-right">{pct}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${statusCfg?.color || ''}`} variant="secondary">{statusCfg?.label || b.status}</Badge>
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
