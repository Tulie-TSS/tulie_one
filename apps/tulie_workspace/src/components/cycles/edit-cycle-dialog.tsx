'use client'

import React, { useState, useEffect } from 'react'
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
    Textarea,
    Separator
} from '@repo/ui'
import { Loader2, Plus, Trash2, Target } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { CycleRow } from '@/hooks/useCycles'

interface EditCycleDialogProps {
    cycle: CycleRow
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function EditCycleDialog({ cycle, open, onOpenChange, onSuccess }: EditCycleDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: cycle.name,
        status: cycle.status,
        start_date: cycle.start_date,
        end_date: cycle.end_date,
        buffer_week_start: cycle.buffer_week_start,
        goals: Array.isArray(cycle.goals) ? cycle.goals : [] as { title: string; progress: number }[]
    })

    useEffect(() => {
        setFormData({
            name: cycle.name,
            status: cycle.status,
            start_date: cycle.start_date ? cycle.start_date.split('T')[0] : '',
            end_date: cycle.end_date ? cycle.end_date.split('T')[0] : '',
            buffer_week_start: cycle.buffer_week_start ? cycle.buffer_week_start.split('T')[0] : '',
            goals: Array.isArray(cycle.goals) ? [...cycle.goals] : []
        })
    }, [cycle, open])

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
        setLoading(true)

        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('cycles')
                .update({
                    name: formData.name,
                    status: formData.status,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    buffer_week_start: formData.buffer_week_start,
                    goals: formData.goals
                })
                .eq('id', cycle.id)

            if (error) throw error

            toast.success('Đã cập nhật chu kỳ thành công')
            onSuccess()
            onOpenChange(false)
        } catch (err: any) {
            toast.error(err.message || 'Lỗi khi cập nhật chu kỳ')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa Chu kỳ</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Tên chu kỳ</Label>
                            <Input 
                                id="name" 
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
                                        <SelectItem value="completed">Đã hoàn thành</SelectItem>
                                        <SelectItem value="archived">Lưu trữ</SelectItem>
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
                                            value={g.title || ''}
                                            onChange={e => handleUpdateGoal(i, 'title', e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                        <div className="flex items-center gap-3">
                                            <Input 
                                                type="number" 
                                                min="0" 
                                                max="100" 
                                                value={g.progress || 0}
                                                onChange={e => handleUpdateGoal(i, 'progress', parseInt(e.target.value) || 0)}
                                                className="h-8 w-20 text-sm"
                                            />
                                            <span className="text-xs text-muted-foreground">% hoàn thành</span>
                                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-primary" style={{ width: `${g.progress || 0}%` }} />
                                            </div>
                                        </div>
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
                            {formData.goals.length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                                    Chưa có mục tiêu nào được thêm.
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Hủy</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
                            Lưu thay đổi
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
