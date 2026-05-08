"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocaleStore } from "@/lib/stores/locale-store";
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
  TrendingUp,
  Network
} from "lucide-react";

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
  SidebarSeparator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  useSidebar,
} from "@repo/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui";
import { getMockCurrentUser } from "@/lib/mock/data";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", labelKey: "nav.overview", icon: LayoutDashboard, allowedRoles: ['admin', 'manager', 'maker', 'observer'] },
  { href: "/board", labelKey: "nav.board", icon: KanbanSquare, allowedRoles: ['admin', 'manager', 'maker'] },
  { href: "/focus", labelKey: "nav.focus", icon: Target, allowedRoles: ['admin', 'manager', 'maker'] },
  { href: "/quarantine", labelKey: "nav.quarantine", icon: ShieldAlert, allowedRoles: ['admin', 'manager'] },
  { type: "divider" },
  { href: "/tasks", labelKey: "nav.tasks", icon: CheckSquare, allowedRoles: ['admin', 'manager', 'maker', 'observer'] },
  { href: "/projects", labelKey: "nav.projects", icon: FolderKanban, allowedRoles: ['admin', 'manager', 'maker', 'observer'] },
  { href: "/cycles", labelKey: "nav.cycles", icon: RefreshCw, allowedRoles: ['admin', 'manager', 'maker', 'observer'] },
  { type: "divider" },
  { href: "/analytics", labelKey: "nav.analytics", icon: BarChart3, allowedRoles: ['admin', 'manager'] },
  { href: "/templates", labelKey: "nav.templates", icon: LayoutTemplate, allowedRoles: ['admin', 'manager'] },
  { href: "/strategy", labelKey: "nav.strategy", icon: TrendingUp, allowedRoles: ['admin', 'manager'] },
  { href: "/strategy/okrs", labelKey: "nav.okrs", icon: Network, allowedRoles: ['admin', 'manager', 'maker', 'observer'] },
  { href: "/resources", labelKey: "nav.resources", icon: LayoutTemplate, allowedRoles: ['admin', 'manager', 'maker', 'observer'] },
  { type: "divider" },
  {
    href: "/settings",
    labelKey: "nav.settings",
    icon: Settings,
    isBottom: true,
    allowedRoles: ['admin', 'manager', 'maker', 'observer']
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { t } = useLocaleStore();
  const router = useRouter();
  const { state, setOpenMobile } = useSidebar();
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  React.useEffect(() => {
    async function fetchProfile() {
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        setUserProfile(profile);
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    const { createClient } = await import("@/lib/supabase");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/dashboard" || href === "/")
      return pathname === "/dashboard" || pathname === "/";
    return pathname.startsWith(href);
  };

  const role = userProfile?.role_type || 'observer';

  const filteredNav = NAV_ITEMS.reduce((acc: any[], item, idx) => {
    // If it's a real item, check role
    if (!("type" in item)) {
      if (item.allowedRoles.includes(role)) {
        acc.push(item);
      }
    } else {
      // It's a divider
      acc.push(item);
    }
    return acc;
  }, []);

  // Clean up dividers: remove if at start, end, or consecutive
  const cleanNav = filteredNav.reduce((acc: any[], item, idx, arr) => {
    if ("type" in item && item.type === "divider") {
      // Skip if it's the first item
      if (acc.length === 0) return acc;
      // Skip if the previous item was also a divider
      if (acc[acc.length - 1].type === "divider") return acc;
      // Skip if it's the last item (will check at the end)
      if (idx === arr.length - 1) return acc;
      
      acc.push(item);
    } else {
      acc.push(item);
    }
    return acc;
  }, []);

  // Final pass: remove trailing divider if any
  if (cleanNav.length > 0 && cleanNav[cleanNav.length - 1].type === "divider") {
    cleanNav.pop();
  }

  const mainNav = cleanNav.filter((n) => !("isBottom" in n) || !n.isBottom);
  const bottomNav = cleanNav.filter((n) => "isBottom" in n && n.isBottom);

  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild onClick={handleLinkClick}>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center overflow-hidden">
                  <img src="/logo.png" alt="Tulie Logo" className="size-8 object-contain" />
                </div>
                {state === "expanded" && (
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold text-foreground">
                      Tulie Workspace
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Productivity
                    </span>
                  </div>
                )}
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
                if ("type" in item && item.type === "divider") {
                  return (
                    <SidebarSeparator
                      key={`div-${idx}`}
                      className="my-2 mx-2"
                    />
                  );
                }
                const navItem = item as Extract<
                  (typeof NAV_ITEMS)[number],
                  { href: string }
                >;
                const active = isActive(navItem.href);
                return (
                  <SidebarMenuItem key={navItem.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={t(navItem.labelKey as any)}
                      onClick={handleLinkClick}
                    >
                      <Link href={navItem.href}>
                        <navItem.icon className="size-4" />
                        <span>{t(navItem.labelKey as any)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {bottomNav.map((item) => {
            const navItem = item as Extract<
              (typeof NAV_ITEMS)[number],
              { href: string }
            >;
            const active = isActive(navItem.href);
            return (
              <SidebarMenuItem key={navItem.href}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={t(navItem.labelKey as any)}
                  onClick={handleLinkClick}
                >
                  <Link href={navItem.href}>
                    <navItem.icon className="size-4" />
                    <span>{t(navItem.labelKey as any)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
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
                      {userProfile?.full_name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {state === "expanded" && (
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {userProfile?.full_name || "User"}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {t(`role.${userProfile?.role_type || 'observer'}` as any)}
                      </span>
                    </div>
                  )}
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
  );
}
