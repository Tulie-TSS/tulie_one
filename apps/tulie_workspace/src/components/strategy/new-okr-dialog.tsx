'use client'

import React, { useState } from 'react'
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
    toast,
    Badge,
    Separator
} from '@repo/ui'
import { Loader2, Plus, Target, Trash2, Network } from 'lucide-react'
import { useCycles } from '@/hooks/useCycles'
import { useDepartments } from '@/hooks/useDepartments'
import { useOrganizationUsers } from '@/hooks/useOrganizationUsers'
import { useOkrs } from '@/hooks/useOkrs'

interface NewOkrDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function NewOkrDialog({ open, onOpenChange, onSuccess }: NewOkrDialogProps) {
    const [loading, setLoading] = useState(false)
    const { cycles } = useCycles()
    const { departments } = useDepartments()
    const { users } = useOrganizationUsers()
    const { objectives: allObjectives } = useOkrs()

    const [objective, setObjective] = useState({
        title: '',
        description: '',
        level: 'individual',
        cycle_id: 'none',
        department_id: 'none',
        owner_id: '',
        parent_objective_id: 'none'
    })

    const [keyResults, setKeyResults] = useState([
        { title: '', initial_value: 0, target_value: 100, unit: '%', weight: 1 }
    ])

    const addKeyResult = () => {
        setKeyResults([...keyResults, { title: '', initial_value: 0, target_value: 100, unit: '%', weight: 1 }])
    }

    const removeKeyResult = (index: number) => {
        setKeyResults(keyResults.filter((_, i) => i !== index))
    }

    const updateKR = (index: number, field: string, value: any) => {
        const newKR = [...keyResults]
        newKR[index] = { ...newKR[index], [field]: value }
        setKeyResults(newKR)
    }

    const handleSave = async () => {
        if (!objective.title.trim()) {
            toast.error('Vui lòng nhập tiêu đề mục tiêu.')
            return
        }
        if (!objective.owner_id) {
            toast.error('Vui lòng chọn người phụ trách.')
            return
        }
        if (keyResults.some(kr => !kr.title.trim())) {
            toast.error('Vui lòng điền đầy đủ tiêu đề các Kết quả then chốt.')
            return
        }

        setLoading(true)
        try {
            const supabase = createClient()
            
            // 1. Get organization_id (assuming first user's org for now, or fetch current user)
            const { data: { user } } = await supabase.auth.getUser()
            const { data: profile } = await supabase.from('user_profiles').select('organization_id').eq('id', user?.id).single()
            
            if (!profile?.organization_id) throw new Error('Không tìm thấy thông tin tổ chức.')

            // 2. Insert Objective
            const { data: newObjective, error: objError } = await supabase
                .from('objectives')
                .insert({
                    organization_id: profile.organization_id,
                    title: objective.title,
                    description: objective.description,
                    level: objective.level,
                    cycle_id: objective.cycle_id === 'none' ? null : objective.cycle_id,
                    department_id: objective.department_id === 'none' ? null : objective.department_id,
                    owner_id: objective.owner_id,
                    parent_objective_id: objective.parent_objective_id === 'none' ? null : objective.parent_objective_id,
                })
                .select()
                .single()

            if (objError) throw objError

            // 3. Insert Key Results
            if (keyResults.length > 0) {
                const { error: krError } = await supabase
                    .from('key_results')
                    .insert(keyResults.map(kr => ({
                        objective_id: newObjective.id,
                        title: kr.title,
                        initial_value: kr.initial_value,
                        current_value: kr.initial_value,
                        target_value: kr.target_value,
                        unit: kr.unit,
                        weight: kr.weight
                    })))

                if (krError) throw krError
            }

            toast.success('Đã tạo OKR mới thành công.')
            onSuccess?.()
            onOpenChange(false)
            
            // Reset form
            setObjective({
                title: '',
                description: '',
                level: 'individual',
                cycle_id: 'none',
                department_id: 'none',
                owner_id: '',
                parent_objective_id: 'none'
            })
            setKeyResults([{ title: '', initial_value: 0, target_value: 100, unit: '%', weight: 1 }])

        } catch (err: any) {
            toast.error(err.message || 'Lỗi khi tạo OKR.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Target className="size-5 text-primary" />
                        Thiết lập Mục tiêu mới (OKR)
                    </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                    {/* Section 1: Objective */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="obj-title">Mục tiêu (Objective) *</Label>
                            <Input 
                                id="obj-title" 
                                placeholder="Ví dụ: Tăng trưởng doanh thu quý 2" 
                                value={objective.title}
                                onChange={(e) => setObjective({ ...objective, title: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Cấp độ</Label>
                                <Select value={objective.level} onValueChange={(val) => setObjective({ ...objective, level: val })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="company">Tổng công ty</SelectItem>
                                        <SelectItem value="department">Phòng ban</SelectItem>
                                        <SelectItem value="team">Đội ngũ (Team)</SelectItem>
                                        <SelectItem value="individual">Cá nhân</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Người phụ trách *</Label>
                                <Select value={objective.owner_id} onValueChange={(val) => setObjective({ ...objective, owner_id: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn người phụ trách" />
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
                            <div className="space-y-2">
                                <Label>Chu kỳ</Label>
                                <Select value={objective.cycle_id} onValueChange={(val) => setObjective({ ...objective, cycle_id: val })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Không chọn</SelectItem>
                                        {cycles.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Phòng ban</Label>
                                <Select value={objective.department_id} onValueChange={(val) => setObjective({ ...objective, department_id: val })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Không chọn</SelectItem>
                                        {departments.map(d => (
                                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                                <Network className="size-3" /> Liên kết với mục tiêu cao hơn
                            </Label>
                            <Select value={objective.parent_objective_id} onValueChange={(val) => setObjective({ ...objective, parent_objective_id: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn mục tiêu cha (Alignment)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Không có liên kết (Mục tiêu gốc)</SelectItem>
                                    {allObjectives.filter(o => o.level !== 'individual').map(o => (
                                        <SelectItem key={o.id} value={o.id}>[{o.level}] {o.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    {/* Section 2: Key Results */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Kết quả then chốt (Key Results)</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addKeyResult}>
                                <Plus className="size-3.5 mr-1" /> Thêm KR
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {keyResults.map((kr, index) => (
                                <Card key={index} className="p-4 bg-muted/20 border-dashed">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 space-y-3">
                                            <Input 
                                                placeholder="Tiêu đề kết quả then chốt..." 
                                                value={kr.title}
                                                onChange={(e) => updateKR(index, 'title', e.target.value)}
                                                className="bg-background"
                                            />
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase">Mục tiêu</Label>
                                                    <Input 
                                                        type="number" 
                                                        value={kr.target_value} 
                                                        onChange={(e) => updateKR(index, 'target_value', parseFloat(e.target.value))}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase">Đơn vị</Label>
                                                    <Input 
                                                        value={kr.unit} 
                                                        onChange={(e) => updateKR(index, 'unit', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase">Trọng số</Label>
                                                    <Input 
                                                        type="number" 
                                                        step="0.1" 
                                                        value={kr.weight} 
                                                        onChange={(e) => updateKR(index, 'weight', parseFloat(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-destructive hover:bg-destructive/10"
                                            onClick={() => removeKeyResult(index)}
                                            disabled={keyResults.length === 1}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="sticky bottom-0 bg-background pt-2 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}
                        Tạo mục tiêu
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
