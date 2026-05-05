'use client'

import { useEffect } from 'react'
import { Button } from '@repo/ui'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log to error reporting service in production
        console.error('[Dashboard Error]', error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>

            <div className="space-y-2 max-w-md">
                <h2 className="text-xl font-semibold text-foreground">Đã xảy ra lỗi</h2>
                <p className="text-sm text-muted-foreground">
                    Trang này không tải được. Vui lòng thử lại hoặc quay về trang trước.
                </p>
                {error.digest && (
                    <p className="text-xs text-muted-foreground/60 font-mono">
                        Error ID: {error.digest}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Dashboard
                    </Link>
                </Button>
                <Button size="sm" onClick={reset}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Thử lại
                </Button>
            </div>
        </div>
    )
}
