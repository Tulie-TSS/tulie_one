"use client";

import { Sidebar, SidebarProvider } from "@/components/layouts/sidebar";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background text-foreground">
                <Sidebar />
                <main className="flex flex-1 flex-col min-w-0 overflow-auto bg-muted/20">
                    <div className="flex-1 px-6 py-6 md:px-10 md:py-8 transition-all">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
