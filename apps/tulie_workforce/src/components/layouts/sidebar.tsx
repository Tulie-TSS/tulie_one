"use client";

import * as React from "react";
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
  LogOut,
  User,
  ChevronsUpDown,
  ChevronRight,
  Facebook,
  Search,
  Music,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuBadge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const CURRENT_USER_ROLE: "owner" | "manager" | "specialist" | "viewer" =
  "owner";

interface NavChild {
  name: string;
  href?: string;
  icon?: any;
}

interface NavItem {
  name: string;
  href?: string;
  icon: any;
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
    name: "Ads Manager",
    icon: Megaphone,
    visibleTo: ["owner", "manager"],
    children: [
      { name: "Tổng quan", href: "/ads" },
      { name: "Facebook Ads", href: "/ads/facebook", icon: Facebook },
      { name: "Google Ads", href: "/ads/google", icon: Search },
      { name: "TikTok Ads", href: "/ads/tiktok", icon: Music },
      { name: "Ad Accounts", href: "/ads/accounts" },
      { name: "Recommendations", href: "/ads/recommendations" },
      { name: "Automation", href: "/ads/automation/rules" },
      { name: "Templates", href: "/ads/automation/templates" },
      { name: "AI Settings", href: "/ads/automation/ai" },
    ],
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
      }
    };
    getUser();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const visibleNav = navigation.filter(
    (item) => !item.visibleTo || item.visibleTo.includes(CURRENT_USER_ROLE),
  );

  return (
    <Sidebar variant="sidebar" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Zap className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-foreground">
                    Tulie AI
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Workforce
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Nghiệp vụ</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNav.map((item) => {
                const isActive = item.href
                  ? item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href)
                  : false;

                if (item.children && item.children.length > 0) {
                  return (
                    <Collapsible
                      key={item.name}
                      asChild
                      defaultOpen={isActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            isActive={isActive}
                            tooltip={item.name}
                          >
                            {item.icon && <item.icon />}
                            <span>{item.name}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.name}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={pathname === subItem.href}
                                >
                                  <Link href={subItem.href}>
                                    <span>{subItem.name}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                    >
                      <Link href={item.href || "#"}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
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
                      {userEmail?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {userEmail ? userEmail.split("@")[0] : "User"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {userEmail || "Loading..."}
                    </span>
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
  );
}
