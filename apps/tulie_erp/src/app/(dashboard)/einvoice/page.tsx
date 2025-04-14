'use client'

import { useState } from 'react'
import {
  FileCheck2,
  Plus,
  Search,
  Filter,
  Eye,
  Download,
  QrCode,
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
} from '@repo/ui'
import { formatVND, EINVOICE_TEMPLATES } from '@repo/vietnam'

const DEMO_EINVOICES = [
  {
    id: '1',
    template: '01GTKT',
    series: 'C26TAA',
    number: '0000001',
    date: '2026-03-01',
    buyerName: 'Công ty TNHH ABC',
    buyerTaxCode: '0301234567',
    subtotal: 50000000,
    vatRate: 10,
    vatAmount: 5000000,
    totalAmount: 55000000,
    status: 'ACCEPTED',
  },
  {
    id: '2',
    template: '01GTKT',
    series: 'C26TAA',
    number: '0000002',
    date: '2026-03-05',
    buyerName: 'Công ty CP XYZ',
    buyerTaxCode: '0309876543',
    subtotal: 120000000,
    vatRate: 10,
    vatAmount: 12000000,
    totalAmount: 132000000,
    status: 'TRANSMITTED',
  },
  {
    id: '3',
    template: '01GTKT',
    series: 'C26TAA',
    number: '0000003',
    date: '2026-03-10',
    buyerName: 'Cá nhân Nguyễn Văn A',
    buyerTaxCode: '',
    subtotal: 8500000,
    vatRate: 10,
    vatAmount: 850000,
    totalAmount: 9350000,
    status: 'DRAFT',
  },
  {
    id: '4',
    template: '02GTTT',
    series: 'C26TAB',
    number: '0000001',
    date: '2026-03-12',
    buyerName: 'Hộ KD Trần Thị B',
    buyerTaxCode: '0312345678',
    subtotal: 25000000,
    vatRate: 0,
    vatAmount: 0,
    totalAmount: 25000000,
    status: 'SIGNED',
  },
]

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Nháp', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  SIGNED: { label: 'Đã ký', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  SENT_TO_BUYER: { label: 'Đã gửi', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  TRANSMITTED: { label: 'Đã truyền CQT', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  ACCEPTED: { label: 'CQT chấp nhận', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  REJECTED: { label: 'CQT từ chối', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
}

export default function EInvoicePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = DEMO_EINVOICES.filter(inv => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return inv.buyerName.toLowerCase().includes(q) || inv.number.includes(q) || (inv.buyerTaxCode && inv.buyerTaxCode.includes(q))
    }
    return true
  })

  const totalAmount = DEMO_EINVOICES.reduce((s, i) => s + i.totalAmount, 0)
  const totalVAT = DEMO_EINVOICES.reduce((s, i) => s + i.vatAmount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Hóa đơn Điện tử</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý hóa đơn điện tử theo Nghị định 123/2020/NĐ-CP
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Xuất XML
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Phát hành HĐ
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Tổng hóa đơn</p>
          <p className="text-2xl font-bold">{DEMO_EINVOICES.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">CQT chấp nhận</p>
          <p className="text-2xl font-bold text-green-600">{DEMO_EINVOICES.filter(i => i.status === 'ACCEPTED').length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Tổng VAT</p>
          <p className="text-2xl font-bold text-amber-600">{formatVND(totalVAT)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Tổng giá trị</p>
          <p className="text-2xl font-bold text-blue-600">{formatVND(totalAmount)}</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Tìm theo tên người mua, MST, số HĐ..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="DRAFT">Nháp</SelectItem>
                <SelectItem value="SIGNED">Đã ký số</SelectItem>
                <SelectItem value="TRANSMITTED">Đã truyền CQT</SelectItem>
                <SelectItem value="ACCEPTED">CQT chấp nhận</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* E-Invoice Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Danh sách hóa đơn điện tử</CardTitle>
          <CardDescription>{filtered.length} hóa đơn</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Mẫu</TableHead>
                <TableHead className="w-[140px]">Ký hiệu / Số</TableHead>
                <TableHead className="w-[100px]">Ngày</TableHead>
                <TableHead>Người mua</TableHead>
                <TableHead className="w-[120px]">MST</TableHead>
                <TableHead className="w-[140px] text-right">Tổng tiền</TableHead>
                <TableHead className="w-[120px]">Trạng thái</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(inv => {
                const statusCfg = STATUS_CONFIG[inv.status]
                return (
                  <TableRow key={inv.id}>
                    <TableCell className="text-xs font-mono">{inv.template}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {inv.series}/{inv.number}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{inv.date}</TableCell>
                    <TableCell className="text-sm font-medium">{inv.buyerName}</TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {inv.buyerTaxCode || '—'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatVND(inv.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${statusCfg?.color || ''}`} variant="secondary">
                        {statusCfg?.label || inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </div>
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
