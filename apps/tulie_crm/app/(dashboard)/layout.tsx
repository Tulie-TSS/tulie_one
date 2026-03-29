import { SidebarProvider, SidebarInset } from '@repo/ui'
import { AppSidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export const dynamic = 'force-dynamic'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-1 flex-col min-w-0 bg-background relative overflow-y-auto w-full md:w-auto">
                <Header />
                <main className="flex-1 bg-background p-4 sm:p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
