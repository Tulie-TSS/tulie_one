'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Contract } from '@/types'
import { Badge } from '@repo/ui'
import { Button } from '@repo/ui'
import { Checkbox } from '@repo/ui'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import { DataTableColumnHeader } from '@/components/shared/data-table-column-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { ContractCellAction } from './contract-cell-action'

export const contractColumns: ColumnDef<Contract>[] = [
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
        accessorKey: 'contract_number',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4"
                >
                    Mã hợp đồng
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const contract = row.original
            return (
                <Link
                    href={`/contracts/${contract.id}`}
                    className="font-bold text-foreground hover:underline"
                >
                    {contract.contract_number}
                </Link>
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
        accessorKey: 'category',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Loại" />
        ),
        cell: ({ row }) => {
            const category = row.original.category || 'customer'
            return (
                <Badge variant={category === 'freelancer' ? 'outline' : 'secondary'} className="capitalize">
                    {category === 'freelancer' ? 'CTV' : 'K.Hàng'}
                </Badge>
            )
        },
    },
    {
        accessorKey: 'customer',
        header: 'Khách hàng',
        cell: ({ row }) => {
            const customer = row.original.customer
            if (!customer) return <span className="text-muted-foreground">-</span>
            return (
                <div className="max-w-[200px] xl:max-w-[300px]">
                    <Link
                        href={`/customers/${customer.id}`}
                        className="hover:underline line-clamp-2 whitespace-normal leading-snug"
                    >
                        {customer.company_name}
                    </Link>
                </div>
            )
        },
    },
    {
        accessorKey: 'title',
        header: 'Tiêu đề',
        cell: ({ row }) => <span className="max-w-[200px] truncate block">{row.getValue('title')}</span>
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
            return <span className="font-medium">{formatCurrency(amount)}</span>
        },
    },
    {
        accessorKey: 'dates',
        header: 'Thời hạn',
        cell: ({ row }) => {
            const contract = row.original
            return (
                <div className="text-sm">
                    <div>{formatDate(contract.start_date)}</div>
                    <div className="text-muted-foreground text-xs">
                        → {contract.end_date ? formatDate(contract.end_date) : 'Không xác định'}
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => {
            const status = row.getValue('status') as Contract['status']
            return <StatusBadge entityType="contract" status={status} />
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => <ContractCellAction data={row.original} />,
    },
]
