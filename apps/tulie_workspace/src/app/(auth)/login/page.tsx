'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { Card, CardContent, CardHeader, CardTitle, Button, Label, Input } from '@repo/ui'
import { Shield, Loader2, ArrowRight } from 'lucide-react'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const { t } = useLocaleStore()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        
        const formData = new FormData(e.target as HTMLFormElement)
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        try {
            const { createClient } = await import('@/lib/supabase')
            const supabase = createClient()
            
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                throw error
            } else {
                router.push('/dashboard')
                router.refresh()
            }
        } catch (err: any) {
            setError(err.message || 'Lỗi đăng nhập.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="size-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Shield className="size-7 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">TULIE One</h1>
                    <p className="text-muted-foreground text-sm max-w-[280px]">
                        Hệ thống quản trị hợp nhất dành cho Agency chuyên nghiệp
                    </p>
                </div>

                <Card className="border-none shadow-2xl bg-background/60 backdrop-blur-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl font-semibold">Đăng nhập</CardTitle>
                        <p className="text-xs text-muted-foreground">Nhập email và mật khẩu của bạn để truy cập hệ thống</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">{t('auth.email')}</Label>
                                <Input 
                                    id="email"
                                    name="email" 
                                    type="email"
                                    placeholder="name@company.com" 
                                    required 
                                    className="h-11 bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">{t('auth.password')}</Label>
                                    <Link 
                                        href="/forgot-password" 
                                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input 
                                        id="password"
                                        name="password" 
                                        type={showPassword ? "text" : "password"} 
                                        required 
                                        className="h-11 bg-background/50 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20 animate-in shake duration-300">
                                    {error}
                                </div>
                            )}

                            <Button 
                                type="submit" 
                                className="w-full h-11 text-base font-semibold group" 
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Đang đăng nhập...
                                    </>
                                ) : (
                                    <>
                                        Đăng nhập
                                        <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                        
                        <div className="mt-6 text-center text-sm">
                            <span className="text-muted-foreground">{t('auth.noAccount')} </span>
                            <Link 
                                href="/register" 
                                className="font-medium text-primary hover:underline underline-offset-4"
                            >
                                {t('auth.register')}
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest pt-4">
                    &copy; 2026 TULIE Digital Solutions. All rights reserved.
                </p>
            </div>
        </div>
    )
}
