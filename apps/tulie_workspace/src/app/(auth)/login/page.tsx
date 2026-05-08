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
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Section */}
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="size-20 flex items-center justify-center mb-2">
                        <img 
                            src="/logo.png" 
                            alt="Tulie Logo" 
                            className="size-20 object-contain" 
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Tulie Workspace
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Hệ thống quản trị hợp nhất dành cho Agency chuyên nghiệp
                        </p>
                    </div>
                </div>

                {/* Form Section */}
                <Card className="border-border shadow-sm bg-card rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-center">Đăng nhập</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pb-8">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">
                                    {t('auth.email')}
                                </Label>
                                <Input 
                                    id="email"
                                    name="email" 
                                    type="email"
                                    placeholder="name@company.com" 
                                    required 
                                    className="h-10"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium">
                                        {t('auth.password')}
                                    </Label>
                                    <Link 
                                        href="/forgot-password" 
                                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <Input 
                                        id="password"
                                        name="password" 
                                        type={showPassword ? "text" : "password"} 
                                        required 
                                        className="h-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-muted-foreground/50 hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
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
                                className="w-full h-10 text-sm font-medium" 
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Đang đăng nhập...
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        Đăng nhập
                                        <ArrowRight className="size-4" />
                                    </div>
                                )}
                            </Button>
                        </form>
                        
                        <div className="text-center">
                            <span className="text-xs text-muted-foreground">{t('auth.noAccount')} </span>
                            <Link 
                                href="/register" 
                                className="text-xs font-semibold text-primary hover:underline"
                            >
                                {t('auth.register')}
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Section */}
                <div className="pt-4 text-center">
                    <p className="text-[10px] text-muted-foreground/60 font-medium">
                        &copy; 2026 Tulie Digital Solutions. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}
