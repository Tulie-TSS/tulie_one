'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocaleStore } from '@/lib/stores/locale-store'
import {
    LayoutDashboard,
    KanbanSquare,
    Target,
    ShieldAlert,
    CheckSquare,
    FolderKanban,
    RefreshCw,
    BarChart3,
    LayoutTemplate,
    Settings,
    LogOut,
    User,
    ChevronsUpDown,
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
import { getMockCurrentUser } from '@/lib/mock/data'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
    { href: '/dashboard', labelKey: 'nav.overview', icon: LayoutDashboard },
    { href: '/board', labelKey: 'nav.board', icon: KanbanSquare },
    { href: '/focus', labelKey: 'nav.focus', icon: Target },
    { href: '/quarantine', labelKey: 'nav.quarantine', icon: ShieldAlert },
    { type: 'divider' },
    { href: '/tasks', labelKey: 'nav.tasks', icon: CheckSquare },
    { href: '/projects', labelKey: 'nav.projects', icon: FolderKanban },
    { href: '/cycles', labelKey: 'nav.cycles', icon: RefreshCw },
    { type: 'divider' },
    { href: '/analytics', labelKey: 'nav.analytics', icon: BarChart3 },
    { href: '/templates', labelKey: 'nav.templates', icon: LayoutTemplate },
    { type: 'divider' },
    { href: '/settings', labelKey: 'nav.settings', icon: Settings, isBottom: true },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const { t } = useLocaleStore()
    const router = useRouter()
    const [userEmail, setUserEmail] = React.useState<string | null>(null)

    React.useEffect(() => {
        const user = getMockCurrentUser()
        if (user) {
            setUserEmail(user.email ?? null)
        }
    }, [])

    const handleSignOut = async () => {
        router.push('/login')
        router.refresh()
    }

    const isActive = (href: string) => {
        if (href === '/dashboard' || href === '/') return pathname === '/dashboard' || pathname === '/'
        return pathname.startsWith(href)
    }

    const mainNav = NAV_ITEMS.filter(n => !('isBottom' in n) || !n.isBottom)
    const bottomNav = NAV_ITEMS.filter(n => 'isBottom' in n && n.isBottom)

    return (
        <Sidebar variant="sidebar" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-primary-foreground">
                                    <Target className="size-4 text-white" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold text-foreground">Tulie Workspace</span>
                                    <span className="text-xs text-muted-foreground">Productivity</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainNav.map((item, idx) => {
                                if ('type' in item && item.type === 'divider') {
                                    return <div key={`div-${idx}`} className="my-2 h-px bg-border mx-2" />
                                }
                                const navItem = item as Extract<typeof NAV_ITEMS[number], { href: string }>
                                const active = isActive(navItem.href)
                                return (
                                    <SidebarMenuItem key={navItem.href}>
                                        <SidebarMenuButton asChild isActive={active} tooltip={t(navItem.labelKey as any)}>
                                            <Link href={navItem.href}>
                                                <navItem.icon className="size-4" />
                                                <span>{t(navItem.labelKey as any)}</span>
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
                    {bottomNav.map((item) => {
                        const navItem = item as Extract<typeof NAV_ITEMS[number], { href: string }>
                        const active = isActive(navItem.href)
                        return (
                            <SidebarMenuItem key={navItem.href}>
                                <SidebarMenuButton asChild isActive={active} tooltip={t(navItem.labelKey as any)}>
                                    <Link href={navItem.href}>
                                        <navItem.icon className="size-4" />
                                        <span>{t(navItem.labelKey as any)}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                    <SidebarMenuItem className="mt-2">
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
