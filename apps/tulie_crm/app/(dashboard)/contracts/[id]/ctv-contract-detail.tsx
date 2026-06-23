import Link from 'next/link'
import { Button, Card, CardContent, CardHeader, CardTitle, Separator, Progress, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui'
import { ArrowLeft, Edit, Calendar, User, CheckCircle, AlertTriangle, FileSignature, Globe, CreditCard } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { ContractEmailButton } from '@/components/contracts/contract-email-button'
import { SetPasswordDialog } from '@/components/shared/set-password-dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import { CtvLinkButton } from '@/components/contracts/ctv-link-button'
import { MilestoneConfirmButton } from '@/components/contracts/milestone-confirm-button'
import { ContractDocuments } from '@/components/contracts/contract-documents'
import { ContractResetButton } from '@/components/contracts/contract-reset-button'
export function CtvContractDetail({ contract, backHref, progress, paidAmount }: any) {
    const fMeta = contract.freelancer_metadata || {}
    // For CTV, we might not use portalUrl as public_token points to /ctv/[token] instead of /portal/[token]
    const portalUrl = contract.public_token ? `/ctv/${contract.public_token}` : null

    return (
        <div className="space-y-6 pb-12">
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
                            <h1 className="text-2xl font-semibold tracking-tight">{contract.title}</h1>
                            <div className="px-2.5 py-0.5 rounded-md border bg-muted/50 font-medium text-xs flex items-center">
                                {contract.contract_number}
                            </div>
                            <StatusBadge status={contract.status} entityType="contract" />
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <FileSignature className="h-4 w-4" />
                            Chi tiết Hợp đồng Cộng tác viên
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
                    {contract.public_token && (
                        <CtvLinkButton publicToken={contract.public_token} />
                    )}
                    <ContractResetButton contractId={contract.id} />
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/contracts/${contract.id}/edit?from=/contracts/ctv`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                        </Link>
                    </Button>
                    {portalUrl && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={portalUrl} target="_blank" rel="noopener noreferrer">
                                <Globe className="h-4 w-4 mr-2" />
                                Mở Form CTV
                            </a>
                        </Button>
                    )}
                </div>
            </div>

            {/* Information Cards */}
            <Card>
                <CardHeader className="border-b bg-muted/20 pb-4">
                    <CardTitle className="text-base text-foreground">Thông tin CTV & Hợp đồng</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3 pt-6">
                    {/* CTV Info */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                            <User className="w-4 h-4 text-muted-foreground" />
                            Thông tin Cá nhân
                        </h4>
                        <div className="space-y-2.5 text-sm">
                            <div className="flex justify-between items-start gap-4 border-b pb-2.5">
                                <span className="text-muted-foreground shrink-0 mt-0.5">Họ tên</span>
                                <span className="font-medium text-right leading-tight break-words max-w-[200px]">
                                    {fMeta.name || <span className="text-muted-foreground italic">Chưa điền</span>}
                                </span>
                            </div>
                            <div className="flex justify-between items-center gap-4 border-b pb-2.5">
                                <span className="text-muted-foreground shrink-0">CCCD</span>
                                <span className="font-medium text-right truncate">{fMeta.cccd || '—'}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4 border-b pb-2.5">
                                <span className="text-muted-foreground shrink-0">SĐT</span>
                                <span className="font-medium text-right">{fMeta.phone || '—'}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-muted-foreground shrink-0">Email</span>
                                <span className="font-medium text-right">{fMeta.email || '—'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bank Info */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                            Thông tin Thanh toán
                        </h4>
                        <div className="space-y-2.5 text-sm">
                            <div className="flex items-center justify-between gap-4 border-b pb-2.5">
                                <span className="text-muted-foreground">Ngân hàng</span>
                                <span className="font-medium">{fMeta.bank_name || '—'}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-b pb-2.5">
                                <span className="text-muted-foreground">Số TK</span>
                                <span className="font-medium">{fMeta.bank_account || '—'}</span>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                                <span className="text-muted-foreground shrink-0">Địa chỉ</span>
                                <span className="font-medium text-right line-clamp-2">{fMeta.address || '—'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Time */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            Thời gian
                        </h4>
                        <div className="space-y-2.5 text-sm">
                            <div className="flex items-center justify-between gap-4 border-b pb-2.5">
                                <span className="text-muted-foreground">Ngày tạo</span>
                                <span className="font-medium">{formatDate(contract.created_at)}</span>
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
                </CardContent>
            </Card>

            {/* Payment Progress & Milestones */}
            <Card>
                <CardHeader className="border-b bg-muted/20">
                    <CardTitle className="text-base">Thanh toán & Milestone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                    <div className="space-y-4">
                        <div className="flex justify-between font-semibold text-sm">
                            <span>Đã thanh toán: {formatCurrency(paidAmount)}</span>
                            <span>Tổng giá trị: {formatCurrency(contract.total_amount)}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-center text-sm text-muted-foreground font-medium">
                            {progress.toFixed(0)}% hoàn thành
                            <span className="ml-2 text-xs">(Sau thuế TNCN 10%: {formatCurrency(contract.total_amount * 0.9)})</span>
                        </p>
                    </div>
                    
                    <Separator />

                    {/* Milestones - Separated into Payment and Work */}
                    <div className="space-y-8 pt-2">
                        {/* Payment Milestones */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                                    Các đợt thanh toán ({contract.milestones?.filter((m: any) => (m.type === 'payment' || !m.type) && m.amount > 0).length || 0})
                                </h4>
                            </div>
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="w-[60px] text-center">TT</TableHead>
                                            <TableHead>Giai đoạn</TableHead>
                                            <TableHead className="text-right">Số tiền</TableHead>
                                            <TableHead className="text-right">Thực nhận (Sau thuế)</TableHead>
                                            <TableHead className="w-[140px] text-center">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {contract.milestones?.filter((m: any) => (m.type === 'payment' || !m.type) && m.amount > 0).map((milestone: any, index: number) => (
                                            <TableRow key={milestone.id}>
                                                <TableCell className="text-center font-medium text-xs text-muted-foreground">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-sm text-foreground">
                                                                {milestone.name || milestone.label}
                                                            </span>
                                                            {milestone.status === 'completed' && (
                                                                <CheckCircle className="h-3.5 w-3.5 text-foreground" />
                                                            )}
                                                        </div>
                                                        {milestone.due_date && (
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                Hạn: {formatDate(milestone.due_date)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-sm tabular-nums">
                                                    {formatCurrency(milestone.amount)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-sm text-foreground tabular-nums">
                                                    {formatCurrency(milestone.amount * 0.9)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <MilestoneConfirmButton 
                                                        milestoneId={milestone.id}
                                                        milestoneName={milestone.name || milestone.label}
                                                        amount={milestone.amount}
                                                        status={milestone.status}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {(!contract.milestones || contract.milestones.filter((m: any) => (m.type === 'payment' || !m.type) && m.amount > 0).length === 0) && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8 text-sm">
                                                    Chưa có đợt thanh toán nào
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Work Milestones */}
                        {contract.milestones?.some((m: any) => m.type === 'work' || m.type === 'delivery' || m.amount === 0) && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                        <CheckCircle className="w-4 h-4 text-muted-foreground" />
                                        Tiến độ công việc ({contract.milestones?.filter((m: any) => m.type === 'work' || m.type === 'delivery' || m.amount === 0).length || 0})
                                    </h4>
                                </div>
                                <div className="rounded-md border overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead className="w-[60px] text-center">STT</TableHead>
                                                <TableHead>Nội dung công việc</TableHead>
                                                <TableHead className="w-[180px]">Hạn hoàn thành</TableHead>
                                                <TableHead className="w-[120px] text-center">Trạng thái</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {contract.milestones?.filter((m: any) => m.type === 'work' || m.type === 'delivery' || m.amount === 0).map((milestone: any, index: number) => (
                                                <TableRow key={milestone.id}>
                                                    <TableCell className="text-center font-medium text-xs text-muted-foreground">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-medium text-sm text-foreground">
                                                                {milestone.name || milestone.label}
                                                            </span>
                                                            {milestone.type === 'delivery' && (
                                                                <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded w-fit dark:bg-zinc-800 dark:text-zinc-300">Bàn giao</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-xs space-y-1">
                                                            <div className="text-muted-foreground italic">Dự kiến: {formatDate(milestone.due_date)}</div>
                                                            {milestone.completed_at && (
                                                                <div className="text-primary font-medium flex items-center gap-1">
                                                                    Thực tế: {formatDate(milestone.completed_at)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
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

            <ContractDocuments contract={contract} />
        </div>
    )
}
