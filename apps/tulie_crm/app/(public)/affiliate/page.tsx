'use client'

import React, { useState, useMemo } from 'react'
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
    Input, Label, Button, Badge, Separator,
    RadioGroup, RadioGroupItem,
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
    Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@repo/ui'
import { Calculator, ArrowRight, CheckCircle2, TrendingUp, Gift, Trophy, Phone, Mail, MessageCircle, Globe, Layers, Rocket, Building2, DollarSign, Headset } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import { PartnerRegistrationForm } from './components/partner-registration-form'

// ── Data Constants ──────────────────────────────────────────────────────────

const ROLES = [
    { value: 'lead_only', label: 'Giới thiệu khách hàng', rate: 7, desc: 'Cung cấp thông tin khách hàng tiềm năng, Công ty chịu trách nhiệm tư vấn và chốt hợp đồng.' },
    { value: 'consult_close', label: 'Tư vấn & phối hợp', rate: 15, desc: 'Tham gia tư vấn khách hàng và phối hợp cùng đội ngũ Công ty để hoàn tất hợp đồng.' },
    { value: 'full_close', label: 'Tự chốt hợp đồng', rate: 20, desc: 'Chủ động toàn bộ quy trình tư vấn và đàm phán cho đến khi ký kết hợp đồng.' },
] as const

const BONUS_TIERS = [
    { min: 0, max: 50_000_000, label: '< 50 triệu', bonusPct: 0 },
    { min: 50_000_000, max: 100_000_000, label: '50 – 100 triệu', bonusPct: 3 },
    { min: 100_000_000, max: 200_000_000, label: '100 – 200 triệu', bonusPct: 5 },
    { min: 200_000_000, max: Infinity, label: '> 200 triệu', bonusPct: 8 },
] as const

const CASH_MILESTONES = [
    { target: 50_000_000, label: '50 triệu', reward: 3_000_000 },
    { target: 100_000_000, label: '100 triệu', reward: 5_000_000 },
    { target: 150_000_000, label: '150 triệu', reward: 7_000_000 },
    { target: 200_000_000, label: '200 triệu', reward: 9_000_000 },
    { target: 250_000_000, label: '250 triệu', reward: 11_000_000 },
    { target: 300_000_000, label: '300 triệu', reward: 13_000_000 },
] as const

const STEPS = [
    { step: '1', title: 'Giới thiệu khách hàng', desc: 'Gửi thông tin khách hàng tiềm năng đến Công ty qua Hotline hoặc Zalo.' },
    { step: '2', title: 'Công ty tiếp nhận & xử lý', desc: 'Đội ngũ chuyên môn tư vấn, đàm phán và hoàn tất hợp đồng với khách hàng.' },
    { step: '3', title: 'Nhận hoa hồng', desc: 'Sau khi hợp đồng được xác nhận, hoa hồng được thanh toán trong vòng 7 ngày làm việc.' },
]

const FAQS = [
    { q: 'Có cần đầu tư vốn ban đầu không?', a: 'Không. Đối tác chỉ cần giới thiệu khách hàng tiềm năng.' },
    { q: 'Có giới hạn số lượng hợp đồng không?', a: 'Không giới hạn. Doanh số càng cao, mức thưởng càng lớn.' },
    { q: 'Hoa hồng được thanh toán qua kênh nào?', a: 'Chuyển khoản ngân hàng hoặc ví điện tử theo thỏa thuận.' },
    { q: 'Thời điểm nhận hoa hồng?', a: 'Trong vòng 7 ngày làm việc sau khi hợp đồng được xác nhận hoàn tất.' },
    { q: 'Cần ký hợp đồng gì không?', a: 'Đối tác sẽ ký Hợp đồng CTV chính thức với công ty trước khi bắt đầu hợp tác.' },
    { q: 'Thuế thu nhập cá nhân?', a: 'Công ty khấu trừ 10% thuế TNCN theo quy định pháp luật trước khi thanh toán hoa hồng.' },
]

