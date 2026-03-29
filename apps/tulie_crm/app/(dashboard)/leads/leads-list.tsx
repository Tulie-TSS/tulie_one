'use client'

import { useState } from 'react'
import { Lead } from '@/lib/supabase/services/lead-service'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { Badge } from '@repo/ui'
import { Button } from '@repo/ui'
import { Input } from '@repo/ui'
import { Textarea } from '@repo/ui'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@repo/ui'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@repo/ui'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@repo/ui'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@repo/ui'
import {
    Contact, UserPlus, Phone, Mail, Building2, MessageSquare,
    MoreHorizontal, Trash2, Clock, CheckCircle2, XCircle, UserCheck, Search
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useConfirm } from '@repo/ui'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    new: { label: 'Mới', color: 'bg-blue-100/50 text-blue-700', icon: UserPlus },
    contacted: { label: 'Đã liên hệ', color: 'bg-amber-100/50 text-amber-700', icon: Phone },
    qualified: { label: 'Tiềm năng', color: 'bg-emerald-100/50 text-emerald-700', icon: UserCheck },
    converted: { label: 'Đã chuyển đổi', color: 'bg-zinc-800 text-white', icon: CheckCircle2 },
    lost: { label: 'Mất', color: 'bg-rose-100/50 text-rose-700', icon: XCircle },
}

interface LeadsListProps {
    initialData: Lead[]
    stats: { total: number; new: number; contacted: number; qualified: number }
}

export function LeadsList({ initialData, stats }: LeadsListProps) {
    const router = useRouter()
    const { confirm } = useConfirm()
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [updating, setUpdating] = useState(false)

    const filtered = initialData.filter(lead => {
        const matchSearch = !search ||
            lead.full_name.toLowerCase().includes(search.toLowerCase()) ||
            lead.phone.includes(search) ||
            lead.company_name?.toLowerCase().includes(search.toLowerCase()) ||
            lead.email?.toLowerCase().includes(search.toLowerCase())
        const matchStatus = statusFilter === 'all' || lead.status === statusFilter
        return matchSearch && matchStatus
    })

    const handleStatusChange = async (leadId: string, newStatus: string) => {
        setUpdating(true)
        try {
            const res = await fetch('/api/leads', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: leadId, status: newStatus }),
            })
            if (!res.ok) {
                const { updateLead } = await import('@/lib/supabase/services/lead-service')
                await updateLead(leadId, { status: newStatus as any })
            }
            toast.success('Đã cập nhật trạng thái')
            router.refresh()
        } catch {
            toast.error('Có lỗi xảy ra')
        } finally {
            setUpdating(false)
        }
    }

    const handleDelete = async (leadId: string) => {
        const confirmed = await confirm({
            title: 'Xóa lead',
            description: 'Bạn có chắc muốn xóa lead này?',
            variant: 'destructive',
            confirmText: 'Xóa',
        })
        if (!confirmed) return
        try {
            const { deleteLead } = await import('@/lib/supabase/services/lead-service')
            await deleteLead(leadId)
            toast.success('Đã xóa lead')
            router.refresh()
        } catch {
            toast.error('Có lỗi xảy ra')
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        })
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                {[
                    { label: 'Tổng leads', value: stats.total, icon: Contact, color: 'text-muted-foreground' },
                    { label: 'Mới', value: stats.new, icon: UserPlus, color: 'text-blue-600' },
                    { label: 'Đã liên hệ', value: stats.contacted, icon: Phone, color: 'text-amber-600' },
                    { label: 'Tiềm năng', value: stats.qualified, icon: UserCheck, color: 'text-emerald-600' },
                ].map((s, i) => (
                    <Card key={i} className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
                            <s.icon className={cn("h-4 w-4", s.color)} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{s.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm khách hàng..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                            <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[250px]">KHÁCH HÀNG</TableHead>
                            <TableHead>LIÊN HỆ</TableHead>
                            <TableHead>CÔNG TY</TableHead>
                            <TableHead>NGUỒN</TableHead>
                            <TableHead>TRẠNG THÁI</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Không tìm thấy dữ liệu.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((lead) => {
                                const statusCfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new
                                return (
                                    <TableRow
                                        key={lead.id}
                                        className="cursor-pointer"
                                        onClick={() => { setSelectedLead(lead); setIsDetailOpen(true) }}
                                    >
                                        <TableCell>
                                            <div className="font-medium">{lead.full_name}</div>
                                            {lead.business_type && (
                                                <div className="text-xs text-muted-foreground mt-0.5">{lead.business_type}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">{lead.phone}</div>
                                            <div className="text-xs text-muted-foreground">{formatDate(lead.created_at)}</div>
                                        </TableCell>
                                        <TableCell>{lead.company_name || '—'}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="text-[10px] font-medium">
                                                {lead.source === 'lp_thiet_ke_website' ? 'LP Thiết kế Web' : (lead.source || 'Website Tulie')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn("border-none", statusCfg.color)}>
                                                {statusCfg.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                                        <DropdownMenuItem
                                                            key={key}
                                                            onClick={() => handleStatusChange(lead.id, key)}
                                                            disabled={lead.status === key}
                                                        >
                                                            <cfg.icon className="w-4 h-4 mr-2" />
                                                            {cfg.label}
                                                        </DropdownMenuItem>
                                                    ))}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleDelete(lead.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Xóa
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    {selectedLead && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl">{selectedLead.full_name}</DialogTitle>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary" className={cn(STATUS_CONFIG[selectedLead.status]?.color, "border-none")}>
                                        {STATUS_CONFIG[selectedLead.status]?.label}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{formatDate(selectedLead.created_at)}</span>
                                </div>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Điện thoại</p>
                                        <p className="text-sm font-medium">{selectedLead.phone}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Email</p>
                                        <p className="text-sm font-medium">{selectedLead.email || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Công ty</p>
                                        <p className="text-sm font-medium">{selectedLead.company_name || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Lĩnh vực</p>
                                        <p className="text-sm font-medium">{selectedLead.business_type || '—'}</p>
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Nguồn</p>
                                        <Badge variant="secondary" className="font-normal mt-1">
                                            {selectedLead.source === 'lp_thiet_ke_website' ? 'Landing Page: Thiết kế Web' : (selectedLead.source || 'Website Chính')}
                                        </Badge>
                                    </div>
                                </div>

                                {selectedLead.message && (
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Nhu cầu</p>
                                        <div className="p-3 bg-muted/50 rounded-md text-sm border">
                                            {selectedLead.message}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2 pt-4">
                                    <p className="text-xs font-medium text-muted-foreground uppercase">Đổi trạng thái</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                            <Button
                                                key={key}
                                                variant={selectedLead.status === key ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => {
                                                    handleStatusChange(selectedLead.id, key)
                                                    setSelectedLead({ ...selectedLead, status: key as any })
                                                }}
                                            >
                                                <cfg.icon className="w-4 h-4 mr-2" />
                                                {cfg.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
