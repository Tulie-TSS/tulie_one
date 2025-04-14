'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { MOCK_NOTIFICATIONS, getMockCurrentUser } from '@/lib/mock/data'
import { SidebarTrigger } from '@repo/ui'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@repo/ui'

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
    const [showNotifications, setShowNotifications] = useState(false)
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
    const panelRef = useRef<HTMLDivElement>(null)

    const unreadCount = notifications.filter(n => !n.is_read).length

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setShowNotifications(false)
            }
        }
        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showNotifications])

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    }

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    }

    const severityColor = (type: string) => {
        switch (type) {
            case 'critical': return 'var(--color-danger)'
            case 'important': return 'var(--color-warning)'
            default: return 'var(--color-info)'
        }
    }

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 flex-1 max-w-md cursor-pointer ml-4 rounded-md border text-muted-foreground bg-muted/50">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <span className="text-sm">{t('search.headerPlaceholder')}</span>
            </div>

            <div className="flex flex-1 items-center justify-end gap-2 md:gap-4 ml-auto">
                {/* Notification Bell + Dropdown */}
                <div className="relative" ref={panelRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-md cursor-pointer transition-colors hover:bg-muted"
                        aria-label="Notifications"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                        </svg>
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center bg-destructive text-destructive-foreground text-[10px]">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notification Panel */}
                    {showNotifications && (
                        <div
                            className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-md border bg-popover text-popover-foreground z-50"
                        >
                            {/* Panel Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-sm">{t('notifications.title')}</h3>
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="text-xs font-medium text-primary hover:underline"
                                    >
                                        {t('notifications.markAllRead')}
                                    </button>
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
                                            onClick={() => { markAsRead(n.id); setShowNotifications(false) }}
                                            className="flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-0"
                                            style={{
                                                backgroundColor: n.is_read ? 'transparent' : 'var(--color-info-bg)',
                                            }}
                                        >
                                            <div className="flex-shrink-0 pt-1.5">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: n.is_read ? 'var(--color-fg-tertiary)' : severityColor(n.type) }} />
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
                        </div>
                    )}
                </div>

                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs font-semibold">
                    <span>WIP: 1/2</span>
                </div>
            </div>
        </header>
    )
}
