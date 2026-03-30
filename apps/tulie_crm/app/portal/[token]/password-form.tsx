'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui'
import { Button } from '@repo/ui'
import { Input } from '@repo/ui'
import { Lock, AlertCircle } from 'lucide-react'
import { LoadingSpinner } from '@repo/ui'
import { verifyPortalPassword } from '@/lib/supabase/services/portal-actions'
import { Alert, AlertDescription } from '@repo/ui'
import { Label, Badge } from '@repo/ui' // Added Label and Badge import

import { cn } from '@/lib/utils'

export default function PortalPasswordForm({ token, companyName, isModal = false, type = 'portal' }: { token: string, companyName?: string, isModal?: boolean, type?: 'portal' | 'financial' }) {
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
            const res = await verifyPortalPassword(token, password, type)
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
        <div className={cn(
            "flex items-center justify-center font-sans selection:bg-zinc-950 selection:text-white",
            isModal ? "w-full" : "min-h-screen p-6 bg-muted/50 dark:bg-zinc-950"
        )}>
            <div className={cn("w-full max-w-[400px]", isModal ? "space-y-6" : "space-y-8")}>
                {/* Brand Logo/Identity */}
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="h-14 w-14 rounded-md bg-zinc-950 flex items-center justify-center shadow-2xl shadow-zinc-950/20 mb-4">
                        <Lock className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Secure Access</p>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {type === 'portal' ? 'Portal Khách Hàng' : 'Tài liệu Tài chính'}
                        </h1>
                    </div>
                </div>

                <Card className={cn(
                    "overflow-hidden border-none bg-white",
                    isModal ? "shadow-none" : "rounded-3xl shadow-2xl /50 ring-1 ring-zinc-200/50"
                )}>
                    <CardHeader className="pt-8 pb-4 px-8 text-center">
                        <CardDescription className="text-muted-foreground font-medium px-4 leading-relaxed">
                            {companyName ? (
                                <>Tài liệu bảo mật dành cho <span className="text-foreground font-bold">{companyName}</span>. Vui lòng xác thực quyền truy cập.</>
                            ) : (
                                type === 'portal' ? 'Vui lòng nhập mật khẩu bảo mật để tiếp tục truy cập hồ sơ dự án.' : 'Vui lòng nhập mật khẩu cấp 2 để xem Báo giá, Hợp đồng và Hoá đơn.'
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
                                            className="font-mono"
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
                                        <Badge variant="secondary" className="font-mono">
                                            {captcha.a} + {captcha.b} = ?
                                        </Badge>
                                    </div>
                                    <Input
                                        id="captcha"
                                        type="number"
                                        placeholder="Kết quả..."
                                        value={captchaValue}
                                        onChange={(e) => setCaptchaValue(e.target.value)}
                                        className="font-mono"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full mt-4"
                                disabled={isLoading || !password || !captchaValue}
                            >
                                {isLoading ? (
                                    <LoadingSpinner size="sm" className="mr-2" />
                                ) : null}
                                {isLoading ? 'Đang xác thực...' : type === 'portal' ? 'Truy cập Portal' : 'Mở khoá tài liệu'}
                            </Button>
                        </form>
                    </CardContent>

                    <div className="bg-muted border-t border-border px-8 py-4 text-center">
                        <p className="text-[10px] text-muted-foreground font-medium">Hệ thống bảo mật bởi Tulie CRM</p>
                    </div>
                </Card>

                {isModal ? null : (
                    <p className="text-center text-[11px] text-muted-foreground font-medium">
                        Quên thông tin truy cập? <a href="https://zalo.me/0963715692" target="_blank" className="text-foreground font-bold hover:underline">Liên hệ quản trị viên</a>
                    </p>
                )}
            </div>
        </div>
    )
}
