'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Quotation } from '@/types'
import { Badge } from '@repo/ui'
import { Button } from '@repo/ui'
import { Checkbox } from '@repo/ui'
import {
    QUOTATION_STATUS_LABELS,
} from '@/lib/constants/status'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils/format'
import { ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import { DataTableColumnHeader } from '@/components/shared/data-table-column-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { QuotationCellAction } from './quotation-cell-action'

export const quotationColumns: ColumnDef<Quotation>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'quotation_number',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4"
                >
                    Mã báo giá
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const quotation = row.original
            const displayTitle = quotation.version_name || quotation.title
            return (
                <div className="py-1">
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/quotations/${quotation.id}`}
                            className="text-sm font-medium text-foreground hover:underline"
                        >
                            {quotation.quotation_number}
                        </Link>
                        {quotation.is_primary && (
                            <Badge variant="outline" className="text-[10px] font-medium px-1.5 py-0 h-[18px] rounded-md bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">Chính</Badge>
                        )}
                    </div>
                    {displayTitle && (
                        <p className="text-xs text-muted-foreground truncate max-w-[220px] mt-0.5">
                            {displayTitle}
                        </p>
                    )}
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                        {formatDate(quotation.created_at)}
                    </p>
                </div>
            )
        },
    },
    {
        accessorKey: 'brand',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Brand" />
        ),
        cell: ({ row }) => {
            const brand = row.original.brand || 'agency'
            return <StatusBadge entityType="brand" status={brand} />
        },
    },
    {
        accessorKey: 'customer',
        header: 'Khách hàng',
        cell: ({ row }) => {
            const customer = row.original.customer
            if (!customer) return <span className="text-sm text-muted-foreground">-</span>
            return (
                <Link
                    href={`/customers/${customer.id}`}
                    className="text-sm font-medium text-foreground hover:underline"
                >
                    {customer.company_name}
                </Link>
            )
        },
    },
    {
        accessorKey: 'total_amount',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Giá trị
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const amount = row.getValue('total_amount') as number
            return <span className="text-sm font-medium tabular-nums">{formatCurrency(amount)}</span>
        },
    },
    {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => {
            const status = row.getValue('status') as Quotation['status']
            return <StatusBadge entityType="quotation" status={status} />
        },
    },
    {
        accessorKey: 'view_count',
        header: 'Lượt xem',
        cell: ({ row }) => {
            const count = (row.getValue('view_count') as number) || 0
            return <span className="text-sm text-muted-foreground tabular-nums">{count}</span>
        },
    },
    {
        accessorKey: 'valid_until',
        header: 'Hiệu lực',
        cell: ({ row }) => {
            const date = row.getValue('valid_until') as string
            const isExpired = new Date(date) < new Date()
            return (
                <span className={`text-sm ${isExpired ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                    {formatDate(date)}
                </span>
            )
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => <QuotationCellAction data={row.original} />,
    },
]
