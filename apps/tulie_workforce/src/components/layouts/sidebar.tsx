"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Bot,
    ClipboardList,
    MessageSquare,
    Workflow,
    BookOpen,
    Settings,
    Zap,
    Inbox,
    Users,
    Megaphone,
    ChevronDown,
    PanelLeftClose,
    PanelLeft,
} from "lucide-react";
import { useState, createContext, useContext } from "react";

/* ------------------------------------------------------------------ */
/*  Sidebar context                                                    */
/* ------------------------------------------------------------------ */

interface SidebarContextValue {
    collapsed: boolean;
    setCollapsed: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue>({
    collapsed: false,
    setCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    return (
        <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
            {children}
        </SidebarContext.Provider>
    );
}

/* ------------------------------------------------------------------ */
/*  Types & Data                                                       */
/* ------------------------------------------------------------------ */

const CURRENT_USER_ROLE: "owner" | "manager" | "specialist" | "viewer" = "owner";

interface NavChild {
    name: string;
    href: string;
}

interface NavItem {
    name: string;
    href?: string;
    icon: typeof LayoutDashboard;
    badge?: string;
    children?: NavChild[];
    visibleTo?: ("owner" | "manager" | "specialist" | "viewer")[];
}

const navigation: NavItem[] = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    {
        name: "Agents",
        href: "/agents",
        icon: Bot,
        badge: "4",
        children: [
            { name: "All Agents", href: "/agents" },
            { name: "Create Agent", href: "/agents/new" },
        ],
    },
    {
        name: "Tasks",
        href: "/tasks",
        icon: ClipboardList,
        badge: "3",
        children: [
            { name: "All Tasks", href: "/tasks" },
            { name: "Assign Task", href: "/tasks/new" },
        ],
    },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Automations", href: "/automations", icon: Workflow, badge: "5" },
    {
        name: "FB Ads",
        href: "/ads",
        icon: Megaphone,
        visibleTo: ["owner", "manager"],
    },
    {
        name: "Approvals",
        href: "/approvals",
        icon: Inbox,
        badge: "3",
        visibleTo: ["owner", "manager"],
    },
    { name: "Knowledge", href: "/knowledge", icon: BookOpen, badge: "6" },
    { name: "Team", href: "/settings/team", icon: Users, visibleTo: ["owner"] },
    {
        name: "Settings",
        href: "/settings",
        icon: Settings,
        visibleTo: ["owner", "manager"],
    },
];

/* ------------------------------------------------------------------ */
/*  NavLink                                                            */
/* ------------------------------------------------------------------ */

function NavLink({
    item,
    isActive,
    collapsed,
}: {
    item: NavItem;
    isActive: boolean;
    collapsed: boolean;
}) {
    return (
        <Link
            href={item.href ?? "#"}
            className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                isActive
                    ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
            title={collapsed ? item.name : undefined}
        >
            <item.icon
                className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
            />
            {!collapsed && (
                <>
                    <span className="flex-1 truncate">{item.name}</span>
                    {item.badge && (
                        <span
                            className={cn(
                                "flex h-5 min-w-[20px] items-center justify-center rounded-md px-1.5 text-[10px] font-bold",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "bg-accent text-muted-foreground group-hover:bg-primary/90 group-hover:text-primary-foreground group-hover:shadow-sm"
                            )}
                        >
                            {item.badge}
                        </span>
                    )}
                </>
            )}
        </Link>
    );
}

/* ------------------------------------------------------------------ */
/*  NavAccordion                                                       */
/* ------------------------------------------------------------------ */

function NavAccordion({
    item,
    isActive,
    collapsed,
}: {
    item: NavItem;
    isActive: boolean;
    collapsed: boolean;
}) {
    const pathname = usePathname();
    const [open, setOpen] = useState(isActive);

    if (collapsed) {
        return (
            <Link
                href={item.href ?? "#"}
                className={cn(
                    "group flex items-center justify-center rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                    isActive
                        ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
                title={item.name}
            >
                <item.icon
                    className={cn(
                        "h-[18px] w-[18px] shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                />
            </Link>
        );
    }

    return (
        <div>
            <button
                onClick={() => setOpen((prev) => !prev)}
                className={cn(
                    "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                    isActive
                        ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
            >
                <item.icon
                    className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                />
                <span className="flex-1 truncate text-left">{item.name}</span>
                {item.badge && (
                    <span
                        className={cn(
                            "flex h-5 min-w-[20px] items-center justify-center rounded-md px-1.5 text-[10px] font-bold",
                            isActive
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-accent text-muted-foreground group-hover:bg-primary/90 group-hover:text-primary-foreground group-hover:shadow-sm"
                        )}
                    >
                        {item.badge}
                    </span>
                )}
                <ChevronDown
                    className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform duration-200",
                        open && "rotate-180"
                    )}
                />
            </button>

            <div
                className={cn(
                    "overflow-hidden transition-all duration-200",
                    open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="ml-[30px] mt-1 space-y-0.5 border-l border-border/60 pl-3">
                    {item.children?.map((child) => {
                        const childActive = pathname === child.href;
                        return (
                            <Link
                                key={child.href}
                                href={child.href}
                                className={cn(
                                    "block rounded-md px-2.5 py-1.5 text-[13px] transition-colors duration-150 font-medium",
                                    childActive
                                        ? "text-primary font-bold bg-primary/5"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                )}
                            >
                                {child.name}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Main Sidebar                                                       */
/* ------------------------------------------------------------------ */

export const Sidebar = () => {
    const pathname = usePathname();
    const { collapsed, setCollapsed } = useSidebar();

    const visibleNav = navigation.filter(
        (item) => !item.visibleTo || item.visibleTo.includes(CURRENT_USER_ROLE)
    );

    return (
        <aside
            className={cn(
                "sticky top-0 flex h-screen flex-col bg-card border-r border-border shrink-0 transition-all duration-300 ease-in-out z-30 shadow-[1px_0_10px_rgba(0,0,0,0.02)]",
                collapsed ? "w-[68px]" : "w-[260px]"
            )}
        >
            {/* ── Logo ── */}
            <div className="flex h-[64px] items-center gap-3 px-5 border-b border-border bg-card/50 backdrop-blur-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20">
                    <Zap className="h-4.5 w-4.5 text-white" />
                </div>
                {!collapsed && (
                    <span className="text-[17px] font-bold text-foreground">
                        Tulie
                    </span>
                )}
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 space-y-0.5 overflow-y-auto px-4 py-6 scrollbar-thin">
                {visibleNav.map((item) => {
                    const isActive = item.href
                        ? item.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(item.href)
                        : false;

                    if (item.children && item.children.length > 0) {
                        return (
                            <NavAccordion
                                key={item.name}
                                item={item}
                                isActive={isActive}
                                collapsed={collapsed}
                            />
                        );
                    }

                    return (
                        <NavLink
                            key={item.name}
                            item={item}
                            isActive={isActive}
                            collapsed={collapsed}
                        />
                    );
                })}
            </nav>

            {/* ── Footer: collapse toggle ── */}
            <div className="border-t border-border p-3">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex w-full items-center justify-center rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? (
                        <PanelLeft className="h-[18px] w-[18px]" />
                    ) : (
                        <PanelLeftClose className="h-[18px] w-[18px]" />
                    )}
                </button>
            </div>
        </aside>
    );
};
