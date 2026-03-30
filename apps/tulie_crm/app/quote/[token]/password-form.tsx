'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader } from '@repo/ui'
import { Button } from '@repo/ui'
import { Input } from '@repo/ui'
import { Lock, AlertCircle } from 'lucide-react'
import { LoadingSpinner } from '@repo/ui'
import { verifyQuotePassword } from '@/lib/supabase/services/portal-actions'
import { Alert, AlertDescription } from '@repo/ui'
import { Label } from '@repo/ui'

export default function QuotePasswordForm({ token, customerName }: { token: string, customerName?: string }) {
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [captcha, setCaptcha] = useState({ a: Math.floor(Math.random() * 10), b: Math.floor(Math.random() * 10) })
    const [captchaValue, setCaptchaValue] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!password) return

        // Verify captcha
        if (parseInt(captchaValue) !== captcha.a + captcha.b) {
            setError('Mã xác nhận không đúng')
            setCaptcha({ a: Math.floor(Math.random() * 10), b: Math.floor(Math.random() * 10) })
            setCaptchaValue('')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const res = await verifyQuotePassword(token, password)
            if (!res.success) {
                setError(res.error || 'Mật khẩu không đúng')
                setCaptcha({ a: Math.floor(Math.random() * 10), b: Math.floor(Math.random() * 10) })
                setCaptchaValue('')
            }
        } catch (err) {
            setError('Lỗi kết nối')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-muted/50 dark:bg-zinc-950 font-sans selection:bg-zinc-950 selection:text-white">
            <div className="w-full max-w-[400px] space-y-8">
                {/* Brand Logo/Identity */}
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="h-14 w-14 rounded-md bg-zinc-950 flex items-center justify-center shadow-2xl shadow-zinc-950/20 mb-4">
                        <Lock className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Secure Access</p>
                        <h1 className="text-2xl font-bold text-foreground">Xem Báo Giá</h1>
                    </div>
                </div>

                <Card className="rounded-3xl border-none shadow-2xl /50 bg-white ring-1 ring-zinc-200/50 overflow-hidden">
                    <CardHeader className="pt-8 pb-4 px-8 text-center">
                        <CardDescription className="text-muted-foreground font-medium px-4 leading-relaxed">
                            {customerName ? (
                                <>Báo giá bảo mật dành cho <span className="text-foreground font-bold">{customerName}</span>. Vui lòng xác thực quyền truy cập.</>
                            ) : (
                                'Vui lòng nhập mật khẩu bảo mật để xem báo giá.'
                            )}
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-8 pt-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-100 rounded-md py-3 px-4">
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                    <AlertDescription className="text-[12px] font-medium ml-2">{error}</AlertDescription>
                                </Alert>
                            )}
                            
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="password">Mật khẩu truy cập</Label>
                                    <div className="relative group">
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-10 px-4 rounded-md border-border focus:ring-zinc-950 focus:border-zinc-950 transition-all font-mono"
                                            required
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                                            <div className="h-1.5 w-1.5 rounded-full bg-zinc-950 animate-pulse" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="captcha">Xác thực con người</Label>
                                        <span className="text-[12px] font-medium text-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
                                            {captcha.a} + {captcha.b} = ?
                                        </span>
                                    </div>
                                    <Input
                                        id="captcha"
                                        type="number"
                                        placeholder="Kết quả..."
                                        value={captchaValue}
                                        onChange={(e) => setCaptchaValue(e.target.value)}
                                        className="h-10 px-4 rounded-md border-border focus:ring-zinc-950 focus:border-zinc-950 transition-all font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-[11px] font-bold uppercase tracking-widest rounded-md bg-zinc-950 hover:bg-zinc-800 text-white transition-all active:scale-[0.97] shadow-xl shadow-zinc-950/10 mt-2"
                                disabled={isLoading || !password || !captchaValue}
                            >
                                {isLoading ? (
                                    <LoadingSpinner size="sm" className="mr-2" />
                                ) : null}
                                {isLoading ? 'Đang xác thực...' : 'Xem Báo Giá'}
                            </Button>
                        </form>
                    </CardContent>

                    <div className="bg-muted border-t border-border px-8 py-4 text-center">
                        <p className="text-[10px] text-muted-foreground font-medium">Hệ thống bảo mật bởi Tulie CRM</p>
                    </div>
                </Card>

                <p className="text-center text-[11px] text-muted-foreground font-medium">
                    Quên thông tin truy cập? <a href="https://zalo.me/0963715692" target="_blank" className="text-foreground font-bold hover:underline">Liên hệ quản trị viên</a>
                </p>
            </div>
        </div>
    )
}
