"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    User,
    Settings,
    LogOut,
    Bell,
    Search,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

/* ------------------------------------------------------------------ */
/*  Breadcrumb generation                                              */
/* ------------------------------------------------------------------ */

function useBreadcrumbs() {
    const pathname = usePathname();

    return useMemo(() => {
        const segments = pathname.split("/").filter(Boolean);
        if (segments.length === 0) return [{ name: "Dashboard", href: "/" }];

        const crumbs = [{ name: "Dashboard", href: "/" }];
        let path = "";
        for (const seg of segments) {
            path += `/${seg}`;
            const label = seg
                .replace(/-/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());
            crumbs.push({ name: label, href: path });
        }
        return crumbs;
    }, [pathname]);
}

/* ------------------------------------------------------------------ */
/*  Header component                                                   */
/* ------------------------------------------------------------------ */

interface HeaderProps {
    title?: string;
}

export const Header = ({ title }: HeaderProps) => {
    const { user, signOut } = useAuth();
    const breadcrumbs = useBreadcrumbs();

    const initials = user?.user_metadata?.full_name
        ? user.user_metadata.full_name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : user?.email?.[0]?.toUpperCase() ?? "U";

    const displayName = (
        user?.user_metadata?.full_name ?? "User"
    ).toLowerCase();

    return (
        <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-border bg-background/95 px-6 md:px-10 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-6 -mt-6 mb-6 md:-mx-10 md:-mt-8 md:mb-8">
            {/* Left: breadcrumbs */}
            <div className="flex items-center gap-1">
                {breadcrumbs.map((crumb, i) => (
                    <div key={crumb.href} className="flex items-center gap-1">
                        {i > 0 && (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        {i === breadcrumbs.length - 1 ? (
                            <span className="text-sm font-medium text-foreground">
                                {title && i === breadcrumbs.length - 1
                                    ? title
                                    : crumb.name}
                            </span>
                        ) : (
                            <Link
                                href={crumb.href}
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {crumb.name}
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            {/* Right: search + notifications + user */}
            <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        className="h-8 w-[200px] pl-8 text-sm"
                    />
                </div>

                {/* Notifications */}
                <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                    <Bell className="h-[18px] w-[18px]" />
                    <span className="absolute right-1 top-1 flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                    </span>
                </button>

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 rounded-lg p-1 outline-none transition-colors hover:bg-accent">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium text-foreground">
                                    {displayName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {user?.email?.toLowerCase()}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link href="/settings">
                            <DropdownMenuItem className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </DropdownMenuItem>
                        </Link>
                        <Link href="/settings">
                            <DropdownMenuItem className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer text-muted-foreground focus:text-foreground"
                            onClick={() => signOut()}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};
