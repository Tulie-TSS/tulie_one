'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@repo/ui'
import { Input } from '@repo/ui'
import { Label } from '@repo/ui'
import { Textarea } from '@repo/ui'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@repo/ui'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@repo/ui'
import { Tabs, TabsList, TabsTrigger } from '@repo/ui'
import { Calendar } from '@repo/ui'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@repo/ui'
import { formatCurrency } from '@/lib/utils/format'
import { ArrowLeft, CalendarIcon, Save, Plus, Trash2, FileSignature, Percent, CreditCard, ShieldCheck } from 'lucide-react'
import { LoadingSpinner } from '@repo/ui'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { createContract } from '@/lib/supabase/services/contract-service'
import { toast } from 'sonner'

interface Milestone {
    id: string
    name: string
    amount: number
    percentage: number
    amount_mode: 'fixed' | 'percent'
    due_date: Date | undefined
}

interface NewContractClientProps {
    initialCustomers: any[]
    initialQuotations: any[]
    initialProjects: any[]
}

function NewContractForm({ initialCustomers, initialQuotations, initialProjects }: NewContractClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const fromQuoteId = searchParams.get('from_quote')

    const [isLoading, setIsLoading] = useState(false)
    const [customerId, setCustomerId] = useState('')
    const [quotationId, setQuotationId] = useState(fromQuoteId || '')
    const [projectId, setProjectId] = useState('')
    const [title, setTitle] = useState('')
    const [totalValue, setTotalValue] = useState(0)
    const [startDate, setStartDate] = useState<Date>()
    const [endDate, setEndDate] = useState<Date>()
    const [terms, setTerms] = useState('')
    
    // New fields
    const [productNameInContract, setProductNameInContract] = useState('')
    const [vatExemptStatus, setVatExemptStatus] = useState<'0_percent' | 'exempt'>('0_percent')
    const [vatPercent, setVatPercent] = useState<number>(10)
    const [category, setCategory] = useState<'customer' | 'freelancer'>('customer')
    const [warrantyMonths, setWarrantyMonths] = useState<number | null>(null)
    const [fMeta, setFMeta] = useState<any>({
        termination_penalty_percent: 50,
        notice_days: 15
    })

    const [milestones, setMilestones] = useState<Milestone[]>([
        { id: '1', name: 'Đặt cọc 50%', amount: 0, percentage: 50, amount_mode: 'percent', due_date: undefined },
    ])

    const addMilestone = () => {
        setMilestones([
            ...milestones,
            { id: Date.now().toString(), name: '', amount: 0, percentage: 0, amount_mode: 'fixed', due_date: undefined },
        ])
    }

    const removeMilestone = (id: string) => {
        if (milestones.length > 1) {
            setMilestones(milestones.filter((m) => m.id !== id))
        }
    }

    const updateMilestone = (id: string, field: keyof Milestone, value: string | number | Date | undefined) => {
        setMilestones(
            milestones.map((m) => {
                if (m.id !== id) return m
                const updated = { ...m, [field]: value }
                if (field === 'percentage' && updated.amount_mode === 'percent' && totalValue > 0) {
                    updated.amount = Math.round(totalValue * ((updated.percentage as number) / 100))
                }
                if (field === 'amount_mode' && value === 'percent' && totalValue > 0 && updated.amount > 0) {
                    updated.percentage = Math.round((updated.amount / totalValue) * 10000) / 100
                }
                return updated
            })
        )
    }

    const handleTotalValueChange = (newValue: number) => {
        setTotalValue(newValue)
        if (newValue > 0) {
            setMilestones(prev => prev.map(m =>
                m.amount_mode === 'percent' && m.percentage > 0
                    ? { ...m, amount: Math.round(newValue * (m.percentage / 100)) }
                    : m
            ))
        }
    }

    const handleQuotationChange = (qId: string) => {
        setQuotationId(qId)
        const quote = initialQuotations.find(q => q.id === qId)
        if (quote) {
            setCustomerId(quote.customer_id)
            const newTotal = quote.total_amount
            setTotalValue(newTotal)
            setTitle(`Hợp đồng triển khai - ${quote.quotation_number}`)
            setProductNameInContract(quote.product_name_in_contract || quote.proposal_content?.product_name_in_contract || '')
            setVatExemptStatus(quote.vat_exempt_status || quote.proposal_content?.vat_exempt_status || '0_percent')
            setVatPercent(quote.vat_percent || 10)
            
            // Recalculate percent-mode milestones
            if (newTotal > 0) {
                setMilestones(prev => prev.map(m =>
                    m.amount_mode === 'percent' && m.percentage > 0
                        ? { ...m, amount: Math.round(newTotal * (m.percentage / 100)) }
                        : m
                ))
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!customerId || !title) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
            return
        }

        setIsLoading(true)
        try {
            const selectedQuote = initialQuotations.find(q => q.id === quotationId)
            const contractData = {
                // contract_number is auto-generated server-side (see contract-service.ts)
                customer_id: customerId,
                quotation_id: quotationId || undefined,
                project_id: projectId || selectedQuote?.project_id || undefined,
                title,
                total_amount: totalValue,
                start_date: startDate?.toISOString(),
                end_date: endDate?.toISOString(),
                status: 'active',
                terms,
                product_name_in_contract: productNameInContract,
                vat_exempt_status: vatPercent === 0 ? vatExemptStatus : null,
                category: category,
                warranty_months: warrantyMonths,
                freelancer_metadata: category === 'freelancer' ? fMeta : null,
                brand: selectedQuote?.brand || 'TMM'
            }

            const milestoneData = milestones.map(m => ({
                name: m.name,
                amount: m.amount,
                percentage: m.amount_mode === 'percent' ? m.percentage : undefined,
                due_date: m.due_date?.toISOString() || undefined,
                status: 'pending' as any
            }))

            await createContract(contractData as any, milestoneData)

            toast.success('Tạo hợp đồng thành công')
            router.push('/contracts')
            router.refresh()
        } catch (error: any) {
            console.error('Failed to create contract:', error)
            toast.error('Có lỗi xảy ra khi tạo hợp đồng: ' + (error.message || ''))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/contracts">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-semibold">Tạo hợp đồng mới</h1>
                    <p className="text-muted-foreground">
                        {fromQuoteId ? 'Tạo hợp đồng từ báo giá' : 'Nhập thông tin hợp đồng'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin hợp đồng</CardTitle>
                            <CardDescription>Thông tin cơ bản của hợp đồng</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Báo giá liên quan</Label>
                                <Select value={quotationId} onValueChange={handleQuotationChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn báo giá (tùy chọn)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {initialQuotations.map((q) => (
                                            <SelectItem key={q.id} value={q.id}>
                                                {q.quotation_number} - {formatCurrency(q.total_amount)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Đối tượng hợp đồng</Label>
                                <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="customer">Khách hàng (Bán ra)</SelectItem>
                                        <SelectItem value="freelancer">Cộng tác viên (Thuê vào)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {category !== 'freelancer' && (
                            <div className="space-y-2">
                                <Label>Khách hàng <span className="text-destructive">*</span></Label>
                                <Select value={customerId} onValueChange={setCustomerId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn khách hàng" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {initialCustomers.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.company_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            )}

                            <div className="space-y-2">
                                <Label>Dự án liên kết {category === 'freelancer' && <span className="text-xs text-zinc-500">(để kế thừa hạng mục từ HĐ khách hàng)</span>}</Label>
                                <Select value={projectId || 'none'} onValueChange={(v) => setProjectId(v === 'none' ? '' : v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn dự án (tùy chọn)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- Không thuộc dự án --</SelectItem>
                                        {initialProjects
                                            .filter(p => category === 'freelancer' || !customerId || p.customer_id === customerId)
                                            .map((p) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.title}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Tiêu đề hợp đồng <span className="text-destructive">*</span></Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="VD: Hợp đồng phát triển website"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Giá trị hợp đồng <span className="text-destructive">*</span></Label>
                                <Input
                                    type="number"
                                    value={totalValue}
                                    onChange={(e) => handleTotalValueChange(parseInt(e.target.value) || 0)}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Tên SP/Dịch vụ hiển thị hợp đồng</Label>
                                    <Input
                                        placeholder="Ví dụ: Thiết kế website"
                                        value={productNameInContract}
                                        onChange={(e) => setProductNameInContract(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phân loại VAT</Label>
                                    <Select 
                                        value={vatPercent === 0 ? (vatExemptStatus === 'exempt' ? 'exempt' : '0') : vatPercent.toString()} 
                                        onValueChange={(v) => {
                                            if (v === 'exempt') {
                                                setVatPercent(0);
                                                setVatExemptStatus('exempt');
                                            } else {
                                                setVatPercent(parseInt(v));
                                                setVatExemptStatus('0_percent');
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="exempt">Không chịu thuế</SelectItem>
                                            <SelectItem value="0">Thuế 0%</SelectItem>
                                            <SelectItem value="8">Thuế 8%</SelectItem>
                                            <SelectItem value="10">Thuế 10%</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Ngày bắt đầu</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                <CalendarIcon className="h-4 w-4" />
                                                {startDate ? format(startDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label>Ngày kết thúc</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                <CalendarIcon className="h-4 w-4" />
                                                {endDate ? format(endDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                                    Bảo hành kỹ thuật
                                </Label>
                                <Select
                                    value={warrantyMonths === null ? 'none' : warrantyMonths.toString()}
                                    onValueChange={(v) => setWarrantyMonths(v === 'none' ? null : parseInt(v))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn thời gian bảo hành" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Không có bảo hành</SelectItem>
                                        <SelectItem value="6">6 tháng</SelectItem>
                                        <SelectItem value="12">12 tháng (Khuyến nghị)</SelectItem>
                                        <SelectItem value="24">24 tháng</SelectItem>
                                    </SelectContent>
                                </Select>
                                {warrantyMonths && (
                                    <p className="text-xs text-blue-600">
                                        Điều khoản bảo hành {warrantyMonths} tháng sẽ tự động được thêm vào hợp đồng in.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Điều khoản</Label>
                                    <Textarea
                                        value={terms}
                                        onChange={(e) => setTerms(e.target.value)}
                                        placeholder="Các điều khoản của hợp đồng..."
                                        rows={4}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Freelancer Metadata - Conditional */}
                        {category === 'freelancer' && (
                            <Card className="border-zinc-200 bg-zinc-50/50 dark:bg-zinc-900/20 dark:border-zinc-800">
                                <CardHeader>
                                    <CardTitle className="text-zinc-800 dark:text-zinc-200">Thông tin Cộng tác viên</CardTitle>
                                    <CardDescription>Thông tin chi tiết để điền vào hợp đồng dịch vụ</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Họ tên (đầy đủ)</Label>
                                            <Input 
                                                value={fMeta.name || ''} 
                                                onChange={(e) => setFMeta({...fMeta, name: e.target.value})}
                                                placeholder="Nguyễn Văn A"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Số CCCD</Label>
                                            <Input 
                                                value={fMeta.cccd || ''} 
                                                onChange={(e) => setFMeta({...fMeta, cccd: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Ngày cấp CCCD</Label>
                                            <Input 
                                                value={fMeta.cccd_date || ''} 
                                                onChange={(e) => setFMeta({...fMeta, cccd_date: e.target.value})}
                                                placeholder="dd/mm/yyyy"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Nơi cấp</Label>
                                            <Input 
                                                value={fMeta.cccd_place || ''} 
                                                onChange={(e) => setFMeta({...fMeta, cccd_place: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>STK Ngân hàng</Label>
                                            <Input 
                                                value={fMeta.bank_account || ''} 
                                                onChange={(e) => setFMeta({...fMeta, bank_account: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tên ngân hàng</Label>
                                            <Input 
                                                value={fMeta.bank_name || ''} 
                                                onChange={(e) => setFMeta({...fMeta, bank_name: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>% Phạt đơn phương hủy ({fMeta.termination_penalty_percent || 50}%)</Label>
                                            <Input 
                                                type="number"
                                                value={fMeta.termination_penalty_percent || 50} 
                                                onChange={(e) => setFMeta({...fMeta, termination_penalty_percent: parseInt(e.target.value)})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Ngày báo trước nghỉ ({fMeta.notice_days || 15} ngày)</Label>
                                            <Input 
                                                type="number"
                                                value={fMeta.notice_days || 15} 
                                                onChange={(e) => setFMeta({...fMeta, notice_days: parseInt(e.target.value)})}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                    {/* Payment Milestones */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-emerald-100 text-emerald-700">
                                        <CreditCard className="h-4 w-4" />
                                    </span>
                                    Mốc thanh toán
                                </CardTitle>
                                <CardDescription>Phân chia các đợt thanh toán theo hợp đồng</CardDescription>
                            </div>
                            <Button type="button" size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={addMilestone}>
                                <Plus className="h-4 w-4" />
                                Thêm đợt
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {milestones.map((milestone, index) => (
                                <div key={milestone.id} className="p-4 border rounded-lg space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Đợt {index + 1}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeMilestone(milestone.id)}
                                            disabled={milestones.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mô tả</Label>
                                        <Input
                                            value={milestone.name}
                                            onChange={(e) => updateMilestone(milestone.id, 'name', e.target.value)}
                                            placeholder="VD: Đặt cọc 50%"
                                        />
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label>Số tiền</Label>
                                                <Tabs
                                                    value={milestone.amount_mode}
                                                    onValueChange={(v) => updateMilestone(milestone.id, 'amount_mode', v as 'fixed' | 'percent')}
                                                    className="w-[130px]"
                                                >
                                                    <TabsList className="h-8 p-1 w-full grid grid-cols-2 bg-muted/50 items-center">
                                                        <TabsTrigger value="percent" className="text-[10px] h-6 px-1.5 data-[state=active]:bg-background data-[state=active]:">Theo %</TabsTrigger>
                                                        <TabsTrigger value="fixed" className="text-[10px] h-6 px-1.5 data-[state=active]:bg-background data-[state=active]:">Cố định</TabsTrigger>
                                                    </TabsList>
                                                </Tabs>
                                            </div>
                                            {milestone.amount_mode === 'percent' ? (
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            max={100}
                                                            step={0.01}
                                                            value={milestone.percentage || ''}
                                                            onChange={(e) => updateMilestone(milestone.id, 'percentage', parseFloat(e.target.value) || 0)}
                                                            placeholder="0"
                                                            className="flex-1"
                                                        />
                                                        <span className="text-sm text-muted-foreground shrink-0">%</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        = {new Intl.NumberFormat('vi-VN').format(milestone.amount)} đ
                                                    </p>
                                                </div>
                                            ) : (
                                                <Input
                                                    type="number"
                                                    value={milestone.amount}
                                                    onChange={(e) => updateMilestone(milestone.id, 'amount', parseInt(e.target.value) || 0)}
                                                />
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Hạn thanh toán</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                        <CalendarIcon className="h-4 w-4" />
                                                        {milestone.due_date ? format(milestone.due_date, 'dd/MM/yyyy') : 'Chọn'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={milestone.due_date}
                                                        onSelect={(date) => updateMilestone(milestone.id, 'due_date', date)}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                                <div className="flex justify-between font-semibold text-emerald-900">
                                    <span>Tổng thanh toán</span>
                                    <span>{formatCurrency(milestones.reduce((sum, m) => sum + m.amount, 0))}</span>
                                </div>
                                {totalValue > 0 && (
                                    <p className="text-sm text-emerald-700 mt-1">
                                        Giá trị hợp đồng: {formatCurrency(totalValue)}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/contracts">Hủy</Link>
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                        <Save className="h-4 w-4" />
                        Tạo hợp đồng
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default function NewContractClient(props: NewContractClientProps) {
    return (
        <Suspense fallback={<div className="p-6">Đang tải...</div>}>
            <NewContractForm {...props} />
        </Suspense>
    )
}
