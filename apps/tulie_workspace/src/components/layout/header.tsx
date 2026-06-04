'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { createClient } from '@/lib/supabase'
import {
    SidebarTrigger,
    Button,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Separator,
} from '@repo/ui'
import { Bell, Search } from 'lucide-react'

import { DynamicBreadcrumbs } from './breadcrumbs'
import { UserNav } from './user-nav'

function timeAgo(dateStr: string, t: (key: string) => string): string {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMin < 1) return t('notifications.justNow')
    if (diffMin < 60) return `${diffMin} ${t('notifications.minutesAgo')}`
    if (diffHours < 24) return `${diffHours} ${t('notifications.hoursAgo')}`
    return `${diffDays} ${t('notifications.daysAgo')}`
}

export function Header() {
    const { t } = useLocaleStore()
    const [notifications, setNotifications] = useState<any[]>([])
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    const fetchNotifications = async () => {
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .or('source.neq.crm,source.is.null')
                .order('created_at', { ascending: false })
                .limit(20)

            if (error) throw error
            setNotifications(data || [])
        } catch (err) {
            console.error('Error fetching notifications:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()

        // Setup realtime subscription
        const supabase = createClient()
        const channel = supabase
            .channel('db_notifications')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications' },
                () => {
                    fetchNotifications()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const unreadCount = notifications.filter(n => !n.read).length

    const markAllRead = async () => {
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', user.id)
                .eq('read', false)

            if (error) throw error
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        } catch (err) {
            console.error('Error marking all notifications as read:', err)
        }
    }

    const markAsRead = async (id: string) => {
        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', id)

            if (error) throw error
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
        } catch (err) {
            console.error('Error marking notification as read:', err)
        }
    }

    return (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4 hidden md:block" />
            
            <div className="flex-1 flex items-center min-w-0">
                <DynamicBreadcrumbs />
            </div>

            <div className="flex items-center justify-end gap-2 md:gap-4 ml-auto">
                {/* Search bar */}
                <Button variant="ghost" size="icon" asChild className="text-muted-foreground hidden sm:inline-flex">
                    <Link href="/search">
                        <Search className="size-4" />
                    </Link>
                </Button>

                {/* Notification Bell */}
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative cursor-pointer" aria-label="Notifications">
                            <Bell className="size-4" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-2 w-2 items-center justify-center rounded-full bg-destructive" />
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
                        {/* Panel Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b">
                            <h3 className="font-semibold text-sm">{t('notifications.title')}</h3>
                            {unreadCount > 0 && (
                                <Button variant="link" size="sm" className="h-auto p-0 text-xs cursor-pointer" onClick={markAllRead}>
                                    {t('notifications.markAllRead')}
                                </Button>
                            )}
                        </div>

                        {/* Notification List */}
                        <div className="max-h-[60vh] overflow-y-auto">
                            {loading ? (
                                <div className="p-4 text-center text-xs text-muted-foreground">Đang tải thông báo...</div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <div className="flex justify-center mb-2">
                                        <Bell className="size-8 text-muted-foreground/30" />
                                    </div>
                                    <p className="text-sm">{t('notifications.empty')}</p>
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <Link
                                        key={n.id}
                                        href={n.link || '#'}
                                        onClick={() => { markAsRead(n.id); setOpen(false) }}
                                        className={`flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-0 ${!n.read ? 'bg-accent/40 font-medium' : ''}`}
                                    >
                                        <div className="flex-shrink-0 pt-1.5">
                                            <div className={`w-2 h-2 rounded-full ${n.read ? 'bg-muted-foreground/30' : n.severity === 'critical' ? 'bg-destructive' : n.severity === 'warning' || n.severity === 'important' ? 'bg-amber-500' : 'bg-primary'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-semibold text-xs text-foreground truncate">{n.title}</span>
                                            </div>
                                            {n.message && (
                                                <p className="text-xs text-muted-foreground line-clamp-2 m-0 font-normal leading-relaxed">{n.message}</p>
                                            )}
                                            <span className="text-[10px] text-muted-foreground mt-1.5 block font-normal">{timeAgo(n.created_at, t)}</span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                <Separator orientation="vertical" className="h-4 hidden sm:block" />
                <UserNav />
            </div>
        </header>
    )
}
