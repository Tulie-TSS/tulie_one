'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Button, Label, Input, toast } from '@repo/ui'
import { ShieldCheck, Loader2, KeyRound } from 'lucide-react'

export default function SetPasswordPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        
        const formData = new FormData(e.target as HTMLFormElement)
        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirm_password') as string

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.')
            setLoading(false)
            return
        }

        try {
            const { createClient } = await import('@/lib/supabase')
            const supabase = createClient()
            
            const { error } = await supabase.auth.updateUser({
                password: password,
            })

            if (error) throw error
            
            toast.success('Mật khẩu đã được cập nhật thành công.')
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message || 'Lỗi cập nhật mật khẩu.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col items-center text-center space-y-4">
                    <img src="/logo.png" alt="Tulie Logo" className="size-20 object-contain" />
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Thiết lập mật khẩu</h1>
                        <p className="text-muted-foreground text-sm">Vui lòng thiết lập mật khẩu mới cho tài khoản của bạn</p>
                    </div>
                </div>

                <Card className="border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-center flex items-center justify-center gap-2">
                            <KeyRound className="size-5" />
                            Cập nhật mật khẩu
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pb-8">
                        <form onSubmit={handleSetPassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Mật khẩu mới</Label>
                                <div className="relative">
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

                            <div className="space-y-2">
                                <Label htmlFor="confirm_password">Xác nhận mật khẩu</Label>
                                <Input 
                                    id="confirm_password" 
                                    name="confirm_password" 
                                    type="password" 
                                    required 
                                    className="h-10" 
                                />
                            </div>

                            {error && (
                                <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full h-10 text-sm font-medium" disabled={loading}>
                                {loading ? (
                                    <><Loader2 className="mr-2 size-4 animate-spin" /> Đang cập nhật...</>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <ShieldCheck className="size-4" />
                                        Hoàn tất thiết lập
                                    </div>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
