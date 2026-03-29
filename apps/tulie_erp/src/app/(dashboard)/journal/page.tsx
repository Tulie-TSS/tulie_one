'use client'

import { useState } from 'react'
import {
  Scale,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpDown,
  FileText,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui'
import { formatVND } from '@repo/vietnam'

// Demo data for journal entries
const DEMO_ENTRIES = [
  {
    id: '1',
    entryNumber: 'JV-2026-000001',
    entryDate: '2026-03-01',
    journalType: 'SALES',
    description: 'Bán hàng hóa cho Công ty ABC — HĐ #001234',
    totalDebit: 55000000,
    totalCredit: 55000000,
    status: 'POSTED',
    createdBy: 'Tùng Nguyễn',
    lines: [
      { account: '131', accountName: 'Phải thu KH', debit: 55000000, credit: 0 },
      { account: '511', accountName: 'Doanh thu bán hàng', debit: 0, credit: 50000000 },
      { account: '33311', accountName: 'Thuế GTGT đầu ra', debit: 0, credit: 5000000 },
    ],
  },
  {
    id: '2',
    entryNumber: 'JV-2026-000002',
    entryDate: '2026-03-05',
    journalType: 'PURCHASE',
    description: 'Mua nguyên vật liệu từ NCC XYZ — HĐ #005678',
    totalDebit: 33000000,
    totalCredit: 33000000,
    status: 'POSTED',
    createdBy: 'Tùng Nguyễn',
    lines: [
      { account: '152', accountName: 'Nguyên vật liệu', debit: 30000000, credit: 0 },
      { account: '1331', accountName: 'Thuế GTGT đầu vào', debit: 3000000, credit: 0 },
      { account: '331', accountName: 'Phải trả NCC', debit: 0, credit: 33000000 },
    ],
  },
  {
    id: '3',
    entryNumber: 'JV-2026-000003',
    entryDate: '2026-03-10',
    journalType: 'CASH_RECEIPT',
    description: 'Thu tiền khách hàng — Công ty ABC',
    totalDebit: 55000000,
    totalCredit: 55000000,
    status: 'APPROVED',
    createdBy: 'Tùng Nguyễn',
    lines: [
      { account: '1121', accountName: 'Tiền VND tại bank', debit: 55000000, credit: 0 },
      { account: '131', accountName: 'Phải thu KH', debit: 0, credit: 55000000 },
    ],
  },
  {
    id: '4',
    entryNumber: 'JV-2026-000004',
    entryDate: '2026-03-15',
    journalType: 'PAYROLL',
    description: 'Chi lương tháng 3/2026',
    totalDebit: 120000000,
    totalCredit: 120000000,
    status: 'DRAFT',
    createdBy: 'Tùng Nguyễn',
    lines: [
      { account: '642', accountName: 'Chi phí QLDN', debit: 100000000, credit: 0 },
      { account: '3383', accountName: 'BHXH', debit: 17500000, credit: 0 },
      { account: '3384', accountName: 'BHYT', debit: 2500000, credit: 0 },
      { account: '334', accountName: 'Phải trả NLĐ', debit: 0, credit: 100000000 },
      { account: '338', accountName: 'Phải trả khác', debit: 0, credit: 20000000 },
    ],
  },
  {
    id: '5',
    entryNumber: 'JV-2026-000005',
    entryDate: '2026-03-20',
    journalType: 'CASH_PAYMENT',
    description: 'Thanh toán NCC XYZ — Chuyển khoản',
    totalDebit: 33000000,
    totalCredit: 33000000,
    status: 'PENDING',
    createdBy: 'Tùng Nguyễn',
    lines: [
      { account: '331', accountName: 'Phải trả NCC', debit: 33000000, credit: 0 },
      { account: '1121', accountName: 'Tiền VND tại bank', debit: 0, credit: 33000000 },
    ],
  },
]

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle2 }> = {
  DRAFT: { label: 'Nháp', variant: 'secondary', icon: FileText },
  PENDING: { label: 'Chờ duyệt', variant: 'outline', icon: Clock },
  APPROVED: { label: 'Đã duyệt', variant: 'default', icon: CheckCircle2 },
  POSTED: { label: 'Đã ghi sổ', variant: 'default', icon: CheckCircle2 },
  REVERSED: { label: 'Đã đảo', variant: 'destructive', icon: XCircle },
  REJECTED: { label: 'Từ chối', variant: 'destructive', icon: XCircle },
}

