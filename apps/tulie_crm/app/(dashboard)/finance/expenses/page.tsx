'use client'

import { useEffect, useState } from 'react'
import { getExpenses, deleteExpense, deleteExpenses } from '@/lib/supabase/services/expense-service'
import { DataTable } from '@/components/shared/data-table'
import { ExpenseDialog } from '@/components/finance/expense-form'
import { Checkbox } from '@repo/ui'
import { Button } from '@repo/ui'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@repo/ui'
import { cn } from '@/lib/utils'
import { ColumnDef } from '@tanstack/react-table'
import { Edit, Trash2, MoreHorizontal, Plus, PieChart, Wallet, Receipt } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils/format'

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [activeExpense, setActiveExpense] = useState<any>(undefined)

    const fetchExpenses = async () => {
        setIsLoading(true)
        try {
            const data = await getExpenses()
            setExpenses(data)
        } catch (err) {
            console.error('Error fetching expenses:', err)
            toast.error('Lỗi tải danh sách chi phí')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchExpenses()
    }, [])

    const handleAdd = () => {
        setActiveExpense(undefined)
        setDialogOpen(true)
    }

    const handleEdit = (expense: any) => {
        setActiveExpense(expense)
        setDialogOpen(true)
    }

    const handleDeleteSingle = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa khoản chi này?')) return
        try {
            await deleteExpense(id)
            toast.success('Xóa chi phí thành công')
            fetchExpenses()
        } catch (err: any) {
            toast.error(err.message || 'Lỗi hệ thống')
        }
    }

    const handleDeleteBulk = async (rows: any[]) => {
        const ids = rows.map((r) => r.id)
        await deleteExpenses(ids)
        toast.success(`Đã xóa ${ids.length} khoản chi thành công`)
        fetchExpenses()
    }

    const totalAmount = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)

    const columns: ColumnDef<any>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Chọn tất cả"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Chọn hàng"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'title',
            header: 'Tiêu đề / Khoản chi',
            cell: ({ row }) => {
                const item = row.original
                return (
                    <div className="py-1">
                        <div className="text-sm font-semibold text-foreground">
                            {item.title || 'Khoản chi không tiêu đề'}
                        </div>
                        {item.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[260px]">{item.description}</p>
                        )}
                    </div>
                )
            }
        },
        {
            accessorKey: 'category',
            header: 'Danh mục',
            cell: ({ row }) => {
                const cat = row.getValue('category') as string
                const labels: Record<string, string> = {
                    salary: 'Lương nhân viên',
                    marketing: 'Marketing / QC',
                    office: 'Văn phòng / Thuê nhà',
                    server: 'Server / Tool / Hạ tầng',
                    other: 'Chi phí khác'
                }
                const bgColors: Record<string, string> = {
                    salary: 'bg-emerald-600 text-white',
                    marketing: 'bg-blue-600 text-white',
                    office: 'bg-violet-600 text-white',
                    server: 'bg-orange-600 text-white',
                    other: 'bg-zinc-550 text-white'
                }
                return (
                    <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap border-none",
                        bgColors[cat] || 'bg-zinc-500 text-white'
                    )}>
                        {labels[cat] || 'Khác'}
                    </span>
                )
            }
        },
        {
            accessorKey: 'amount',
            header: 'Số tiền',
            cell: ({ row }) => {
                const val = Number(row.getValue('amount')) || 0
                return (
                    <span className="text-sm font-mono font-bold text-red-600 dark:text-red-400">
                        -{new Intl.NumberFormat('vi-VN').format(val)}đ
                    </span>
                )
            }
        },
        {
            accessorKey: 'date',
            header: 'Ngày chi',
            cell: ({ row }) => {
                const dateVal = row.getValue('date') as string
                if (!dateVal) return <span className="text-xs text-muted-foreground">-</span>
                return (
                    <span className="text-xs font-medium text-muted-foreground">
                        {new Date(dateVal).toLocaleDateString('vi-VN')}
                    </span>
                )
            }
        },
        {
            accessorKey: 'payment_method',
            header: 'Phương thức',
            cell: ({ row }) => {
                const method = row.getValue('payment_method') as string
                const labels: Record<string, string> = {
                    bank_transfer: 'Chuyển khoản',
                    cash: 'Tiền mặt',
                    card: 'Thẻ tín dụng'
                }
                return (
                    <span className="text-xs text-muted-foreground font-medium">
                        {labels[method] || method || '-'}
                    </span>
                )
            }
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                const item = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteSingle(item.id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa khoản chi
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        }
    ]

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto w-full pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center text-white shadow-sm shrink-0">
                        <Receipt className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <h1 className="text-2xl font-bold text-foreground">Quản lý Chi phí</h1>
                        <p className="text-xs text-muted-foreground">Theo dõi và quản lý các khoản chi phí vận hành (OpEx) phục vụ báo cáo P&L</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/finance"
                        className="px-4 py-1.5 rounded-full text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all border border-border/40 flex items-center gap-1.5"
                    >
                        <PieChart className="size-3.5" />
                        Xem P&L
                    </Link>
                    <Link
                        href="/finance/cashflow"
                        className="px-4 py-1.5 rounded-full text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all border border-border/40 flex items-center gap-1.5"
                    >
                        <Wallet className="size-3.5" />
                        Xem Dòng tiền
                    </Link>
                    <Button onClick={handleAdd} className="px-5 h-8 rounded-full text-xs font-bold bg-gradient-to-tr from-rose-500 to-orange-500 text-white border-none shadow-sm hover:shadow-md transition-all">
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Thêm khoản chi
                    </Button>
                </div>
            </div>

            {/* Total Expense Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 rounded-3xl border border-rose-100 dark:border-rose-950/20 bg-rose-50/30 dark:bg-rose-950/5 p-5 flex items-center justify-between shadow-sm">
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-rose-600 dark:text-rose-450">Tổng chi phí đã nhập</span>
                        <h2 className="text-2xl font-extrabold text-rose-650 leading-none">
                            {formatCurrency(totalAmount)}
                        </h2>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/20 text-rose-600">
                        <Receipt className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Expenses List Table */}
            <DataTable
                columns={columns}
                data={expenses}
                searchKey="title"
                searchPlaceholder="Tìm theo khoản chi..."
                onDelete={handleDeleteBulk}
            />

            {/* Form Dialog */}
            <ExpenseDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                expense={activeExpense}
                onSuccess={fetchExpenses}
            />
        </div>
    )
}
