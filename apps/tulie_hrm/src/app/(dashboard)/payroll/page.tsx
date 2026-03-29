'use client'

import { useState, useMemo } from 'react'
import { Wallet, Download, Calculator, Search, ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui'
import { formatVND, calculateMonthlyPIT, calculateInsurance } from '@repo/vietnam'

// Demo employees for payroll
const PAYROLL_DATA = [
  { id: 'NV001', name: 'Nguyễn Văn A', department: 'Kỹ thuật', grossSalary: 25000000, allowance: 2000000, dependents: 1 },
  { id: 'NV002', name: 'Trần Thị B', department: 'Marketing', grossSalary: 22000000, allowance: 1500000, dependents: 0 },
  { id: 'NV003', name: 'Lê Hoàng C', department: 'Kinh doanh', grossSalary: 18000000, allowance: 3000000, dependents: 2 },
  { id: 'NV004', name: 'Phạm Minh D', department: 'Design', grossSalary: 20000000, allowance: 1000000, dependents: 0 },
  { id: 'NV005', name: 'Hoàng Thị E', department: 'Kế toán', grossSalary: 28000000, allowance: 2000000, dependents: 1 },
  { id: 'NV006', name: 'Vũ Đức F', department: 'Kỹ thuật', grossSalary: 22000000, allowance: 1500000, dependents: 0 },
  { id: 'NV007', name: 'Đỗ Quang G', department: 'Kỹ thuật', grossSalary: 24000000, allowance: 2000000, dependents: 1 },
  { id: 'NV008', name: 'Ngô Thị H', department: 'Hành chính', grossSalary: 20000000, allowance: 1000000, dependents: 0 },
]

interface PayrollLine {
  id: string
  name: string
  department: string
  grossSalary: number
  allowance: number
  totalIncome: number
  bhxhEmployee: number
  bhytEmployee: number
  bhtnEmployee: number
  totalInsuranceEmployee: number
  bhxhEmployer: number
  bhytEmployer: number
  bhtnEmployer: number
  totalInsuranceEmployer: number
  taxableIncome: number
  pitAmount: number
  netSalary: number
}

function calculatePayroll(emp: typeof PAYROLL_DATA[0]): PayrollLine {
  const totalIncome = emp.grossSalary + emp.allowance
  const ins = calculateInsurance(emp.grossSalary)
  const pit = calculateMonthlyPIT(totalIncome, emp.dependents, ins.employee.total)
  const netSalary = totalIncome - ins.employee.total - pit.taxAmount

  return {
    id: emp.id,
    name: emp.name,
    department: emp.department,
    grossSalary: emp.grossSalary,
    allowance: emp.allowance,
    totalIncome,
    bhxhEmployee: ins.employee.bhxh,
    bhytEmployee: ins.employee.bhyt,
    bhtnEmployee: ins.employee.bhtn,
    totalInsuranceEmployee: ins.employee.total,
    bhxhEmployer: ins.employer.bhxh,
    bhytEmployer: ins.employer.bhyt,
    bhtnEmployer: ins.employer.bhtn,
    totalInsuranceEmployer: ins.employer.total,
    taxableIncome: pit.taxableIncome,
    pitAmount: pit.taxAmount,
    netSalary,
  }
}

export default function PayrollPage() {
  const [period, setPeriod] = useState('03/2026')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const payrollLines = useMemo(() => PAYROLL_DATA.map(calculatePayroll), [])

  const totals = useMemo(() => ({
    grossSalary: payrollLines.reduce((s, l) => s + l.grossSalary, 0),
    totalIncome: payrollLines.reduce((s, l) => s + l.totalIncome, 0),
    totalInsuranceEmployee: payrollLines.reduce((s, l) => s + l.totalInsuranceEmployee, 0),
    totalInsuranceEmployer: payrollLines.reduce((s, l) => s + l.totalInsuranceEmployer, 0),
    totalPIT: payrollLines.reduce((s, l) => s + l.pitAmount, 0),
    totalNetSalary: payrollLines.reduce((s, l) => s + l.netSalary, 0),
    totalCost: payrollLines.reduce((s, l) => s + l.totalIncome + l.totalInsuranceEmployer, 0),
  }), [payrollLines])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bảng Lương</h1>
          <p className="text-sm text-muted-foreground">
            Tính lương tự động theo quy định Việt Nam — BHXH/BHYT/BHTN + TNCN lũy tiến
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="03/2026">Tháng 3/2026</SelectItem>
              <SelectItem value="02/2026">Tháng 2/2026</SelectItem>
              <SelectItem value="01/2026">Tháng 1/2026</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Xuất Excel
          </Button>
          <Button size="sm">
            <Calculator className="mr-2 h-4 w-4" />
            Tính lương
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Tổng lương Gross</p>
          <p className="text-xl font-bold">{formatVND(totals.grossSalary)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">BH (NLĐ)</p>
          <p className="text-xl font-bold text-amber-600">{formatVND(totals.totalInsuranceEmployee)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Thuế TNCN</p>
          <p className="text-xl font-bold text-red-600">{formatVND(totals.totalPIT)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Thực nhận</p>
          <p className="text-xl font-bold text-green-600">{formatVND(totals.totalNetSalary)}</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">BH (DN đóng)</p>
          <p className="text-lg font-bold text-blue-600">{formatVND(totals.totalInsuranceEmployer)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Tổng chi phí doanh nghiệp</p>
          <p className="text-lg font-bold">{formatVND(totals.totalCost)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Số nhân viên</p>
          <p className="text-lg font-bold">{payrollLines.length}</p>
        </CardContent></Card>
      </div>

      {/* Payroll Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Bảng lương chi tiết — Kỳ {period}</CardTitle>
          <CardDescription>Click vào dòng để xem chi tiết BH & Thuế</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Mã</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead className="hidden md:table-cell">Phòng ban</TableHead>
                <TableHead className="text-right">Lương Gross</TableHead>
                <TableHead className="text-right hidden lg:table-cell">Phụ cấp</TableHead>
                <TableHead className="text-right">BH (NLĐ)</TableHead>
                <TableHead className="text-right">TNCN</TableHead>
                <TableHead className="text-right">Thực nhận</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollLines.map(line => {
                const isExpanded = expandedRow === line.id
                return (
                  <>
                    <TableRow
                      key={line.id}
                      className="cursor-pointer"
                      onClick={() => setExpandedRow(isExpanded ? null : line.id)}
                    >
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center gap-1">
                          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          {line.id}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{line.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{line.department}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{formatVND(line.grossSalary)}</TableCell>
                      <TableCell className="text-right font-mono text-sm hidden lg:table-cell">{formatVND(line.allowance)}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-amber-600">{formatVND(line.totalInsuranceEmployee)}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-red-600">{formatVND(line.pitAmount)}</TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold text-green-600">{formatVND(line.netSalary)}</TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow key={`${line.id}-detail`} className="bg-muted/30">
                        <TableCell colSpan={8} className="p-0">
                          <div className="border-t px-8 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                              <div>
                                <p className="font-medium text-muted-foreground mb-2">Bảo hiểm (NLĐ đóng)</p>
                                <div className="space-y-1">
                                  <div className="flex justify-between"><span>BHXH (8%)</span><span className="font-mono">{formatVND(line.bhxhEmployee)}</span></div>
                                  <div className="flex justify-between"><span>BHYT (1.5%)</span><span className="font-mono">{formatVND(line.bhytEmployee)}</span></div>
                                  <div className="flex justify-between"><span>BHTN (1%)</span><span className="font-mono">{formatVND(line.bhtnEmployee)}</span></div>
                                  <div className="flex justify-between font-semibold border-t pt-1"><span>Tổng NLĐ</span><span className="font-mono">{formatVND(line.totalInsuranceEmployee)}</span></div>
                                </div>
                              </div>
                              <div>
                                <p className="font-medium text-muted-foreground mb-2">Bảo hiểm (DN đóng)</p>
                                <div className="space-y-1">
                                  <div className="flex justify-between"><span>BHXH (17.5%)</span><span className="font-mono">{formatVND(line.bhxhEmployer)}</span></div>
                                  <div className="flex justify-between"><span>BHYT (3%)</span><span className="font-mono">{formatVND(line.bhytEmployer)}</span></div>
                                  <div className="flex justify-between"><span>BHTN (1%)</span><span className="font-mono">{formatVND(line.bhtnEmployer)}</span></div>
                                  <div className="flex justify-between font-semibold border-t pt-1"><span>Tổng DN</span><span className="font-mono">{formatVND(line.totalInsuranceEmployer)}</span></div>
                                </div>
                              </div>
                              <div>
                                <p className="font-medium text-muted-foreground mb-2">Thuế TNCN</p>
                                <div className="space-y-1">
                                  <div className="flex justify-between"><span>Thu nhập tính thuế</span><span className="font-mono">{formatVND(line.taxableIncome)}</span></div>
                                  <div className="flex justify-between font-semibold text-red-600"><span>Thuế TNCN</span><span className="font-mono">{formatVND(line.pitAmount)}</span></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })}
              {/* Total row */}
              <TableRow className="font-semibold bg-muted/50">
                <TableCell colSpan={3}>TỔNG CỘNG</TableCell>
                <TableCell className="text-right font-mono">{formatVND(totals.grossSalary)}</TableCell>
                <TableCell className="text-right font-mono hidden lg:table-cell">—</TableCell>
                <TableCell className="text-right font-mono text-amber-600">{formatVND(totals.totalInsuranceEmployee)}</TableCell>
                <TableCell className="text-right font-mono text-red-600">{formatVND(totals.totalPIT)}</TableCell>
                <TableCell className="text-right font-mono text-green-600">{formatVND(totals.totalNetSalary)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
