'use client'

import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import Link from 'next/link'
import { ExternalLink, Files, MoreHorizontal, Loader2 } from 'lucide-react'
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
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateQuotePortal, deleteQuotePortal } from '@/lib/supabase/services/quote-portal-service'

const PortalActionsCell = ({ portal }: { portal: QuotePortal }) => {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleToggleActive = () => {
        startTransition(async () => {
            try {
                await updateQuotePortal(portal.id, { is_active: !portal.is_active })
                toast.success(portal.is_active ? 'Đã đóng portal' : 'Đã mở lại portal')
                router.refresh()
            } catch (error) {
                toast.error('Có lỗi khi thay đổi trạng thái')
            }
        })
    }

    const handleDelete = () => {
        if (!window.confirm('Bạn có chắc chắn muốn xoá portal này? Hành động này không thể hoàn tác.')) return
        
        startTransition(async () => {
            try {
                await deleteQuotePortal(portal.id)
                toast.success('Đã xoá portal')
                router.refresh()
            } catch (error) {
                toast.error('Có lỗi khi xoá portal')
            }
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                    <span className="sr-only">Mở menu</span>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                    <a href={`/quote/${portal.public_token}`} target="_blank">
                        Mở trang khách hàng
                    </a>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                    onClick={handleToggleActive}
                    className="cursor-pointer"
                >
                    {portal.is_active ? 'Đóng portal' : 'Mở lại portal'}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                    className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                    onClick={handleDelete}
                >
                    Xoá portal
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export const columns: ColumnDef<QuotePortal>[] = [
    {
        accessorKey: 'title',
        header: 'Tên Portal',
        cell: ({ row }) => {
            const portal = row.original
            return (
                <div className="flex flex-col gap-1">
                    <Link href={`/quotations/portals/${portal.id}`} className="font-semibold text-foreground hover:text-primary hover:underline transition-colors">
                        {portal.title}
                    </Link>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{portal.customer?.company_name || 'Khách lẻ'}</span>
                        <span className="text-border">•</span>
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
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-muted/50 px-2 py-1 rounded-md w-fit transition-colors"
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
        cell: ({ row }) => <PortalActionsCell portal={row.original} />,
    },
]
