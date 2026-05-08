'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useCycles } from '@/hooks/useCycles'
import { Card, CardContent, CardHeader, CardTitle, Button, Label, Input } from '@repo/ui'
import { Loader2, ArrowLeft, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function NewProjectPage() {
    const router = useRouter()
    const { t } = useLocaleStore()
    const { user, loading: userLoading } = useCurrentUser()
    const { activeCycle } = useCycles()
    
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
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
        setError(null)

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

            router.push('/projects')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
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
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full">
                    <Link href="/projects">
                        <ArrowLeft className="size-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Tạo dự án mới</h1>
                    <p className="text-sm text-muted-foreground">Khởi tạo một dự án mới cho chu kỳ {activeCycle?.name || 'hiện tại'}</p>
                </div>
            </div>

            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Chi tiết dự án</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Tên dự án</Label>
                            <Input 
                                id="name"
                                placeholder="VD: Thiết kế App Mobile, Chiến dịch Marketing..."
                                value={formData.name}
                                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                                className="h-11"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả dự án</Label>
                            <textarea 
                                id="description"
                                rows={4}
                                placeholder="Mục tiêu, phạm vi dự án..."
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.description}
                                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Priority */}
                            <div className="space-y-2">
                                <Label htmlFor="priority">Độ ưu tiên</Label>
                                <select 
                                    id="priority"
                                    className="w-full h-11 rounded-md border border-input bg-background px-3 py-1 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.priority}
                                    onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                                >
                                    <option value="critical">Khẩn cấp (Critical)</option>
                                    <option value="high">Cao (High)</option>
                                    <option value="medium">Trung bình (Medium)</option>
                                    <option value="low">Thấp (Low)</option>
                                </select>
                            </div>

                            {/* Owner */}
                            <div className="space-y-2">
                                <Label htmlFor="owner_id">Chủ dự án (PM)</Label>
                                <select 
                                    id="owner_id"
                                    className="w-full h-11 rounded-md border border-input bg-background px-3 py-1 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.owner_id}
                                    onChange={e => setFormData(prev => ({ ...prev, owner_id: e.target.value }))}
                                    required
                                >
                                    {usersLoading ? (
                                        <option>Đang tải thành viên...</option>
                                    ) : (
                                        users.map(u => (
                                            <option key={u.id} value={u.id}>{u.full_name}</option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20 font-medium">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" type="button" onClick={() => router.back()} disabled={loading}>
                                Hủy bỏ
                            </Button>
                            <Button type="submit" disabled={loading} className="px-8">
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Đang tạo...
                                    </>
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
