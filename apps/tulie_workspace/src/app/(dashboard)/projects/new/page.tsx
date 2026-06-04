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
    CardDescription,
    CardHeader, 
    CardTitle, 
    Button, 
    Label, 
    Input,
    Textarea,
    Checkbox,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    toast,
} from '@repo/ui'
import { Loader2, ArrowLeft, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useLifeRoles } from '@/hooks/useLifeRoles'
import { RoleIcon } from '@/components/command-center/role-icon'

export default function NewProjectPage() {
    const router = useRouter()
    const { t } = useLocaleStore()
    const { user, loading: userLoading } = useCurrentUser()
    const { activeCycle } = useCycles()
    const { roles, loading: rolesLoading } = useLifeRoles()
    
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState<{ id: string; full_name: string }[]>([])
    const [usersLoading, setUsersLoading] = useState(true)

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        priority: 'medium',
        status: 'planning',
        owner_id: '',
        member_ids: [] as string[],
        life_role_id: 'none',
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
            toast.error('Không có chu kỳ (Cycle) hoạt động. Vui lòng tạo chu kỳ trước.')
            return
        }
        if (!user) {
            toast.error('Chưa đăng nhập.')
            return
        }

        setLoading(true)

        try {
            const supabase = createClient()
            const { data, error: insertError } = await supabase
                .from('projects')
                .insert({
                    name: formData.name,
                    description: formData.description,
                    priority: formData.priority,
                    status: formData.status,
                    owner_id: formData.owner_id,
                    cycle_id: activeCycle.id,
                    organization_id: user.organization_id,
                    life_role_id: formData.life_role_id === 'none' ? null : formData.life_role_id,
                })
                .select()
                .single()

            if (insertError) throw insertError
            
            // Add members
            if (data && formData.member_ids.length > 0) {
                const memberInserts = formData.member_ids.map(uid => ({
                    project_id: data.id,
                    user_id: uid,
                    role: 'member'
                }))
                const { error: memberError } = await supabase
                    .from('project_members')
                    .insert(memberInserts)
                if (memberError) console.error('Error adding members:', memberError)
            }

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
                    <CardTitle>{t('projects.info')}</CardTitle>
                    <CardDescription>{t('projects.details')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('projects.name')}</Label>
                            <Input 
                                id="name"
                                placeholder="VD: Tên chiến dịch, tên khách hàng..."
                                value={formData.name}
                                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">{t('projects.description')}</Label>
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
                                <Label>{t('projects.owner')}</Label>
                                <Select 
                                    value={formData.owner_id} 
                                    onValueChange={v => setFormData(prev => ({ ...prev, owner_id: v }))}
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
                                <Label>Vai trò cuộc sống (Life Role)</Label>
                                <Select 
                                    value={formData.life_role_id} 
                                    onValueChange={v => setFormData(prev => ({ ...prev, life_role_id: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn vai trò" />
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

                        <div className="space-y-2">
                            <Label>Chu kỳ áp dụng</Label>
                            <div className="h-10 px-3 flex items-center rounded-md border border-input bg-muted/50 text-sm">
                                {activeCycle?.name || 'Phase 1: Bootstrap'}
                            </div>
                        </div>

                        {/* Member Selection */}
                        <div className="space-y-3">
                            <Label>{t('projects.members')}</Label>
                            <div className="grid grid-cols-2 gap-2 p-3 border rounded-md max-h-[200px] overflow-y-auto bg-muted/10">
                                {users.map(u => (
                                    <div key={u.id} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={`user-${u.id}`}
                                            checked={formData.member_ids.includes(u.id)}
                                            onCheckedChange={(checked) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    member_ids: checked 
                                                        ? [...prev.member_ids, u.id]
                                                        : prev.member_ids.filter(id => id !== u.id)
                                                }))
                                            }}
                                        />
                                        <label htmlFor={`user-${u.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                            {u.full_name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[12px] text-muted-foreground">Chọn những thành viên sẽ trực tiếp tham gia vào dự án này.</p>
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
