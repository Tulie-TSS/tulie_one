'use client'

import React, { useState, useMemo } from 'react'
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
    Input, Label, Button, Badge, Separator,
    RadioGroup, RadioGroupItem,
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@repo/ui'
import { Calculator, ArrowRight, CheckCircle2, TrendingUp, Gift, Trophy } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

// ── Data Constants ──────────────────────────────────────────────────────────

const ROLES = [
    { value: 'lead_only', label: 'Chỉ bắn Lead', rate: 7, desc: 'Kết nối khách hàng, Tulie tư vấn và chốt sale.' },
    { value: 'consult_close', label: 'Tư vấn + Chốt cùng', rate: 15, desc: 'Phối hợp cùng team Sales Tulie để chốt.' },
    { value: 'full_close', label: 'Chốt full', rate: 20, desc: 'Tự tư vấn, đàm phán và mang hợp đồng về.' },
] as const

const BONUS_TIERS = [
    { min: 0, max: 50_000_000, label: '< 50 triệu', bonusPct: 0 },
    { min: 50_000_000, max: 100_000_000, label: '50 – 100 triệu', bonusPct: 2 },
    { min: 100_000_000, max: 200_000_000, label: '100 – 200 triệu', bonusPct: 5 },
    { min: 200_000_000, max: Infinity, label: '> 200 triệu', bonusPct: 7 },
] as const

const CASH_MILESTONES = [
    { target: 50_000_000, label: '50 triệu', reward: 2_000_000 },
    { target: 100_000_000, label: '100 triệu', reward: 5_000_000 },
    { target: 200_000_000, label: '200 triệu', reward: 12_000_000 },
    { target: 300_000_000, label: '300 triệu', reward: 20_000_000 },
] as const

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatInput(val: string) {
    const num = val.replace(/\D/g, '')
    if (!num) return ''
    return parseInt(num).toLocaleString('vi-VN')
}

// ── Page Component ──────────────────────────────────────────────────────────

