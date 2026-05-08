'use client'

import React, { useState } from 'react'
import { login } from '../actions'
import { Button } from '@repo/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui'
import { Input } from '@repo/ui'
import { Label } from '@repo/ui'
import { LoadingSpinner } from '@repo/ui'
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
    const [state, formAction, isPending] = React.useActionState(login, null)
    const [showPassword, setShowPassword] = useState(false)

    const error = state?.error
    const loading = isPending

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Logo and Brand */}
            <div className="text-center space-y-1 mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-white border border-slate-200 shadow-sm mb-4">
                    <img src="/logo-icon.png" alt="Tulie" className="w-8 h-8 object-contain" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Tulie CRM
                </h1>
                <p className="text-slate-500 text-sm">Hệ thống quản trị doanh nghiệp</p>
            </div>

            <Card className="border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden bg-white relative">
                {/* Minimalist loading overlay */}
                {loading && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px] transition-all duration-200">
                        <div className="flex flex-col items-center gap-3">
                            <LoadingSpinner size="lg" className="border-slate-200 border-t-black h-8 w-8" />
                            <p className="text-slate-900 text-xs font-bold">Đang xử lý...</p>
                        </div>
                    </div>
                )}

                <CardHeader className="pb-6 pt-8">
                    <CardTitle className="text-lg font-bold text-slate-900">
                        Đăng nhập
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-sm">
                        Nhập thông tin tài khoản để tiếp tục
                    </CardDescription>
                </CardHeader>

                <form action={formAction}>
                    <CardContent className="space-y-5 pb-8">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                                Email
                            </Label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-colors">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <Input 
                                    id="email" 
                                    name="email" 
                                    type="email" 
                                    placeholder="admin@tulie.agency" 
                                    required 
                                    className="h-10 pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-black focus:ring-0 transition-all rounded-md"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                                Mật khẩu
                            </Label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-colors">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    className="h-10 pl-10 pr-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-black focus:ring-0 transition-all rounded-md"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                    className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center text-slate-400 hover:text-black transition-colors cursor-pointer disabled:opacity-30"
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

                        {/* Error Message */}
                        {error && (
                            <div className="text-xs font-medium text-red-600 bg-red-50 p-3 rounded-md border border-red-100 flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                                <span className="w-1 h-1 rounded-full bg-red-600 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button 
                            className="w-full h-10 font-semibold bg-black hover:bg-slate-800 text-white shadow-sm border-none transition-all active:scale-[0.98] rounded-md flex items-center justify-center gap-2" 
                            type="submit" 
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <LoadingSpinner size="sm" className="border-slate-400 border-t-white" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    Đăng nhập
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </CardContent>
                </form>

                {/* Footer */}
                <div className="px-8 pb-8 pt-0 flex justify-center">
                    <p className="text-[11px] text-slate-400 font-medium">
                        Tulie Digital Agency &copy; 2026
                    </p>
                </div>
            </Card>
            
            {/* Help links */}
            <div className="flex justify-center gap-4">
                <button className="text-xs font-medium text-slate-500 hover:text-black transition-colors underline underline-offset-4">Quên mật khẩu?</button>
                <button className="text-xs font-medium text-slate-500 hover:text-black transition-colors underline underline-offset-4">Hỗ trợ</button>
            </div>
        </div>
    )
}
