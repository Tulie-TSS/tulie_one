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

    // Get portal URL via linked project's quotation
    let portalUrl: string | null = null
    if (contract.project_id) {
        try {
            const supabase = await createClient()
            const { data: quotation } = await supabase
                .from('quotations')
                .select('public_token')
                .eq('project_id', contract.project_id)
                .limit(1)
                .maybeSingle()
            if (quotation?.public_token) {
                portalUrl = `/portal/${quotation.public_token}`
            }
        } catch {}
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80">
                        <Link href={backHref}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 rounded-md bg-primary/10 flex items-center justify-center">
                            <FileSignature className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="px-2 py-0.5 rounded-md border bg-muted font-medium h-6 flex items-center text-xs">
                                    {contract.contract_number}
                                </div>
                                <StatusBadge status={contract.status} entityType="contract" />
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight">{contract.customer?.company_name}</h1>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">

                    <SetPasswordDialog
                        entityId={contract.id}
                        tableName="contracts"
                        hasPassword={!!contract.password_hash}
                        hasFinancialPassword={!!contract.financial_password_hash}
                    />
                    <ContractEmailButton contract={contract} />
                    <Button variant="outline" asChild>
                        <Link href={`/contracts/${contract.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            Chỉnh sửa
                        </Link>
                    </Button>
                    {portalUrl && (
                        <Button variant="outline" asChild>
                            <a href={portalUrl} target="_blank" rel="noopener noreferrer">
                                <Globe className="h-4 w-4" />
                                Xem Portal
                            </a>
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-6 flex flex-col pb-12">
                {/* Contract Info merged card */}
                <Card>
                    <CardHeader className="border-b">
                        <CardTitle>Thông tin hợp đồng</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 grid gap-8 md:grid-cols-3">
                        {/* Khách hàng */}
                        <div>
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                Khách hàng
                            </h4>
                            <Link href={`/customers/${contract.customer?.id}`} className="font-medium hover:underline block">
                                {contract.customer?.company_name}
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1">{contract.customer?.email}</p>
                            <p className="text-sm text-muted-foreground">{contract.customer?.phone}</p>
                        </div>
                        {/* Thời gian */}
                        <div>
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                Thời gian
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Ngày ký</span>
                                    <span className="font-medium">{contract.signed_date ? formatDate(contract.signed_date) : 'Chưa ký'}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Bắt đầu</span>
                                    <span className="font-medium">{formatDate(contract.start_date)}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Kết thúc</span>
                                    <span className="font-medium">{contract.end_date ? formatDate(contract.end_date) : 'Không xác định'}</span>
                                </div>
                            </div>
                        </div>
                        {/* Thông tin khác */}
                        <div>
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                Thông tin khác
                            </h4>
                            <div className="space-y-3">
                                {contract.quotation && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Báo giá gốc</p>
                                        <Link href={`/quotations/${contract.quotation.id}`} className="font-medium hover:underline text-sm">
                                            {contract.quotation.quotation_number}
                                        </Link>
                                    </div>
                                )}
                                {contract.creator && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Người phụ trách</p>
                                        <p className="text-sm font-medium">{contract.creator.full_name}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Lifecycle Timeline */}
                <ContractLifecycle contract={contract} />

                {/* Payment Progress & Milestones merged */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thanh toán & Milestone</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Payment Progress */}
                        <div className="space-y-4 max-w-2xl">
                            <div className="flex justify-between font-semibold text-sm">
                                <span>Đã thanh toán: {formatCurrency(paidAmount)}</span>
                                <span>Tổng giá trị: {formatCurrency(contract.total_amount)}</span>
                            </div>
                            <Progress value={progress} className="h-3" />
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
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {contract.milestones?.map((milestone: any, index: number) => (
                                            <TableRow key={milestone.id}>
                                                <TableCell className="text-center">
                                                    {milestone.status === 'completed' ? (
                                                        <CheckCircle className="h-4 w-4 mx-auto text-emerald-600" />
                                                    ) : milestone.status === 'overdue' ? (
                                                        <AlertTriangle className="h-4 w-4 mx-auto text-destructive" />
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground font-medium">{index + 1}</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`font-medium text-sm ${milestone.status === 'completed' ? 'text-emerald-800' : ''}`}>
                                                            {milestone.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                            Hạn: {formatDate(milestone.due_date)}
                                                            {milestone.completed_at && (
                                                                <span className="text-emerald-600 font-medium">• Đã thanh toán {formatDate(milestone.completed_at)}</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className={`font-semibold tabular-nums text-sm ${milestone.status === 'completed' ? 'text-emerald-700' : ''}`}>
                                                        {milestone.amount ? formatCurrency(milestone.amount).replace(/\s*[₫đ]\s*$/g, '').trim() : '0'} <sup className="text-[10px] text-muted-foreground font-normal">đ</sup>
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {(!contract.milestones || contract.milestones.length === 0) && (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-6">
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
                    <CardHeader>
                        <CardTitle>Chi tiết & Điều khoản</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        {contract.description && (
                            <div>
                                <h4 className="font-medium text-sm mb-2">Mô tả dự án</h4>
                                <p className="text-sm text-muted-foreground">{contract.description}</p>
                            </div>
                        )}
                        {contract.terms && (
                            <div>
                                <h4 className="font-medium text-sm mb-2">Điều khoản hợp đồng</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-line">{contract.terms}</p>
                            </div>
                        )}
                        {(contract as any).notes && (
                            <div>
                                <h4 className="font-medium text-sm mb-2">Ghi chú hợp đồng</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-line">{(contract as any).notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
