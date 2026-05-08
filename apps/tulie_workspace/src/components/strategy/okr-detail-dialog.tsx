'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    Button,
    Badge,
    Progress,
    Avatar,
    AvatarFallback,
    AvatarImage,
    Input,
    Label,
    toast,
    Separator,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
} from '@repo/ui'
import { Target, Network, CheckSquare, FolderKanban, Loader2, Save, X, Activity } from 'lucide-react'
import { Objective, KeyResult } from '@/hooks/useOkrs'

interface OkrDetailDialogProps {
    okr: Objective | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    allObjectives: Objective[]
}

export function OkrDetailDialog({ okr, open, onOpenChange, onSuccess, allObjectives }: OkrDetailDialogProps) {
    const [updating, setUpdating] = useState<string | null>(null)
    const [krValues, setKrValues] = useState<Record<string, number>>({})

    if (!okr) return null

    const parent = allObjectives.find(o => o.id === okr.parent_objective_id)
    const childOkrs = allObjectives.filter(o => o.parent_objective_id === okr.id)

    const handleUpdateKR = async (kr: KeyResult) => {
        const newValue = krValues[kr.id]
        if (newValue === undefined || newValue === kr.current_value) return

        setUpdating(kr.id)
        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('key_results')
                .update({ current_value: newValue })
                .eq('id', kr.id)

            if (error) throw error
            
            toast.success('Đã cập nhật tiến độ KR.')
            onSuccess?.()
        } catch (err: any) {
            toast.error(err.message || 'Lỗi cập nhật KR')
        } finally {
            setUpdating(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 gap-0">
                <div className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b p-6 pb-4">
                    <DialogHeader className="space-y-4">
                        <div className="flex items-start justify-between">
                            <Badge variant="outline" className="capitalize text-xs font-semibold">
                                {okr.level} Objective
                            </Badge>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Phụ trách:</span>
                                <Avatar className="size-6">
                                    <AvatarImage src={okr.owner?.avatar_url || ''} />
                                    <AvatarFallback className="text-[10px]">{okr.owner?.full_name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                        <DialogTitle className="text-xl leading-relaxed">{okr.title}</DialogTitle>
                        
                        {parent && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md border border-dashed">
                                <Network className="size-4 text-primary" />
                                <span>Đóng góp cho: <strong>{parent.title}</strong></span>
                            </div>
                        )}

                        <div className="space-y-2 pt-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span>Tiến độ tổng thể</span>
                                <span className="text-primary">{Math.round(okr.progress_percentage)}%</span>
                            </div>
                            <Progress value={okr.progress_percentage} className="h-2" />
                        </div>
                    </DialogHeader>
                </div>

                <div className="p-6 pt-4 space-y-6">
                    <Tabs defaultValue="krs">
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger value="krs">Key Results</TabsTrigger>
                            <TabsTrigger value="alignment">Mục tiêu liên kết ({childOkrs.length})</TabsTrigger>
                            <TabsTrigger value="execution">Công việc & Dự án</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="krs" className="space-y-4 mt-0">
                            <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                                Cập nhật tiến độ
                            </div>
                            {(!okr.key_results || okr.key_results.length === 0) ? (
                                <p className="text-sm text-muted-foreground italic text-center py-8">Chưa có kết quả then chốt nào.</p>
                            ) : (
                                okr.key_results.map(kr => (
                                    <div key={kr.id} className="p-4 rounded-lg border bg-card space-y-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm leading-snug">{kr.title}</h4>
                                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                    <Target className="size-3" />
                                                    <span>Mục tiêu: {kr.target_value} {kr.unit}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-end gap-3 pt-2">
                                            <div className="flex-1 space-y-1.5">
                                                <Label className="text-xs text-muted-foreground">Đạt được hiện tại ({kr.unit})</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input 
                                                        type="number"
                                                        value={krValues[kr.id] ?? kr.current_value}
                                                        onChange={(e) => setKrValues({ ...krValues, [kr.id]: parseFloat(e.target.value) || 0 })}
                                                        className="h-8 text-sm"
                                                    />
                                                    <span className="text-sm font-medium">/ {kr.target_value}</span>
                                                </div>
                                            </div>
                                            <Button 
                                                size="sm" 
                                                className="h-8"
                                                onClick={() => handleUpdateKR(kr)}
                                                disabled={updating === kr.id || (krValues[kr.id] === undefined) || (krValues[kr.id] === kr.current_value)}
                                            >
                                                {updating === kr.id ? <Loader2 className="size-3 animate-spin mr-1.5" /> : <Save className="size-3 mr-1.5" />}
                                                Lưu
                                            </Button>
                                        </div>
                                        <Progress value={((krValues[kr.id] ?? kr.current_value) / kr.target_value) * 100} className="h-1.5 opacity-70" />
                                    </div>
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="alignment" className="space-y-4 mt-0">
                            <div className="text-sm text-muted-foreground mb-4">Các mục tiêu cấp dưới đang đóng góp trực tiếp vào mục tiêu này:</div>
                            {childOkrs.length === 0 ? (
                                <div className="text-center py-8 border border-dashed rounded-lg">
                                    <Network className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">Chưa có mục tiêu cấp dưới liên kết.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {childOkrs.map(child => (
                                        <div key={child.id} className="p-3 border rounded-lg hover:border-primary/50 transition-colors flex items-center justify-between">
                                            <div>
                                                <Badge variant="secondary" className="text-[10px] mb-1">{child.level}</Badge>
                                                <div className="text-sm font-medium">{child.title}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-primary text-sm font-bold">{Math.round(child.progress_percentage)}%</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="execution" className="space-y-4 mt-0">
                            <div className="rounded-lg border border-dashed p-6 text-center space-y-3 bg-muted/10">
                                <Activity className="size-8 text-primary/40 mx-auto" />
                                <h3 className="font-semibold text-foreground">Liên kết Hành động thực thi</h3>
                                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                    Trong tương lai gần, bạn có thể gán trực tiếp các Dự án (Projects) và Công việc (Tasks) vào OKR này để tự động hóa việc tính toán tiến độ.
                                </p>
                                <div className="flex items-center justify-center gap-3 pt-2">
                                    <Button variant="outline" size="sm" disabled>
                                        <FolderKanban className="size-3.5 mr-2" />
                                        Liên kết Dự án
                                    </Button>
                                    <Button variant="outline" size="sm" disabled>
                                        <CheckSquare className="size-3.5 mr-2" />
                                        Liên kết Task
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    )
}
