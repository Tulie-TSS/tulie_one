'use client'

import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import Link from 'next/link'
import { ExternalLink, Files, MoreHorizontal } from 'lucide-react'
import { QuotePortal } from '@/types'
import { 
    Badge, 
    Button, 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger, 
} from '@repo/ui'

export const columns: ColumnDef<QuotePortal>[] = [
    {
        accessorKey: 'title',
        header: 'Tên Portal',
        cell: ({ row }) => {
            const portal = row.original
            return (
                <div className="flex flex-col gap-1">
                    <Link href={`/quotations/portals/${portal.id}`} className="font-semibold text-blue-600 hover:underline">
                        {portal.title}
                    </Link>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{portal.customer?.company_name || 'Khách lẻ'}</span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1">
                            <Files className="w-3 h-3" />
                            {portal.items?.length || 0} phương án
                        </span>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: 'public_token',
        header: 'URL Chia sẻ',
        cell: ({ row }) => {
            const token = row.original.public_token
            return (
                <a 
                    href={`/quote/${token}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 bg-slate-100 px-2 py-1 rounded-md w-fit"
                >
                    <ExternalLink className="w-3 h-3" />
                    /quote/{token}
                </a>
            )
        }
    },
    {
        accessorKey: 'is_active',
        header: 'Trạng thái',
        cell: ({ row }) => {
            const isActive = row.original.is_active
            return (
                <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? 'Hoạt động' : 'Đã đóng'}
                </Badge>
            )
        }
    },
    {
        accessorKey: 'created_at',
        header: 'Ngày tạo',
        cell: ({ row }) => <span className="text-sm">{format(new Date(row.original.created_at), 'dd/MM/yyyy')}</span>
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const portal = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/quotations/portals/${portal.id}`}>
                                Xem/Sửa portal
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={`/quote/${portal.public_token}`} target="_blank">
                                Mở trang khách hàng
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                            Đóng portal
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
