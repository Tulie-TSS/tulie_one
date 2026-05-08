'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { Card, CardContent, CardHeader, CardTitle, Button, Label, Input } from '@repo/ui'
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const { t } = useLocaleStore()

    const handleResetRequest = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        
        const formData = new FormData(e.target as HTMLFormElement)
        const email = formData.get('email') as string

        try {
            const { createClient } = await import('@/lib/supabase')
            const supabase = createClient()
            
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
            })

            if (error) throw error
            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Lỗi gửi yêu cầu khôi phục.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col items-center text-center space-y-4">
                    <img src="/logo.png" alt="Tulie Logo" className="size-20 object-contain" />
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Khôi phục mật khẩu</h1>
                        <p className="text-muted-foreground text-sm">Nhập email của bạn để nhận liên kết đặt lại mật khẩu</p>
                    </div>
                </div>

                <Card className="border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-center">
                            {success ? 'Kiểm tra hộp thư' : 'Quên mật khẩu?'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pb-8">
                        {success ? (
                            <div className="flex flex-col items-center text-center space-y-4 py-4">
                                <div className="p-3 rounded-full bg-primary/10 text-primary">
                                    <MailCheck className="size-8" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Chúng tôi đã gửi một liên kết đặt lại mật khẩu đến địa chỉ email của bạn. Vui lòng kiểm tra và làm theo hướng dẫn.
                                </p>
                                <Button variant="outline" asChild className="w-full">
                                    <Link href="/login">Quay lại đăng nhập</Link>
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleResetRequest} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">Email của bạn</Label>
                                    <Input id="email" name="email" type="email" placeholder="name@company.com" required className="h-10" />
                                </div>

                                {error && (
                                    <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                                        {error}
                                    </div>
                                )}

                                <Button type="submit" className="w-full h-10 text-sm font-medium" disabled={loading}>
                                    {loading ? (
                                        <><Loader2 className="mr-2 size-4 animate-spin" /> Đang gửi yêu cầu...</>
                                    ) : (
                                        'Gửi liên kết khôi phục'
                                    )}
                                </Button>

                                <div className="text-center pt-2">
                                    <Link href="/login" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1">
                                        <ArrowLeft className="size-3" /> Quay lại đăng nhập
                                    </Link>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
