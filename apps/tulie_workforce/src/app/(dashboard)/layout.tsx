"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@repo/ui";
import { AppSidebar } from "@/components/layouts/sidebar";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-1 flex-col min-w-0 bg-background relative overflow-y-auto w-full md:w-auto">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background">
                    <SidebarTrigger className="-ml-1" />
                </header>
                <main className="flex flex-1 flex-col min-w-0 overflow-auto bg-muted/40">
                    <div className="flex-1 px-6 py-6 md:px-10 md:py-8 transition-all">
                        {children}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
