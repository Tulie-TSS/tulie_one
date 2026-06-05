'use client'

import { useEffect } from 'react'
import { SidebarProvider, SidebarInset, QuickStrikeBar } from '@repo/ui'
import { AppSidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { useQuickStrikeStore } from '@/lib/stores/quick-strike-store'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { NewTaskDialog } from '@/components/tasks/new-task-dialog'
import { useNewTaskStore } from '@/lib/stores/use-new-task-store'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { addStrike, fetchStrikes } = useQuickStrikeStore()
    const { t } = useLocaleStore()
    const { isOpen, setOpen } = useNewTaskStore()

    // Fetch recent quick strikes on mount
    useEffect(() => {
        fetchStrikes()
    }, [fetchStrikes])

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-1 flex-col min-w-0 relative w-full md:w-auto overflow-hidden bg-background">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/40">
                    {children}
                </main>
                <QuickStrikeBar
                    onSubmit={(text) => addStrike(text)}
                    placeholder={t('quickStrike.placeholder')}
                    position="bottom"
                />
                <NewTaskDialog open={isOpen} onOpenChange={setOpen} />
            </SidebarInset>
        </SidebarProvider>
    )
}
