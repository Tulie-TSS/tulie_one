'use client'
import { Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui'
import { formatVND, calculateInsurance, INSURANCE_RATES } from '@repo/vietnam'

const EMPLOYEES_INS = [
  { name: 'Nguyễn Văn A', salary: 25000000 },
  { name: 'Trần Thị B', salary: 22000000 },
  { name: 'Lê Hoàng C', salary: 18000000 },
  { name: 'Phạm Minh D', salary: 20000000 },
  { name: 'Hoàng Thị E', salary: 28000000 },
  { name: 'Vũ Đức F', salary: 22000000 },
  { name: 'Đỗ Quang G', salary: 24000000 },
  { name: 'Ngô Thị H', salary: 20000000 },
]

export default function InsurancePage() {
  const data = EMPLOYEES_INS.map(e => ({ ...e, ins: calculateInsurance(e.salary) }))
  const totalEmp = data.reduce((s, d) => s + d.ins.employee.total, 0)
  const totalEmployer = data.reduce((s, d) => s + d.ins.employer.total, 0)

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Bảo hiểm Xã hội</h1><p className="text-sm text-muted-foreground">BHXH/BHYT/BHTN — Tự động tính theo mức lương 2024</p></div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">NLĐ đóng (10.5%)</p><p className="text-2xl font-bold text-amber-600">{formatVND(totalEmp)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">DN đóng (21.5%)</p><p className="text-2xl font-bold text-blue-600">{formatVND(totalEmployer)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Tổng đóng</p><p className="text-2xl font-bold">{formatVND(totalEmp + totalEmployer)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Số NV tham gia</p><p className="text-2xl font-bold">{data.length}</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Bảng đóng BH chi tiết</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Nhân viên</TableHead><TableHead className="text-right">Lương đóng BH</TableHead>
              <TableHead className="text-right">BHXH NLĐ</TableHead><TableHead className="text-right">BHYT NLĐ</TableHead><TableHead className="text-right">BHTN NLĐ</TableHead>
              <TableHead className="text-right">BHXH DN</TableHead><TableHead className="text-right">BHYT DN</TableHead><TableHead className="text-right">BHTN DN</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {data.map(d => (
                <TableRow key={d.name}>
                  <TableCell className="font-medium text-sm">{d.name}</TableCell>
                  <TableCell className="font-mono text-sm text-right">{formatVND(d.ins.cappedSalary)}</TableCell>
                  <TableCell className="font-mono text-sm text-right">{formatVND(d.ins.employee.bhxh)}</TableCell>
                  <TableCell className="font-mono text-sm text-right">{formatVND(d.ins.employee.bhyt)}</TableCell>
                  <TableCell className="font-mono text-sm text-right">{formatVND(d.ins.employee.bhtn)}</TableCell>
                  <TableCell className="font-mono text-sm text-right">{formatVND(d.ins.employer.bhxh)}</TableCell>
                  <TableCell className="font-mono text-sm text-right">{formatVND(d.ins.employer.bhyt)}</TableCell>
                  <TableCell className="font-mono text-sm text-right">{formatVND(d.ins.employer.bhtn)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
