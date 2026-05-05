'use client'
import { useEffect } from 'react'
import { Button } from '@repo/ui'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CustomersError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => { console.error('[Customers Error]', error) }, [error])
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center px-4">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-destructive" />
            </div>
            <div className="space-y-1 max-w-sm">
                <h2 className="text-lg font-semibold">Không tải được danh sách khách hàng</h2>
                <p className="text-sm text-muted-foreground">Vui lòng thử lại. Nếu lỗi tiếp diễn, liên hệ kỹ thuật.</p>
                {error.digest && <p className="text-xs text-muted-foreground/50 font-mono mt-2">ID: {error.digest}</p>}
            </div>
            <div className="flex gap-3">
                <Button variant="outline" size="sm" asChild><Link href="/dashboard"><ArrowLeft className="w-4 h-4 mr-1" />Dashboard</Link></Button>
                <Button size="sm" onClick={reset}><RefreshCw className="w-4 h-4 mr-1" />Thử lại</Button>
            </div>
        </div>
    )
}
