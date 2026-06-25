import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@repo/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { Separator } from '@repo/ui'
import { Progress } from '@repo/ui'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui'
import {
    formatCurrency, formatDate
} from '@/lib/utils/format'
import {
    ArrowLeft,
    Edit,
    FileText,
    Calendar,
    Building2,
    Receipt,
    CheckCircle,
    AlertTriangle,
    FileSignature,
    Globe
} from 'lucide-react'
import { getContractById } from '@/lib/supabase/services/contract-service'
import { notFound } from 'next/navigation'
import { ContractEmailButton } from '@/components/contracts/contract-email-button'
import { ContractDocuments } from '@/components/contracts/contract-documents'
import { ContractLifecycle } from '@/components/contracts/contract-lifecycle'
import { SetPasswordDialog } from '@/components/shared/set-password-dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import { createClient } from '@/lib/supabase/server'
import { CtvLinkButton } from '@/components/contracts/ctv-link-button'

import { EntityPipelineTracker } from '@/components/shared/entity-pipeline-tracker'
import { MilestoneConfirmButton } from '@/components/contracts/milestone-confirm-button'

import { CtvContractDetail } from './ctv-contract-detail'
import { ContractResetButton } from '@/components/contracts/contract-reset-button'
import { DuplicateContractButton } from '@/components/contracts/duplicate-contract-button'

export async function generateMetadata({ params }: any): Promise<Metadata> {
    const { id } = await params
    const contract = await getContractById(id)
    return {
        title: contract ? `${contract.contract_number} - Tulie CRM` : 'Hợp đồng - Tulie CRM',
    }
}

