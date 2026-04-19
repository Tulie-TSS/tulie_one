'use client'

import { SidebarProvider, SidebarInset, QuickStrikeBar } from '@repo/ui'
import { AppSidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { useQuickStrikeStore } from '@/lib/stores/quick-strike-store'
import { useLocaleStore } from '@/lib/stores/locale-store'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { addStrike } = useQuickStrikeStore()
    const { t } = useLocaleStore()

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-1 flex-col min-w-0 relative w-full md:w-auto overflow-hidden bg-background">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/40">
                    {children}
                </main>
                <QuickStrikeBar
                    onSubmit={(text) => addStrike({ id: Date.now().toString(), description: text, completed_at: new Date().toISOString() })}
                    placeholder={t('quickStrike.placeholder')}
                    position="bottom"
                />
            </SidebarInset>
        </SidebarProvider>
    )
}
