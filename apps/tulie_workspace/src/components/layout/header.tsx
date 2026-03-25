'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useSidebarStore } from '@/lib/stores/sidebar-store'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { MOCK_NOTIFICATIONS, getMockCurrentUser } from '@/lib/mock/data'

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
    const { isCollapsed, setMobileOpen } = useSidebarStore()
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
        <header
            className="fixed top-0 right-0 flex items-center justify-between px-3 md:px-6 transition-all duration-200 md-header-offset"
            style={{
                height: 'var(--header-height)',
                backgroundColor: 'var(--color-bg)',
                borderBottom: '1px solid var(--color-border)',
                zIndex: 'var(--z-sticky)',
            }}
        >
            <style>{`
                .md-header-offset { left: 0; }
                @media (min-width: 768px) {
                    .md-header-offset { left: ${isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'}; }
                }
            `}</style>

            <button onClick={() => setMobileOpen(true)}
                className="p-2 rounded-md md:hidden cursor-pointer"
                style={{ color: 'var(--color-fg)', background: 'none', border: 'none' }}
                aria-label="Open sidebar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
            </button>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 flex-1 max-w-md cursor-pointer"
                style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-fg-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <span style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-sm)' }}>{t('search.headerPlaceholder')}</span>
            </div>

            <div className="flex items-center gap-2 md:gap-3 ml-auto">
                {/* Notification Bell + Dropdown */}
                <div className="relative" ref={panelRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-md cursor-pointer transition-colors"
                        style={{
                            color: showNotifications ? 'var(--color-info)' : 'var(--color-fg-secondary)',
                            background: showNotifications ? 'var(--color-info-bg)' : 'none',
                            border: 'none',
                        }}
                        aria-label="Notifications"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                        </svg>
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: 'var(--color-danger)', color: 'white', fontSize: '10px', fontWeight: 600 }}>
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notification Panel */}
                    {showNotifications && (
                        <div
                            className="fixed md:absolute right-0 md:right-0 top-[var(--header-height)] md:top-full md:mt-2 overflow-hidden"
                            style={{
                                width: '100vw',
                                maxWidth: '380px',
                                backgroundColor: 'var(--color-bg)',
                                borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                                border: '1px solid var(--color-border)',
                                borderTop: 'none',
                                boxShadow: 'var(--shadow-lg)',
                                zIndex: 100,
                            }}
                        >
                            {/* Panel Header */}
                            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold" style={{ color: 'var(--color-fg)', fontSize: 'var(--text-sm)' }}>{t('notifications.title')}</h3>
                                    {unreadCount > 0 && (
                                        <span className="px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-danger)', color: 'white', fontSize: '10px', fontWeight: 600 }}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="cursor-pointer"
                                        style={{ color: 'var(--color-info)', fontSize: 'var(--text-xs)', background: 'none', border: 'none', fontWeight: 500 }}
                                    >
                                        {t('notifications.markAllRead')}
                                    </button>
                                )}
                            </div>

                            {/* Notification List */}
                            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="text-3xl mb-2">🔔</div>
                                        <p style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-sm)' }}>{t('notifications.empty')}</p>
                                    </div>
                                ) : (
                                    notifications.map(n => (
                                        <Link
                                            key={n.id}
                                            href={n.related_task_id ? `/tasks/${n.related_task_id}` : '#'}
                                            onClick={() => { markAsRead(n.id); setShowNotifications(false) }}
                                            className="flex gap-3 px-4 py-3 no-underline transition-colors"
                                            style={{
                                                backgroundColor: n.is_read ? 'transparent' : 'var(--color-info-bg)',
                                                borderBottom: '1px solid var(--color-border)',
                                            }}
                                        >
                                            <div className="flex-shrink-0 pt-1.5">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: n.is_read ? 'var(--color-fg-tertiary)' : severityColor(n.type) }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="font-medium truncate" style={{ color: 'var(--color-fg)', fontSize: 'var(--text-sm)' }}>{n.title}</span>
                                                    {!n.is_read && (
                                                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-info)' }} />
                                                    )}
                                                </div>
                                                {n.content && (
                                                    <p className="truncate" style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-xs)', margin: 0 }}>{n.content}</p>
                                                )}
                                                <span style={{ color: 'var(--color-fg-tertiary)', fontSize: '11px' }}>{timeAgo(n.created_at, t)}</span>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>

                            {unreadCount === 0 && notifications.length > 0 && (
                                <div className="px-4 py-3 text-center" style={{ borderTop: '1px solid var(--color-border)' }}>
                                    <span style={{ color: 'var(--color-success)', fontSize: 'var(--text-xs)', fontWeight: 500 }}>✓ {t('notifications.allCaughtUp')}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                    <span>WIP: 1/2</span>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-info)', color: 'white', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                    {user.full_name.charAt(0)}
                </div>
            </div>
        </header>
    )
}