const TYPE_LABELS: Record<string, string> = {
  GENERAL: 'Tổng hợp',
  CASH_RECEIPT: 'Phiếu thu',
  CASH_PAYMENT: 'Phiếu chi',
  BANK_RECEIPT: 'Báo có NH',
  BANK_PAYMENT: 'Báo nợ NH',
  SALES: 'Bán hàng',
  PURCHASE: 'Mua hàng',
  PAYROLL: 'Bảng lương',
  DEPRECIATION: 'Khấu hao',
  ADJUSTMENT: 'Điều chỉnh',
  CLOSING: 'Kết chuyển',
  OPENING: 'Đầu kỳ',
  REVERSAL: 'Đảo bút toán',
}

export default function JournalPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)

  const filtered = DEMO_ENTRIES.filter(entry => {
    if (statusFilter !== 'all' && entry.status !== statusFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        entry.entryNumber.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q)
      )
    }
    return true
  })

  const totals = DEMO_ENTRIES.reduce(
    (acc, e) => ({
      total: acc.total + 1,
      draft: acc.draft + (e.status === 'DRAFT' ? 1 : 0),
      pending: acc.pending + (e.status === 'PENDING' ? 1 : 0),
      posted: acc.posted + (e.status === 'POSTED' || e.status === 'APPROVED' ? 1 : 0),
      amount: acc.amount + e.totalDebit,
    }),
    { total: 0, draft: 0, pending: 0, posted: 0, amount: 0 }
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sổ Nhật ký Chung</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý bút toán kế toán — Ghi sổ kép (Double-entry)
          </p>
        </div>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Tạo bút toán
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Tổng bút toán</p>
            <p className="text-2xl font-bold">{totals.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Nháp</p>
            <p className="text-2xl font-bold text-muted-foreground">{totals.draft}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Chờ duyệt</p>
            <p className="text-2xl font-bold text-amber-600">{totals.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Tổng giá trị</p>
            <p className="text-2xl font-bold text-green-600">{formatVND(totals.amount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm theo số bút toán, mô tả..."
                className="pl-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="DRAFT">Nháp</SelectItem>
                <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                <SelectItem value="POSTED">Đã ghi sổ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Journal Entries Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Danh sách bút toán</CardTitle>
          <CardDescription>{filtered.length} bút toán</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Số bút toán</TableHead>
                <TableHead className="w-[100px]">Ngày</TableHead>
                <TableHead className="w-[100px]">Loại</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="w-[140px] text-right">Nợ</TableHead>
                <TableHead className="w-[140px] text-right">Có</TableHead>
                <TableHead className="w-[120px]">Trạng thái</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(entry => {
                const statusCfg = STATUS_CONFIG[entry.status]
                const isExpanded = expandedEntry === entry.id
                return (
                  <>
                    <TableRow
                      key={entry.id}
                      className="cursor-pointer"
                      onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                    >
                      <TableCell className="font-mono text-sm font-medium">
                        {entry.entryNumber}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.entryDate}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {TYPE_LABELS[entry.journalType] || entry.journalType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm max-w-[300px] truncate">
                        {entry.description}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatVND(entry.totalDebit)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatVND(entry.totalCredit)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusCfg?.variant || 'secondary'} className="text-xs">
                          {statusCfg?.label || entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Expanded detail rows */}
                    {isExpanded && (
                      <TableRow key={`${entry.id}-detail`} className="bg-muted/30">
                        <TableCell colSpan={8} className="p-0">
                          <div className="border-t px-8 py-4">
                            <p className="text-xs font-medium text-muted-foreground mb-3">
                              Chi tiết bút toán · {entry.lines.length} dòng
                            </p>
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-xs text-muted-foreground">
                                  <th className="pb-2 text-left w-[100px]">Số TK</th>
                                  <th className="pb-2 text-left">Tên tài khoản</th>
                                  <th className="pb-2 text-right w-[150px]">Nợ (Debit)</th>
                                  <th className="pb-2 text-right w-[150px]">Có (Credit)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {entry.lines.map((line, i) => (
                                  <tr key={i} className="border-t border-muted">
                                    <td className="py-2 font-mono font-medium">{line.account}</td>
                                    <td className="py-2">{line.accountName}</td>
                                    <td className="py-2 text-right font-mono">
                                      {line.debit > 0 ? formatVND(line.debit) : '—'}
                                    </td>
                                    <td className="py-2 text-right font-mono">
                                      {line.credit > 0 ? formatVND(line.credit) : '—'}
                                    </td>
                                  </tr>
                                ))}
                                <tr className="border-t-2 border-foreground/20 font-semibold">
                                  <td className="py-2" colSpan={2}>Tổng cộng</td>
                                  <td className="py-2 text-right font-mono">{formatVND(entry.totalDebit)}</td>
                                  <td className="py-2 text-right font-mono">{formatVND(entry.totalCredit)}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
