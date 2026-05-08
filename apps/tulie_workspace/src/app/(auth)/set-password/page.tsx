'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Button, Label, Input } from '@repo/ui'
import { createClient } from '@/lib/supabase-client'
import { ShieldCheck, Loader2, ArrowRight, Lock } from 'lucide-react'

export default function SetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
      setError('Mật khẩu phải có ít nhất 6 ký tự.')
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
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-11 bg-background/50"
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm">Xác nhận mật khẩu</Label>
                        <Input
                            id="confirm"
                            type="password"
                            required
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className="h-11 bg-background/50"
                            placeholder="••••••••"
                        />
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
