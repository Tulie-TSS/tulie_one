'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useProjects } from '@/hooks/useProjects'
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    Button, 
    Label, 
    Input,
    Textarea,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    toast,
} from '@repo/ui'
import { Loader2, Send, Calendar as CalendarIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface NewTaskDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function NewTaskDialog({ open, onOpenChange, onSuccess }: NewTaskDialogProps) {
    const router = useRouter()
    const { t } = useLocaleStore()
    const { user } = useCurrentUser()
    const { projects, loading: projectsLoading } = useProjects()
    
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState<{ id: string; full_name: string }[]>([])
    const [usersLoading, setUsersLoading] = useState(true)

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project_id: '',
        assigned_to: '',
        eisenhower_quadrant: 'Q2',
        estimated_effort_hours: '2',
        requested_deadline: '',
    })

    useEffect(() => {
        if (!open) return
        async function fetchUsers() {
            const supabase = createClient()
            const { data } = await supabase
                .from('user_profiles')
                .select('id, full_name')
                .eq('is_active', true)
                .order('full_name')
            if (data) setUsers(data)
            setUsersLoading(false)
        }
        fetchUsers()
    }, [open])

    useEffect(() => {
        if (!projectsLoading && projects.length > 0 && !formData.project_id) {
            setFormData(prev => ({ ...prev, project_id: projects[0].id }))
        }
        if (user && !formData.assigned_to) {
            setFormData(prev => ({ ...prev, assigned_to: user.id }))
        }
    }, [projects, projectsLoading, user, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    estimated_effort_hours: parseFloat(formData.estimated_effort_hours),
                    priority: 0,
                    status: 'intake',
                    organization_id: user?.organization_id,
                }),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Lỗi khi tạo công việc')
            }

            toast.success('Đã tạo công việc thành công')
            onOpenChange(false)
            setFormData({
                title: '',
                description: '',
                project_id: projects[0]?.id || '',
                assigned_to: user?.id || '',
                eisenhower_quadrant: 'Q2',
                estimated_effort_hours: '2',
                requested_deadline: '',
            })
            if (onSuccess) onSuccess()
            router.refresh()
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="p-6 bg-muted/30 border-b">
                    <DialogTitle className="text-xl font-bold">{t('tasks.createTask')}</DialogTitle>
                    <DialogDescription className="text-xs">
                        Triển khai công việc mới vào hệ thống quản lý Flow State.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground/80">Tiêu đề công việc</Label>
                        <Input 
                            id="title"
                            placeholder="VD: Thiết kế UI trang Dashboard..."
                            value={formData.title}
                            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            required
                            className="h-12 px-4 bg-background border-muted-foreground/20 focus-visible:ring-primary/20 text-base"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground/80">Mô tả chi tiết</Label>
                        <Textarea 
                            id="description"
                            rows={4}
                            placeholder="Mục tiêu, yêu cầu kỹ thuật, tài liệu liên quan..."
                            className="px-4 py-3 bg-background border-muted-foreground/20 focus-visible:ring-primary/20 resize-none text-sm leading-relaxed"
                            value={formData.description}
                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Project */}
                        <div className="space-y-2">
                            <Label className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground/80">Dự án</Label>
                            <Select 
                                value={formData.project_id} 
                                onValueChange={v => setFormData(prev => ({ ...prev, project_id: v }))}
                            >
                                <SelectTrigger className="h-11 px-4 bg-background border-muted-foreground/20">
                                    <SelectValue placeholder="Chọn dự án" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Assignee */}
                        <div className="space-y-2">
                            <Label className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground/80">Người thực hiện</Label>
                            <Select 
                                value={formData.assigned_to} 
                                onValueChange={v => setFormData(prev => ({ ...prev, assigned_to: v }))}
                            >
                                <SelectTrigger className="h-11 px-4 bg-background border-muted-foreground/20">
                                    <SelectValue placeholder="Chọn thành viên" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map(u => (
                                        <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Eisenhower */}
                        <div className="space-y-2">
                            <Label className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground/80">Phân loại (Eisenhower)</Label>
                            <Select 
                                value={formData.eisenhower_quadrant} 
                                onValueChange={v => setFormData(prev => ({ ...prev, eisenhower_quadrant: v }))}
                            >
                                <SelectTrigger className="h-11 px-4 bg-background border-muted-foreground/20">
                                    <SelectValue placeholder="Độ ưu tiên" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Q1">Q1: Khẩn cấp & Quan trọng</SelectItem>
                                    <SelectItem value="Q2">Q2: Quan trọng (Dài hạn)</SelectItem>
                                    <SelectItem value="Q3">Q3: Khẩn cấp (Phát sinh)</SelectItem>
                                    <SelectItem value="Q4">Q4: Không quan trọng/khẩn cấp</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Effort & Deadline */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="effort" className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground/80">Ước tính (h)</Label>
                                <Input 
                                    id="effort"
                                    type="number"
                                    min="0.5"
                                    step="0.5"
                                    value={formData.estimated_effort_hours}
                                    onChange={e => setFormData(prev => ({ ...prev, estimated_effort_hours: e.target.value }))}
                                    className="h-11 px-4 bg-background border-muted-foreground/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deadline" className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground/80">Hạn chót</Label>
                                <div className="relative">
                                    <Input 
                                        id="deadline"
                                        type="date"
                                        value={formData.requested_deadline}
                                        onChange={e => setFormData(prev => ({ ...prev, requested_deadline: e.target.value }))}
                                        className="h-11 pl-4 pr-10 bg-background border-muted-foreground/20"
                                    />
                                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t gap-3">
                        <Button variant="ghost" type="button" onClick={() => onOpenChange(false)} disabled={loading} className="h-11 px-6">
                            Hủy bỏ
                        </Button>
                        <Button type="submit" disabled={loading} className="h-11 px-10 shadow-xl shadow-primary/20 font-bold flex-1 md:flex-none">
                            {loading ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <>
                                    <Send className="mr-2 size-4" />
                                    Tạo công việc
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
