'use client'

import React, { useState } from 'react'
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
    toast,
    Separator
} from '@repo/ui'
import { Loader2, Plus, Trash2, Target } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useCurrentUser } from '@/hooks/useCurrentUser'

interface NewCycleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function NewCycleDialog({ open, onOpenChange, onSuccess }: NewCycleDialogProps) {
    const { user } = useCurrentUser()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        status: 'planning',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 84 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 12 weeks
        buffer_week_start: new Date(Date.now() + 84 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        goals: [] as { title: string; progress: number }[]
    })

    const handleAddGoal = () => {
        setFormData(prev => ({
            ...prev,
            goals: [...prev.goals, { title: '', progress: 0 }]
        }))
    }

    const handleUpdateGoal = (index: number, field: string, value: string | number) => {
        const newGoals = [...formData.goals]
        newGoals[index] = { ...newGoals[index], [field]: value }
        setFormData(prev => ({ ...prev, goals: newGoals }))
    }

    const handleRemoveGoal = (index: number) => {
        setFormData(prev => ({
            ...prev,
            goals: prev.goals.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user?.organization_id) {
            toast.error('Không tìm thấy thông tin tổ chức')
            return
        }
        setLoading(true)

        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('cycles')
                .insert({
                    name: formData.name,
                    status: formData.status,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    buffer_week_start: formData.buffer_week_start,
                    goals: formData.goals,
                    organization_id: user.organization_id,
                    created_by: user.id
                })

            if (error) throw error

            toast.success('Đã tạo chu kỳ mới thành công')
            onSuccess()
            onOpenChange(false)
            setFormData({
                name: '',
                status: 'planning',
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(Date.now() + 84 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                buffer_week_start: new Date(Date.now() + 84 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                goals: []
            })
        } catch (err: any) {
            toast.error(err.message || 'Lỗi khi tạo chu kỳ')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tạo Chu kỳ mới</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Tên chu kỳ</Label>
                            <Input 
                                id="name" 
                                placeholder="VD: Q2 2024 - Tập trung tăng trưởng"
                                value={formData.name} 
                                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Trạng thái</Label>
                                <Select value={formData.status} onValueChange={v => setFormData(prev => ({ ...prev, status: v }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="planning">Đang lên kế hoạch</SelectItem>
                                        <SelectItem value="active">Đang hoạt động</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Buffer Week Start</Label>
                                <Input 
                                    type="date" 
                                    value={formData.buffer_week_start}
                                    onChange={e => setFormData(prev => ({ ...prev, buffer_week_start: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Ngày bắt đầu</Label>
                                <Input 
                                    type="date" 
                                    value={formData.start_date}
                                    onChange={e => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Ngày kết thúc</Label>
                                <Input 
                                    type="date" 
                                    value={formData.end_date}
                                    onChange={e => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2">
                                <Target className="size-4 text-primary" />
                                Mục tiêu chiến lược (Goals)
                            </Label>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddGoal}>
                                <Plus className="size-3 mr-1" /> Thêm mục tiêu
                            </Button>
                        </div>
                        
                        <div className="space-y-3">
                            {formData.goals.map((g, i) => (
                                <div key={i} className="flex gap-3 items-start p-3 border rounded-lg bg-muted/20">
                                    <div className="flex-1 space-y-3">
                                        <Input 
                                            placeholder="Tên mục tiêu..." 
                                            value={g.title}
                                            onChange={e => handleUpdateGoal(i, 'title', e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleRemoveGoal(i)}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Hủy</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
                            Tạo chu kỳ
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
