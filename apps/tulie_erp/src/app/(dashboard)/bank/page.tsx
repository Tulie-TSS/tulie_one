'use client'

import { Landmark, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui'
import { formatVND } from '@repo/vietnam'

const DEMO_ACCOUNTS = [
  { bankName: 'Vietcombank', branch: 'TP.HCM', accountNumber: '007 1000 XXXXXX', accountName: 'Công ty TNHH Tulie', currency: 'VND', balance: 850000000, glAccount: '1121', isActive: true },
  { bankName: 'Techcombank', branch: 'Quận 1', accountNumber: '1903 XXXX XXXX', accountName: 'Công ty TNHH Tulie', currency: 'VND', balance: 320000000, glAccount: '1121', isActive: true },
  { bankName: 'MB Bank', branch: 'HN', accountNumber: '068 XXXX XXXX XXXX', accountName: 'Công ty TNHH Tulie', currency: 'USD', balance: 15000, glAccount: '1122', isActive: true },
]

export default function BankPage() {
  const totalVND = DEMO_ACCOUNTS.filter(a => a.currency === 'VND').reduce((s, a) => s + a.balance, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ngân hàng</h1>
          <p className="text-sm text-muted-foreground">Quản lý tài khoản ngân hàng & đối chiếu</p>
        </div>
        <Button size="sm"><Plus className="mr-2 h-4 w-4" />Thêm tài khoản</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Tổng số dư VND</p>
          <p className="text-2xl font-bold text-green-600">{formatVND(totalVND)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Số dư USD</p>
          <p className="text-2xl font-bold text-blue-600">$15,000</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Tài khoản hoạt động</p>
          <p className="text-2xl font-bold">{DEMO_ACCOUNTS.length}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tài khoản ngân hàng</CardTitle>
          <CardDescription>{DEMO_ACCOUNTS.length} tài khoản</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngân hàng</TableHead>
                <TableHead>Chi nhánh</TableHead>
                <TableHead>Số tài khoản</TableHead>
                <TableHead>TK kế toán</TableHead>
                <TableHead>Tiền tệ</TableHead>
                <TableHead className="text-right">Số dư</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_ACCOUNTS.map((acc, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{acc.bankName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{acc.branch}</TableCell>
                  <TableCell className="font-mono text-sm">{acc.accountNumber}</TableCell>
                  <TableCell><Badge variant="outline" className="font-mono text-xs">{acc.glAccount}</Badge></TableCell>
                  <TableCell className="text-sm">{acc.currency}</TableCell>
                  <TableCell className="text-right font-mono text-sm font-medium">
                    {acc.currency === 'VND' ? formatVND(acc.balance) : `$${acc.balance.toLocaleString()}`}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Hoạt động</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
