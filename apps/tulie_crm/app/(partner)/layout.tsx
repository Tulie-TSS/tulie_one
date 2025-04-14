import { SidebarProvider, SidebarInset } from '@repo/ui'
import { Header } from '@/components/layout/header'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function PartnerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single()
        if (dbUser?.role !== 'partner') {
            redirect('/dashboard') // Nếu không phải partner thì back về dashboard CRM
        }
    } else {
        redirect('/system-login') // Dành cho trường hợp chưa đăng nhập
    }

    return (
        <SidebarProvider>
            {/* Không sử dụng AppSidebar để tối giản */}
            <SidebarInset className="flex flex-1 flex-col min-w-0 bg-background relative overflow-y-auto w-full md:w-auto">
                <Header />
                <main className="flex-1 bg-background p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
