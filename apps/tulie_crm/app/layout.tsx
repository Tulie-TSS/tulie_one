import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { getBrandConfig } from "@/lib/supabase/services/settings-service";
import "./globals.css";
import { headers } from "next/headers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
});

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrandConfig()
  return {
    title: `${brand.brand_name || 'Tulie'} CRM - Quản trị Khách hàng`,
    description: "Hệ thống CRM toàn diện cho Tulie Agency - Quản lý khách hàng, báo giá, hợp đồng và tài chính",
    keywords: ["CRM", "Tulie Agency", "quản lý khách hàng", "báo giá", "hợp đồng"],
    icons: {
      icon: brand.favicon_url || "/logo-icon.png",
      shortcut: brand.favicon_url || "/logo-icon.png",
      apple: brand.favicon_url || "/logo-icon.png",
    },
  }
}

import { Toaster } from 'sonner'
import { ConfirmProvider } from '@repo/ui'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get('x-nonce') || undefined;

  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          nonce={nonce}
        >
          <ConfirmProvider>
            {children}
          </ConfirmProvider>
          <Toaster
            position="top-right"
            closeButton
            duration={4000}
            toastOptions={{
              unstyled: false,
              classNames: {
                toast: 'group font-sans !rounded-lg !shadow-xl !border !border-zinc-200 dark:!border-zinc-700 !bg-white dark:!bg-zinc-900 !text-zinc-900 dark:!text-zinc-100',
                title: '!text-sm !font-semibold',
                description: '!text-xs !opacity-80',
                actionButton: 'bg-primary text-primary-foreground text-xs font-medium rounded-lg px-3 py-1.5',
                cancelButton: 'bg-muted text-muted-foreground text-xs font-medium rounded-lg px-3 py-1.5',
                closeButton: '!bg-transparent !border-zinc-200 dark:!border-zinc-700 hover:!bg-zinc-100 dark:hover:!bg-zinc-800',
                success: '!border-l-4 !border-l-emerald-500 !border-zinc-200 dark:!border-zinc-700 dark:!border-l-emerald-500 [&>[data-icon]]:!text-emerald-500',
                error: '!border-l-4 !border-l-red-500 !border-zinc-200 dark:!border-zinc-700 dark:!border-l-red-500 [&>[data-icon]]:!text-red-500',
                warning: '!border-l-4 !border-l-amber-500 !border-zinc-200 dark:!border-zinc-700 dark:!border-l-amber-500 [&>[data-icon]]:!text-amber-500',
                info: '!border-l-4 !border-l-blue-500 !border-zinc-200 dark:!border-zinc-700 dark:!border-l-blue-500 [&>[data-icon]]:!text-blue-500',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