export default async function ContractDetailPage({ params, searchParams }: any) {
    const { id } = await params
    const resolvedSearchParams = await searchParams
    const contract = await getContractById(id)
    if (!contract) {
        notFound()
    }

    // Auto-heal / promote contract status if it is currently draft/sent/viewed but has a signed date or completed milestone
    const isDraftState = ['draft', 'sent', 'viewed'].includes(contract.status)
    const hasCompletedMilestone = contract.milestones?.some((m: any) => m.status === 'completed')
    if (isDraftState && (contract.signed_date || hasCompletedMilestone)) {
        try {
            const supabase = await createClient()
            await supabase
                .from('contracts')
                .update({ status: 'active' })
                .eq('id', id)
            contract.status = 'active'
        } catch (err) {
            console.error('Failed to auto-promote contract status on page load:', err)
        }
    }

    const fromParam = resolvedSearchParams?.from
    const isFreelancerContract = contract.category === 'freelancer'
    const backHref = fromParam && typeof fromParam === 'string' && fromParam.startsWith('/') 
        ? fromParam 
        : (isFreelancerContract ? '/contracts/ctv' : '/contracts')

    // In a real app, paid_amount would be calculated from related invoices
    const paidAmount = contract.milestones
        ?.filter((m: any) => m.status === 'completed')
        .reduce((sum: number, m: any) => sum + m.amount, 0) || 0

    const progress = contract.total_amount > 0 ? (paidAmount / contract.total_amount) * 100 : 0

    // Get portal URL via contract's public_token
    const portalUrl: string | null = contract.public_token ? `/portal/${contract.public_token}` : null

    if (isFreelancerContract) {
        return <CtvContractDetail contract={contract} backHref={backHref} progress={progress} paidAmount={paidAmount} />
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80 shrink-0 mt-1">
                        <Link href={backHref}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">{contract.contract_number}</h1>
                            <StatusBadge status={contract.status} entityType="contract" />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="h-4 w-4 shrink-0" />
                            <span className="font-semibold text-foreground">{contract.customer?.company_name}</span>
                            <span>•</span>
                            <FileSignature className="h-4 w-4 shrink-0" />
                            <span>Chi tiết hợp đồng kinh tế</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <SetPasswordDialog
                        entityId={contract.id}
                        tableName="contracts"
                        hasPassword={!!contract.password_hash}
                        hasFinancialPassword={!!contract.financial_password_hash}
                    />
                    <ContractEmailButton contract={contract} />
                    {isFreelancerContract && contract.public_token && (
                        <CtvLinkButton publicToken={contract.public_token} />
                    )}
                    <ContractResetButton contractId={contract.id} />
                    <DuplicateContractButton contractId={contract.id} />
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/contracts/${contract.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="space-y-3 flex flex-col pb-4">
                {/* Contract Info merged card */}
                <Card>
                    <CardHeader className="pb-2 pt-3 px-4 border-b flex flex-row items-center justify-between gap-4 flex-wrap md:flex-nowrap">
                        <CardTitle className="text-sm font-semibold text-foreground shrink-0">Thông tin cơ bản</CardTitle>
                        <EntityPipelineTracker entityType="contract" entityId={id} minimal={true} />
                    </CardHeader>
                    <CardContent className="grid gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3 px-4 pb-3 pt-2.5">
                        {/* Khách hàng */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                                Khách hàng
                            </h4>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between items-start gap-4 border-b pb-1.5">
                                    <span className="text-muted-foreground shrink-0 mt-0.5">Công ty</span>
                                    <Link href={`/customers/${contract.customer?.id}`} className="font-semibold text-foreground hover:underline text-right leading-tight break-words max-w-[200px]">
                                        {contract.customer?.company_name}
                                    </Link>
                                </div>
                                <div className="flex justify-between items-center gap-4 border-b pb-1.5">
                                    <span className="text-muted-foreground shrink-0">Email</span>
                                    <span className="font-semibold text-right truncate">{contract.customer?.email || '—'}</span>
                                </div>
                                <div className="flex justify-between items-center gap-4">
                                    <span className="text-muted-foreground shrink-0">Số ĐT</span>
                                    <span className="font-semibold text-right">{contract.customer?.phone || '—'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Thời gian */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                Thời gian
                            </h4>
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center justify-between gap-4 border-b pb-1.5">
                                    <span className="text-muted-foreground">Ngày ký</span>
                                    <span className="font-semibold">{contract.signed_date ? formatDate(contract.signed_date) : 'Chưa ký'}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4 border-b pb-1.5">
                                    <span className="text-muted-foreground">Bắt đầu</span>
                                    <span className="font-semibold">{formatDate(contract.start_date)}</span>
                                </div>
                                <div className={`flex items-center justify-between gap-4 border-b pb-1.5`}>
                                    <span className="text-muted-foreground">Kết thúc</span>
                                    <span className="font-semibold">{contract.end_date ? formatDate(contract.end_date) : 'Không xác định'}</span>
                                </div>
                                {(contract as any).warranty_months && (
                                    <div className="flex items-center justify-between gap-4 pt-0.5">
                                        <span className="text-muted-foreground">Bảo hành</span>
                                        <span className="font-semibold">
                                            {(contract as any).warranty_months} tháng
                                            {(() => {
                                                const startRaw = contract.end_date
                                                if (!startRaw) return ''
                                                const startD = new Date(startRaw.substring(0, 10))
                                                const endD = new Date(startD)
                                                endD.setMonth(endD.getMonth() + (contract as any).warranty_months)
                                                endD.setDate(endD.getDate() - 1)
                                                return ` (đến ${formatDate(endD)})`
                                            })()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thông tin khác */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                                Thông tin khác
                            </h4>
                            <div className="space-y-2 text-xs">
                                {contract.quotation && (
                                    <div className="flex justify-between items-start gap-4 border-b pb-1.5">
                                        <span className="text-muted-foreground shrink-0 mt-0.5">Báo giá gốc</span>
                                        <Link href={`/quotations/${contract.quotation.id}`} className="font-semibold text-foreground hover:underline text-right break-words max-w-[150px]">
                                            {contract.quotation.quotation_number}
                                        </Link>
                                    </div>
                                )}
                                <div className="flex justify-between items-center gap-4">
                                    <span className="text-muted-foreground shrink-0">Phụ trách</span>
                                    <span className="font-semibold text-right truncate">
                                        {contract.creator ? contract.creator.full_name : 'Hệ thống'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Lifecycle + Payment side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
                    {/* Lifecycle Timeline */}
                    <ContractLifecycle contract={contract} />

                    {/* Payment Progress & Milestones merged */}
                    <Card className="h-fit">
                        <CardHeader className="pb-2 pt-3 px-4 border-b">
                            <CardTitle className="text-sm font-semibold">Thanh toán & Milestone</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 px-4 pb-3 pt-2.5">
                            {/* Payment Progress */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between font-bold text-xs">
                                    <span>Đã thanh toán: {formatCurrency(paidAmount)}</span>
                                    <span>Tổng giá trị: {formatCurrency(contract.total_amount)}</span>
                                </div>
                                <Progress value={progress} className="h-1.5" />
                                <p className="text-center text-xs text-muted-foreground font-semibold">
                                    {progress.toFixed(0)}% hoàn thành
                                </p>
                            </div>
                            
                            <Separator />

                            {/* Milestones - Separated into Payment and Work */}
                            <div className="space-y-3 pt-0.5">
                                {/* Payment Milestones */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                                            <Receipt className="w-3.5 h-3.5 text-muted-foreground" />
                                            Các đợt thanh toán ({contract.milestones?.filter((m: any) => (m.type === 'payment' || !m.type) && m.amount > 0).length || 0})
                                        </h4>
                                    </div>
                                    <div className="rounded-md border overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="w-[40px] text-center text-xs h-8 py-1">TT</TableHead>
                                                    <TableHead className="text-xs h-8 py-1">Giai đoạn</TableHead>
                                                    <TableHead className="text-right text-xs h-8 py-1">Số tiền</TableHead>
                                                    <TableHead className="w-[100px] text-center text-xs h-8 py-1">Thao tác</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {contract.milestones?.filter((m: any) => (m.type === 'payment' || !m.type) && m.amount > 0).map((milestone: any, index: number) => (
                                                    <TableRow key={milestone.id}>
                                                        <TableCell className="text-center font-medium text-xs text-muted-foreground py-1">
                                                            {index + 1}
                                                        </TableCell>
                                                        <TableCell className="py-1">
                                                            <div className="flex flex-col gap-0.5">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="font-semibold text-xs text-foreground">
                                                                        {milestone.name}
                                                                    </span>
                                                                    {milestone.status === 'completed' && (
                                                                        <CheckCircle className="h-3 w-3 text-foreground" />
                                                                    )}
                                                                </div>
                                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                                    Hạn: {formatDate(milestone.due_date)}
                                                                    {milestone.completed_at && (
                                                                        <span className="text-muted-foreground font-medium">• Đã TT {formatDate(milestone.completed_at)}</span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right py-1">
                                                            <span className="font-bold tabular-nums text-xs text-foreground">
                                                                {formatCurrency(milestone.amount || 0).replace(/\s*[₫đ]\s*$/g, '').trim()} <sup className="text-[9px] text-muted-foreground font-normal">đ</sup>
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-center py-1">
                                                            <MilestoneConfirmButton
                                                                milestoneId={milestone.id}
                                                                milestoneName={milestone.name}
                                                                amount={milestone.amount || 0}
                                                                status={milestone.status}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {(!contract.milestones || contract.milestones.filter((m: any) => (m.type === 'payment' || !m.type) && m.amount > 0).length === 0) && (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-3">
                                                            Chưa thiết lập mốc thanh toán
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                {/* Work Milestones */}
                                {contract.milestones?.some((m: any) => m.type === 'work' || m.type === 'delivery' || m.amount === 0) && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                                                <CheckCircle className="w-3.5 h-3.5 text-muted-foreground" />
                                                Đầu việc & Bàn giao ({contract.milestones?.filter((m: any) => m.type === 'work' || m.type === 'delivery' || m.amount === 0).length || 0})
                                            </h4>
                                        </div>
                                        <div className="rounded-md border overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="hover:bg-transparent">
                                                        <TableHead className="w-[40px] text-center text-xs h-8 py-1">STT</TableHead>
                                                        <TableHead className="text-xs h-8 py-1">Nội dung công việc</TableHead>
                                                        <TableHead className="w-[120px] text-xs h-8 py-1">Hạn hoàn thành</TableHead>
                                                        <TableHead className="w-[80px] text-center text-xs h-8 py-1">Trạng thái</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {contract.milestones?.filter((m: any) => m.type === 'work' || m.type === 'delivery' || m.amount === 0).map((milestone: any, index: number) => (
                                                        <TableRow key={milestone.id}>
                                                            <TableCell className="text-center font-medium text-xs text-muted-foreground py-1">
                                                                {index + 1}
                                                            </TableCell>
                                                            <TableCell className="py-1">
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="font-semibold text-xs text-foreground">
                                                                        {milestone.name}
                                                                    </span>
                                                                    {milestone.type === 'delivery' && (
                                                                        <span className="text-[9px] tracking-wider font-bold text-foreground bg-muted px-1.5 py-0.25 rounded w-fit">Bàn giao</span>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="py-1">
                                                                <div className="text-[11px] space-y-0.5">
                                                                    <div className="text-muted-foreground italic">Dự kiến: {formatDate(milestone.due_date)}</div>
                                                                    {milestone.completed_at && (
                                                                        <div className="text-foreground font-medium flex items-center gap-1">
                                                                            Thực tế: {formatDate(milestone.completed_at)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center py-1">
                                                                <StatusBadge status={milestone.status} entityType="milestone" />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Document Templates */}
                <ContractDocuments contract={contract} />

            </div>
        </div>
    )
}
