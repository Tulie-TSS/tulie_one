'use client'

import {
  Calculator,
  FileText,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Download,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui'
import { formatVND } from '@repo/vietnam'

const TAX_DECLARATIONS = [
  { period: '03/2026', type: 'VAT_MONTHLY', dueDate: '2026-04-20', taxable: 200000000, output: 20000000, input: 8000000, payable: 12000000, status: 'DRAFT' },
  { period: '02/2026', type: 'VAT_MONTHLY', dueDate: '2026-03-20', taxable: 180000000, output: 18000000, input: 7200000, payable: 10800000, status: 'SUBMITTED' },
  { period: '01/2026', type: 'VAT_MONTHLY', dueDate: '2026-02-20', taxable: 150000000, output: 15000000, input: 6000000, payable: 9000000, status: 'ACCEPTED' },
  { period: 'Q1/2026', type: 'CIT_QUARTERLY', dueDate: '2026-04-30', taxable: 530000000, output: 0, input: 0, payable: 106000000, status: 'DRAFT' },
  { period: '03/2026', type: 'PIT_MONTHLY', dueDate: '2026-04-20', taxable: 120000000, output: 0, input: 0, payable: 8500000, status: 'DRAFT' },
]

const TYPE_LABELS: Record<string, string> = {
  VAT_MONTHLY: 'Thuế GTGT tháng',
  VAT_QUARTERLY: 'Thuế GTGT quý',
  CIT_QUARTERLY: 'Thuế TNDN quý',
  CIT_ANNUAL: 'Quyết toán TNDN',
  PIT_MONTHLY: 'Thuế TNCN tháng',
  PIT_ANNUAL: 'Quyết toán TNCN',
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Nháp', color: 'bg-gray-100 text-gray-700' },
  CALCULATED: { label: 'Đã tính', color: 'bg-blue-100 text-blue-700' },
  SUBMITTED: { label: 'Đã nộp', color: 'bg-amber-100 text-amber-700' },
  ACCEPTED: { label: 'Đã chấp nhận', color: 'bg-green-100 text-green-700' },
}

export default function TaxPage() {
  const totalPayable = TAX_DECLARATIONS.filter(t => t.status !== 'ACCEPTED').reduce((s, t) => s + t.payable, 0)
  const draftCount = TAX_DECLARATIONS.filter(t => t.status === 'DRAFT').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Quản lý Thuế</h1>
          <p className="text-sm text-muted-foreground">Tờ khai thuế GTGT, TNDN, TNCN</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Xuất HTKK XML
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Tổng phải nộp</p>
          <p className="text-2xl font-bold text-red-600">{formatVND(totalPayable)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Tờ khai nháp</p>
          <p className="text-2xl font-bold text-amber-600">{draftCount}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Thuế GTGT T3</p>
          <p className="text-2xl font-bold">{formatVND(12000000)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-xs text-muted-foreground">Hạn nộp gần nhất</p>
          </div>
          <p className="text-lg font-bold">20/04/2026</p>
        </CardContent></Card>
      </div>

      {/* Tax Declarations Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tờ khai thuế</CardTitle>
          <CardDescription>{TAX_DECLARATIONS.length} tờ khai</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Kỳ</TableHead>
                <TableHead className="w-[180px]">Loại tờ khai</TableHead>
                <TableHead className="w-[120px]">Hạn nộp</TableHead>
                <TableHead className="text-right w-[140px]">Doanh thu chịu thuế</TableHead>
                <TableHead className="text-right w-[140px]">Thuế đầu ra</TableHead>
                <TableHead className="text-right w-[140px]">Thuế đầu vào</TableHead>
                <TableHead className="text-right w-[140px]">Phải nộp</TableHead>
                <TableHead className="w-[120px]">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TAX_DECLARATIONS.map((td, i) => {
                const statusCfg = STATUS_CONFIG[td.status]
                return (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{td.period}</TableCell>
                    <TableCell className="text-sm">{TYPE_LABELS[td.type]}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{td.dueDate}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{formatVND(td.taxable)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{td.output > 0 ? formatVND(td.output) : '—'}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{td.input > 0 ? formatVND(td.input) : '—'}</TableCell>
                    <TableCell className="text-right font-mono text-sm font-medium text-red-600">{formatVND(td.payable)}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${statusCfg?.color || ''}`} variant="secondary">
                        {statusCfg?.label || td.status}
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
