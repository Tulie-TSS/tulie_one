'use client'

import React, { useState, useEffect } from 'react'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { PageHeader, Card, CardContent, Button, Input, Label, toast, useConfirm } from '@repo/ui'
import { Loader2, Plus, ExternalLink, Trash2, Globe, Calendar, FileSpreadsheet, Maximize2, Minimize2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface Resource {
    id: string
    name: string
    url: string
    type: 'google_sheets' | 'google_calendar' | 'lark' | 'excel_online' | 'other'
    is_embedded: boolean
    security_level: 'public' | 'internal' | 'confidential' | 'restricted'
    tags: string[]
    description?: string
    allowed_roles: string[]
}

export default function ResourcesPage() {
    const { t } = useLocaleStore()
    const { isAdmin, isManager, isMaker, user } = useCurrentUser()
    const confirm = useConfirm()
    const [resources, setResources] = useState<Resource[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const [viewMode, setViewMode] = useState<'list' | 'graph'>('list')
    const [newResource, setNewResource] = useState({
        name: '',
        url: '',
        type: 'other' as Resource['type'],
        is_embedded: true,
        security_level: 'internal' as Resource['security_level'],
        tags: [] as string[]
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
        
        let finalUrl = newResource.url
        // Tự động chuyển đổi link Google Sheets sang dạng nhúng nếu cần
        if (newResource.type === 'google_sheets' && finalUrl.includes('docs.google.com/spreadsheets')) {
            if (finalUrl.includes('/edit')) {
                finalUrl = finalUrl.replace(/\/edit.*$/, '/preview')
            } else if (!finalUrl.endsWith('/preview')) {
                finalUrl = finalUrl.endsWith('/') ? finalUrl + 'preview' : finalUrl + '/preview'
            }
        }

        console.log('Adding resource:', {
            ...newResource,
            url: finalUrl,
            organization_id: user?.organization_id,
            created_by: user?.id
        })

        if (!user?.organization_id) {
            toast.error('Tài khoản của bạn chưa được gắn vào Tổ chức (Organization). Vui lòng liên hệ Admin hoặc chạy script fix dữ liệu.')
            return
        }

        // Nếu là tài liệu bảo mật, mặc định chỉ cho admin và manager
        const allowedRoles = newResource.security_level === 'confidential' 
            ? ['admin', 'manager'] 
            : ['admin', 'manager', 'maker', 'observer']

        const { data, error } = await supabase
            .from('workspace_resources')
            .insert({
                ...newResource,
                url: finalUrl,
                organization_id: user.organization_id,
                created_by: user.id,
                allowed_roles: allowedRoles
            })
            .select()
            .single()

        if (data) {
            setResources([...resources, data])
            setIsAdding(false)
            setNewResource({ name: '', url: '', type: 'other', is_embedded: true })
            setSelectedResource(data)
            toast.success('Đã thêm tài liệu mới')
        } else if (error) {
            toast.error('Lỗi khi thêm tài liệu: ' + error.message)
        }
    }

    const handleDelete = async (id: string) => {
        const isConfirmed = await confirm({
            title: 'Xóa tài liệu',
            description: 'Bạn có chắc chắn muốn xóa tài liệu này? Hành động này không thể hoàn tác.',
            variant: 'destructive'
        })
        
        if (!isConfirmed) return

        const supabase = createClient()
        const { error } = await supabase.from('workspace_resources').delete().eq('id', id)
        
        if (error) {
            toast.error('Lỗi khi xóa tài liệu: ' + error.message)
            return
        }

        setResources(resources.filter(r => r.id !== id))
        if (selectedResource?.id === id) {
            setSelectedResource(resources.find(r => r.id !== id) || null)
        }
        toast.success('Đã xóa tài liệu')
    }

    const toggleFullscreen = () => {
        if (!containerRef.current) return

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                toast.error(`Không thể mở toàn màn hình: ${err.message}`)
            })
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }
        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }, [])

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
                {(isAdmin || isManager || isMaker) && (
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
                                    <option value="excel_online">Excel Online</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="security" className="text-xs">Bảo mật</Label>
                                <select 
                                    id="security"
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    value={newResource.security_level}
                                    onChange={e => setNewResource({...newResource, security_level: e.target.value as any})}
                                >
                                    <option value="public">Công khai (Public)</option>
                                    <option value="internal">Nội bộ (Internal)</option>
                                    <option value="confidential">Bảo mật (CEO/Admin)</option>
                                    <option value="restricted">Hạn chế (Restricted)</option>
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

            <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 overflow-hidden">
                {/* Sidebar list - scrollable horizontally on mobile, vertically on desktop */}
                <div className="w-full md:w-64 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto shrink-0 pb-2 md:pb-0 md:pr-2 border-b md:border-b-0 md:border-r">
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
                                    className={`w-full flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all text-left whitespace-nowrap md:whitespace-normal ${
                                        selectedResource?.id === r.id 
                                        ? 'bg-primary text-primary-foreground shadow-md' 
                                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {getIcon(r.type)}
                                    <span className="truncate flex-1">{r.name}</span>
                                </button>
                                {(isAdmin || isManager || isMaker) && (
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
                <div 
                    ref={containerRef}
                    className={`flex-1 rounded-xl border bg-muted/30 overflow-hidden relative ${isFullscreen ? 'bg-background p-0' : ''}`}
                >
                    {selectedResource ? (
                        <div className="w-full h-full flex flex-col">
                            <div className="p-2 border-b bg-background flex items-center justify-between px-4 shrink-0">
                                <span className="text-xs font-semibold text-muted-foreground truncate mr-4">
                                    {selectedResource.url}
                                </span>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="h-7 text-[10px]">
                                        {isFullscreen ? (
                                            <>
                                                <Minimize2 className="mr-1 size-3" />
                                                Thoát
                                            </>
                                        ) : (
                                            <>
                                                <Maximize2 className="mr-1 size-3" />
                                                Toàn màn hình
                                            </>
                                        )}
                                    </Button>
                                    <Button variant="ghost" size="sm" asChild className="h-7 text-[10px]">
                                        <a href={selectedResource.url} target="_blank" rel="noopener noreferrer">
                                            Mở tab mới
                                            <ExternalLink className="ml-1 size-3" />
                                        </a>
                                    </Button>
                                </div>
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
