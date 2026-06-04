'use client'

import React, { useState, useEffect } from 'react'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Label, Input, toast
} from '@repo/ui'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui'
import { useLifeRoles } from '@/hooks/useLifeRoles'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import type { TimeBlock } from '@/hooks/useTimeBlocks'

interface EditScheduleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialBlocks: TimeBlock[]
    onSave: (blocks: Omit<TimeBlock, 'user_id' | 'daily_plan_id'>[]) => Promise<void>
}

const BLOCK_TYPES = [
    { value: 'deep_work', label: 'Deep Work' },
    { value: 'meeting', label: 'Họp hành' },
    { value: 'admin', label: 'Hành chính / Mail' },
    { value: 'learning', label: 'Học tập / Nghiên cứu' },
    { value: 'exercise', label: 'Thể thao / Sức khoẻ' },
    { value: 'family', label: 'Gia đình / Nghỉ ngơi' },
    { value: 'rest', label: 'Thư giãn / Đi ngủ' },
]

export function EditScheduleDialog({
    open,
    onOpenChange,
    initialBlocks,
    onSave
}: EditScheduleDialogProps) {
    const { roles } = useLifeRoles()
    const [localBlocks, setLocalBlocks] = useState<Omit<TimeBlock, 'user_id' | 'daily_plan_id'>[]>([])
    const [loading, setLoading] = useState(false)

    // Sync state when dialog opens
    useEffect(() => {
        if (open) {
            setLocalBlocks(
                initialBlocks.map(b => ({
                    id: b.id,
                    block_type: b.block_type,
                    life_role_id: b.life_role_id || 'none', // Use string 'none' for select compatibility
                    start_time: b.start_time,
                    end_time: b.end_time,
                    title: b.title,
                    is_completed: b.is_completed,
                    notes: b.notes || ''
                }))
            )
        }
    }, [open, initialBlocks])

    const handleAddBlock = () => {
        // Estimate next block start time based on last block end time
        let nextStart = '09:00'
        if (localBlocks.length > 0) {
            nextStart = localBlocks[localBlocks.length - 1].end_time
        }
        
        // Calculate an end time 1 hour later
        let [hours, minutes] = nextStart.split(':').map(Number)
        let endHours = (hours + 1) % 24
        const nextEnd = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

        setLocalBlocks([
            ...localBlocks,
            {
                block_type: 'deep_work',
                life_role_id: 'none',
                start_time: nextStart,
                end_time: nextEnd,
                title: '',
                is_completed: false,
                notes: ''
            }
        ])
    }

    const handleRemoveBlock = (index: number) => {
        setLocalBlocks(prev => prev.filter((_, i) => i !== index))
    }

    const handleUpdateBlock = (index: number, fields: Partial<typeof localBlocks[number]>) => {
        setLocalBlocks(prev => prev.map((b, i) => i === index ? { ...b, ...fields } : b))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        for (let i = 0; i < localBlocks.length; i++) {
            const b = localBlocks[i]
            if (!b.title.trim()) {
                toast.error(`Dòng thứ ${i + 1} chưa có tên lịch trình`)
                return
            }
            if (!b.start_time || !b.end_time) {
                toast.error(`Dòng thứ ${i + 1} chưa có thời gian bắt đầu hoặc kết thúc`)
                return
            }
        }

        setLoading(true)
        try {
            // Map 'none' back to null for saving
            const formatted = localBlocks.map(b => ({
                ...b,
                life_role_id: b.life_role_id === 'none' ? null : b.life_role_id
            }))

            await onSave(formatted)
            toast.success('Đã lưu lịch trình hôm nay thành công!')
            onOpenChange(false)
        } catch (err: any) {
            toast.error(err.message || 'Lỗi khi lưu lịch trình')
        } finally {
            setLoading(false)
        }
    }

    // Active roles only for linking
    const activeRoles = roles.filter(r => r.is_active)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-lg font-semibold">Điều chỉnh lịch trình hôm nay</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                    {/* Scrollable list */}
                    <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4 max-h-[55vh]">
                        {localBlocks.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-muted/10">
                                <p className="text-sm">Chưa có khung thời gian nào.</p>
                                <Button type="button" variant="outline" size="sm" className="mt-3 cursor-pointer" onClick={handleAddBlock}>
                                    <Plus className="size-4 mr-1.5" /> Thêm khung đầu tiên
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {localBlocks.map((block, idx) => (
                                    <div key={idx} className="flex flex-col md:flex-row items-start md:items-center gap-2 p-3 rounded-lg border bg-background/50 relative group">
                                        
                                        {/* Time range */}
                                        <div className="flex items-center gap-1.5 w-full md:w-auto">
                                            <Input
                                                type="time"
                                                value={block.start_time}
                                                onChange={e => handleUpdateBlock(idx, { start_time: e.target.value })}
                                                className="w-[95px] h-9 py-1 px-2 text-xs"
                                                required
                                            />
                                            <span className="text-muted-foreground text-xs font-mono">→</span>
                                            <Input
                                                type="time"
                                                value={block.end_time}
                                                onChange={e => handleUpdateBlock(idx, { end_time: e.target.value })}
                                                className="w-[95px] h-9 py-1 px-2 text-xs"
                                                required
                                            />
                                        </div>

                                        {/* Title */}
                                        <div className="flex-1 w-full md:w-auto">
                                            <Input
                                                placeholder="Tên lịch trình... (vd: Chạy bộ, Nghỉ trưa, Coding)"
                                                value={block.title}
                                                onChange={e => handleUpdateBlock(idx, { title: e.target.value })}
                                                className="h-9 text-xs"
                                                required
                                            />
                                        </div>

                                        {/* Type */}
                                        <div className="w-full md:w-[130px] shrink-0">
                                            <Select
                                                value={block.block_type}
                                                onValueChange={val => handleUpdateBlock(idx, { block_type: val as any })}
                                            >
                                                <SelectTrigger className="h-9 text-xs">
                                                    <SelectValue placeholder="Loại hình" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {BLOCK_TYPES.map(t => (
                                                        <SelectItem key={t.value} value={t.value} className="text-xs">
                                                            {t.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Role Link */}
                                        <div className="w-full md:w-[130px] shrink-0">
                                            <Select
                                                value={block.life_role_id || 'none'}
                                                onValueChange={val => handleUpdateBlock(idx, { life_role_id: val })}
                                            >
                                                <SelectTrigger className="h-9 text-xs">
                                                    <SelectValue placeholder="Lĩnh vực" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none" className="text-xs">Không liên kết</SelectItem>
                                                    {activeRoles.map(r => (
                                                        <SelectItem key={r.id} value={r.id} className="text-xs">
                                                            {r.display_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Delete Action */}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-muted-foreground hover:text-destructive md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
                                            onClick={() => handleRemoveBlock(idx)}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions and Footer */}
                    <div className="p-6 border-t bg-muted/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-auto">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="cursor-pointer self-start sm:self-auto"
                            onClick={handleAddBlock}
                            disabled={loading}
                        >
                            <Plus className="size-4 mr-1.5" /> Thêm khung giờ
                        </Button>

                        <div className="flex items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                                className="cursor-pointer"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={loading}
                                className="cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="size-4 mr-1.5 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    'Lưu lịch trình'
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
