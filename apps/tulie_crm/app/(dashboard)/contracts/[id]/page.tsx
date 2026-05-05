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
    const fromParam = resolvedSearchParams?.from
    const backHref = fromParam && typeof fromParam === 'string' && fromParam.startsWith('/') ? fromParam : '/contracts'
    const contract = await getContractById(id)

    if (!contract) {
        notFound()
    }

    // In a real app, paid_amount would be calculated from related invoices
    const paidAmount = contract.milestones
        ?.filter((m: any) => m.status === 'completed')
        .reduce((sum: number, m: any) => sum + m.amount, 0) || 0

    const progress = contract.total_amount > 0 ? (paidAmount / contract.total_amount) * 100 : 0

    // Get portal URL via contract's public_token
    const portalUrl: string | null = contract.public_token ? `/portal/${contract.public_token}` : null
    const isFreelancerContract = contract.category === 'freelancer'

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80 shrink-0 mt-1">
                        <Link href={backHref}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-semibold tracking-tight">{contract.customer?.company_name}</h1>
                            <div className="px-2.5 py-0.5 rounded-md border bg-muted/50 font-medium text-xs flex items-center">
                                {contract.contract_number}
                            </div>
                            <StatusBadge status={contract.status} entityType="contract" />
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <FileSignature className="h-4 w-4" />
                            Chi tiết hợp đồng kinh tế
                        </p>
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
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/contracts/${contract.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                        </Link>
                    </Button>
                    {portalUrl && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={portalUrl} target="_blank" rel="noopener noreferrer">
                                <Globe className="h-4 w-4 mr-2" />
                                Mở Portal Dự Án
                            </a>
                        </Button>
                    )}
                </div>
            </div>

            <EntityPipelineTracker entityType="contract" entityId={id} />

            <div className="space-y-6 flex flex-col pb-12">
                {/* Contract Info merged card */}
                <Card>
                    <CardHeader className="border-b bg-muted/20 pb-4">
                        <CardTitle className="text-base text-foreground">Thông tin cơ bản</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3 pt-6">
                        {/* Khách hàng */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                Khách hàng
                            </h4>
                            <div className="space-y-2.5 text-sm">
                                <div className="flex justify-between items-start gap-4 border-b pb-2.5">
                                    <span className="text-muted-foreground shrink-0 mt-0.5">Công ty</span>
                                    <Link href={`/customers/${contract.customer?.id}`} className="font-medium text-primary hover:underline text-right leading-tight break-words max-w-[200px]">
                                        {contract.customer?.company_name}
                                    </Link>
                                </div>
                                <div className="flex justify-between items-center gap-4 border-b pb-2.5">
                                    <span className="text-muted-foreground shrink-0">Email</span>
                                    <span className="font-medium text-right truncate">{contract.customer?.email || '—'}</span>
                                </div>
                                <div className="flex justify-between items-center gap-4">
                                    <span className="text-muted-foreground shrink-0">Số ĐT</span>
                                    <span className="font-medium text-right">{contract.customer?.phone || '—'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Thời gian */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                Thời gian
                            </h4>
                            <div className="space-y-2.5 text-sm">
                                <div className="flex items-center justify-between gap-4 border-b pb-2.5">
                                    <span className="text-muted-foreground">Ngày ký</span>
                                    <span className="font-medium">{contract.signed_date ? formatDate(contract.signed_date) : 'Chưa ký'}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4 border-b pb-2.5">
                                    <span className="text-muted-foreground">Bắt đầu</span>
                                    <span className="font-medium">{formatDate(contract.start_date)}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-muted-foreground">Kết thúc</span>
                                    <span className="font-medium">{contract.end_date ? formatDate(contract.end_date) : 'Không xác định'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin khác */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                Thông tin khác
                            </h4>
                            <div className="space-y-2.5 text-sm">
                                {contract.quotation && (
                                    <div className="flex justify-between items-start gap-4 border-b pb-2.5">
                                        <span className="text-muted-foreground shrink-0 mt-0.5">Báo giá gốc</span>
                                        <Link href={`/quotations/${contract.quotation.id}`} className="font-medium text-primary hover:underline text-right break-words max-w-[150px]">
                                            {contract.quotation.quotation_number}
                                        </Link>
                                    </div>
                                )}
                                <div className="flex justify-between items-center gap-4">
                                    <span className="text-muted-foreground shrink-0">Phụ trách</span>
                                    <span className="font-medium text-right truncate">
                                        {contract.creator ? contract.creator.full_name : 'Hệ thống'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Lifecycle Timeline */}
                <ContractLifecycle contract={contract} />

                {/* Payment Progress & Milestones merged */}
                <Card>
                    <CardHeader className="border-b bg-muted/20">
                        <CardTitle className="text-base">Thanh toán & Milestone</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-6">
                        {/* Payment Progress */}
                        <div className="space-y-4">
                            <div className="flex justify-between font-semibold text-sm">
                                <span>Đã thanh toán: {formatCurrency(paidAmount)}</span>
                                <span>Tổng giá trị: {formatCurrency(contract.total_amount)}</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <p className="text-center text-sm text-muted-foreground font-medium">
                                {progress.toFixed(0)}% hoàn thành
                            </p>
                        </div>
                        
                        <Separator />

                        {/* Milestones */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-foreground">Các đợt thanh toán ({contract.milestones?.length || 0})</h4>
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="w-[60px] text-center">TT</TableHead>
                                            <TableHead>Giai đoạn</TableHead>
                                            <TableHead className="text-right">Số tiền</TableHead>
                                            <TableHead className="w-[140px] text-center">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {contract.milestones?.map((milestone: any, index: number) => (
                                            <TableRow key={milestone.id}>
                                                <TableCell className="text-center">
                                                    {milestone.status === 'completed' ? (
                                                        <CheckCircle className="h-4 w-4 mx-auto text-primary" />
                                                    ) : milestone.status === 'overdue' ? (
                                                        <AlertTriangle className="h-4 w-4 mx-auto text-destructive" />
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground font-medium">{index + 1}</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-medium text-sm text-foreground">
                                                            {milestone.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                            Hạn: {formatDate(milestone.due_date)}
                                                            {milestone.completed_at && (
                                                                <span className="text-muted-foreground font-medium">• Đã thanh toán {formatDate(milestone.completed_at)}</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="font-semibold tabular-nums text-sm text-foreground">
                                                        {milestone.amount ? formatCurrency(milestone.amount).replace(/\s*[₫đ]\s*$/g, '').trim() : '0'} <sup className="text-[10px] text-muted-foreground font-normal">đ</sup>
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {milestone.type === 'payment' || !milestone.type ? (
                                                        <MilestoneConfirmButton
                                                            milestoneId={milestone.id}
                                                            milestoneName={milestone.name}
                                                            amount={milestone.amount || 0}
                                                            status={milestone.status}
                                                        />
                                                    ) : null}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {(!contract.milestones || contract.milestones.length === 0) && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">
                                                    Chưa thiết lập milestone thanh toán
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Document Templates */}
                <ContractDocuments contract={contract} />

                {/* Terms & Details */}
                <Card>
                    <CardHeader className="border-b bg-muted/20">
                        <CardTitle className="text-base">Chi tiết & Điều khoản</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2 pt-6">
                        {contract.description && (
                            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                                <h4 className="font-semibold text-sm text-foreground">Mô tả dự án</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{contract.description}</p>
                            </div>
                        )}
                        {contract.terms && (
                            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                                <h4 className="font-semibold text-sm text-foreground">Điều khoản hợp đồng</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{contract.terms}</p>
                            </div>
                        )}
                        {(contract as any).notes && (
                            <div className="rounded-lg border bg-muted/30 p-4 space-y-2 md:col-span-2">
                                <h4 className="font-semibold text-sm text-foreground">Ghi chú hợp đồng</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{(contract as any).notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
