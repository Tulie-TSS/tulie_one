'use client'

import React, { useState, useEffect } from 'react'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { PageHeader, Card, CardContent, Button, Input, Label } from '@repo/ui'
import { Loader2, Plus, ExternalLink, Trash2, Globe, Calendar, FileSpreadsheet } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface Resource {
    id: string
    name: string
    url: string
    type: 'google_sheets' | 'google_calendar' | 'lark' | 'excel_online' | 'other'
    is_embedded: boolean
}

export default function ResourcesPage() {
    const { t } = useLocaleStore()
    const { isAdmin, isManager, user } = useCurrentUser()
    const [resources, setResources] = useState<Resource[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [newResource, setNewResource] = useState({
        name: '',
        url: '',
        type: 'other' as Resource['type'],
        is_embedded: true
    })

    const fetchResources = async () => {
        setLoading(true)
        const supabase = createClient()
        const { data } = await supabase
            .from('workspace_resources')
            .select('*')
            .order('created_at', { ascending: true })
        
        if (data) {
            setResources(data)
            if (data.length > 0 && !selectedResource) {
                setSelectedResource(data[0])
            }
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchResources()
    }, [])

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        const supabase = createClient()
        const { data, error } = await supabase
            .from('workspace_resources')
            .insert({
                ...newResource,
                organization_id: user?.organization_id,
                created_by: user?.id
            })
            .select()
            .single()

        if (data) {
            setResources([...resources, data])
            setIsAdding(false)
            setNewResource({ name: '', url: '', type: 'other', is_embedded: true })
            setSelectedResource(data)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return
        const supabase = createClient()
        await supabase.from('workspace_resources').delete().eq('id', id)
        setResources(resources.filter(r => r.id !== id))
        if (selectedResource?.id === id) {
            setSelectedResource(resources.find(r => r.id !== id) || null)
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'google_calendar': return <Calendar className="size-4" />
            case 'google_sheets':
            case 'excel_online': return <FileSpreadsheet className="size-4" />
            case 'lark': return <Globe className="size-4" />
            default: return <ExternalLink className="size-4" />
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-var(--header-height)-2rem)] space-y-4">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Tài liệu & Nhúng</h1>
                    <p className="text-sm text-muted-foreground">Truy cập nhanh các tài liệu Google Sheets, Lịch, Lark...</p>
                </div>
                {(isAdmin || isManager) && (
                    <Button onClick={() => setIsAdding(!isAdding)} size="sm">
                        <Plus className="size-4" />
                        Thêm tài liệu
                    </Button>
                )}
            </div>

            {isAdding && (
                <Card className="shrink-0 border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="space-y-1">
                                <Label htmlFor="name" className="text-xs">Tên tài liệu</Label>
                                <Input 
                                    id="name" 
                                    value={newResource.name} 
                                    onChange={e => setNewResource({...newResource, name: e.target.value})} 
                                    placeholder="VD: Kế hoạch doanh thu" 
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="url" className="text-xs">Link (URL)</Label>
                                <Input 
                                    id="url" 
                                    value={newResource.url} 
                                    onChange={e => setNewResource({...newResource, url: e.target.value})} 
                                    placeholder="https://docs.google.com/..." 
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="type" className="text-xs">Loại</Label>
                                <select 
                                    id="type"
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    value={newResource.type}
                                    onChange={e => setNewResource({...newResource, type: e.target.value as any})}
                                >
                                    <option value="other">Khác</option>
                                    <option value="google_sheets">Google Sheets</option>
                                    <option value="google_calendar">Google Calendar</option>
                                    <option value="lark">Lark</option>
                                    <option value="excel_online">Excel Online</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="flex-1">Lưu</Button>
                                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Hủy</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="flex-1 flex gap-4 min-h-0">
                {/* Sidebar list */}
                <div className="w-64 flex flex-col gap-2 overflow-y-auto shrink-0 pr-2 border-r">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="size-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : resources.length === 0 ? (
                        <p className="text-xs text-center py-10 text-muted-foreground italic">Chưa có tài liệu nào</p>
                    ) : (
                        resources.map(r => (
                            <div key={r.id} className="group relative">
                                <button
                                    onClick={() => setSelectedResource(r)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                                        selectedResource?.id === r.id 
                                        ? 'bg-primary text-primary-foreground shadow-md' 
                                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {getIcon(r.type)}
                                    <span className="truncate flex-1">{r.name}</span>
                                </button>
                                {(isAdmin || isManager) && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="size-3" />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Content View */}
                <div className="flex-1 rounded-xl border bg-muted/30 overflow-hidden relative">
                    {selectedResource ? (
                        <div className="w-full h-full flex flex-col">
                            <div className="p-2 border-b bg-background flex items-center justify-between px-4">
                                <span className="text-xs font-semibold text-muted-foreground truncate mr-4">
                                    {selectedResource.url}
                                </span>
                                <Button variant="ghost" size="sm" asChild className="h-7 text-[10px]">
                                    <a href={selectedResource.url} target="_blank" rel="noopener noreferrer">
                                        Mở tab mới
                                        <ExternalLink className="ml-1 size-3" />
                                    </a>
                                </Button>
                            </div>
                            <iframe 
                                src={selectedResource.url} 
                                className="flex-1 w-full border-none bg-white"
                                title={selectedResource.name}
                                allowFullScreen
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground space-y-2">
                            <Globe className="size-12 opacity-20" />
                            <p className="text-sm">Chọn một tài liệu để xem nội dung</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
