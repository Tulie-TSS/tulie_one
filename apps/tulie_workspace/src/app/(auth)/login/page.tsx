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
        <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-[#fafafa] dark:bg-[#0a0a0a] overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.05]" 
                    style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
                />
                <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
                {/* Header Section */}
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl group-hover:bg-primary/20 transition-all duration-500 scale-110" />
                        <div className="relative size-20 flex items-center justify-center bg-background rounded-2xl shadow-2xl border border-border/50">
                            <img 
                                src="/logo.png" 
                                alt="Tulie Logo" 
                                className="size-16 object-contain" 
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                            Tulie Workspace
                        </h1>
                        <p className="text-muted-foreground text-base max-w-[320px] mx-auto font-medium">
                            Hệ thống quản trị hợp nhất dành cho Agency chuyên nghiệp
                        </p>
                    </div>
                </div>

                {/* Form Section */}
                <Card className="border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-background/80 backdrop-blur-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="pt-8 pb-4 px-8">
                        <CardTitle className="text-2xl font-bold text-center tracking-tight">Đăng nhập</CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2.5">
                                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
                                    {t('auth.email')}
                                </Label>
                                <Input 
                                    id="email"
                                    name="email" 
                                    type="email"
                                    placeholder="name@company.com" 
                                    required 
                                    className="h-12 bg-muted/30 border-muted-foreground/10 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all rounded-xl"
                                />
                            </div>

                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between ml-1">
                                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                                        {t('auth.password')}
                                    </Label>
                                    <Link 
                                        href="/forgot-password" 
                                        className="text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-tight"
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
                                        className="h-12 bg-muted/30 border-muted-foreground/10 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all pr-12 rounded-xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-muted-foreground/50 hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 text-xs font-semibold text-destructive bg-destructive/10 rounded-xl border border-destructive/20 animate-in shake duration-500">
                                    {error}
                                </div>
                            )}

                            <Button 
                                type="submit" 
                                className="w-full h-12 text-sm font-bold group rounded-xl shadow-lg shadow-primary/10 active:scale-[0.98] transition-transform" 
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Đang xác thực...
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        Đăng nhập hệ thống
                                        <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </Button>
                        </form>
                        
                        <div className="mt-8 text-center">
                            <span className="text-sm text-muted-foreground/70 font-medium">{t('auth.noAccount')} </span>
                            <Link 
                                href="/register" 
                                className="text-sm font-bold text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                            >
                                {t('auth.register')}
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Section */}
                <div className="pt-4 text-center space-y-4">
                    <p className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em] font-bold">
                        &copy; 2026 Tulie Digital Solutions. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}
