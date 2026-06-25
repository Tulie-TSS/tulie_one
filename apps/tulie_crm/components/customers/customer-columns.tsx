'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Customer } from '@/types'
import { Button } from '@repo/ui'
import { Checkbox } from '@repo/ui'
import { formatRelativeTime } from '@/lib/utils/format'
import { ArrowUpDown, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/status-badge'
import { CellAction } from './cell-action'

export const getCustomerColumns = (isStudio = false): ColumnDef<Customer>[] => [
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
        accessorKey: 'company_name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4"
                >
                    {isStudio ? 'Khách hàng' : 'Công ty'}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const customer = row.original
            const displayName = customer.customer_type === 'individual' 
                ? (customer.company_name || customer.representative || 'Chưa đặt tên')
                : customer.company_name

            return (
                <div className="py-1">
                    <Link
                        href={isStudio ? `/studio/customers/${customer.id}` : `/customers/${customer.id}`}
                        className="text-sm font-medium text-foreground hover:underline"
                    >
                        {displayName}
                    </Link>
                    {customer.customer_type === 'business' && customer.tax_code && (
                        <p className="text-xs text-muted-foreground mt-0.5">MST: {customer.tax_code}</p>
                    )}
                    {customer.customer_type === 'individual' && customer.address && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px] mt-0.5">{customer.address}</p>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: 'email',
        header: 'Liên hệ',
        cell: ({ row }) => {
            const customer = row.original
            return (
                <div className="space-y-1">
                    {customer.email && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span>{customer.email}</span>
                        </div>
                    )}
                    {customer.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3 shrink-0" />
                            <span>{customer.phone}</span>
                        </div>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => {
            const status = row.getValue('status') as string
            return <StatusBadge entityType="customer" status={status} />
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: 'quotation_revenue',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 font-semibold"
                >
                    Doanh thu báo giá
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const val = row.original.quotation_revenue || 0
            return (
                <span className="text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400">
                    {val === 0 ? '0đ' : `${new Intl.NumberFormat('vi-VN').format(val)}đ`}
                </span>
            )
        },
    },
    {
        accessorKey: 'actual_revenue',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 font-bold"
                >
                    Doanh thu thực tế
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const val = row.original.actual_revenue || 0
            return (
                <span className="text-xs font-mono font-bold text-foreground">
                    {val === 0 ? '0đ' : `${new Intl.NumberFormat('vi-VN').format(val)}đ`}
                </span>
            )
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => <CellAction data={row.original} />,
    },
]
