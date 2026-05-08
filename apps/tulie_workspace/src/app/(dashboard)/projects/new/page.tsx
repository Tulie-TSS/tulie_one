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
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="flex items-center gap-2 mb-8">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                    <ArrowLeft className="size-4" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">{t('projects.newProject')}</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Thông tin dự án</CardTitle>
                    <CardDescription>Điền thông tin chi tiết để bắt đầu một dự án mới.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Tên dự án</Label>
                            <Input 
                                id="name"
                                placeholder="VD: Tên chiến dịch, tên khách hàng..."
                                value={formData.name}
                                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả ngắn</Label>
                            <Textarea 
                                id="description"
                                rows={3}
                                placeholder="Mục tiêu chính của dự án này là gì?"
                                value={formData.description}
                                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Chủ trì dự án</Label>
                                <Select 
                                    value={formData.lead_id} 
                                    onValueChange={v => setFormData(prev => ({ ...prev, lead_id: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn người dẫn dắt" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map(u => (
                                            <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Chu kỳ hiện tại</Label>
                                <div className="h-10 px-3 flex items-center rounded-md border border-input bg-muted/50 text-sm">
                                    {activeCycle?.name || 'Chưa có chu kỳ hoạt động'}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="outline" type="button" onClick={() => router.back()} disabled={loading}>
                                Hủy bỏ
                            </Button>
                            <Button type="submit" disabled={loading} className="px-8">
                                {loading ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="mr-2 size-4" />
                                        Tạo dự án
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