const PRODUCTS = [
    {
        name: 'Landing Page',
        price: '2 – 8 triệu',
        target: 'Chạy quảng cáo, bán 1 sản phẩm / dịch vụ',
        pages: '1 trang',
        simpleExplain: 'Giống như một tờ rơi số — khách xem xong là đăng ký / liên hệ ngay. Không cần nhiều trang, chỉ cần 1 trang chốt đơn.',
        howToSell: '“Anh/chị đang chạy quảng cáo thì cần 1 trang web để khách bấm vào là đăng ký ngay. Chỉ 2–8 triệu, làm xong trong 3–5 ngày.”',
        features: ['Banner + nút kêu gọi hành động (CTA)', 'Giới thiệu sản phẩm / dịch vụ', 'Lợi ích nổi bật (USP)', 'Feedback khách hàng', 'Form đăng ký / nhận lead', 'Tích hợp Messenger / Zalo', 'Tracking quảng cáo (Facebook Pixel, Google)'],
        customers: ['Chủ spa, thẩm mỹ viện', 'Người bán khóa học online', 'Cửa hàng bán lẻ đang chạy ads', 'Freelancer cần trang giới thiệu dịch vụ', 'Nhà hàng, quán cà phê mới khai trương'],
        insight: 'Sản phẩm dễ bán nhất — giá thấp, làm nhanh, ai cũng cần khi chạy ads',
    },
    {
        name: 'Website cơ bản',
        price: '8 – 20 triệu',
        target: 'Doanh nghiệp nhỏ, cá nhân, freelancer',
        pages: '4 – 7 trang',
        simpleExplain: 'Website đầy đủ cho doanh nghiệp: Trang chủ, Giới thiệu, Dịch vụ, Liên hệ. Giống như một văn phòng trên mạng — khách hàng search Google là thấy.',
        howToSell: '“Doanh nghiệp anh/chị chưa có website thì khách hàng search không thấy. Làm 1 web cơ bản 8–20 triệu là có địa chỉ chuyên nghiệp trên Google rồi.”',
        features: ['Trang chủ, Giới thiệu, Dịch vụ, Blog, Liên hệ', 'Hiển thị đẹp trên điện thoại', 'Form liên hệ', 'SEO cơ bản (xuất hiện trên Google)', 'Tự chỉnh sửa nội dung', 'Tích hợp chat Zalo, Messenger'],
        customers: ['Văn phòng luật sư, kế toán', 'Phòng khám, nha khoa', 'Công ty nội thất, xây dựng nhỏ', 'Trung tâm dạy học, gia sư', 'Cửa hàng thời trang, mỹ phẩm'],
        insight: 'Nhu cầu phổ biến nhất — hầu như doanh nghiệp nhỏ nào cũng cần',
    },
    {
        name: 'Website tiêu chuẩn',
        price: '20 – 50 triệu',
        target: 'Doanh nghiệp SME, có chiến lược Marketing / SEO',
        pages: '8 – 20 trang',
        simpleExplain: 'Website chuyên sâu cho marketing: viết bài SEO lên top Google, landing page riêng cho từng dịch vụ, hệ thống quản lý nội dung chuyên nghiệp.',
        howToSell: '“Anh/chị muốn khách hàng tự tìm đến qua Google không cần chạy ads thì cần web có SEO và blog. Đầu tư 20–50 triệu nhưng tiết kiệm hàng chục triệu ads mỗi tháng.”',
        features: ['Quản lý bài viết, dịch vụ dễ dàng', 'Blog SEO (lên top Google)', 'Landing page riêng cho từng dịch vụ', 'Tốc độ tải nhanh (Core Web Vitals)', 'Tracking nâng cao (GA4, Pixel)', 'Form liên hệ nhiều bước', 'Phân quyền người dùng', 'Email tự động'],
        customers: ['Chuỗi cửa hàng, nhà hàng nhiều chi nhánh', 'Công ty tài chính, bảo hiểm', 'Công ty du lịch, lữ hành', 'Thương hiệu thực phẩm, đồ uống', 'Trung tâm đào tạo, giáo dục'],
        insight: 'Deal giá trị cao — khách hàng hiểu rõ giá trị của marketing online',
    },
    {
        name: 'Website chuyên nghiệp',
        price: '50 – 100 triệu',
        target: 'Công ty lớn, startup, thương hiệu quy mô',
        pages: '20+ trang / dynamic',
        simpleExplain: 'Website như một hệ thống quản lý: có dashboard, tích hợp CRM, đa ngôn ngữ, bảo mật cao. Dành cho công ty muốn web là công cụ kinh doanh chứ không chỉ là trang giới thiệu.',
        howToSell: '“Công ty anh/chị đang lớn, cần web không chỉ đẹp mà còn quản lý được khách hàng, đơn hàng, nhân sự. Đầu tư 50–100 triệu cho cả một hệ thống vận hành.”',
        features: ['Thiết kế UI/UX riêng theo brand', 'Hệ thống quản trị nâng cao', 'Dashboard báo cáo', 'Tích hợp API (CRM, ERP, thanh toán)', 'Đa ngôn ngữ', 'SEO kỹ thuật chuyên sâu', 'Bảo mật cao', 'Tốc độ vượt trội'],
        customers: ['Công ty bất động sản', 'Startup gọi vốn', 'Tập đoàn, công ty quốc tế', 'Bệnh viện, hệ thống y tế', 'Sàn thương mại điện tử'],
        insight: 'Deal lớn nhất — hoa hồng cao nhất, phù hợp với khách hàng doanh nghiệp',
    },
]

