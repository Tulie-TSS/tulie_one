import { SidebarProvider, SidebarInset } from '@repo/ui'
import { AppSidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Defense in depth: redirect unauthenticated users even if middleware fails
    if (!user) {
        redirect('/system-login')
    }

    const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (dbUser?.role === 'partner') {
        redirect('/partner')
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-1 flex-col min-w-0 bg-background relative w-full md:w-auto">
                <Header />
                <main className="flex-1 bg-background p-4 sm:p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
