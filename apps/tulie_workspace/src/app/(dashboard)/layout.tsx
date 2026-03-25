'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { QuickStrikeBar } from '@/components/quick-strike/quick-strike-bar'
import { useSidebarStore } from '@/lib/stores/sidebar-store'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebarStore()
    const sidebarWidth = isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
            <Sidebar />
            <Header />
            <main
                id="main-content"
                className="transition-all duration-200 md-sidebar-offset"
                style={{
                    paddingTop: 'var(--header-height)',
                    minHeight: '100vh',
                }}
            >
                <style>{`
                    .md-sidebar-offset { margin-left: 0; }
                    @media (min-width: 768px) {
                        .md-sidebar-offset { margin-left: ${sidebarWidth}; }
                    }
                `}</style>
                <div className="p-3 md:p-5">
                    {children}
                </div>
            </main>
            <QuickStrikeBar />
        </div>
    )
}
