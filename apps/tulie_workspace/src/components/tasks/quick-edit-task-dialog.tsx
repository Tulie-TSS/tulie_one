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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    toast
} from '@repo/ui'
import { Loader2, Save, Move } from 'lucide-react'
import { TASK_STATUS_LABELS } from '@/lib/constants/task-status'

interface TaskData {
    id: string
    title: string
    status: string
    project_id: string | null
}

interface ProjectOption {
    id: string
    name: string
}

interface QuickEditTaskDialogProps {
    task: TaskData
    projects: ProjectOption[]
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function QuickEditTaskDialog({ task, projects, open, onOpenChange, onSuccess }: QuickEditTaskDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: task.title,
        status: task.status,
        project_id: task.project_id || 'none'
    })

    useEffect(() => {
        setFormData({
            title: task.title,
            status: task.status,
            project_id: task.project_id || 'none'
        })
    }, [task])

    const handleSave = async () => {
        if (!formData.title.trim()) {
            toast.error('Vui lòng nhập tên công việc.')
            return
        }

        setLoading(true)
        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('tasks')
                .update({
                    title: formData.title,
                    status: formData.status,
                    project_id: formData.project_id === 'none' ? null : formData.project_id,
                    updated_at: new Date().toISOString()
                })
                .eq('id', task.id)

            if (error) throw error

            toast.success('Đã cập nhật công việc thành công.')
            onSuccess?.()
            onOpenChange(false)
        } catch (err: any) {
            toast.error(err.message || 'Lỗi cập nhật công việc.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Move className="size-5 text-muted-foreground" />
                        Chuyển & Chỉnh sửa công việc
                    </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="task-title">Tên công việc</Label>
                        <Input 
                            id="task-title" 
                            value={formData.title} 
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="task-project">Dự án</Label>
                        <Select 
                            value={formData.project_id} 
                            onValueChange={(val) => setFormData({ ...formData, project_id: val })}
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

                    <div className="space-y-2">
                        <Label htmlFor="task-status">Trạng thái</Label>
                        <Select 
                            value={formData.status} 
                            onValueChange={(val) => setFormData({ ...formData, status: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(TASK_STATUS_LABELS).map(([val, label]) => (
                                    <SelectItem key={val} value={val}>{label}</SelectItem>
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