// Max earnings: 20% base + tier bonus + cumulative cash milestones
const COMMISSION_EXAMPLES = [
    { deal: 10_000_000, earning: 10_000_000 * 0.20 },
    { deal: 20_000_000, earning: 20_000_000 * 0.20 },
    { deal: 50_000_000, earning: 50_000_000 * (0.20 + 0.03) + 3_000_000 },
    { deal: 100_000_000, earning: 100_000_000 * (0.20 + 0.05) + 3_000_000 + 5_000_000 },
]

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatInput(val: string) {
    const num = val.replace(/\D/g, '')
    if (!num) return ''
    return parseInt(num).toLocaleString('vi-VN')
}

// ── Page Component ──────────────────────────────────────────────────────────

export default function AffiliateCalculatorPage() {
    const [amountStr, setAmountStr] = useState('100,000,000')
    const [role, setRole] = useState('full_close')

    const amount = parseInt(amountStr.replace(/\D/g, '')) || 0
    const selectedRole = ROLES.find(r => r.value === role) ?? ROLES[0]
    const baseRate = selectedRole.rate

    const currentTier = useMemo(() => {
        for (let i = BONUS_TIERS.length - 1; i >= 0; i--) {
            if (amount >= BONUS_TIERS[i].min) return BONUS_TIERS[i]
        }
        return BONUS_TIERS[0]
    }, [amount])

    const cashReward = useMemo(() => {
        let reward = 0
        for (const m of CASH_MILESTONES) {
            if (amount >= m.target) reward += m.reward
        }
        return reward
    }, [amount])

    const bonusPct = currentTier.bonusPct
    const baseEarning = amount * (baseRate / 100)
    const bonusEarning = amount * (bonusPct / 100)
    const grossEarning = baseEarning + bonusEarning + cashReward
    const taxAmount = grossEarning * 0.1
    const totalEarning = grossEarning - taxAmount

    return (
        <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* ── Header ────────────────────────────────────────── */}
                <div className="text-center space-y-3">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Calculator className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Chương trình Đối tác Kinh doanh
                    </h1>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Ước tính thu nhập khi giới thiệu khách hàng sử dụng dịch vụ thiết kế Website & Landing Page.
                    </p>
                </div>

                {/* ── 2-Column Layout ───────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ═══ LEFT: Calculator ══════════════════════════ */}
                    <div className="space-y-6">

                        {/* Input */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calculator className="w-5 h-5 text-primary" />
                                    Thông số dự án
                                </CardTitle>
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
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">VNĐ</span>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <Label>Vai trò của bạn</Label>
                                    <RadioGroup value={role} onValueChange={setRole} className="space-y-2">
                                        {ROLES.map((r) => (
                                            <label
                                                key={r.value}
                                                htmlFor={r.value}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-md border p-4 cursor-pointer transition-colors",
                                                    role === r.value ? "border-primary bg-primary/5" : "hover:bg-muted/50"
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

                        {/* Results */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    Kết quả ước tính
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Doanh thu dự kiến</span>
                                    <span className="font-medium tabular-nums">{formatCurrency(amount)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-emerald-600">Hoa hồng cơ bản ({baseRate}%)</span>
                                    <span className="font-medium tabular-nums text-emerald-600">{formatCurrency(baseEarning)}</span>
                                </div>
                                {bonusPct > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-emerald-600">Hoa hồng thưởng (+{bonusPct}%)</span>
                                        <span className="font-medium tabular-nums text-emerald-600">+{formatCurrency(bonusEarning)}</span>
                                    </div>
                                )}
                                {cashReward > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-emerald-600">Thưởng tiền mặt</span>
                                        <span className="font-medium tabular-nums text-emerald-600">+{formatCurrency(cashReward)}</span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium">Tổng trước thuế</span>
                                    <span className="font-medium tabular-nums">{formatCurrency(grossEarning)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Thuế TNCN (10%)</span>
                                    <span className="font-medium tabular-nums text-muted-foreground">−{formatCurrency(taxAmount)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center pt-2">
                                    <span className="font-medium">Thực nhận sau thuế</span>
                                    <span className="text-2xl font-bold tabular-nums text-primary">{formatCurrency(totalEarning)}</span>
                                </div>
                                <PartnerRegistrationForm />
                                <p className="text-xs text-center text-muted-foreground mt-4">
                                    Đây là công cụ ước tính. Thu nhập thực tế có thể thay đổi tùy theo quy mô và đàm phán cụ thể.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Commission Examples */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-primary" />
                                    Bạn sẽ kiếm được bao nhiêu?
                                </CardTitle>
                                <CardDescription>Thu nhập tối đa với vai trò Tự chốt hợp đồng (20%), đã bao gồm thưởng theo mức doanh số và thưởng tiền mặt.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Giá trị hợp đồng</TableHead>
                                            <TableHead className="text-right">Thu nhập tối đa</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {COMMISSION_EXAMPLES.map((ex, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-medium">{formatCurrency(ex.deal)}</TableCell>
                                                <TableCell className="text-right font-semibold tabular-nums text-primary">
                                                    {formatCurrency(ex.earning)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <p className="text-xs text-muted-foreground mt-3">Đã bao gồm hoa hồng cơ bản, thưởng theo mức doanh số và thưởng tiền mặt cộng dồn. Chưa trừ 10% thuế TNCN.</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ═══ RIGHT: Information ════════════════════════ */}
                    <div className="space-y-6">

                        {/* Quy trình */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                    Quy trình hợp tác
                                </CardTitle>
                                <CardDescription>Đơn giản, minh bạch, hiệu quả.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ol className="space-y-4">
                                    {STEPS.map((s) => (
                                        <li key={s.step} className="flex gap-3">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-muted text-sm font-medium">
                                                {s.step}
                                            </div>
                                            <div>
                                                <p className="font-medium leading-7">{s.title}</p>
                                                <p className="text-sm text-muted-foreground">{s.desc}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </CardContent>
                        </Card>

                        {/* Bảng Tier */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-primary" />
                                    Bảng mức thưởng theo doanh số
                                </CardTitle>
                                <CardDescription>Càng đạt nhiều doanh số, tỷ lệ hoa hồng càng cao. Tổng hoa hồng = Base + Bonus.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Doanh thu tháng</TableHead>
                                            <TableHead className="text-right">Thưởng thêm</TableHead>
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
                                                        <Badge variant="secondary">{tier.bonusPct === 0 ? '0%' : `+${tier.bonusPct}%`}</Badge>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Thưởng tiền mặt */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Gift className="w-5 h-5 text-primary" />
                                    Thưởng tiền mặt
                                </CardTitle>
                                <CardDescription>Thưởng cộng dồn — đạt mốc nào nhận mốc đó. VD: đạt 200 triệu sẽ nhận thưởng mốc 50 + 100 + 150 + 200 triệu.</CardDescription>
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
                                                    <TableCell className="text-right font-medium tabular-nums text-emerald-600">
                                                        +{formatCurrency(m.reward)}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* FAQ */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5 text-primary" />
                                    Câu hỏi thường gặp
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {FAQS.map((f, i) => (
                                    <div key={i}>
                                        <p className="text-sm font-medium">{f.q}</p>
                                        <p className="text-sm text-muted-foreground mt-0.5">{f.a}</p>
                                        {i < FAQS.length - 1 && <Separator className="mt-4" />}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Liên hệ */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Headset className="w-5 h-5 text-primary" />
                                    Liên hệ hợp tác
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <a href="tel:0988984554" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <span>098 898 4554</span>
                                </a>
                                <a href="mailto:lienhe@tulie.vn" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <span>lienhe@tulie.vn</span>
                                </a>
                                <a href="https://zalo.me/0988984554" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                                    <span>Zalo: 098 898 4554</span>
                                </a>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* ── Full-Width: Sản phẩm Tulie ────────────────────── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-primary" />
                            Sản phẩm & Dịch vụ của Tulie
                        </CardTitle>
                        <CardDescription>Tổng quan các gói dịch vụ để Đối tác dễ dàng tư vấn khách hàng.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* Overview Table */}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Gói dịch vụ</TableHead>
                                    <TableHead>Mức giá</TableHead>
                                    <TableHead className="hidden sm:table-cell">Định vị</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {PRODUCTS.map((p, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium">{p.name}</TableCell>
                                        <TableCell className="tabular-nums">{p.price}</TableCell>
                                        <TableCell className="hidden sm:table-cell text-muted-foreground">{p.target}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <Separator />

                        {/* Gợi ý nhanh */}
                        <div>
                            <p className="text-sm font-medium mb-3">Nhận diện nhu cầu — gợi ý gói phù hợp</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex items-start gap-2.5 rounded-md border p-3">
                                    <Rocket className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">Đang chạy quảng cáo, cần trang chốt đơn</p>
                                        <p className="text-xs text-muted-foreground">→ Landing Page (2 – 8 triệu)</p>
                                        <p className="text-xs text-muted-foreground italic">VD: Spa, phòng khám, khóa học online</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5 rounded-md border p-3">
                                    <Globe className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">Cần web giới thiệu doanh nghiệp</p>
                                        <p className="text-xs text-muted-foreground">→ Website cơ bản (8 – 20 triệu)</p>
                                        <p className="text-xs text-muted-foreground italic">VD: Nha khoa, luật sư, nội thất</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5 rounded-md border p-3">
                                    <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">Cần hệ thống SEO & Marketing online</p>
                                        <p className="text-xs text-muted-foreground">→ Website tiêu chuẩn (20 – 50 triệu)</p>
                                        <p className="text-xs text-muted-foreground italic">VD: Chuỗi nhà hàng, du lịch, giáo dục</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5 rounded-md border p-3">
                                    <Building2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">Cần web tích hợp hệ thống quản trị</p>
                                        <p className="text-xs text-muted-foreground">→ Website chuyên nghiệp (50 – 100 triệu)</p>
                                        <p className="text-xs text-muted-foreground italic">VD: BĐS, startup, tập đoàn, sàn TMĐT</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Detail Accordion */}
                        <div>
                            <p className="text-sm font-medium mb-3">Chi tiết từng gói dịch vụ</p>
                            <Accordion type="single" collapsible className="w-full">
                                {PRODUCTS.map((p, i) => (
                                    <AccordionItem key={i} value={`product-${i}`}>
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium">{p.name}</span>
                                                <Badge variant="outline">{p.price}</Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4 pt-2">
                                                {/* Giải thích đơn giản */}
                                                <p className="text-sm leading-relaxed">{p.simpleExplain}</p>

                                                {/* Mẫu câu bán hàng */}
                                                <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3">
                                                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">💬 Mẫu câu tư vấn</p>
                                                    <p className="text-sm italic text-emerald-800 dark:text-emerald-300">{p.howToSell}</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground">Đối tượng</p>
                                                        <p className="font-medium">{p.target}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Quy mô</p>
                                                        <p className="font-medium">{p.pages}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground mb-2">Tính năng bao gồm</p>
                                                    <ul className="space-y-1.5">
                                                        {p.features.map((f, fi) => (
                                                            <li key={fi} className="flex items-start gap-2 text-sm">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                                                                {f}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground mb-2">Khách hàng tiềm năng</p>
                                                    <ul className="space-y-1.5">
                                                        {p.customers.map((c, ci) => (
                                                            <li key={ci} className="flex items-start gap-2 text-sm">
                                                                <span className="text-muted-foreground mt-0.5 shrink-0">•</span>
                                                                {c}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="rounded-md bg-primary/5 border border-primary/10 p-3">
                                                    <p className="text-sm font-medium text-primary">{p.insight}</p>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>

                    </CardContent>
                </Card>

                {/* ── Policy Footer ──────────────────────────────────── */}
                <div className="text-center text-xs text-muted-foreground space-y-1 pt-4">
                    <p>Chính sách hoa hồng áp dụng từ ngày 01/03/2026 cho đến khi có thông báo thay đổi chính thức từ Công ty.</p>
                    <p>Hotline: 098 898 4554 · Email: lienhe@tulie.vn</p>
                </div>

            </div>
        </div>
    )
}