export default function AffiliateCalculatorPage() {
    const [amountStr, setAmountStr] = useState('100,000,000')
    const [role, setRole] = useState('lead_only')

    const amount = parseInt(amountStr.replace(/\D/g, '')) || 0
    const selectedRole = ROLES.find(r => r.value === role) ?? ROLES[0]
    const baseRate = selectedRole.rate

    // Determine bonus tier
    const currentTier = useMemo(() => {
        for (let i = BONUS_TIERS.length - 1; i >= 0; i--) {
            if (amount >= BONUS_TIERS[i].min) return BONUS_TIERS[i]
        }
        return BONUS_TIERS[0]
    }, [amount])

    // Determine cash milestone reward
    const cashReward = useMemo(() => {
        let reward = 0
        for (const m of CASH_MILESTONES) {
            if (amount >= m.target) reward = m.reward
        }
        return reward
    }, [amount])

    const bonusPct = currentTier.bonusPct
    const baseEarning = amount * (baseRate / 100)
    const bonusEarning = amount * (bonusPct / 100)
    const totalEarning = baseEarning + bonusEarning + cashReward

    return (
        <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto space-y-8">

                {/* ── Header ────────────────────────────────────────── */}
                <div className="text-center space-y-3">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Calculator className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Công cụ tính Chiết khấu Đối tác
                    </h1>
                    <p className="text-muted-foreground">
                        Mô phỏng thu nhập thực tế khi trở thành Đối tác kinh doanh của Tulie.
                    </p>
                </div>

                {/* ── 1. Input: Doanh số & Vai trò ──────────────────── */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thông số dự án</CardTitle>
                        <CardDescription>Nhập giá trị hợp đồng và chọn vai trò của bạn.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="budget">Doanh số khách hàng (VNĐ)</Label>
                            <div className="relative">
                                <Input
                                    id="budget"
                                    value={amountStr}
                                    onChange={(e) => setAmountStr(formatInput(e.target.value))}
                                    className="text-lg font-semibold tabular-nums pr-14"
                                    placeholder="VD: 50,000,000"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    VNĐ
                                </span>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <Label>Vai trò của bạn</Label>
                            <RadioGroup value={role} onValueChange={setRole} className="space-y-2">
                                {ROLES.map((r) => (
                                    <label
                                        key={r.value}
                                        htmlFor={r.value}
                                        className={cn(
                                            "flex items-center gap-3 rounded-md border p-4 cursor-pointer transition-colors",
                                            role === r.value
                                                ? "border-primary bg-primary/5"
                                                : "hover:bg-muted/50"
                                        )}
                                    >
                                        <RadioGroupItem value={r.value} id={r.value} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{r.label}</span>
                                                <Badge variant="secondary">{r.rate}%</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-0.5">{r.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </RadioGroup>
                        </div>
                    </CardContent>
                </Card>

                {/* ── 2. Kết quả tính toán ───────────────────────────── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Kết quả ước tính
                        </CardTitle>
                        <CardDescription>Phân tích chi tiết hoa hồng dự kiến nhận được.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Doanh thu dự kiến</span>
                            <span className="font-medium tabular-nums">{formatCurrency(amount)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Hoa hồng cơ bản ({baseRate}%)</span>
                            <span className="font-medium tabular-nums">{formatCurrency(baseEarning)}</span>
                        </div>
                        {bonusPct > 0 && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-emerald-600">Hoa hồng thưởng (+{bonusPct}%)</span>
                                <span className="font-medium tabular-nums text-emerald-600">+{formatCurrency(bonusEarning)}</span>
                            </div>
                        )}
                        {cashReward > 0 && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-emerald-600">Thưởng nóng (tiền mặt)</span>
                                <span className="font-medium tabular-nums text-emerald-600">+{formatCurrency(cashReward)}</span>
                            </div>
                        )}
                        <Separator />
                        <div className="flex justify-between items-center pt-2">
                            <span className="font-medium">Tổng tiền thực nhận</span>
                            <span className="text-2xl font-bold tabular-nums text-primary">{formatCurrency(totalEarning)}</span>
                        </div>

                        <Button size="lg" className="w-full mt-4">
                            Đăng ký trở thành Đối tác
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            Đây là công cụ ước tính. Thu nhập thực tế có thể thay đổi tùy quy mô và đàm phán từng dự án.
                        </p>
                    </CardContent>
                </Card>

                {/* ── 3. Bảng Tier — Hoa hồng bonus ──────────────────── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-primary" />
                            Bảng tier hoa hồng bonus
                        </CardTitle>
                        <CardDescription>Càng bán nhiều, phần trăm hoa hồng bonus càng cao. Tổng hoa hồng = Base + Bonus.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Doanh thu tháng</TableHead>
                                    <TableHead className="text-right">Hoa hồng bonus</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {BONUS_TIERS.map((tier, i) => {
                                    const isActive = tier === currentTier
                                    return (
                                        <TableRow key={i} className={isActive ? 'bg-primary/5' : ''}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    {isActive && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                                                    {tier.label}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {tier.bonusPct === 0 ? (
                                                    <span className="text-muted-foreground">0%</span>
                                                ) : (
                                                    <Badge variant="secondary">+{tier.bonusPct}%</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* ── 4. Cơ chế thưởng tiền mặt ──────────────────────── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Gift className="w-5 h-5 text-primary" />
                            Cơ chế thưởng tiền mặt
                        </CardTitle>
                        <CardDescription>Thưởng nóng khi đạt các mốc doanh số tháng. Thưởng được cộng trực tiếp vào tổng thu nhập.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Doanh thu tháng</TableHead>
                                    <TableHead className="text-right">Thưởng</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {CASH_MILESTONES.map((m, i) => {
                                    const isReached = amount >= m.target
                                    return (
                                        <TableRow key={i} className={isReached ? 'bg-primary/5' : ''}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    {isReached && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                                                    {m.label}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium tabular-nums">
                                                {formatCurrency(m.reward)}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
