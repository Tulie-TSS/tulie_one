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
    Copy,
    Send,
    ExternalLink,
    FileSignature,
    FilePlus
} from 'lucide-react'
import { toast } from 'sonner'
import { Quotation } from '@/types'
import { deleteQuotation, duplicateQuotation } from '@/lib/supabase/services/quotation-service'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@repo/ui'
import { SendEmailDialog } from '@/components/shared/send-email-dialog'
import { formatCurrency, formatDate } from '@/lib/utils/format'

interface QuotationCellActionProps {
    data: Quotation
}

export function QuotationCellAction({ data }: QuotationCellActionProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [emailOpen, setEmailOpen] = useState(false)
    const publicUrl = `/quote/${data.public_token}`

    const onDelete = async () => {
        try {
            setLoading(true)
            await deleteQuotation(data.id)
            router.refresh()
            toast.success('Xóa báo giá thành công')
        } catch (error) {
            toast.error('Có lỗi xảy ra khi xóa báo giá')
        } finally {
            setLoading(false)
            setOpen(false)
        }
    }

    const onDuplicate = async () => {
        try {
            setLoading(true)
            const newQuote = await duplicateQuotation(data.id)
            toast.success('Nhân bản báo giá thành công')
            router.refresh()
            if (newQuote && (newQuote as any).id) {
                router.push(`/quotations/${(newQuote as any).id}/edit`)
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi nhân bản báo giá')
        } finally {
            setLoading(false)
        }
    }

    const copyLink = () => {
        const url = `${window.location.origin}${publicUrl}`
        navigator.clipboard.writeText(url)
        toast.success('Đã sao chép liên kết')
    }

    return (
        <div className="flex items-center justify-end gap-1.5">
            <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 border-border/60 shrink-0" 
                title="Mở Portal Báo Giá"
                asChild
            >
                <Link href={publicUrl} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                </Link>
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bạn có chắc chắn muốn xóa?</DialogTitle>
                        <DialogDescription>
                            Hành động này không thể hoàn tác. Báo giá <strong>{data.quotation_number}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống.
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

            <SendEmailDialog
                open={emailOpen}
                onOpenChange={setEmailOpen}
                type="quotation"
                defaultTo={data.customer?.email || ''}
                data={{
                    customerName: data.customer?.company_name || 'Quý khách',
                    quotationNumber: data.quotation_number,
                    totalAmount: formatCurrency(data.total_amount),
                    validUntil: data.valid_until ? formatDate(data.valid_until) : 'N/A',
                    publicUrl: typeof window !== 'undefined'
                        ? `${window.location.origin}${publicUrl}`
                        : publicUrl,
                    senderName: data.creator?.full_name || 'Tulie Agency',
                }}
            />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 shrink-0" disabled={loading}>
                        <span className="sr-only">Mở menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/quotations/${data.id}`}>
                            <Eye className="h-4 w-4" />
                            Xem chi tiết
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/quotations/${data.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            Chỉnh sửa
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDuplicate} disabled={loading}>
                        <FilePlus className="h-4 w-4" />
                        Nhân bản (Duplicate)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href={publicUrl} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                            Mở Portal Báo Giá
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={copyLink}>
                        <Copy className="h-4 w-4" />
                        Copy link Portal Báo Giá
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEmailOpen(true)}>
                        <Send className="h-4 w-4" />
                        Gửi email
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {data.status === 'accepted' && (
                        <DropdownMenuItem asChild>
                            <Link href={`/contracts/new?from_quote=${data.id}`}>
                                <FileSignature className="h-4 w-4" />
                                Tạo hợp đồng
                            </Link>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                        className="text-destructive font-medium"
                        onClick={() => setOpen(true)}
                    >
                        <Trash2 className="h-4 w-4" />
                        Xóa
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
