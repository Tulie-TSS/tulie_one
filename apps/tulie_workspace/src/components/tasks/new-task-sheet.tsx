'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useProjects } from '@/hooks/useProjects'
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle, 
    SheetDescription,
    SheetFooter,
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
import { Loader2, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface NewTaskSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function NewTaskSheet({ open, onOpenChange, onSuccess }: NewTaskSheetProps) {
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

    // Set default project and assignee
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
            toast.success('Đã tạo công việc thành công')
            router.refresh()
        } catch (err: any) {
            toast.error(err.message || 'Lỗi khi tạo công việc')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle>{t('tasks.createTask')}</SheetTitle>
                    <SheetDescription>
                        Thêm một công việc mới vào hệ thống quản lý Flow của bạn.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-semibold">Tiêu đề</Label>
                        <Input 
                            id="title"
                            placeholder="VD: Thiết kế UI trang Dashboard..."
                            value={formData.title}
                            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            required
                            className="bg-muted/30 border-none focus-visible:ring-primary/20"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-semibold">Mô tả</Label>
                        <Textarea 
                            id="description"
                            rows={3}
                            placeholder="Chi tiết công việc..."
                            className="bg-muted/30 border-none focus-visible:ring-primary/20 resize-none"
                            value={formData.description}
                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Project */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Dự án</Label>
                            <Select 
                                value={formData.project_id} 
                                onValueChange={v => setFormData(prev => ({ ...prev, project_id: v }))}
                            >
                                <SelectTrigger className="bg-muted/30 border-none">
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
                            <Label className="text-sm font-semibold">Người thực hiện</Label>
                            <Select 
                                value={formData.assigned_to} 
                                onValueChange={v => setFormData(prev => ({ ...prev, assigned_to: v }))}
                            >
                                <SelectTrigger className="bg-muted/30 border-none">
                                    <SelectValue placeholder="Người thực hiện" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map(u => (
                                        <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Eisenhower */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Phân loại</Label>
                            <Select 
                                value={formData.eisenhower_quadrant} 
                                onValueChange={v => setFormData(prev => ({ ...prev, eisenhower_quadrant: v }))}
                            >
                                <SelectTrigger className="bg-muted/30 border-none">
                                    <SelectValue placeholder="Chọn độ ưu tiên" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Q1">Q1: Khẩn cấp & Quan trọng</SelectItem>
                                    <SelectItem value="Q2">Q2: Quan trọng (Không khẩn cấp)</SelectItem>
                                    <SelectItem value="Q3">Q3: Khẩn cấp (Không quan trọng)</SelectItem>
                                    <SelectItem value="Q4">Q4: Không quan trọng & Không khẩn cấp</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Effort */}
                        <div className="space-y-2">
                            <Label htmlFor="effort" className="text-sm font-semibold">Ước tính (h)</Label>
                            <Input 
                                id="effort"
                                type="number"
                                min="0.5"
                                step="0.5"
                                value={formData.estimated_effort_hours}
                                onChange={e => setFormData(prev => ({ ...prev, estimated_effort_hours: e.target.value }))}
                                className="bg-muted/30 border-none focus-visible:ring-primary/20"
                            />
                        </div>
                    </div>

                    {/* Deadline */}
                    <div className="space-y-2">
                        <Label htmlFor="deadline" className="text-sm font-semibold">Hạn chót</Label>
                        <Input 
                            id="deadline"
                            type="date"
                            value={formData.requested_deadline}
                            onChange={e => setFormData(prev => ({ ...prev, requested_deadline: e.target.value }))}
                            className="bg-muted/30 border-none focus-visible:ring-primary/20"
                        />
                    </div>


                    <SheetFooter className="pt-6">
                        <Button variant="ghost" type="button" onClick={() => onOpenChange(false)} disabled={loading}>
                            Hủy bỏ
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-1 shadow-lg shadow-primary/20">
                            {loading ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <>
                                    <Send className="mr-2 size-4" />
                                    Tạo công việc
                                </>
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}
