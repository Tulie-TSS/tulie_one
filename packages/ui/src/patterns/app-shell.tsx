"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "../lib/utils"
import { Button } from "../components/button"
import { ScrollArea } from "../components/scroll-area"
import { Separator } from "../components/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/tooltip"

/**
 * AppShell — Standard responsive application layout
 *
 * Enterprise-grade app shell with collapsible sidebar, top header,
 * and main content area. Follows Linear/ClickUp layout paradigm.
 *
 * Usage:
 * ```tsx
 * <AppShell
 *   logo={<LogoIcon />}
 *   appName="Tulie CRM"
 *   navigation={navItems}
 *   user={{ name: "Tung", email: "tung@tulie.vn", avatar: "/avatar.jpg" }}
 *   footer={<SidebarFooter />}
 * >
 *   <PageHeader title="Dashboard" />
 *   <main>...</main>
 * </AppShell>
 * ```
 */

// ─── Types ───────────────────────────────────────────────

export interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string | number
  active?: boolean
  children?: NavItem[]
}

export interface NavGroup {
  label?: string
  items: NavItem[]
}

export interface AppShellUser {
  name: string
  email?: string
  avatar?: string
  role?: string
}

interface AppShellProps {
  /** Logo element */
  logo?: React.ReactNode
  /** Application name */
  appName?: string
  /** Navigation groups */
  navigation: NavGroup[]
  /** Current user info */
  user?: AppShellUser
  /** Footer content (bottom of sidebar) */
  footer?: React.ReactNode
  /** Header right-side actions */
  headerActions?: React.ReactNode
  /** Main page content */
  children: React.ReactNode
  /** Additional sidebar content */
  sidebarExtra?: React.ReactNode
  /** Default collapsed state */
  defaultCollapsed?: boolean
  className?: string
}

// ─── Sidebar Context ─────────────────────────────────────

interface SidebarContextValue {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  mobile: boolean
  mobileOpen: boolean
  setMobileOpen: (v: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextValue>({
  collapsed: false,
  setCollapsed: () => {},
  mobile: false,
  mobileOpen: false,
  setMobileOpen: () => {},
})

export function useSidebar() {
  return React.useContext(SidebarContext)
}

// ─── Component ───────────────────────────────────────────

export function AppShell({
  logo,
  appName,
  navigation,
  user,
  footer,
  headerActions,
  children,
  sidebarExtra,
  defaultCollapsed = false,
  className,
}: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [mobile, setMobile] = React.useState(false)

  React.useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // Close mobile sidebar on route change
  React.useEffect(() => {
    if (mobileOpen) setMobileOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children])

  const sidebarWidth = collapsed ? "w-[60px]" : "w-[240px]"

  return (
    <SidebarContext.Provider
      value={{ collapsed, setCollapsed, mobile, mobileOpen, setMobileOpen }}
    >
      <TooltipProvider delayDuration={0}>
        <div className={cn("flex h-screen overflow-hidden bg-background", className)}>
          {/* Skip to content — A11y */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-[999] focus:p-4 focus:bg-background focus:text-foreground focus:border focus:border-border focus:rounded-md focus:m-2"
          >
            Skip to content
          </a>

          {/* Mobile overlay */}
          {mobile && mobileOpen && (
            <div
              className="fixed inset-0 z-[var(--z-overlay)] bg-black/40 animate-[fade-in_200ms]"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Sidebar */}
          <aside
            className={cn(
              "flex flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-apple shrink-0",
              mobile
                ? cn(
                    "fixed inset-y-0 left-0 z-[var(--z-modal)] w-[240px]",
                    mobileOpen
                      ? "translate-x-0"
                      : "-translate-x-full"
                  )
                : sidebarWidth
            )}
            role="navigation"
            aria-label="Main navigation"
          >
            {/* Sidebar Header */}
            <div className="flex h-14 items-center gap-2 px-3 shrink-0">
              {logo && (
                <div className="flex items-center justify-center shrink-0">
                  {logo}
                </div>
              )}
              {appName && !collapsed && (
                <span className="text-sm font-semibold tracking-tight truncate">
                  {appName}
                </span>
              )}
            </div>

            <Separator />

            {/* Navigation */}
            <ScrollArea className="flex-1 px-2 py-2">
              <nav className="space-y-4">
                {navigation.map((group, gi) => (
                  <div key={gi} className="space-y-1">
                    {group.label && !collapsed && (
                      <p className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        {group.label}
                      </p>
                    )}
                    {group.items.map((item) => (
                      <SidebarNavItem key={item.href} item={item} collapsed={collapsed} />
                    ))}
                  </div>
                ))}
              </nav>
              {sidebarExtra && !collapsed && (
                <div className="mt-4">{sidebarExtra}</div>
              )}
            </ScrollArea>

            {/* Sidebar Footer */}
            {footer && (
              <>
                <Separator />
                <div className="p-2 shrink-0">{footer}</div>
              </>
            )}

            {/* Collapse Toggle (desktop only) */}
            {!mobile && (
              <div className="p-2 shrink-0 flex justify-end">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setCollapsed(!collapsed)}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={cn(
                      "transition-transform duration-200",
                      collapsed ? "rotate-0" : "rotate-180"
                    )}
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Button>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <div className="flex flex-1 flex-col min-w-0">
            {/* Top Header */}
            <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-4 shrink-0">
              {/* Mobile menu toggle */}
              {mobile && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open navigation"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </svg>
                </Button>
              )}

              <div className="flex-1" />

              {/* Header Actions */}
              {headerActions && (
                <div className="flex items-center gap-2">{headerActions}</div>
              )}

              {/* User Widget */}
              {user && (
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium shrink-0"
                    aria-label={user.name}
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>
              )}
            </header>

            {/* Page Content */}
            <main
              id="main-content"
              className="flex-1 overflow-y-auto p-6"
              role="main"
            >
              {children}
            </main>
          </div>
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

// ─── Nav Item ────────────────────────────────────────────

function SidebarNavItem({
  item,
  collapsed,
}: {
  item: NavItem
  collapsed: boolean
}) {
  const content = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        item.active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70",
        collapsed && "justify-center px-0"
      )}
    >
      <span className="shrink-0 [&_svg]:size-4">{item.icon}</span>
      {!collapsed && (
        <>
          <span className="truncate flex-1">{item.label}</span>
          {item.badge !== undefined && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-medium text-primary">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}
