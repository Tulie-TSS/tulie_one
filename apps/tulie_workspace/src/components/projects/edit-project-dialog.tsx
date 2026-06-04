'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
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
    toast
} from '@repo/ui'
import { Loader2, Save } from 'lucide-react'
import { useCycles } from '@/hooks/useCycles'
import { useLifeRoles } from '@/hooks/useLifeRoles'
import { RoleIcon } from '@/components/command-center/role-icon'

interface ProjectData {
    id: string
    name: string
    description: string | null
    status: string
    cycle_id: string | null
    life_role_id?: string | null
}

interface EditProjectDialogProps {
    project: ProjectData
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function EditProjectDialog({ project, open, onOpenChange, onSuccess }: EditProjectDialogProps) {
    const [loading, setLoading] = useState(false)
    const { cycles } = useCycles()
    const { roles } = useLifeRoles()
    const [formData, setFormData] = useState({
        name: project.name,
        description: project.description || '',
        status: project.status,
        cycle_id: project.cycle_id || 'none',
        life_role_id: project.life_role_id || 'none'
    })

    useEffect(() => {
        setFormData({
            name: project.name,
            description: project.description || '',
            status: project.status,
            cycle_id: project.cycle_id || 'none',
            life_role_id: project.life_role_id || 'none'
        })
    }, [project])

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('Vui lòng nhập tên dự án.')
            return
        }

        setLoading(true)
        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('projects')
                .update({
                    name: formData.name,
                    description: formData.description,
                    status: formData.status,
                    cycle_id: formData.cycle_id === 'none' ? null : formData.cycle_id,
                    life_role_id: formData.life_role_id === 'none' ? null : formData.life_role_id,
                    updated_at: new Date().toISOString()
                })
                .eq('id', project.id)

            if (error) throw error

            toast.success('Đã cập nhật dự án thành công.')
            onSuccess?.()
            onOpenChange(false)
        } catch (err: any) {
            toast.error(err.message || 'Lỗi cập nhật dự án.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa dự án</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Tên dự án *</Label>
                        <Input 
                            id="name" 
                            value={formData.name} 
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea 
                            id="description" 
                            value={formData.description} 
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Trạng thái</Label>
                            <Select 
                                value={formData.status} 
                                onValueChange={(val) => setFormData({ ...formData, status: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Đang thực hiện</SelectItem>
                                    <SelectItem value="completed">Đã hoàn thành</SelectItem>
                                    <SelectItem value="paused">Tạm dừng</SelectItem>
                                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cycle">Chu kỳ (Cycle)</Label>
                            <Select 
                                value={formData.cycle_id} 
                                onValueChange={(val) => setFormData({ ...formData, cycle_id: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn chu kỳ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Không thuộc chu kỳ nào</SelectItem>
                                    {cycles.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="life_role">Vai trò cuộc sống (Life Role)</Label>
                        <Select 
                            value={formData.life_role_id} 
                            onValueChange={(val) => setFormData({ ...formData, life_role_id: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn vai trò cuộc sống" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Không có (Chung)</SelectItem>
                                {roles.map(r => (
                                    <SelectItem key={r.id} value={r.id}>
                                        <div className="flex items-center gap-2">
                                            <RoleIcon name={r.icon} className="size-3.5" />
                                            <span>{r.display_name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />}
                        Lưu thay đổi
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
