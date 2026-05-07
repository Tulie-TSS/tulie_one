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
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Logo and Brand */}
            <div className="text-center space-y-2 mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-xl shadow-indigo-500/20 mb-4 transform hover:scale-105 transition-transform duration-300">
                    <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                    Tulie <span className="text-indigo-400">CRM</span>
                </h1>
                <p className="text-slate-400 text-sm font-medium">Hệ thống quản trị doanh nghiệp thông minh</p>
            </div>

            <Card className="border-white/10 shadow-2xl overflow-hidden bg-white/5 backdrop-blur-xl relative">
                {/* Full card loading overlay */}
                {loading && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0f172a]/60 backdrop-blur-sm transition-all duration-300">
                        <div className="bg-white/10 p-6 rounded-3xl shadow-2xl border border-white/10 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
                            <LoadingSpinner size="lg" className="border-indigo-400 border-t-white h-10 w-10" />
                            <div className="text-center">
                                <p className="text-white font-bold tracking-wide">Đang xác thực...</p>
                                <p className="text-indigo-300/70 text-xs mt-1">Vui lòng đợi trong giây lát</p>
                            </div>
                        </div>
                    </div>
                )}

                <CardHeader className="pb-6 pt-8">
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                        Chào mừng trở lại
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Đăng nhập để tiếp tục quản lý công việc của bạn
                    </CardDescription>
                </CardHeader>

                <form action={formAction}>
                    <CardContent className="space-y-6 pb-8">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
                                Email đăng nhập
                            </Label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <Input 
                                    id="email" 
                                    name="email" 
                                    type="email" 
                                    placeholder="admin@tulie.agency" 
                                    required 
                                    className="h-12 pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all rounded-xl"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
                                Mật khẩu
                            </Label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    className="h-12 pl-10 pr-11 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all rounded-xl"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                    className="absolute right-0 top-0 h-12 w-11 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer disabled:opacity-30"
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
                            <div className="text-sm font-semibold text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button 
                            className="w-full h-12 font-bold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-xl shadow-indigo-500/20 border-none transition-all active:scale-[0.98] rounded-xl flex items-center justify-center gap-2 group" 
                            type="submit" 
                            disabled={loading}
                        >
                            Đăng nhập hệ thống
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </CardContent>
                </form>

                {/* Footer decorations */}
                <div className="px-8 pb-8 pt-0 flex justify-center border-t border-white/5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-bold mt-6">
                        Tulie Digital Agency &copy; 2026
                    </p>
                </div>
            </Card>
            
            {/* System Status / Help links */}
            <div className="flex justify-center gap-6">
                <button className="text-xs text-slate-500 hover:text-indigo-400 transition-colors">Quên mật khẩu?</button>
                <button className="text-xs text-slate-500 hover:text-indigo-400 transition-colors">Hỗ trợ kỹ thuật</button>
            </div>
        </div>
    )
}
