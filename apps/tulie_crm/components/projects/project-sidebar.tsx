'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@repo/ui'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui'
import { Badge } from '@repo/ui'
import { Separator } from '@repo/ui'
import { Input } from '@repo/ui'
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui'
import { Calendar as ShadcnCalendar } from '@repo/ui'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@repo/ui'
import {
    Users, Calendar, AlertCircle, FileCheck, Plus, CheckCircle, Clock, Play, Eye, Save
} from 'lucide-react'
import { LoadingSpinner } from '@repo/ui'
import { formatDate } from '@/lib/utils/format'
import { PROJECT_STATUS_LABELS } from '@/lib/constants/status'
import { AcceptancePDFButton } from '@/components/projects/acceptance-pdf-button'
import { toast } from 'sonner'

interface ProjectSidebarProps {
    project: any
    teamMembers?: any[]
}

export function ProjectSidebar({ project, teamMembers = [] }: ProjectSidebarProps) {
    const router = useRouter()
    const [statusLoading, setStatusLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [assignee, setAssignee] = useState(project.assigned_to || '')
    const [startDate, setStartDate] = useState(project.start_date?.split('T')[0] || '')
    const [endDate, setEndDate] = useState(project.end_date?.split('T')[0] || '')

    const handleStatusChange = async (newStatus: string) => {
        setStatusLoading(true)
        try {
            const res = await fetch(`/api/projects/${project.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || 'Lỗi hệ thống')
            }
            toast.success('Đã cập nhật trạng thái dự án')
            router.refresh()
        } catch (err: any) {
            toast.error(`Lỗi cập nhật trạng thái: ${err.message}`)
        } finally {
            setStatusLoading(false)
        }
    }

    const handleSaveDetails = async () => {
        setSaving(true)
        try {
            const updates: any = {}
            if (startDate) updates.start_date = startDate
            if (endDate) updates.end_date = endDate
            if (assignee) updates.assigned_to = assignee

            const res = await fetch(`/api/projects/${project.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            })
            if (!res.ok) throw new Error('Failed')
            toast.success('Đã lưu thông tin quản lý')
            router.refresh()
        } catch (err: any) {
            toast.error(`Lỗi lưu thông tin: ${err?.message || 'Thử lại sau'}`)
        } finally {
            setSaving(false)
        }
    }


    // Derive deadline
    const deadline = endDate || project.end_date
    const isOverdue = deadline && new Date(deadline) < new Date()

    const statusOptions = [
        { value: 'todo', label: 'Chờ triển khai', icon: Clock },
        { value: 'in_progress', label: 'Đang thực hiện', icon: Play },
        { value: 'review', label: 'Đang nghiệm thu', icon: Eye },
        { value: 'completed', label: 'Đã hoàn thành', icon: CheckCircle },
    ]

    return (
        <div className="space-y-6">
            {/* Status & Management */}
            <Card>
                <CardHeader>
                    <CardTitle>Quản lý dự án</CardTitle>
                    <CardDescription>Trạng thái, phân công, timeline</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Status Selector */}
                    <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Trạng thái dự án</label>
                        <Select
                            defaultValue={project.status}
                            onValueChange={handleStatusChange}
                            disabled={statusLoading}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        <div className="flex items-center gap-2">
                                            <opt.icon className="h-3.5 w-3.5" />
                                            <span>{opt.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    {/* PM/Account Assignment */}
                    <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Người quản lý (PM/Account)</label>
                        {teamMembers.length > 0 ? (
                            <Select value={assignee} onValueChange={setAssignee}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Chọn người phụ trách" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teamMembers.map((m: any) => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.full_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <p className="text-sm font-medium">{project.assigned_user?.full_name || "Chưa gán"}</p>
                        )}
                    </div>

                    {/* Timeline Setup */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Ngày Khởi tạo</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal text-sm h-9",
                                            !startDate && "text-muted-foreground"
                                        )}
                                    >
                                        {startDate ? format(new Date(startDate), "dd/MM/yyyy") : <span>Chọn ngày</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <ShadcnCalendar
                                        mode="single"
                                        captionLayout="dropdown"
                                        locale={vi}
                                        selected={startDate ? new Date(startDate) : undefined}
                                        onSelect={(date) => setStartDate(date ? format(date, "yyyy-MM-dd") : "")}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Ngày Đóng Dự án</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal text-sm h-9",
                                            !endDate && "text-muted-foreground"
                                        )}
                                    >
                                        {endDate ? format(new Date(endDate), "dd/MM/yyyy") : <span>Chọn ngày</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <ShadcnCalendar
                                        mode="single"
                                        captionLayout="dropdown"
                                        locale={vi}
                                        selected={endDate ? new Date(endDate) : undefined}
                                        onSelect={(date) => setEndDate(date ? format(date, "yyyy-MM-dd") : "")}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleSaveDetails}
                        disabled={saving}
                    >
                        {saving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="h-4 w-4" />}
                        Lưu thay đổi
                    </Button>

                    {/* Deadline Alert */}
                    {deadline && (
                        <>
                            <Separator />
                            <div className={cn(
                                "flex justify-between items-center p-3 rounded-lg border",
                                isOverdue ? "bg-destructive/10 border-destructive/20" : "bg-muted border-border"
                            )}>
                                <div className="flex items-center gap-2">
                                    <AlertCircle className={cn("h-4 w-4", isOverdue ? "text-destructive" : "text-muted-foreground")} />
                                    <span className={cn("text-[11px] font-semibold", isOverdue ? "text-destructive" : "text-muted-foreground")}>
                                        {isOverdue ? 'TRỄ HẠN DỰ KIẾN' : 'HẠN HOÀN THÀNH'}
                                    </span>
                                </div>
                                <span className={cn("text-xs font-semibold", isOverdue ? "text-destructive" : "text-foreground")}>
                                    {formatDate(deadline)}
                                </span>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
