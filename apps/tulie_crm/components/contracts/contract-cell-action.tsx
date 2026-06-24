'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@repo/ui'
import { Button } from '@repo/ui'
import {
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    FileText,
    Receipt,
    Copy,
} from 'lucide-react'
import { toast } from 'sonner'
import { Contract } from '@/types'
import { deleteContract } from '@/lib/supabase/services/contract-service'
import { duplicateContract } from '@/lib/supabase/services/contract-service'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@repo/ui'

interface ContractCellActionProps {
    data: Contract
    from?: string
}

export function ContractCellAction({ data, from }: ContractCellActionProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    
    const queryParams = from ? `?from=${from}` : ''

    const onDelete = async () => {
        try {
            setLoading(true)
            await deleteContract(data.id)
            router.refresh()
            toast.success('Xóa hợp đồng thành công')
        } catch (error) {
            toast.error(`Lỗi xóa hợp đồng: ${(error as any)?.message || 'Thử lại sau'}`)
        } finally {
            setLoading(false)
            setOpen(false)
        }
    }

    const onDuplicate = async () => {
        try {
            setLoading(true)
            const duplicate = await duplicateContract(data.id)
            toast.success('Đã tạo bản nháp nhân bản')
            router.push(`/contracts/${duplicate.id}/edit`)
            router.refresh()
        } catch (error) {
            toast.error(`Không thể nhân bản hợp đồng: ${(error as Error).message || 'Thử lại sau'}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bạn có chắc chắn muốn xóa?</DialogTitle>
                        <DialogDescription>
                            Hành động này không thể hoàn tác. Hợp đồng <strong>{data.contract_number}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={onDelete}
                            disabled={loading}
                        >
                            {loading ? 'Đang xóa...' : 'Xác nhận xóa'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Mở menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/contracts/${data.id}${queryParams}`}>
                            <Eye className="h-4 w-4" />
                            Xem chi tiết
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/contracts/${data.id}/edit${queryParams}`}>
                            <Edit className="h-4 w-4" />
                            Chỉnh sửa
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDuplicate} disabled={loading}>
                        <Copy className="h-4 w-4" />
                        Nhân bản hợp đồng
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href={`/invoices/new?contract=${data.id}`}>
                            <Receipt className="h-4 w-4" />
                            Tạo hóa đơn
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <FileText className="h-4 w-4" />
                        In hợp đồng
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-destructive font-medium"
                        onClick={() => setOpen(true)}
                    >
                        <Trash2 className="h-4 w-4" />
                        Xóa
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
