'use client'

import * as React from "react"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Package,
  Building2,
  TrendingUp,
  Receipt,
  Settings,
  CreditCard,
  BarChart3,
  LogOut,
  User,
  ChevronsUpDown
} from 'lucide-react'

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@repo/ui'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { name: 'Hóa đơn', url: '/invoices', icon: FileText },
  { name: 'Thanh toán', url: '/payments', icon: CreditCard },
  { name: 'Sản phẩm', url: '/products', icon: Package },
  { name: 'Nhà cung cấp', url: '/vendors', icon: Building2 },
  { name: 'Chi phí', url: '/expenses', icon: Receipt },
  { name: 'Báo cáo', url: '/reports', icon: BarChart3 },
  { name: 'Dòng tiền', url: '/cash-flow', icon: TrendingUp },
  { name: 'Cài đặt', url: '/settings', icon: Settings },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [userEmail, setUserEmail] = React.useState<string | null>(null)

    React.useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserEmail(user.email ?? null)
            }
        }
        getUser()
    }, [supabase.auth])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <Sidebar variant="sidebar" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <span className="font-bold">T</span>
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold text-foreground">Tulie ERP</span>
                                    <span className="text-xs text-muted-foreground">Tài chính</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Nghiệp vụ cốt lõi</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigation.map((item) => {
                                const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
                                return (
                                    <SidebarMenuItem key={item.name}>
                                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                                            <Link href={item.url}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.name}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarFallback className="rounded-lg">
                                            {userEmail?.charAt(0).toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{userEmail ? userEmail.split('@')[0] : 'User'}</span>
                                        <span className="truncate text-xs text-muted-foreground">{userEmail || 'Loading...'}</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-md"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    Tài khoản
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleSignOut}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Đăng xuất
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
