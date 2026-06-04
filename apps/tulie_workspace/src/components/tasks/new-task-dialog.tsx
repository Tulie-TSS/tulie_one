'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useProjects } from '@/hooks/useProjects'
import { useLifeRoles } from '@/hooks/useLifeRoles'
import { RoleIcon } from '@/components/command-center/role-icon'
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
import { Loader2, Send } from 'lucide-react'
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
    const { roles: lifeRoles, loading: rolesLoading } = useLifeRoles()
    
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState<{ id: string; full_name: string }[]>([])
    const [usersLoading, setUsersLoading] = useState(true)

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project_id: 'none',
        life_role_id: '',
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
        if (user && !formData.assigned_to) {
            setFormData(prev => ({ ...prev, assigned_to: user.id }))
        }
        if (lifeRoles.length > 0 && !formData.life_role_id) {
            setFormData(prev => ({ ...prev, life_role_id: lifeRoles[0].id }))
        }
    }, [lifeRoles, user, open])

    // Sync project selection with its associated life role
    useEffect(() => {
        if (formData.project_id && formData.project_id !== 'none') {
            const selectedProj = projects.find(p => p.id === formData.project_id)
            if (selectedProj?.life_role_id) {
                setFormData(prev => ({ ...prev, life_role_id: selectedProj.life_role_id || '' }))
            }
        }
    }, [formData.project_id, projects])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    project_id: formData.project_id === 'none' ? null : formData.project_id,
                    life_role_id: formData.life_role_id === 'none' || !formData.life_role_id ? null : formData.life_role_id,
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
                project_id: 'none',
                life_role_id: lifeRoles[0]?.id || '',
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

    const isRoleSelectorDisabled = formData.project_id !== 'none' && formData.project_id !== ''

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t('tasks.createTask')}</DialogTitle>
                    <DialogDescription>
                        Thêm một công việc mới vào hệ thống quản lý.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Tiêu đề</Label>
                        <Input 
                            id="title"
                            placeholder="VD: Thiết kế UI trang Dashboard..."
                            value={formData.title}
                            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea 
                            id="description"
                            rows={3}
                            placeholder="Chi tiết công việc..."
                            className="resize-none"
                            value={formData.description}
                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Project */}
                        <div className="space-y-2">
                            <Label>Dự án</Label>
                            <Select 
                                value={formData.project_id} 
                                onValueChange={v => setFormData(prev => ({ ...prev, project_id: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn dự án" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Không thuộc dự án nào</SelectItem>
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Life Role / Area */}
                        <div className="space-y-2">
                            <Label>Lĩnh vực / Mảng</Label>
                            <Select 
                                value={formData.life_role_id} 
                                onValueChange={v => setFormData(prev => ({ ...prev, life_role_id: v }))}
                                disabled={isRoleSelectorDisabled}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn lĩnh vực" />
                                </SelectTrigger>
                                <SelectContent>
                                    {lifeRoles.map(role => (
                                        <SelectItem key={role.id} value={role.id}>
                                            <div className="flex items-center gap-2">
                                                <RoleIcon name={role.icon} className="size-3.5" />
                                                <span>{role.display_name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {isRoleSelectorDisabled && (
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    Được liên kết tự động theo dự án đã chọn
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Assignee */}
                        <div className="space-y-2">
                            <Label>Người thực hiện</Label>
                            <Select 
                                value={formData.assigned_to} 
                                onValueChange={v => setFormData(prev => ({ ...prev, assigned_to: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Thành viên" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map(u => (
                                        <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Eisenhower */}
                        <div className="space-y-2">
                            <Label>Phân loại</Label>
                            <Select 
                                value={formData.eisenhower_quadrant} 
                                onValueChange={v => setFormData(prev => ({ ...prev, eisenhower_quadrant: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Độ ưu tiên" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Q1">Q1: Khẩn cấp & Quan trọng</SelectItem>
                                    <SelectItem value="Q2">Q2: Quan trọng</SelectItem>
                                    <SelectItem value="Q3">Q3: Khẩn cấp</SelectItem>
                                    <SelectItem value="Q4">Q4: Khác</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Effort */}
                        <div className="space-y-2">
                            <Label htmlFor="effort">Ước tính (h)</Label>
                            <Input 
                                id="effort"
                                type="number"
                                min="0.5"
                                step="0.5"
                                value={formData.estimated_effort_hours}
                                onChange={e => setFormData(prev => ({ ...prev, estimated_effort_hours: e.target.value }))}
                            />
                        </div>

                        {/* Deadline */}
                        <div className="space-y-2">
                            <Label htmlFor="deadline">Hạn chót</Label>
                            <Input 
                                id="deadline"
                                type="date"
                                value={formData.requested_deadline}
                                onChange={e => setFormData(prev => ({ ...prev, requested_deadline: e.target.value }))}
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={loading}>
                            Hủy bỏ
                        </Button>
                        <Button type="submit" disabled={loading}>
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
