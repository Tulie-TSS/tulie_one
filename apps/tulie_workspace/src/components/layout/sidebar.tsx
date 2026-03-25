'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebarStore } from '@/lib/stores/sidebar-store'
import { useLocaleStore } from '@/lib/stores/locale-store'

const NAV_ITEMS = [
    { href: '/dashboard', labelKey: 'nav.overview' as const, icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10' },
    { href: '/board', labelKey: 'nav.board' as const, icon: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18' },
    { href: '/focus', labelKey: 'nav.focus' as const, icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2' },
    { href: '/quarantine', labelKey: 'nav.quarantine' as const, icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M12 8v4 M12 16h.01' },
    { type: 'divider' as const },
    { href: '/tasks', labelKey: 'nav.tasks' as const, icon: 'M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' },
    { href: '/projects', labelKey: 'nav.projects' as const, icon: 'M2 20h.01 M7 20v-4 M12 20v-8 M17 20V8 M22 4v16' },
    { href: '/cycles', labelKey: 'nav.cycles' as const, icon: 'M21 12a9 9 0 11-6.219-8.56 M21 3v5h-5' },
    { type: 'divider' as const },
    { href: '/analytics', labelKey: 'nav.analytics' as const, icon: 'M18 20V10 M12 20V4 M6 20v-6' },
    { href: '/templates', labelKey: 'nav.templates' as const, icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8' },
    { type: 'divider' as const },
    { href: '/settings', labelKey: 'nav.settings' as const, icon: 'M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z M12 8a4 4 0 100 8 4 4 0 000-8z', isBottom: true },
] as const

type NavItemType = (typeof NAV_ITEMS)[number]

export function Sidebar() {
    const pathname = usePathname()
    const { isCollapsed, toggle, isMobileOpen, setMobileOpen } = useSidebarStore()
    const { t } = useLocaleStore()

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/'
        return pathname.startsWith(href)
    }

    const mainNav = NAV_ITEMS.filter(n => !('isBottom' in n && n.isBottom))
    const bottomNav = NAV_ITEMS.filter(n => 'isBottom' in n && n.isBottom)

    return (
        <>
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/40 md:hidden"
                    style={{ zIndex: 'var(--z-overlay)' }}
                    onClick={() => setMobileOpen(false)}
                />
            )}
            <aside
                className={`fixed top-0 left-0 h-full flex flex-col transition-all duration-200 ${
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}
                style={{
                    width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
                    backgroundColor: 'var(--color-bg)',
                    borderRight: '1px solid var(--color-border)',
                    zIndex: 'var(--z-sticky)',
                }}
            >
                <div className="flex items-center gap-3 px-4 h-14"
                    style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'var(--color-info)', color: 'white' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                    </div>
                    {!isCollapsed && (
                        <span className="font-bold text-lg" style={{ color: 'var(--color-fg)' }}>FlowGuard</span>
                    )}
                    <button onClick={toggle} className="ml-auto p-1.5 rounded-md hover:opacity-80 cursor-pointer hidden md:flex"
                        style={{ color: 'var(--color-fg-secondary)', background: 'none', border: 'none' }}
                        aria-label="Toggle sidebar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {isCollapsed
                                ? <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>
                                : <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                            }
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden" role="navigation">
                    {mainNav.map((item, idx) => {
                        if ('type' in item && item.type === 'divider') {
                            return <div key={`divider-${idx}`} className="my-2 mx-2" style={{ borderTop: '1px solid var(--color-border)' }} />
                        }
                        const navItem = item as Extract<NavItemType, { href: string }>
                        return (
                            <Link key={navItem.href} href={navItem.href}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors no-underline"
                                style={{
                                    color: isActive(navItem.href) ? 'var(--color-info)' : 'var(--color-fg-secondary)',
                                    backgroundColor: isActive(navItem.href) ? 'var(--color-info-bg)' : 'transparent',
                                    fontSize: 'var(--text-sm)', fontWeight: isActive(navItem.href) ? 500 : 400,
                                }}
                                onClick={() => setMobileOpen(false)}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                                    <path d={navItem.icon} />
                                </svg>
                                {!isCollapsed && <span>{t(navItem.labelKey)}</span>}
                            </Link>
                        )
                    })}
                </nav>

                <div className="py-3 px-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                    {bottomNav.map((item) => {
                        const navItem = item as Extract<NavItemType, { href: string }>
                        return (
                            <Link key={navItem.href} href={navItem.href}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors no-underline"
                                style={{
                                    color: isActive(navItem.href) ? 'var(--color-info)' : 'var(--color-fg-secondary)',
                                    backgroundColor: isActive(navItem.href) ? 'var(--color-info-bg)' : 'transparent',
                                    fontSize: 'var(--text-sm)',
                                }}
                                onClick={() => setMobileOpen(false)}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                                    <path d={navItem.icon} />
                                </svg>
                                {!isCollapsed && <span>{t(navItem.labelKey)}</span>}
                            </Link>
                        )
                    })}
                </div>
            </aside>
        </>
    )
}
