'use client'

import { useState, useMemo } from 'react'
import {
  BookOpen,
  Search,
  ChevronRight,
  ChevronDown,
  Plus,
  Filter,
  Download,
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
import {
  VAS_TT200_ACCOUNTS,
  type VASAccount,
  AccountGroup,
  AccountType,
  formatVND,
} from '@repo/vietnam'

const GROUP_LABELS: Record<string, string> = {
  GROUP_1: 'Loại 1 — Tài sản ngắn hạn',
  GROUP_2: 'Loại 2 — Tài sản dài hạn',
  GROUP_3: 'Loại 3 — Nợ phải trả',
  GROUP_4: 'Loại 4 — Vốn chủ sở hữu',
  GROUP_5: 'Loại 5 — Doanh thu',
  GROUP_6: 'Loại 6 — Chi phí SXKD',
  GROUP_7: 'Loại 7 — Thu nhập khác',
  GROUP_8: 'Loại 8 — Chi phí khác',
  GROUP_9: 'Loại 9 — Xác định KQKD',
}

const TYPE_COLORS: Record<string, string> = {
  ASSET: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  LIABILITY: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  EQUITY: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  REVENUE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  EXPENSE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  CONTRA_ASSET: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
  CONTRA_REVENUE: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
}

const TYPE_LABELS: Record<string, string> = {
  ASSET: 'Tài sản',
  LIABILITY: 'Nợ phải trả',
  EQUITY: 'Vốn CSH',
  REVENUE: 'Doanh thu',
  EXPENSE: 'Chi phí',
  CONTRA_ASSET: 'Giảm trừ TS',
  CONTRA_REVENUE: 'Giảm trừ DT',
}

export default function ChartOfAccountsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [groupFilter, setGroupFilter] = useState<string>('all')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(Object.values(AccountGroup))
  )

  const filteredAccounts = useMemo(() => {
    let accounts = VAS_TT200_ACCOUNTS

    if (groupFilter !== 'all') {
      accounts = accounts.filter(a => a.accountGroup === groupFilter)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      accounts = accounts.filter(
        a =>
          a.accountNumber.includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.nameEn.toLowerCase().includes(q)
      )
    }

    return accounts
  }, [searchQuery, groupFilter])

  const groupedAccounts = useMemo(() => {
    const groups: Record<string, VASAccount[]> = {}
    for (const account of filteredAccounts) {
      const group = account.accountGroup
      if (!groups[group]) groups[group] = []
      groups[group].push(account)
    }
    return groups
  }, [filteredAccounts])

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(group)) next.delete(group)
      else next.add(group)
      return next
    })
  }

  const stats = useMemo(() => ({
    total: VAS_TT200_ACCOUNTS.length,
    assets: VAS_TT200_ACCOUNTS.filter(a => a.accountType === AccountType.ASSET).length,
    liabilities: VAS_TT200_ACCOUNTS.filter(a => a.accountType === AccountType.LIABILITY).length,
    equity: VAS_TT200_ACCOUNTS.filter(a => a.accountType === AccountType.EQUITY).length,
    revenue: VAS_TT200_ACCOUNTS.filter(a => a.accountType === AccountType.REVENUE).length,
    expense: VAS_TT200_ACCOUNTS.filter(a => a.accountType === AccountType.EXPENSE).length,
  }), [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Hệ thống Tài khoản</h1>
          <p className="text-sm text-muted-foreground">
            Hệ thống tài khoản kế toán theo Thông tư 200/2014/TT-BTC
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Xuất Excel
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Thêm tài khoản
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Tổng TK', value: stats.total, color: 'text-foreground' },
          { label: 'Tài sản', value: stats.assets, color: 'text-blue-600' },
          { label: 'Nợ phải trả', value: stats.liabilities, color: 'text-orange-600' },
          { label: 'Vốn CSH', value: stats.equity, color: 'text-purple-600' },
          { label: 'Doanh thu', value: stats.revenue, color: 'text-green-600' },
          { label: 'Chi phí', value: stats.expense, color: 'text-red-600' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm theo số TK, tên tài khoản..."
                className="pl-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="w-full sm:w-[260px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Tất cả loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại tài khoản</SelectItem>
                {Object.entries(GROUP_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Danh sách tài khoản</CardTitle>
          <CardDescription>
            {filteredAccounts.length} tài khoản · Thông tư 200/2014/TT-BTC
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Số tài khoản</TableHead>
                <TableHead>Tên tài khoản</TableHead>
                <TableHead className="hidden md:table-cell">Tên tiếng Anh</TableHead>
                <TableHead className="w-[120px]">Loại</TableHead>
                <TableHead className="w-[100px] text-center">Số dư BT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedAccounts).map(([group, accounts]) => (
                <>
                  {/* Group header row */}
                  <TableRow
                    key={`group-${group}`}
                    className="bg-muted/50 hover:bg-muted/70 cursor-pointer"
                    onClick={() => toggleGroup(group)}
                  >
                    <TableCell colSpan={5} className="py-2">
                      <div className="flex items-center gap-2 font-medium text-sm">
                        {expandedGroups.has(group) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        {GROUP_LABELS[group] || group}
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {accounts.length} TK
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Account rows */}
                  {expandedGroups.has(group) &&
                    accounts.map(account => (
                      <TableRow key={account.accountNumber} className="group">
                        <TableCell className="font-mono font-medium">
                          <span style={{ paddingLeft: `${(account.level - 1) * 16}px` }}>
                            {account.accountNumber}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className="text-sm"
                            style={{ paddingLeft: `${(account.level - 1) * 16}px` }}
                          >
                            {account.name}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {account.nameEn}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${TYPE_COLORS[account.accountType] || ''}`}
                          >
                            {TYPE_LABELS[account.accountType] || account.accountType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs font-mono">
                            {account.normalBalance === 'DEBIT' ? 'Nợ' : 'Có'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
