'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useCycles } from '@/hooks/useCycles'
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
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
import { Loader2, ArrowLeft, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function NewProjectPage() {
    const router = useRouter()
    const { t } = useLocaleStore()
    const { user, loading: userLoading } = useCurrentUser()
    const { activeCycle } = useCycles()
    
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState<{ id: string; full_name: string }[]>([])
    const [usersLoading, setUsersLoading] = useState(true)

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        priority: 'medium',
        status: 'active',
        owner_id: '',
    })

    useEffect(() => {
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
    }, [])

    // Set default owner
    useEffect(() => {
        if (user && !formData.owner_id) {
            setFormData(prev => ({ ...prev, owner_id: user.id }))
        }
    }, [user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!activeCycle) {
            setError('Không có chu kỳ (Cycle) hoạt động. Vui lòng tạo chu kỳ trước.')
            return
        }

        setLoading(true)

        try {
            const supabase = createClient()
            const { error: insertError } = await supabase
                .from('projects')
                .insert({
                    ...formData,
                    cycle_id: activeCycle.id,
                    organization_id: user?.organization_id,
                })

            if (insertError) throw insertError

            toast.success('Đã khởi tạo dự án thành công')
            router.push('/projects')
            router.refresh()
        } catch (err: any) {
            toast.error(err.message || 'Lỗi khi tạo dự án')
            setLoading(false)
        }
    }

    if (userLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 py-4 px-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/50">
                    <Link href="/projects">
                        <ArrowLeft className="size-5" />
                    </Link>
                </Button>
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Khởi tạo Dự án</h1>
                    <p className="text-sm text-muted-foreground">
                        Triển khai dự án mới cho chu kỳ <span className="font-semibold text-foreground underline decoration-primary/30">{activeCycle?.name || 'hiện tại'}</span>
                    </p>
                </div>
            </div>

            <Card className="border-none shadow-2xl shadow-primary/5 bg-card/40 backdrop-blur-md overflow-hidden">
                <div className="h-1.5 w-full bg-primary/20" />
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        Thông tin chi tiết
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div className="space-y-2.5">
                            <Label htmlFor="name" className="text-sm font-semibold">Tên dự án</Label>
                            <Input 
                                id="name"
                                placeholder="VD: Thiết kế App Mobile, Chiến dịch Marketing..."
                                value={formData.name}
                                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                                className="h-12 bg-muted/30 border-none focus-visible:ring-primary/20 text-base"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2.5">
                            <Label htmlFor="description" className="text-sm font-semibold">Mô tả mục tiêu</Label>
                            <Textarea 
                                id="description"
                                rows={4}
                                placeholder="Mục tiêu cốt lõi, phạm vi dự án và các kết quả mong đợi..."
                                className="bg-muted/30 border-none focus-visible:ring-primary/20 resize-none text-base"
                                value={formData.description}
                                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Priority */}
                            <div className="space-y-2.5">
                                <Label className="text-sm font-semibold">Độ ưu tiên</Label>
                                <Select 
                                    value={formData.priority} 
                                    onValueChange={v => setFormData(prev => ({ ...prev, priority: v }))}
                                >
                                    <SelectTrigger className="h-12 bg-muted/30 border-none">
                                        <SelectValue placeholder="Chọn độ ưu tiên" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="critical">Khẩn cấp (Critical)</SelectItem>
                                        <SelectItem value="high">Cao (High)</SelectItem>
                                        <SelectItem value="medium">Trung bình (Medium)</SelectItem>
                                        <SelectItem value="low">Thấp (Low)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Owner */}
                            <div className="space-y-2.5">
                                <Label className="text-sm font-semibold">Chủ dự án (PM)</Label>
                                <Select 
                                    value={formData.owner_id} 
                                    onValueChange={v => setFormData(prev => ({ ...prev, owner_id: v }))}
                                >
                                    <SelectTrigger className="h-12 bg-muted/30 border-none">
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


                        <div className="flex justify-end gap-3 pt-6 border-t border-muted/50">
                            <Button variant="ghost" type="button" onClick={() => router.back()} disabled={loading} className="h-12 px-6">
                                Hủy bỏ
                            </Button>
                            <Button type="submit" disabled={loading} className="h-12 px-10 shadow-lg shadow-primary/20 font-bold">
                                {loading ? (
                                    <Loader2 className="size-5 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="mr-2 size-5" />
                                        Khởi tạo Dự án
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

