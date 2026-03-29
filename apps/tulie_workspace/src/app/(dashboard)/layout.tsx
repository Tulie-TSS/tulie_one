'use client'

import { SidebarProvider, SidebarInset } from '@repo/ui'
import { AppSidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { QuickStrikeBar } from '@/components/quick-strike/quick-strike-bar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-1 flex-col min-w-0 relative w-full md:w-auto overflow-hidden bg-background">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
                    {children}
                </main>
                <div className="absolute inset-x-0 bottom-4 pointer-events-none flex justify-center z-50">
                    <div className="pointer-events-auto">
                        <QuickStrikeBar />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
