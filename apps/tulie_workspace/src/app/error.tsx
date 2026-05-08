'use client'

import { Button } from '@repo/ui'
import { AlertCircle, RotateCcw } from 'lucide-react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
            <div className="w-full max-w-md text-center space-y-6">
                <div className="flex justify-center">
                    <div className="rounded-full bg-destructive/10 p-4">
                        <AlertCircle className="size-12 text-destructive" />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Đã xảy ra lỗi
                    </h1>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                        {error.message || 'Hệ thống gặp sự cố không mong muốn. Vui lòng thử lại hoặc liên hệ quản trị viên.'}
                    </p>
                </div>

                <div className="pt-2">
                    <Button 
                        onClick={reset}
                        size="lg"
                        className="px-8 font-semibold shadow-lg shadow-primary/10"
                    >
                        <RotateCcw className="mr-2 size-4" />
                        Thử lại
                    </Button>
                </div>
            </div>
        </div>
    )
}
