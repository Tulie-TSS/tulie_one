'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { MOCK_NOTIFICATIONS, getMockCurrentUser } from '@/lib/mock/data'
import {
    SidebarTrigger,
    Button,
    Badge,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Separator,
} from '@repo/ui'
import { Bell, Search } from 'lucide-react'

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
    const user = getMockCurrentUser()
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
    const [open, setOpen] = useState(false)

    const unreadCount = notifications.filter(n => !n.is_read).length

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    }

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    }

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />

            {/* Search bar */}
            <Button variant="outline" asChild className="hidden md:inline-flex items-center gap-2 flex-1 max-w-md justify-start ml-4 text-muted-foreground font-normal">
                <Link href="/search">
                    <Search className="size-4" />
                    <span className="text-sm">{t('search.headerPlaceholder')}</span>
                </Link>
            </Button>

            {/* Mobile Search Icon */}
            <Button variant="ghost" size="icon" asChild className="md:hidden ml-1">
                <Link href="/search">
                    <Search className="size-5" />
                </Link>
            </Button>

            <div className="flex flex-1 items-center justify-end gap-2 md:gap-4 ml-auto">
                {/* Notification Bell */}
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                            <Bell className="size-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium">
                                    {unreadCount}
                                </span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
                        {/* Panel Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b">
                            <h3 className="font-semibold text-sm">{t('notifications.title')}</h3>
                            {unreadCount > 0 && (
                                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={markAllRead}>
                                    {t('notifications.markAllRead')}
                                </Button>
                            )}
                        </div>

                        {/* Notification List */}
                        <div className="max-h-[60vh] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <div className="text-3xl mb-2">🔔</div>
                                    <p className="text-sm">{t('notifications.empty')}</p>
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <Link
                                        key={n.id}
                                        href={n.related_task_id ? `/tasks/${n.related_task_id}` : '#'}
                                        onClick={() => { markAsRead(n.id); setOpen(false) }}
                                        className={`flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-0 ${!n.is_read ? 'bg-accent/50' : ''}`}
                                    >
                                        <div className="flex-shrink-0 pt-1.5">
                                            <div className={`w-2 h-2 rounded-full ${n.is_read ? 'bg-muted-foreground/30' : n.type === 'critical' ? 'bg-destructive' : n.type === 'important' ? 'bg-amber-500' : 'bg-primary'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-medium text-sm truncate">{n.title}</span>
                                                {!n.is_read && (
                                                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary" />
                                                )}
                                            </div>
                                            {n.content && (
                                                <p className="text-xs text-muted-foreground truncate m-0">{n.content}</p>
                                            )}
                                            <span className="text-[11px] text-muted-foreground mt-1 block">{timeAgo(n.created_at, t)}</span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                <Badge variant="secondary" className="hidden sm:inline-flex text-[10px] md:text-xs font-semibold">
                    WIP: 1/2
                </Badge>
            </div>
        </header>
    )
}
