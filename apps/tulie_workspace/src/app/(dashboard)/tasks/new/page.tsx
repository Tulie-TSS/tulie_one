'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useProjects } from '@/hooks/useProjects'
import { Card, CardContent, CardHeader, CardTitle, Button, Label, Input } from '@repo/ui'
import { Loader2, ArrowLeft, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function NewTaskPage() {
    const router = useRouter()
    const { t } = useLocaleStore()
    const { user, loading: userLoading } = useCurrentUser()
    const { projects, loading: projectsLoading } = useProjects()
    
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [users, setUsers] = useState<{ id: string; full_name: string }[]>([])
    const [usersLoading, setUsersLoading] = useState(true)

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project_id: '',
        assigned_to: '',
        eisenhower_quadrant: 'Q2',
        estimated_effort_hours: '2',
        requested_deadline: '',
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

    // Set default project and assignee
    useEffect(() => {
        if (!projectsLoading && projects.length > 0 && !formData.project_id) {
            setFormData(prev => ({ ...prev, project_id: projects[0].id }))
        }
        if (user && !formData.assigned_to) {
            setFormData(prev => ({ ...prev, assigned_to: user.id }))
        }
    }, [projects, projectsLoading, user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    estimated_effort_hours: parseFloat(formData.estimated_effort_hours),
                    priority: 0,
                    status: 'intake',
                    organization_id: user?.organization_id,
                }),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Lỗi khi tạo công việc')
            }

            router.push('/board')
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
                    <Link href="/tasks">
                        <ArrowLeft className="size-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Tạo công việc mới</h1>
                    <p className="text-sm text-muted-foreground">Thêm một công việc mới vào hệ thống</p>
                </div>
            </div>

            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Chi tiết công việc</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Tiêu đề công việc</Label>
                            <Input 
                                id="title"
                                placeholder="VD: Thiết kế UI trang Dashboard..."
                                value={formData.title}
                                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                required
                                className="h-11"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả chi tiết</Label>
                            <textarea 
                                id="description"
                                rows={4}
                                placeholder="Nội dung công việc, yêu cầu kỹ thuật..."
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.description}
                                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Project */}
                            <div className="space-y-2">
                                <Label htmlFor="project_id">Dự án</Label>
                                <select 
                                    id="project_id"
                                    className="w-full h-11 rounded-md border border-input bg-background px-3 py-1 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.project_id}
                                    onChange={e => setFormData(prev => ({ ...prev, project_id: e.target.value }))}
                                    required
                                >
                                    {projectsLoading ? (
                                        <option>Đang tải dự án...</option>
                                    ) : (
                                        projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))
                                    )}
                                </select>
                            </div>

                            {/* Assignee */}
                            <div className="space-y-2">
                                <Label htmlFor="assigned_to">Người thực hiện</Label>
                                <select 
                                    id="assigned_to"
                                    className="w-full h-11 rounded-md border border-input bg-background px-3 py-1 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.assigned_to}
                                    onChange={e => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
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

                            {/* Eisenhower */}
                            <div className="space-y-2">
                                <Label htmlFor="quadrant">Phân loại (Eisenhower)</Label>
                                <select 
                                    id="quadrant"
                                    className="w-full h-11 rounded-md border border-input bg-background px-3 py-1 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.eisenhower_quadrant}
                                    onChange={e => setFormData(prev => ({ ...prev, eisenhower_quadrant: e.target.value }))}
                                >
                                    <option value="Q1">Q1: Khẩn cấp & Quan trọng</option>
                                    <option value="Q2">Q2: Quan trọng (Không khẩn cấp)</option>
                                    <option value="Q3">Q3: Khẩn cấp (Không quan trọng)</option>
                                    <option value="Q4">Q4: Không quan trọng & Không khẩn cấp</option>
                                </select>
                            </div>

                            {/* Effort */}
                            <div className="space-y-2">
                                <Label htmlFor="effort">Ước tính (giờ)</Label>
                                <Input 
                                    id="effort"
                                    type="number"
                                    min="0.5"
                                    step="0.5"
                                    value={formData.estimated_effort_hours}
                                    onChange={e => setFormData(prev => ({ ...prev, estimated_effort_hours: e.target.value }))}
                                    className="h-11"
                                />
                            </div>

                            {/* Deadline */}
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="deadline">Hạn chót mong muốn</Label>
                                <Input 
                                    id="deadline"
                                    type="date"
                                    value={formData.requested_deadline}
                                    onChange={e => setFormData(prev => ({ ...prev, requested_deadline: e.target.value }))}
                                    className="h-11"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20 font-medium animate-in shake duration-300">
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
                                        <Send className="mr-2 size-4" />
                                        Tạo công việc
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
