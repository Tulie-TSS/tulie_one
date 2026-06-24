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
import { CircleAlert, CircleCheck, CircleX, Info, LoaderCircle, X } from 'lucide-react'

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
            gap={18}
            icons={{
              success: <CircleCheck className="size-5" strokeWidth={3} />,
              error: <CircleX className="size-5" strokeWidth={3} />,
              warning: <CircleAlert className="size-5" strokeWidth={3} />,
              info: <Info className="size-5" strokeWidth={3} />,
              loading: <LoaderCircle className="size-5 animate-spin" strokeWidth={2.5} />,
              close: <X className="size-5" strokeWidth={2.5} />,
            }}
            toastOptions={{
              unstyled: true,
              classNames: {
                toast: 'relative flex w-[390px] max-w-[calc(100vw-32px)] items-center gap-3 border-0 rounded-[2px] px-4 py-3 pr-12 font-sans text-white shadow-lg',
                title: 'text-sm font-medium leading-5',
                description: 'mt-0.5 text-xs leading-4 text-white/85',
                icon: 'shrink-0 text-white',
                closeButton: 'absolute right-4 top-1/2 shrink-0 -translate-y-1/2 border-0 bg-transparent p-0 text-white/70 transition-colors hover:bg-transparent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                success: '!bg-[#4CAF50]',
                error: '!bg-[#EF1C25]',
                warning: '!bg-[#FF9800]',
                info: '!bg-[#9C27B0]',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
