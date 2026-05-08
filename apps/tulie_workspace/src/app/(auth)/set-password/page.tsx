'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Button, Label, Input } from '@repo/ui'
import { createClient } from '@/lib/supabase'
import { ShieldCheck, Loader2, ArrowRight, Lock } from 'lucide-react'

export default function SetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setChecking(false)
      }
    }
    checkUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có nhất 6 ký tự.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })
      
      if (updateError) {
        throw updateError
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center text-center space-y-2">
            <div className="size-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Lock className="size-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Thiết lập bảo mật</h1>
            <p className="text-muted-foreground text-sm max-w-[280px]">
                Vui lòng tạo mật khẩu cho tài khoản của bạn để hoàn tất quá trình tham gia
            </p>
        </div>

        <Card className="border-none shadow-2xl bg-background/60 backdrop-blur-xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-xl font-semibold text-center text-primary flex items-center justify-center gap-2">
                    <ShieldCheck className="size-5" />
                    Bảo mật tài khoản
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Mật khẩu mới</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-11 bg-background/50 pr-10"
                                placeholder="••••••••"
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
                    <div className="space-y-2">
                        <Label htmlFor="confirm">Xác nhận mật khẩu</Label>
                        <div className="relative">
                            <Input
                                id="confirm"
                                type={showPassword ? "text" : "password"}
                                required
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                className="h-11 bg-background/50 pr-10"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20 animate-in shake duration-300">
                            {error}
                        </div>
                    )}

                    <Button 
                        type="submit" 
                        className="w-full h-11 text-base font-semibold group mt-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                Hoàn tất và Tiếp tục
                                <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest pt-4">
            &copy; 2026 TULIE Digital Solutions.
        </p>
    </div>
  )
}
