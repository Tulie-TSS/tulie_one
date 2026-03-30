'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui'
import { Input } from '@repo/ui'
import { Label } from '@repo/ui'
import { Button } from '@repo/ui'
import { Progress } from '@repo/ui'
import { Badge } from '@repo/ui'
import { Separator } from '@repo/ui'
import { Calculator, Gift, Target, ArrowRight, Zap, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

// Tiers logic
const TIERS = [
    { target: 50000000, name: "Mốc 50Tr", bonus: 2000000, extraPct: 0 },
    { target: 100000000, name: "Mốc 100Tr", bonus: 5000000, extraPct: 2 },
    { target: 200000000, name: "Mốc 200Tr", bonus: 15000000, extraPct: 5 }
]

export default function AffiliateCalculatorPage() {
    const [amountStr, setAmountStr] = useState("100,000,000")
    const [role, setRole] = useState<'lead_only' | 'consult_close' | 'full_close'>('lead_only')
    
    // Parse the input amount
    const amount = parseInt(amountStr.replace(/\D/g, '')) || 0

    // Base calculation
    let baseRate = 7
    if (role === 'consult_close') baseRate = 15
    if (role === 'full_close') baseRate = 20
    const baseCommission = (amount * baseRate) / 100

    // Gamification state
    const [currentTierIdx, setCurrentTierIdx] = useState(-1)
    const [bonusCash, setBonusCash] = useState(0)
    const [bonusPct, setBonusPct] = useState(0)
    
    // Progress calculation
    const maxTarget = TIERS[TIERS.length - 1].target
    const progressPct = Math.min(100, (amount / maxTarget) * 100)
    
    const nextTier = currentTierIdx < TIERS.length - 1 ? TIERS[currentTierIdx + 1] : null
    const shortfall = nextTier ? nextTier.target - amount : 0

    useEffect(() => {
        let reachedIdx = -1
        let cash = 0
        let pct = 0
        for (let i = 0; i < TIERS.length; i++) {
            if (amount >= TIERS[i].target) {
                reachedIdx = i
                cash = TIERS[i].bonus
                pct = TIERS[i].extraPct
            }
        }
        setCurrentTierIdx(reachedIdx)
        setBonusCash(cash)
        setBonusPct(pct)
    }, [amount])

    const formatInput = (val: string) => {
        const num = val.replace(/\D/g, '')
        if (!num) return ''
        return parseInt(num).toLocaleString('vi-VN')
    }

    const totalRate = baseRate + bonusPct
    const baseEarning = amount * (baseRate / 100)
    const bonusEarningFromPct = amount * (bonusPct / 100)
    const totalEarning = baseEarning + bonusEarningFromPct + bonusCash

    return (
        <div className="min-h-screen bg-muted/30 flex flex-col pt-12 pb-24 px-4 sm:px-6">
            <div className="max-w-3xl w-full mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                        <Calculator className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Công cụ tính Chiết khấu Đối tác
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Mô phỏng thu nhập thực tế của bạn khi trở thành Đối tác phát triển kinh doanh của Tulie. 
                        Thu nhập linh hoạt, không giới hạn mốc thưởng!
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-[1fr_380px]">
                    {/* Input Section */}
                    <div className="space-y-6">
                        <Card className="border-primary/20 shadow-md">
                            <CardHeader className="bg-primary/5 border-b pb-4">
                                <CardTitle className="text-xl">Thông số Dự án</CardTitle>
                                <CardDescription>Nhập giá trị hợp đồng dự kiến mà bạn mang về.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-3">
                                    <Label htmlFor="budget" className="text-base font-semibold">Doanh số khách hàng (VNĐ)</Label>
                                    <div className="relative">
                                        <Input 
                                            id="budget"
                                            value={amountStr}
                                            onChange={(e) => setAmountStr(formatInput(e.target.value))}
                                            className="text-2xl font-bold h-14 pl-6 font-mono"
                                            placeholder="VD: 50,000,000"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                                            VNĐ
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">Vai trò của bạn</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div 
                                            className={cn(
                                                "border-2 rounded-xl p-4 cursor-pointer transition-all",
                                                role === 'lead_only' ? "border-primary bg-primary/5 shadow-md" : "border-muted hover:border-primary/50 text-muted-foreground hover:text-foreground"
                                            )}
                                            onClick={() => setRole('lead_only')}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className={cn("font-semibold", role === 'lead_only' ? "text-foreground" : "")}>Chỉ bắn Lead</h3>
                                                {role === 'lead_only' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                            </div>
                                            <p className="text-xs">Chỉ kết nối khách, Tulie tư vấn.</p>
                                            <div className="mt-4 text-lg font-bold text-primary">7%</div>
                                        </div>

                                        <div 
                                            className={cn(
                                                "border-2 rounded-xl p-4 cursor-pointer transition-all",
                                                role === 'consult_close' ? "border-primary bg-primary/5 shadow-md" : "border-muted hover:border-primary/50 text-muted-foreground hover:text-foreground"
                                            )}
                                            onClick={() => setRole('consult_close')}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className={cn("font-semibold", role === 'consult_close' ? "text-foreground" : "")}>Tư vấn + Chốt</h3>
                                                {role === 'consult_close' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                            </div>
                                            <p className="text-xs">Phối hợp cùng team Sales Tulie.</p>
                                            <div className="mt-4 text-lg font-bold text-primary">15%</div>
                                        </div>

                                        <div 
                                            className={cn(
                                                "border-2 rounded-xl p-4 cursor-pointer transition-all",
                                                role === 'full_close' ? "border-primary bg-primary/5 shadow-md" : "border-muted hover:border-primary/50 text-muted-foreground hover:text-foreground"
                                            )}
                                            onClick={() => setRole('full_close')}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className={cn("font-semibold", role === 'full_close' ? "text-foreground" : "")}>Chốt Full</h3>
                                                {role === 'full_close' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                            </div>
                                            <p className="text-xs">Tự đàm phán mang Hợp đồng về.</p>
                                            <div className="mt-4 text-lg font-bold text-primary">20%</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Gamification Progress */}
                        <Card className="overflow-hidden border-indigo-100 shadow-sm relative">
                            {/* Decorative background */}
                            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                            
                            <CardContent className="p-6 relative">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                                            <Target className="w-5 h-5 text-indigo-500" />
                                            Tiến độ Thưởng Mốc
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">Càng bán nhiều, phần trăm hoa hồng càng tăng vọt!</p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                            {currentTierIdx >= 0 ? TIERS[currentTierIdx].name : 'Khởi động'}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="h-4 w-full bg-muted rounded-full overflow-hidden relative">
                                        <div 
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-700 ease-out"
                                            style={{ width: `${progressPct}%` }}
                                        />
                                        
                                        {/* Markers */}
                                        {TIERS.map((tier, idx) => {
                                            const leftPct = (tier.target / maxTarget) * 100
                                            const isPassed = amount >= tier.target
                                            return (
                                                <div 
                                                    key={idx} 
                                                    className="absolute top-0 bottom-0 w-1 bg-background/50 z-10"
                                                    style={{ left: `${leftPct}%` }}
                                                >
                                                    <div className={cn(
                                                        "absolute w-4 h-4 rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2 border-2",
                                                        isPassed ? "bg-purple-600 border-background" : "bg-muted-foreground border-background"
                                                    )} />
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground font-medium px-1">
                                        <span>0đ</span>
                                        {TIERS.map((t, i) => (
                                            <span key={i} className="absolute -translate-x-1/2" style={{ left: `${(t.target / maxTarget) * 100}%` }}>
                                                {t.target / 1000000}Tr
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Call to action text */}
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
                                    <Gift className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                                    <div>
                                        {nextTier ? (
                                            <p className="text-sm text-yellow-800">
                                                Chỉ cần đạt thêm <strong className="font-bold">{formatCurrency(shortfall)}</strong> nữa, 
                                                bạn sẽ được thưởng nóng <strong className="font-bold text-yellow-600">{formatCurrency(nextTier.bonus)}</strong> 
                                                {nextTier.extraPct > 0 && <span> và <strong className="font-bold">+{nextTier.extraPct}%</strong> hoa hồng</span>}!
                                            </p>
                                        ) : (
                                            <p className="text-sm text-yellow-800 font-medium">
                                                🎉 Chúc mừng! Bạn đã đạt mốc cao nhất của chúng tôi. Hãy liên hệ Giám đốc để có chính sách riêng siêu đặc biệt.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-primary" />
                                    Tổng thu nhập
                                </CardTitle>
                                <CardDescription>Phân tích chi tiết các khoản hoa hồng dự kiến nhận được.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Doanh thu dự kiến</span>
                                        <span className="font-semibold tabular-nums">{formatCurrency(amount)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Hoa hồng cơ bản ({baseRate}%)</span>
                                        <span className="font-semibold tabular-nums text-foreground">{formatCurrency(baseEarning)}</span>
                                    </div>
                                    {bonusPct > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-indigo-600 font-medium">Hoa hồng thưởng (+{bonusPct}%)</span>
                                            <span className="font-semibold tabular-nums text-indigo-600">+{formatCurrency(bonusEarningFromPct)}</span>
                                        </div>
                                    )}
                                    {bonusCash > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-indigo-600 font-medium">Thưởng nóng (Cứng)</span>
                                            <span className="font-semibold tabular-nums text-indigo-600">+{formatCurrency(bonusCash)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t whitespace-nowrap">
                                    <div className="text-sm text-muted-foreground mb-1 text-center">Tổng tiền thực nhận</div>
                                    <div className="text-3xl font-bold text-center text-primary tabular-nums">
                                        {formatCurrency(totalEarning)}
                                    </div>
                                </div>

                                <Button size="lg" className="w-full mt-4">
                                    Đăng ký trở thành Đối tác
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                                
                                <p className="text-xs text-center text-muted-foreground">
                                    Đây là công cụ ước tính. Thu nhập thực tế có thể thay đổi tùy theo quy mô & đàm phán từng dự án cụ thể.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
