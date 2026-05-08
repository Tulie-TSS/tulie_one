import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Tulie Workspace — Quản trị Task/Project định hướng Dòng chảy',
    description: 'Hệ thống quản lý công việc bảo vệ Flow State qua giới hạn WIP. Hoàn thành trọn vẹn từng việc một.',
    keywords: ['task management', 'project management', 'WIP limit', 'flow state', 'productivity'],
}

import { Sonner, ConfirmProvider } from '@repo/ui'

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </head>
            <body className="antialiased">
                <a href="#main-content" className="skip-link">
                    Bỏ qua đến nội dung chính
                </a>
                <ConfirmProvider>
                    {children}
                </ConfirmProvider>
                <Sonner position="top-right" expand={false} richColors />
            </body>
        </html>
    )
}
