'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from '@repo/ui'
import { Calendar } from '@repo/ui'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@repo/ui'
import { formatCurrency } from '@/lib/utils/format'
import { ArrowLeft, CalendarIcon, Save, Plus, Trash2, Percent, ClipboardList, CreditCard, ShieldCheck } from 'lucide-react'
import { LoadingSpinner } from '@repo/ui'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Contract, ContractMilestone, Customer, Quotation } from '@/types'
import { updateContract } from '@/lib/supabase/services/contract-service'
import { toast } from 'sonner'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@repo/ui'

// Helper: parse '27,000,000' → 27000000
const parseFormattedNumber = (value: string): number => {
    return parseInt(value.replace(/[^0-9]/g, '')) || 0
}
const formatNumber = (value: number): string => {
    return value ? new Intl.NumberFormat('vi-VN').format(value) : ''
}

interface MilestoneItem {
    id: string
    name: string
    amount: number
    percentage: number
    amount_mode: 'fixed' | 'percent'
    due_date: Date | undefined
    status: string
    completed_at: Date | undefined
    delay_reason: string
    type: 'payment' | 'work' | 'delivery'
}

interface ContractFormProps {
    contract: Contract
    customers: Customer[]
    quotations: Quotation[]
    projects: any[]
    userRole?: string
}

