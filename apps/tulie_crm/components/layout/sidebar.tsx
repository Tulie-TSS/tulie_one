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
} from '@repo/ui'
import {
    LayoutGrid,
    Users,
    FileText,
    FilePenLine,
    Banknote,

    UserCheck,
    PieChart,
    Settings,
    Files,
    TrendingUp,
    Rocket,
    Camera,
    Contact,
    Headphones,
    ExternalLink,
    DollarSign,
    Briefcase,
    Bot,
    Handshake,
    UserRound
} from 'lucide-react'

// Using the same navigation items
const navGroups = [
    {
        title: 'Tulie Agency',
        items: [
            { title: 'Khách hàng tiềm năng', href: '/leads', icon: Contact },
            { title: 'Leads & Cơ hội', href: '/deals', icon: TrendingUp },
            { title: 'Khách hàng', href: '/customers', icon: Users },
            { title: 'Báo giá', href: '/quotations', icon: FileText },
            { title: 'Portal Báo giá', href: '/quotations/portals', icon: LayoutGrid },
            { title: 'Hợp đồng', href: '/contracts', icon: FilePenLine },
            { title: 'Hợp đồng Cộng tác viên', href: '/contracts/ctv', icon: UserRound },
            { title: 'Dự án', href: '/projects', icon: Rocket },

            { title: 'Helpdesk', href: '/helpdesk', icon: Headphones },
        ]
    },
    {
        title: 'Tulie Studio',
        items: [
            { title: 'Đơn hàng Studio', href: '/studio', icon: Camera },
            { title: 'Khách hàng Studio', href: '/studio/customers', icon: Users },
            { title: 'Cấu hình Sự kiện', href: '/studio/events', icon: ExternalLink },
        ]
    },
    {
        title: 'Hệ thống',
        items: [
            { title: 'Nhân sự', href: '/team', icon: UserCheck },
            { title: 'Đối tác (CTV)', href: '/team/partners', icon: Handshake },
            { title: 'Mẫu giấy tờ', href: '/templates', icon: Files },
            { title: 'Báo cáo', href: '/reports', icon: PieChart },
            { title: 'Cài đặt', href: '/settings', icon: Settings },
        ]
    }
]

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center">
                                    <img src="/logo-icon.png" alt="Tulie" className="size-8 object-contain" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Tulie CRM</span>
                                    <span className="truncate text-xs">Agency Edition</span>
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
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard'} tooltip="Dashboard">
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
                                    const EXACT_MATCH_ROUTES = ['/contracts', '/studio']
                                    const useExact = EXACT_MATCH_ROUTES.includes(item.href)
                                    const isActive = useExact
                                        ? pathname === item.href
                                        : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'))
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
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

                <SidebarGroup>
                    <SidebarGroupLabel>Ứng dụng khác</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {[
                                { title: 'ERP - Tài chính', href: 'https://erp.tulie.app', icon: DollarSign, color: 'text-orange-500' },
                                { title: 'Workspace', href: 'https://workspace.tulie.app', icon: Briefcase, color: 'text-purple-500' },
                                { title: 'Workforce - AI', href: 'https://ai.tulie.app', icon: Bot, color: 'text-blue-500' },
                            ].map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <a href={item.href} target="_blank" rel="noopener">
                                            <item.icon className={item.color} />
                                            <span>{item.title}</span>
                                            <ExternalLink className="ml-auto w-4 h-4 opacity-50" />
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            
            <SidebarRail />
        </Sidebar>
    )
}
