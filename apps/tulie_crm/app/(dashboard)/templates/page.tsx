'use client'

import { useState, useEffect } from 'react'
import { Button } from '@repo/ui'
import { Badge } from '@repo/ui'
import { FileText, Plus, Eye, Edit, FileSignature, Receipt, Wallet, FileCheck, Files, Copy, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { DocumentTemplate } from '@/types'
import { LoadingSpinner } from '@repo/ui'
import { toast } from 'sonner'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@repo/ui'
import { useConfirm } from '@repo/ui'

const getTypeIcon = (type: DocumentTemplate['type']) => {
    switch (type) {
        case 'contract':
            return <FileSignature className="h-4 w-4" />
        case 'invoice':
            return <Receipt className="h-4 w-4" />
        case 'payment_request':
            return <Wallet className="h-4 w-4" />
        case 'delivery_minutes':
            return <FileCheck className="h-4 w-4" />
        case 'quotation':
            return <FileText className="h-4 w-4" />
        case 'order':
            return <Plus className="h-4 w-4" />
        case 'confirmation':
            return <FileCheck className="h-4 w-4" />
        case 'freelance_contract':
            return <FileSignature className="h-4 w-4" />
        default:
            return <FileText className="h-4 w-4" />
    }
}

const getTypeLabel = (type: DocumentTemplate['type']) => {
    switch (type) {
        case 'contract': return 'Hợp đồng'
        case 'invoice': return 'Hóa đơn'
        case 'payment_request': return 'Đề nghị TT'
        case 'quotation': return 'Báo giá'
        case 'order': return 'Đơn hàng'
        case 'delivery_minutes': return 'Biên bản giao nhận'
        case 'confirmation': return 'Biên bản xác nhận'
        case 'freelance_contract': return 'Hợp đồng CTV'
        default: return 'Khác'
    }
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<DocumentTemplate[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const { confirm } = useConfirm()

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/templates')
            if (res.ok) {
                const data = await res.json()
                setTemplates(Array.isArray(data) ? data : data.templates || [])
            } else {
                const errorData = await res.json().catch(() => ({}))
                toast.error(errorData.error || 'Không thể tải danh sách mẫu')
            }
        } catch (err) {
            console.error('Error fetching templates:', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchTemplates()
    }, [])

    const handleDuplicate = async (id: string) => {
        setDuplicatingId(id)
        try {
            const res = await fetch(`/api/templates/${id}`, { method: 'POST' })
            if (res.ok) {
                const newTemplate = await res.json()
                toast.success(`Đã nhân bản: ${newTemplate.name}`)
                await fetchTemplates()
            } else {
                const err = await res.json()
                toast.error(err.error || 'Không thể nhân bản mẫu')
            }
        } catch {
            toast.error('Có lỗi xảy ra')
        } finally {
            setDuplicatingId(null)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        const isConfirmed = await confirm({
            title: 'Khẳng định xóa mẫu',
            description: `Bạn có chắc muốn xóa mẫu "${name}"?`,
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            variant: 'destructive',
        })
        if (!isConfirmed) return
        setDeletingId(id)
        try {
            const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' })
            if (res.ok) {
                toast.success('Đã xóa mẫu')
                setTemplates(prev => prev.filter(t => t.id !== id))
            } else {
                const err = await res.json()
                toast.error(err.error || 'Không thể xóa mẫu')
            }
        } catch {
            toast.error('Có lỗi xảy ra')
        } finally {
            setDeletingId(null)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center border border-border">
                        <Files className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Mẫu giấy tờ</h1>
                        <p className="text-sm font-medium text-muted-foreground mt-1">
                            Quản lý các mẫu báo giá, hợp đồng, đơn hàng, đề nghị thanh toán, biên bản giao nhận
                        </p>
                    </div>
                </div>
                <Button asChild>
                    <Link href="/templates/new">
                        <Plus className="h-4 w-4" />
                        Thêm mẫu mới
                    </Link>
                </Button>
            </div>

            {/* Templates List */}
            <div className="rounded-md border border-border bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Tên mẫu</TableHead>
                            <TableHead className="w-[150px]">Loại</TableHead>
                            <TableHead className="w-[100px] text-center">Số biến</TableHead>
                            <TableHead className="w-[200px] text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {templates.map((template) => (
                            <TableRow key={template.id} className="hover:bg-muted/50">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                                            {getTypeIcon(template.type)}
                                        </div>
                                        <div>
                                            <Link
                                                href={`/templates/${template.id}`}
                                                className="text-sm font-semibold text-foreground hover:text-primary hover:underline"
                                            >
                                                {template.name}
                                            </Link>
                                            {template.is_default && (
                                                <span className="ml-2 text-[10px] text-muted-foreground font-medium">Mặc định</span>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="font-medium bg-muted text-zinc-700 hover:bg-muted/80">
                                        {getTypeLabel(template.type)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="text-sm font-medium tabular-nums text-muted-foreground">{template.variables.length}</span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                                            <Link href={`/templates/${template.id}`} title="Xem">
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                                            <Link href={`/templates/${template.id}/edit`} title="Sửa">
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            title="Nhân bản"
                                            disabled={duplicatingId === template.id}
                                            onClick={() => handleDuplicate(template.id)}
                                        >
                                            {duplicatingId === template.id ? (
                                                <LoadingSpinner size="sm" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                        {!template.is_default && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                title="Xóa"
                                                disabled={deletingId === template.id}
                                                onClick={() => handleDelete(template.id, template.name)}
                                            >
                                                {deletingId === template.id ? (
                                                    <LoadingSpinner size="sm" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {templates.length === 0 && (
                <div className="rounded-lg border py-16 flex flex-col items-center justify-center text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-base font-semibold">Chưa có mẫu giấy tờ nào</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Tạo mẫu đầu tiên để bắt đầu tự động hóa giấy tờ
                    </p>
                    <Button asChild>
                        <Link href="/templates/new">
                            <Plus className="h-4 w-4" />
                            Tạo mẫu mới
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
