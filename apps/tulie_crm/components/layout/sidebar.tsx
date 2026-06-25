'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from '@repo/ui'
import {
    LayoutGrid,
    Users,
    FileText,
    FilePenLine,
    Banknote,
    Wallet,
    PieChart,
    Receipt,
    Settings,
    Files,
    Rocket,
    Camera,
    UserRound
} from 'lucide-react'

// Using the same navigation items
const navGroups = [
    {
        title: 'Tulie Agency',
        items: [
            { title: 'Khách hàng', href: '/customers', icon: Users },
            { title: 'Báo giá', href: '/quotations', icon: FileText },
            { title: 'Portal Báo giá', href: '/quotations/portals', icon: LayoutGrid },
            { title: 'Hợp đồng', href: '/contracts', icon: FilePenLine },
            { title: 'Cộng tác & Khoán việc', href: '/contracts/ctv', icon: UserRound },
        ]
    },
    {
        title: 'Tulie Studio',
        items: [
            { title: 'Đơn hàng Studio', href: '/studio', icon: Camera },
            { title: 'Khách hàng Studio', href: '/studio/customers', icon: Users },
        ]
    },
    {
        title: 'Tài chính',
        items: [
            { title: 'Báo cáo P&L', href: '/finance', icon: PieChart },
            { title: 'Chi phí', href: '/finance/expenses', icon: Receipt },
            { title: 'Dòng tiền', href: '/finance/cashflow', icon: Wallet },
        ]
    },
    {
        title: 'Hệ thống',
        items: [
            { title: 'Mẫu giấy tờ', href: '/templates', icon: Files },
            { title: 'Cài đặt', href: '/settings', icon: Settings },
        ]
    }
]

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const { setOpenMobile } = useSidebar()

    const handleLinkClick = () => {
        setOpenMobile(false)
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild onClick={handleLinkClick}>
                            <Link href="/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center overflow-hidden shrink-0">
                                    <img src="/logo.png" alt="Tulie Logo" className="size-8 object-contain" />
                                </div>
                                <div className="grid flex-1 text-left leading-tight ml-0.5">
                                    <span className="truncate font-bold text-[15px] tracking-tight text-foreground">Tulie CRM</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard'} tooltip="Dashboard" onClick={handleLinkClick}>
                                <Link href="/dashboard">
                                    <LayoutGrid />
                                    <span>Dashboard</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                {navGroups.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    // exactMatch: true for routes that have sub-routes we don't want to activate
                                    // e.g. /contracts should NOT be active when on /contracts/ctv
                                    const EXACT_MATCH_ROUTES = ['/contracts', '/studio', '/finance']
                                    const useExact = EXACT_MATCH_ROUTES.includes(item.href)
                                    const isActive = useExact
                                        ? pathname === item.href
                                        : item.href === '/quotations'
                                            ? pathname === '/quotations' || (pathname.startsWith('/quotations/') && !pathname.startsWith('/quotations/portals'))
                                            : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'))
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild isActive={isActive} tooltip={item.title} onClick={handleLinkClick}>
                                                <Link href={item.href}>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}

            </SidebarContent>
            
            <SidebarRail />
        </Sidebar>
    )
}
