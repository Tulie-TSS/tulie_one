'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
    Label, Input, Textarea, Button, Separator,
} from '@repo/ui'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Milestone {
    id: string
    label: string
    amount: string
    percent?: string
    due_date: string
}

// Helper to format/parse numbers
const parseNumber = (val: string) => val.replace(/[^0-9]/g, '')
const formatNumber = (val: string) => val ? Number(val).toLocaleString('vi-VN') : ''

export default function NewCtvContractClient() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Basic fields
    const [title, setTitle] = useState('')
    const [totalAmountRaw, setTotalAmountRaw] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [terms, setTerms] = useState('')
    const [productName, setProductName] = useState('')

    // Milestones
    const [milestones, setMilestones] = useState<Milestone[]>([
        { id: '1', label: 'Đợt 1 - Tạm ứng', percent: '30', amount: '', due_date: '' },
        { id: '2', label: 'Đợt 2 - Thanh toán cuối', percent: '70', amount: '', due_date: '' },
    ])

    const handleTotalAmountChange = (valRaw: string) => {
        const val = parseNumber(valRaw)
        setTotalAmountRaw(val)
        const t = Number(val)
        if (t > 0) {
            setMilestones(prev => prev.map(m => {
                if (m.percent) {
                    const p = Number(m.percent)
                    if (!isNaN(p)) {
                        return { ...m, amount: Math.round(t * (p / 100)).toString() }
                    }
                }
                return m
            }))
        }
    }

    const handlePercentChange = (id: string, percentValRaw: string) => {
        const percentVal = percentValRaw.replace(/[^0-9.]/g, '')
        const p = Number(percentVal)
        const t = Number(totalAmountRaw)
        let amountStr = ''
        if (t > 0 && !isNaN(p)) {
            amountStr = Math.round(t * (p / 100)).toString()
        }
        setMilestones(prev => prev.map(m => m.id === id ? { ...m, percent: percentVal, amount: amountStr } : m))
    }

    const handleAmountChange = (id: string, amountValRaw: string) => {
        const amountVal = parseNumber(amountValRaw)
        const a = Number(amountVal)
        const t = Number(totalAmountRaw)
        let percentStr = ''
        if (t > 0 && !isNaN(a)) {
            percentStr = ((a / t) * 100).toFixed(1).replace(/\.0$/, '')
        }
        setMilestones(prev => prev.map(m => m.id === id ? { ...m, amount: amountVal, percent: percentStr } : m))
    }

    const addMilestone = () => {
        setMilestones(prev => [...prev, {
            id: Date.now().toString(),
            label: `Đợt ${prev.length + 1}`,
            percent: '',
            amount: '',
            due_date: '',
        }])
    }

    const removeMilestone = (id: string) => {
        setMilestones(prev => prev.filter(m => m.id !== id))
    }

    const updateMilestone = (id: string, field: keyof Milestone, value: string) => {
        setMilestones(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) { toast.error('Vui lòng nhập tiêu đề hợp đồng'); return }
        const totalAmountNum = Number(totalAmountRaw)
        if (!totalAmountNum || totalAmountNum <= 0) { toast.error('Vui lòng nhập giá trị hợp đồng'); return }

        setLoading(true)
        try {
            const res = await fetch('/api/contracts/ctv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    total_amount: totalAmountNum,
                    start_date: startDate || undefined,
                    end_date: endDate || undefined,
                    terms: terms.trim() || undefined,
                    product_name_in_contract: productName.trim() || undefined,
                    freelancer_metadata: {
                        project_name: title.trim(),
                    },
                    milestones: milestones
                        .map(m => ({ ...m, amount: Number(m.amount) }))
                        .filter(m => m.amount > 0 || m.label),
                }),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Có lỗi xảy ra')
            toast.success('Tạo hợp đồng thành công!')
            router.push(`/contracts/${json.id}`)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild className="shrink-0">
                    <Link href="/contracts/ctv"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <div>
                    <h1 className="text-xl font-semibold">Tạo hợp đồng Cộng tác viên</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Sau khi tạo, hệ thống sẽ sinh link để gửi CTV tự điền thông tin cá nhân
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Contract Info */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Thông tin hợp đồng</CardTitle>
                            <CardDescription>Nội dung chính của hợp đồng cộng tác viên</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="title">Tiêu đề hợp đồng <span className="text-destructive">*</span></Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="VD: Hợp đồng thiết kế website thương mại điện tử"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="productName">Tên dịch vụ/sản phẩm trong hợp đồng</Label>
                                <Input
                                    id="productName"
                                    value={productName}
                                    onChange={e => setProductName(e.target.value)}
                                    placeholder="VD: Thiết kế UI/UX & Lập trình frontend"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="totalAmount">Giá trị hợp đồng (VNĐ) <span className="text-destructive">*</span></Label>
                                <Input
                                    id="totalAmount"
                                    type="text"
                                    value={formatNumber(totalAmountRaw)}
                                    onChange={e => handleTotalAmountChange(e.target.value)}
                                    placeholder="0"
                                />
                                {totalAmountRaw && Number(totalAmountRaw) > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        Sau thuế TNCN 10%: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(totalAmountRaw) * 0.9)}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="startDate">Ngày bắt đầu</Label>
                                    <Input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="endDate">Ngày kết thúc</Label>
                                    <Input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="terms">Điều khoản hợp đồng</Label>
                                <Textarea
                                    id="terms"
                                    value={terms}
                                    onChange={e => setTerms(e.target.value)}
                                    placeholder="Các điều khoản và điều kiện đặc biệt của hợp đồng (nếu có)..."
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Milestones */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Đợt thanh toán</CardTitle>
                                    <CardDescription>Phân chia thanh toán thù lao theo từng giai đoạn</CardDescription>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                                    <Plus className="h-3.5 w-3.5 mr-1" />Thêm đợt
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {milestones.map((m, i) => (
                                <div key={m.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                                    <div className="flex-1 grid grid-cols-[1.5fr_0.8fr_1.2fr_1fr] gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Tên đợt</Label>
                                            <Input
                                                value={m.label}
                                                onChange={e => updateMilestone(m.id, 'label', e.target.value)}
                                                placeholder={`Đợt ${i + 1}`}
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Tỷ lệ (%)</Label>
                                            <Input
                                                type="text"
                                                value={m.percent || ''}
                                                onChange={e => handlePercentChange(m.id, e.target.value)}
                                                placeholder="0"
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Số tiền (VNĐ)</Label>
                                            <Input
                                                type="text"
                                                value={formatNumber(m.amount)}
                                                onChange={e => handleAmountChange(m.id, e.target.value)}
                                                placeholder="0"
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Hạn thanh toán</Label>
                                            <Input
                                                type="date"
                                                value={m.due_date}
                                                onChange={e => updateMilestone(m.id, 'due_date', e.target.value)}
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 shrink-0 mt-5 text-muted-foreground hover:text-destructive"
                                        onClick={() => removeMilestone(m.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Quy trình sau khi tạo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <div className="flex gap-2">
                                <span className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shrink-0">1</span>
                                <span>Hệ thống tạo hợp đồng và sinh link riêng</span>
                            </div>
                            <Separator />
                            <div className="flex gap-2">
                                <span className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shrink-0">2</span>
                                <span>Gửi link cho CTV qua Zalo/Email</span>
                            </div>
                            <Separator />
                            <div className="flex gap-2">
                                <span className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shrink-0">3</span>
                                <span>CTV tự điền CCCD, ngân hàng — hợp đồng tự cập nhật</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Đang tạo...' : 'Tạo hợp đồng & sinh link CTV'}
                    </Button>
                </div>
            </div>
        </form>
    )
}
