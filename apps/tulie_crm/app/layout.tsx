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
                toast: 'group font-sans rounded-md shadow-lg border backdrop-blur-sm !bg-background !text-foreground',
                title: 'text-sm font-semibold',
                description: 'text-xs text-muted-foreground',
                actionButton: 'bg-primary text-primary-foreground text-xs font-medium rounded-lg px-3 py-1.5',
                cancelButton: 'bg-muted text-muted-foreground text-xs font-medium rounded-lg px-3 py-1.5',
                closeButton: 'bg-background border-border hover:bg-muted',
                success: '!bg-emerald-600 !border-emerald-700 !text-white dark:!bg-emerald-700 dark:!border-emerald-800',
                error: '!bg-red-600 !border-red-700 !text-white dark:!bg-red-700 dark:!border-red-800',
                warning: '!bg-amber-600 !border-amber-700 !text-white dark:!bg-amber-700 dark:!border-amber-800',
                info: '!bg-blue-600 !border-blue-700 !text-white dark:!bg-blue-700 dark:!border-blue-800',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
