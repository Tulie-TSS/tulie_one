'use client'

import React, { useState } from 'react'
import { login } from '../actions'
import { Button } from '@repo/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui'
import { Input } from '@repo/ui'
import { Label } from '@repo/ui'
import { LoadingSpinner } from '@repo/ui'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = React.useTransition()
    const [showPassword, setShowPassword] = useState(false)

    function handleAction(formData: FormData) {
        setError(null)
        startTransition(async () => {
            try {
                const result = await login(formData)
                if (result?.error) {
                    setError(result.error)
                }
            } catch (e) {
                if (
                    e instanceof Error &&
                    (e.message === 'NEXT_REDIRECT' || (e as any).digest?.startsWith('NEXT_REDIRECT') || e.message.includes('NEXT_REDIRECT'))
                ) {
                    throw e
                }
                console.error('Login error:', e)
                setError('Đã có lỗi xảy ra. Vui lòng thử lại.')
            }
        })
    }

    const loading = isPending

    return (
        <Card className="border-none shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-8">
                <CardTitle className="text-2xl font-bold tracking-tight">Hệ thống Tulie CRM</CardTitle>
                <CardDescription className="text-slate-500 font-medium">
                    Nhập email và mật khẩu để đăng nhập vào hệ thống
                </CardDescription>
            </CardHeader>
            <form action={handleAction} method="POST">
                <CardContent className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</Label>
                        <Input 
                            id="email" 
                            name="email" 
                            type="email" 
                            placeholder="admin@tulie.agency" 
                            required 
                            className="h-11 bg-slate-50/50 border-slate-200 focus:border-slate-400 transition-all"
                            disabled={loading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500">Mật khẩu</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="h-11 pr-11 bg-slate-50/50 border-slate-200 focus:border-slate-400 transition-all"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                                className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer disabled:opacity-30"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                    {error && (
                        <div className="text-sm font-semibold text-red-500 bg-red-50 p-3 rounded-md border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {error}
                        </div>
                    )}
                    <Button className="w-full h-11 font-bold text-sm shadow-lg shadow-slate-200/50 transition-all active:scale-[0.98]" type="submit" disabled={loading}>
                        {loading ? (
                            <><LoadingSpinner size="sm" className="mr-2 border-white/30 border-t-white" /> Đang đăng nhập...</>
                        ) : (
                            'Đăng nhập'
                        )}
                    </Button>
                </CardContent>
            </form>
        </Card>
    )
}