export function ContractForm({ contract, customers, quotations, projects, userRole }: ContractFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const [customerId, setCustomerId] = useState(contract.customer_id)
    const [quotationId, setQuotationId] = useState(contract.quotation_id || '')
    const [projectId, setProjectId] = useState(contract.project_id || '')
    const [title, setTitle] = useState(contract.title || '')
    const [totalValue, setTotalValue] = useState(contract.total_amount || 0)
    // Parse date strings as local dates to avoid timezone shift
    // "2026-03-16" → local March 16, not UTC March 16 (which would be March 15 in UTC+7)
    const parseLocalDate = (dateStr: string | null | undefined): Date | undefined => {
        if (!dateStr) return undefined
        // Extract just the date part (YYYY-MM-DD) regardless of input format
        const datePart = dateStr.substring(0, 10) // "2026-03-16" from "2026-03-16T17:00:00+00:00"
        const [y, m, d] = datePart.split('-').map(Number)
        return new Date(y, m - 1, d) // Local date constructor
    }
    const [startDate, setStartDate] = useState<Date | undefined>(
        parseLocalDate(contract.start_date)
    )
    const [endDate, setEndDate] = useState<Date | undefined>(
        parseLocalDate(contract.end_date)
    )
    const [signedDate, setSignedDate] = useState<Date | undefined>(
        parseLocalDate(contract.signed_date)
    )
    const [status, setStatus] = useState(contract.status)
    const [terms, setTerms] = useState(contract.terms || '')
    const [contractType, setContractType] = useState(contract.type || 'contract')
    const [category, setCategory] = useState<'customer' | 'freelancer'>(contract.category || 'customer')
    const [fMeta, setFMeta] = useState(contract.freelancer_metadata || {})
    const [warrantyMonths, setWarrantyMonths] = useState<number | null>((contract as any).warranty_months ?? null)

    const isAdmin = userRole === 'admin' || userRole === 'ceo'
    // Lock entirely when completed/cancelled (unless admin)
    const isFullyLocked = ['completed', 'cancelled'].includes(contract.status) && !isAdmin
    // Lock core details when active (but allow milestone/status updates) (unless admin)
    const isCoreLocked = ['active', 'completed', 'cancelled'].includes(contract.status) && !isAdmin

    // Customer abbreviation for document number generation
    const selectedCustomer = customers.find(c => c.id === customerId)
    const [customerAbbreviation, setCustomerAbbreviation] = useState(
        selectedCustomer?.abbreviation || ''
    )

    // Editable contract number
    const [contractNumber, setContractNumber] = useState(contract.contract_number || '')

    // Auto-generate contract number from signed_date + abbreviation (or freelancer initials)
    const generateContractNumber = () => {
        if (category === 'freelancer') {
            if (!signedDate || !fMeta.name) {
                toast.error('Cần điền Ngày ký và Họ tên CTV trước')
                return
            }
            const dateStr = format(signedDate, 'yyyyMMdd')
            const words = fMeta.name.trim().split(/\s+/)
            const initials = words.map((w: string) => w[0]).join('').toUpperCase()
            const cleanInitials = initials.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/Đ/g, 'D')
            setContractNumber(`${dateStr}/HĐCTV-TL-${cleanInitials}`)
        } else {
            if (!signedDate || !customerAbbreviation) {
                toast.error('Cần điền Ngày ký và Tên viết tắt KH trước')
                return
            }
            const dateStr = format(signedDate, 'yyyyMMdd')
            setContractNumber(`${dateStr}/HDKT-TL-${customerAbbreviation.toUpperCase()}`)
        }
    }
    const [orderNumber, setOrderNumber] = useState(contract.order_number || '')

    const [milestones, setMilestones] = useState<MilestoneItem[]>(
        contract.milestones?.map(m => ({
            id: m.id,
            name: m.name,
            amount: m.amount,
            percentage: m.percentage || 0,
            amount_mode: (m.percentage && m.percentage > 0) ? 'percent' as const : 'fixed' as const,
            due_date: parseLocalDate(m.due_date),
            status: m.status as any,
            completed_at: parseLocalDate(m.completed_at),
            delay_reason: m.delay_reason || '',
            type: m.type || 'payment'
        })) || []
    )

    const addPaymentMilestone = () => {
        setMilestones([
            ...milestones,
            { id: `temp-${Date.now()}`, name: '', amount: 0, percentage: 0, amount_mode: 'fixed', due_date: undefined, status: 'pending', completed_at: undefined, delay_reason: '', type: 'payment' },
        ])
    }

    const addWorkMilestone = () => {
        setMilestones([
            ...milestones,
            { id: `temp-${Date.now()}-w`, name: '', amount: 0, percentage: 0, amount_mode: 'fixed', due_date: undefined, status: 'pending', completed_at: undefined, delay_reason: '', type: 'work' },
        ])
    }

    const removeMilestone = (id: string) => {
        if (milestones.length > 1) {
            setMilestones(milestones.filter((m) => m.id !== id))
        }
    }

    const updateMilestone = (id: string, field: keyof MilestoneItem, value: any) => {
        setMilestones(
            milestones.map((m) => {
                if (m.id !== id) return m
                const updated = { ...m, [field]: value }
                // Auto-calc amount when percentage changes
                if (field === 'percentage' && updated.amount_mode === 'percent' && totalValue > 0) {
                    updated.amount = Math.round(totalValue * (updated.percentage / 100))
                }
                // When switching to percent mode, calc percentage from current amount
                if (field === 'amount_mode' && value === 'percent' && totalValue > 0 && updated.amount > 0) {
                    updated.percentage = Math.round((updated.amount / totalValue) * 10000) / 100
                }
                // When switching to fixed mode, keep amount as-is
                return updated
            })
        )
    }

    // Recalculate percent-mode milestone amounts when totalValue changes
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

    // Validation warnings
    const missingFields: string[] = []
    if (!signedDate) missingFields.push('Ngày ký hợp đồng')
    if (!customerAbbreviation && category !== 'freelancer') missingFields.push('Tên viết tắt khách hàng')
    if (!totalValue) missingFields.push('Giá trị hợp đồng')
    if (milestones.filter(m => m.type === 'payment').length === 0) missingFields.push('Mốc thanh toán (ít nhất 1 đợt)')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const requiresCustomer = category !== 'freelancer'
        if ((requiresCustomer && !customerId) || !title) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
            return
        }

        // Warn but don't block if missing non-critical fields
        if (missingFields.length > 0) {
            toast.warning(`Thiếu thông tin: ${missingFields.join(', ')}. Bộ giấy tờ có thể chưa đầy đủ.`)
        }

        setIsLoading(true)
        try {
            const updateData: Record<string, any> = {
                customer_id: customerId,
                title,
                total_amount: totalValue,
                start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
                end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
                signed_date: signedDate ? format(signedDate, 'yyyy-MM-dd') : null,
                status: status,
                terms,
                type: contractType,
                category: category,
                freelancer_metadata: category === 'freelancer' ? fMeta : null,
                order_number: orderNumber || null,
                project_id: projectId || null,
                contract_number: contractNumber || null,
                warranty_months: warrantyMonths,
            }
            updateData.quotation_id = quotationId || null

            // Update customer abbreviation if changed
            if (customerAbbreviation && customerId) {
                try {
                    const { createClient } = await import('@/lib/supabase/client')
                    const supabase = createClient()
                    await supabase
                        .from('customers')
                        .update({ abbreviation: customerAbbreviation })
                        .eq('id', customerId)
                } catch (e) {
                    console.warn('Failed to update customer abbreviation:', e)
                }
            }

            const milestoneData = milestones.map(m => ({
                id: m.id,
                name: m.name,
                amount: m.amount,
                percentage: m.amount_mode === 'percent' ? m.percentage : null,
                due_date: m.due_date ? format(m.due_date, 'yyyy-MM-dd') : null,
                status: m.status,
                completed_at: m.completed_at ? format(m.completed_at, 'yyyy-MM-dd') : null,
                delay_reason: m.delay_reason || null,
                type: m.type,
                description: m.name || null,
            }))

            const result = await updateContract(contract.id, updateData, milestoneData as any)

            if (!result.success) {
                toast.error(result.error || 'Có lỗi xảy ra khi cập nhật hợp đồng')
                return
            }

            toast.success('Cập nhật hợp đồng thành công')
            router.push(`/contracts/${contract.id}`)
            router.refresh()
        } catch (error: any) {
            console.error('Failed to update contract:', error)
            toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật hợp đồng')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/contracts/${contract.id}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-semibold">Chỉnh sửa {contract.contract_number}</h1>
                        <p className="text-muted-foreground">Cập nhật thông tin hợp đồng</p>
                    </div>
                </div>
            </div>

            {isCoreLocked && (
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 dark:text-blue-300 font-medium">
                        Hợp đồng đang thực hiện — chỉ cho phép cập nhật trạng thái và tiến độ công việc/thanh toán.
                    </AlertDescription>
                </Alert>
            )}
            {['completed', 'cancelled'].includes(contract.status) && !isAdmin && (
                <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 dark:text-amber-300 font-medium">
                        Hợp đồng đã đóng — không thể chỉnh sửa thông tin. Liên hệ admin nếu cần thay đổi.
                    </AlertDescription>
                </Alert>
            )}
            {isAdmin && ['active', 'completed', 'cancelled'].includes(contract.status) && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800">
                    <AlertTriangle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-300 font-medium">
                        Quyền Admin: Bạn có thể chỉnh sửa thông tin ngay cả khi hợp đồng đã triển khai hoặc đã đóng.
                    </AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <fieldset disabled={isFullyLocked} className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin hợp đồng</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Loại hồ sơ</Label>
                                <Select value={contractType} onValueChange={(v: any) => setContractType(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="contract">Hợp đồng</SelectItem>
                                        <SelectItem value="order">Đơn hàng</SelectItem>
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

                            <div className="space-y-2">
                                <Label>Trạng thái</Label>
                                <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Bản nháp</SelectItem>
                                        <SelectItem value="active">Đang thực hiện</SelectItem>
                                        <SelectItem value="completed">Hoàn thành</SelectItem>
                                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <fieldset disabled={isCoreLocked} className="space-y-4">
                            {category !== 'freelancer' && (
                            <div className="space-y-2">
                                <Label>Khách hàng <span className="text-destructive">*</span></Label>
                                <Select value={customerId} onValueChange={setCustomerId}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map((c) => (
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
                                <Select value={projectId || "none"} onValueChange={(v) => setProjectId(v === "none" ? "" : v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn dự án..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- Không thuộc dự án --</SelectItem>
                                        {projects.filter(p => category === 'freelancer' || !customerId || p.customer_id === customerId).map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Báo giá liên quan</Label>
                                <Select value={quotationId || "none"} onValueChange={(v) => setQuotationId(v === "none" ? "" : v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn báo giá (tùy chọn)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- Không liên kết báo giá --</SelectItem>
                                        {quotations.map((q) => (
                                            <SelectItem key={q.id} value={q.id}>
                                                {q.quotation_number} - {formatCurrency(q.total_amount)}
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
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Giá trị hợp đồng <span className="text-destructive">*</span></Label>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    value={formatNumber(totalValue)}
                                    onChange={(e) => handleTotalValueChange(parseFormattedNumber(e.target.value))}
                                    placeholder="0"
                                />
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
                                <Label>Ngày ký hợp đồng <span className="text-destructive">*</span></Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                            <CalendarIcon className="h-4 w-4" />
                                            {signedDate ? format(signedDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày ký'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={signedDate} onSelect={setSignedDate} />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {category !== 'freelancer' && (
                                <div className="space-y-2">
                                    <Label>Tên viết tắt KH <span className="text-destructive">*</span></Label>
                                    <Input
                                        value={customerAbbreviation}
                                        onChange={(e) => setCustomerAbbreviation(e.target.value.toUpperCase())}
                                        placeholder="VD: VSTEM"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Dùng để tạo mã giấy tờ: HDKT-TL-{customerAbbreviation || 'XXX'}</p>
                                </div>
                                )}
                                <div className="space-y-2">
                                    <Label>Mã hợp đồng</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={contractNumber}
                                            onChange={(e) => setContractNumber(e.target.value)}
                                            placeholder="Nhập hoặc bấm Tạo mã"
                                            className="font-mono text-xs flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={generateContractNumber}
                                            className="shrink-0 text-xs"
                                        >
                                            Tạo mã
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        {category === 'freelancer'
                                            ? `Format: yyyymmdd/HĐCTV-TL-[Viết tắt tên CTV]`
                                            : `Format: yyyymmdd/HDKT-TL-${customerAbbreviation || 'XXX'}`
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Điều khoản</Label>
                                <Textarea
                                    value={terms}
                                    onChange={(e) => setTerms(e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Mã đơn hàng</Label>
                                <Input
                                    value={orderNumber}
                                    onChange={(e) => setOrderNumber(e.target.value)}
                                    placeholder="VD: PO-2023-001"
                                />
                            </div>

                            {missingFields.length > 0 && (
                                <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                        <strong>Thông tin cần bổ sung:</strong> {missingFields.join(' • ')}
                                    </AlertDescription>
                                </Alert>
                            )}
                            </fieldset>

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
                            <Button type="button" size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={addPaymentMilestone}>
                                <Plus className="h-4 w-4" />
                                Thêm đợt
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {milestones.filter(m => m.type === 'payment').length === 0 && (
                                <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg text-sm">
                                    Chưa có mốc thanh toán nào. Bấm &quot;Thêm đợt&quot; để bắt đầu.
                                </div>
                            )}
                            {milestones.filter(m => m.type === 'payment').map((milestone, index) => {
                                const isMilestoneDone = milestone.status === 'completed'
                                const isMilestoneLocked = isMilestoneDone && !isAdmin
                                return (
                                <div key={milestone.id} className={`p-4 border rounded-lg space-y-3 ${isMilestoneDone ? 'bg-emerald-50/50 border-emerald-200' : 'border-slate-200'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">{index + 1}</span>
                                            <span className="font-semibold text-sm">Đợt thanh toán {index + 1}</span>
                                            {isMilestoneLocked && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                                                    ✓ Đã thanh toán
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Select
                                                value={milestone.status}
                                                onValueChange={(v) => updateMilestone(milestone.id, 'status', v)}
                                            >
                                                <SelectTrigger className="h-8 w-28">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Chờ</SelectItem>
                                                    <SelectItem value="completed">Đã TT</SelectItem>
                                                    <SelectItem value="overdue">Trễ</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {!isMilestoneLocked && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeMilestone(milestone.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mô tả</Label>
                                        <Input
                                            value={milestone.name}
                                            onChange={(e) => updateMilestone(milestone.id, 'name', e.target.value)}
                                            placeholder="VD: Thanh toán đợt 1 - Ký hợp đồng"
                                            disabled={isMilestoneLocked}
                                        />
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between h-8">
                                                <Label>Số tiền</Label>
                                                {!isMilestoneLocked && (
                                                <Tabs
                                                    value={milestone.amount_mode}
                                                    onValueChange={(v) => updateMilestone(milestone.id, 'amount_mode', v as 'fixed' | 'percent')}
                                                    className="w-[130px]"
                                                >
                                                    <TabsList className="h-8 p-1 w-full grid grid-cols-2 bg-muted/50 items-center">
                                                        <TabsTrigger value="percent" className="text-[10px] h-6 px-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">Theo %</TabsTrigger>
                                                        <TabsTrigger value="fixed" className="text-[10px] h-6 px-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">Cố định</TabsTrigger>
                                                    </TabsList>
                                                </Tabs>
                                                )}
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
                                                            disabled={isMilestoneLocked}
                                                        />
                                                        <span className="text-sm text-muted-foreground shrink-0">%</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        = {formatCurrency(milestone.amount)}
                                                    </p>
                                                </div>
                                            ) : (
                                                <Input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={formatNumber(milestone.amount)}
                                                    onChange={(e) => updateMilestone(milestone.id, 'amount', parseFormattedNumber(e.target.value))}
                                                    placeholder="0"
                                                    disabled={isMilestoneLocked}
                                                />
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center h-8">
                                                <Label>Hạn thanh toán (Dự kiến)</Label>
                                            </div>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={isMilestoneLocked}>
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
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Ngày thực tế (Nếu có)</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left font-normal border-dashed">
                                                        <CalendarIcon className="h-4 w-4" />
                                                        {milestone.completed_at ? format(milestone.completed_at, 'dd/MM/yyyy') : 'Chưa có'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={milestone.completed_at}
                                                        onSelect={(date) => updateMilestone(milestone.id, 'completed_at', date)}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Lý do trễ (Nếu trễ)</Label>
                                            <Input
                                                value={milestone.delay_reason}
                                                onChange={(e) => updateMilestone(milestone.id, 'delay_reason', e.target.value)}
                                                placeholder="VD: Chờ phản hồi khách hàng"
                                                disabled={isMilestoneLocked}
                                            />
                                        </div>
                                    </div>
                                </div>
                                )
                            })}

                            {milestones.filter(m => m.type === 'payment').length > 0 && (
                            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                                <div className="flex justify-between font-semibold text-emerald-900">
                                    <span>Tổng thanh toán</span>
                                    <span>{formatCurrency(milestones.filter(m => m.type === 'payment').reduce((sum, m) => sum + m.amount, 0))}</span>
                                </div>
                                <p className="text-sm text-emerald-700 mt-1">
                                    Giá trị hợp đồng: {formatCurrency(totalValue)}
                                </p>
                            </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Work/Delivery Milestones */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-blue-100 text-blue-700">
                                        <ClipboardList className="h-4 w-4" />
                                    </span>
                                    Đầu việc & Bàn giao
                                </CardTitle>
                                <CardDescription>Các mốc công việc cần hoàn thành trong hợp đồng</CardDescription>
                            </div>
                            <Button type="button" size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50" onClick={addWorkMilestone}>
                                <Plus className="h-4 w-4" />
                                Thêm đầu việc
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {milestones.filter(m => m.type === 'work' || m.type === 'delivery').length === 0 && (
                                <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg text-sm">
                                    Chưa có đầu việc nào. Bấm &quot;Thêm đầu việc&quot; để bắt đầu.
                                </div>
                            )}
                            {milestones.filter(m => m.type === 'work' || m.type === 'delivery').map((milestone, index) => {
                                const isMilestoneDone = milestone.status === 'completed'
                                const isMilestoneLocked = isMilestoneDone && !isAdmin
                                return (
                                <div key={milestone.id} className={`p-4 border rounded-lg space-y-3 ${isMilestoneDone ? 'bg-blue-50/50 border-blue-200' : 'border-slate-200'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">{index + 1}</span>
                                            <span className="font-semibold text-sm">Đầu việc {index + 1}</span>
                                            {isMilestoneLocked && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                                                    ✓ Hoàn thành
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Select
                                                value={milestone.type}
                                                onValueChange={(v) => updateMilestone(milestone.id, 'type', v)}
                                                disabled={isMilestoneLocked}
                                            >
                                                <SelectTrigger className="h-8 w-28 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="work">Công việc</SelectItem>
                                                    <SelectItem value="delivery">Bàn giao</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select
                                                value={milestone.status}
                                                onValueChange={(v) => updateMilestone(milestone.id, 'status', v)}
                                            >
                                                <SelectTrigger className="h-8 w-28">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Chờ</SelectItem>
                                                    <SelectItem value="completed">Đã xong</SelectItem>
                                                    <SelectItem value="overdue">Trễ</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {!isMilestoneLocked && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeMilestone(milestone.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mô tả công việc</Label>
                                        <Input
                                            value={milestone.name}
                                            onChange={(e) => updateMilestone(milestone.id, 'name', e.target.value)}
                                            placeholder="VD: Thiết kế giao diện, Triển khai hệ thống..."
                                            disabled={isMilestoneLocked}
                                        />
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Hạn hoàn thành (Dự kiến)</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={isMilestoneLocked}>
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
                                        <div className="space-y-2">
                                            <Label>Ngày hoàn thành thực tế</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left font-normal border-dashed">
                                                        <CalendarIcon className="h-4 w-4" />
                                                        {milestone.completed_at ? format(milestone.completed_at, 'dd/MM/yyyy') : 'Chưa hoàn thành'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={milestone.completed_at}
                                                        onSelect={(date) => updateMilestone(milestone.id, 'completed_at', date)}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                </div>
                                )
                            })}
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                {!isFullyLocked && (
                <div className="flex items-center justify-end gap-4">
                    <Button type="button" variant="outline" asChild>
                        <Link href={`/contracts/${contract.id}`}>Hủy</Link>
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                        <Save className="h-4 w-4" />
                        Lưu thay đổi
                    </Button>
                </div>
                )}
                </fieldset>
            </form>
        </div>
    )
}
