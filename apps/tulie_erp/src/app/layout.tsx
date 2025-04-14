import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from 'sonner'
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
})

export const metadata: Metadata = {
  title: "Tulie ERP - Quản trị Tài chính & Vận hành",
  description: "Hệ thống ERP cho Tulie - Quản lý hóa đơn, thanh toán, sản phẩm, nhà cung cấp và tài chính",
  icons: {
    icon: "/logo-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-right"
            closeButton
            duration={4000}
            toastOptions={{
              unstyled: false,
              classNames: {
                toast: 'group font-sans rounded-md border backdrop-blur-sm !bg-background !text-foreground',
                title: 'text-sm font-semibold',
                description: 'text-xs text-muted-foreground',
                success: '!border-emerald-200 !bg-emerald-50 !text-emerald-900 dark:!bg-emerald-950/80 dark:!border-emerald-800 dark:!text-emerald-100',
                error: '!border-red-200 !bg-red-50 !text-red-900 dark:!bg-red-950/80 dark:!border-red-800 dark:!text-red-100',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
