'use client'

import { useState, useMemo, useCallback } from 'react'
import {
    Badge, Button,
    Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction, CardFooter,
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
    Tabs, TabsList, TabsTrigger, TabsContent,
    Separator,
    Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@repo/ui'
import {
    CheckCircle2, Clock, FileText, CheckCircle, Circle,
    ExternalLink, Package, ClipboardCheck, ListTodo,
    Wallet, CreditCard, FileSignature, Lock, BookOpen, Eye,
} from 'lucide-react'
import { getGeneratedDocumentById } from '@/lib/supabase/services/document-template-service'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { CustomerInfoForm, isCustomerInfoComplete } from '@/components/portal/customer-info-form'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ProjectGanttChart } from '@/components/projects/project-gantt-chart'
import { ProjectActivityHistory } from '@/components/projects/project-activity-history'
import { sanitizeHtml } from '@/lib/security/sanitize'
import { useConfirm } from '@repo/ui'
import { usePortalTracking } from '@/hooks/use-portal-tracking'
import { FeedbackBoard } from '@/components/portal/feedback-board'
import PortalPasswordForm from './password-form'

/* ===== Types ===== */

interface PortalContentProps {
    data: {
        quotation: any
        quotations: any[]
        contracts: any[]
        invoices: any[]
        tasks: any[]
        timeline: any[]
        customer: any
        project: any
        projectMetadata: any
        brandConfig: any
        workItems?: any[]
        activities?: any[]
    }
    token: string
    isFinancialAuthenticated?: boolean
    hasFinancialPassword?: boolean
    companyName?: string
}

/* ===== Status Map (semantic variants only) ===== */

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    'pending': { label: 'Chờ xử lý', variant: 'secondary' },
    'in_progress': { label: 'Đang thực hiện', variant: 'default' },
    'delivered': { label: 'Đã bàn giao', variant: 'default' },
    'accepted': { label: 'Đã nghiệm thu', variant: 'default' },
    'rejected': { label: 'Từ chối', variant: 'destructive' },
    'draft': { label: 'Nháp', variant: 'outline' },
    'sent': { label: 'Đã gửi', variant: 'secondary' },
    'viewed': { label: 'Đã xem', variant: 'secondary' },
    'active': { label: 'Đang triển khai', variant: 'default' },
    'completed': { label: 'Hoàn thành', variant: 'default' },
    'signed': { label: 'Đã ký', variant: 'default' },
    'paid': { label: 'Đã thanh toán', variant: 'default' },
    'todo': { label: 'Cần làm', variant: 'outline' },
    'blocked': { label: 'Bị chặn', variant: 'destructive' },
    'upcoming': { label: 'Sắp tới', variant: 'secondary' },
    'overdue': { label: 'Trễ hạn', variant: 'destructive' },
}

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_MAP[status] || { label: status, variant: 'outline' as const }
    return <Badge variant={s.variant}>{s.label}</Badge>
}

/* ===== Main Portal Content ===== */

export default function PortalContent({ data, token, isFinancialAuthenticated = false, hasFinancialPassword = false, companyName }: PortalContentProps) {
    const {
        quotations = [], contracts = [], invoices = [],
        timeline = [], customer, project, brandConfig,
        workItems = [], tasks = []
    } = data
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false)
    const [selectedDocContent, setSelectedDocContent] = useState<string | null>(null)
    const [isViewingDoc, setIsViewingDoc] = useState(false)

    const handleViewDoc = async (docId: string) => {
        trackInteraction('view_document', { docId })
        try {
            const doc = await getGeneratedDocumentById(docId)
            if (doc) {
                setSelectedDocContent(doc.content)
                setIsViewingDoc(true)
            }
        } catch (err) {
            toast.error('Không thể tải tài liệu')
        }
    }

    const handleViewContractDoc = (htmlContent: string) => {
        setSelectedDocContent(htmlContent)
        setIsViewingDoc(true)
    }

    const router = useRouter()
    const { confirm } = useConfirm()
    const { trackInteraction } = usePortalTracking({
        portalToken: token,
        projectId: project?.id,
        customerId: customer?.id
    })

    const displayItems = useMemo(() => {
        if (workItems.length > 0) return workItems
        return quotations.map((q: any) => ({
            id: q.id,
            title: q.title || `Báo giá #${q.quotation_number}`,
            status: q.status === 'accepted' ? 'in_progress' : 'pending',
            quotation: q,
            contract: contracts.find((c: any) => c.quotation_id === q.id) || null,
            delivery_links: [],
            required_documents: [],
            tasks: tasks.filter((t: any) => !t.work_item_id),
            total_amount: q.total_amount || 0,
        }))
    }, [workItems, quotations, contracts, tasks])

    const [selectedQuotationMap, setSelectedQuotationMap] = useState<Record<string, string>>(() => {
        const map: Record<string, string> = {}
        displayItems.forEach((item: any) => {
            if (item.quotation) map[item.id] = item.quotation.id
        })
        return map
    })

    const handleSelectQuotation = useCallback((workItemId: string, quotationId: string) => {
        setSelectedQuotationMap(prev => ({ ...prev, [workItemId]: quotationId }))
    }, [])

    const getQuotationOptionsForItem = useCallback((item: any): any[] => {
        if (item.metadata?.quotation_ids?.length) {
            return item.metadata.quotation_ids
                .map((qId: string) => quotations.find((q: any) => q.id === qId))
                .filter(Boolean)
        }
        if (!item.quotation_id && !item.quotation) return []
        const itemQuotation = item.quotation || quotations.find((q: any) => q.id === item.quotation_id)
        if (!itemQuotation) return []
        return [itemQuotation]
    }, [quotations])

    const totalInvestment = useMemo(() => {
        if (quotations.length <= 1) {
            return quotations.reduce((sum: number, q: any) => sum + (q.total_amount || 0), 0)
        }
        const selectedIds = new Set(Object.values(selectedQuotationMap))
        if (selectedIds.size === 0) return quotations.length > 0 ? (quotations[0].total_amount || 0) : 0
        return quotations
            .filter((q: any) => selectedIds.has(q.id))
            .reduce((sum: number, q: any) => sum + (q.total_amount || 0), 0)
    }, [quotations, selectedQuotationMap])

    const totalPaid = timeline.filter((t: any) => t.status === 'completed').reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
    const balanceDue = totalInvestment - totalPaid
    const completedItems = workItems.filter((w: any) => w.status === 'accepted').length
    const projectProgress = workItems.length > 0
        ? Math.round((completedItems / workItems.length) * 100)
        : (timeline.length > 0
            ? Math.round((timeline.filter((t: any) => t.status === 'completed').length / timeline.length) * 100)
            : 0)

    const hasContracts = contracts.length > 0
    const displayName = companyName || customer?.company_name || customer?.full_name || 'Khách hàng'

    /* ===== Sidebar nav items ===== */
    const navItems = [
        { value: 'overview', label: 'Tổng quan dự án', icon: ListTodo },
        { value: 'gantt', label: 'Lộ trình triển khai', icon: Clock },
        { value: 'feedback', label: 'Nhật ký xử lý', icon: ClipboardCheck },
    ]

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            {/* ===== Header — clean shadcn nav bar ===== */}
            <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-3 flex-1">
                    <img
                        src={brandConfig?.logo_url || "/file/tulie-agency-logo.png"}
                        alt="Logo"
                        className="h-7 w-auto object-contain"
                    />
                    <Separator orientation="vertical" className="h-5" />
                    <span className="text-sm font-medium text-foreground">Customer Portal</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="hidden md:inline text-sm font-medium text-foreground">{displayName}</span>
                    <Badge variant={hasContracts ? 'default' : 'secondary'}>
                        {project?.status === 'in_progress' ? 'Đang thực hiện' 
                            : project?.status === 'review' ? 'Đang nghiệm thu'
                            : project?.status === 'completed' ? 'Đã hoàn thành'
                            : 'Chờ triển khai'}
                    </Badge>
                    {hasFinancialPassword && !isFinancialAuthenticated && (
                        <Dialog open={isUnlockModalOpen} onOpenChange={setIsUnlockModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Lock className="w-3.5 h-3.5" />
                                    Mở khóa tài chính
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <PortalPasswordForm token={token} companyName={companyName} isModal={true} type="financial" />
                            </DialogContent>
                        </Dialog>
                    )}
                    {isFinancialAuthenticated && hasFinancialPassword && (
                        <Badge variant="outline">
                            <Lock className="w-3 h-3" />
                            Đã mở khóa
                        </Badge>
                    )}
                </div>
            </header>

            {/* ===== Main Layout ===== */}
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                <Tabs
                    orientation="vertical"
                    defaultValue="overview"
                    className="mx-auto grid w-full max-w-7xl gap-6 md:grid-cols-[200px_1fr] lg:grid-cols-[220px_1fr]"
                >
                    {/* ===== Sidebar nav ===== */}
                    <nav className="flex flex-col gap-1 sticky top-[72px] h-fit">
                        <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-0.5">
                            {navItems.map(item => (
                                <TabsTrigger
                                    key={item.value}
                                    value={item.value}
                                    className="w-full justify-start gap-2 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-foreground !shadow-none data-[state=active]:ring-0"
                                >
                                    <item.icon className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{item.label}</span>
                                </TabsTrigger>
                            ))}
                            {isFinancialAuthenticated && (
                                <>
                                    <Separator className="my-2" />
                                    <TabsTrigger
                                        value="finance"
                                        className="w-full justify-start gap-2 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-foreground !shadow-none data-[state=active]:ring-0"
                                    >
                                        <Wallet className="w-4 h-4 shrink-0" />
                                        <span className="truncate">Tài chính & Pháp lý</span>
                                    </TabsTrigger>
                                </>
                            )}
                        </TabsList>

                        {/* Customer info incomplete CTA */}
                        {!isCustomerInfoComplete(customer) && (
                            <Card className="mt-4">
                                <CardHeader>
                                    <CardTitle>Hồ sơ chưa hoàn thiện</CardTitle>
                                    <CardDescription>Cập nhật thông tin xuất hóa đơn.</CardDescription>
                                </CardHeader>
                                <CardFooter>
                                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="w-full">Cập nhật ngay</Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[700px]">
                                            <DialogHeader>
                                                <DialogTitle>Cập nhật hồ sơ khách hàng</DialogTitle>
                                            </DialogHeader>
                                            <CustomerInfoForm
                                                customer={customer}
                                                token={token}
                                                onComplete={() => { setIsDialogOpen(false); router.refresh(); toast.success('Đã cập nhật!') }}
                                                onDraftSave={() => { setIsDialogOpen(false); router.refresh() }}
                                            />
                                        </DialogContent>
                                    </Dialog>
                                </CardFooter>
                            </Card>
                        )}
                    </nav>

                    {/* ===== Tab Content ===== */}
                    <div className="min-w-0 space-y-6">

                        {/* Tab: Overview */}
                        <TabsContent value="overview" className="mt-0 space-y-4">
                            {project?.description && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Mô tả dự án</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{project.description}</p>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-medium">Hạng mục công việc</h2>
                                <Badge variant="secondary">{completedItems}/{displayItems.length} hoàn thành</Badge>
                            </div>

                            <div className="grid gap-3">
                                {displayItems.length > 0 ? displayItems.map((item: any, idx: number) => (
                                    <WorkItemCard key={item.id} item={item} idx={idx} />
                                )) : (
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                            <Package className="w-8 h-8 text-muted-foreground/40 mb-3" />
                                            <p className="text-sm text-muted-foreground">Chưa có hạng mục công việc nào.</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </TabsContent>

                        {/* Tab: Gantt & Timeline */}
                        <TabsContent value="gantt" className="mt-0 space-y-4">
                            <ProjectGanttChart tasks={data.tasks || []} />
                            <TimelineSection timeline={timeline} />
                        </TabsContent>

                        {/* Tab: Feedback & History */}
                        <TabsContent value="feedback" className="mt-0 space-y-4">
                            {project?.id && (
                                <FeedbackBoard
                                    projectId={project.id}
                                    customerId={customer?.id}
                                    customerName={displayName}
                                    isAdmin={isFinancialAuthenticated}
                                />
                            )}
                            <ProjectActivityHistory projectId={project?.id} activities={data.activities} />
                        </TabsContent>

                        {/* Tab: Finance (protected) */}
                        {isFinancialAuthenticated && (
                            <TabsContent value="finance" className="mt-0 space-y-6">
                                {/* Finance stat grid — shadcn dashboard-01 */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
                                    {[
                                        { label: 'Tổng đầu tư', value: totalInvestment },
                                        { label: 'Đã thanh toán', value: totalPaid },
                                        { label: 'Còn lại', value: balanceDue },
                                        { label: 'Tiến độ', value: `${projectProgress}%` },
                                    ].map((stat, i) => (
                                        <Card key={i} className="@container/card">
                                            <CardHeader>
                                                <CardDescription>{stat.label}</CardDescription>
                                                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                                    {typeof stat.value === 'number' ? formatCurrency(stat.value).replace(/\s*[₫đ]\s*$/g, '').trim() : stat.value}
                                                </CardTitle>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>

                                {/* Financial cards per item */}
                                <div className="grid gap-4">
                                    {displayItems.map((item: any, idx: number) => (
                                        <FinancialItemCard
                                            key={item.id}
                                            item={item}
                                            idx={idx}
                                            token={token}
                                            quotationOptions={getQuotationOptionsForItem(item)}
                                            selectedQuotationId={selectedQuotationMap[item.id]}
                                            onSelectQuotation={(qId: string) => handleSelectQuotation(item.id, qId)}
                                            timeline={timeline}
                                            contracts={contracts}
                                            onViewContractDoc={handleViewContractDoc}
                                            onViewDoc={handleViewDoc}
                                        />
                                    ))}
                                </div>
                                <div className="mt-6">
                                    <TimelineSection timeline={timeline} />
                                </div>
                            </TabsContent>
                        )}
                    </div>
                </Tabs>

                {/* Document Viewer Dialog */}
                <Dialog open={isViewingDoc} onOpenChange={setIsViewingDoc}>
                    <DialogContent className="max-w-5xl h-[90vh] p-0 flex flex-col" showCloseButton={true}>
                        <div className="px-4 py-4 flex-1 overflow-auto bg-muted/40 flex items-center justify-center">
                            <div
                                className="bg-white shadow-xl ring-1 ring-foreground/10 text-black mx-auto relative rounded-md my-4 p-12"
                                style={{ width: '210mm', minHeight: '297mm' }}
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedDocContent || '') }}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    )
}

/* ================================================================
   WorkItemCard — Overview Tab
   ================================================================ */

function WorkItemCard({ item, idx }: { item: any; idx: number }) {
    const deliveryLinks = item.delivery_links || []
    const itemTasks = item.tasks || []
    const completedTasks = itemTasks.filter((t: any) => t.status === 'completed').length
    const totalTasks = itemTasks.length

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span className="text-muted-foreground font-mono text-xs tabular-nums">{idx + 1}.</span>
                    {item.title}
                </CardTitle>
                {item.description && <CardDescription className="line-clamp-1">{item.description}</CardDescription>}
                <CardAction>
                    <div className="flex items-center gap-2">
                        <StatusBadge status={item.status} />
                        {deliveryLinks.length > 0 && deliveryLinks.map((link: any, lIdx: number) => (
                            <a key={lIdx} href={link.url} target="_blank" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
                                {link.label} <ExternalLink className="w-3 h-3" />
                            </a>
                        ))}
                    </div>
                </CardAction>
            </CardHeader>
            <CardContent className="p-0">
                {totalTasks > 0 ? (
                    <div className="divide-y">
                        {itemTasks.map((task: any) => (
                            <div key={task.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors">
                                {task.status === 'completed' ? (
                                    <CheckCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                                ) : task.status === 'in_progress' ? (
                                    <Clock className="w-4 h-4 text-primary shrink-0" />
                                ) : (
                                    <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                                )}
                                <span className={cn(
                                    "text-sm",
                                    task.status === 'completed' && "text-muted-foreground line-through"
                                )}>
                                    {task.title}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                        Chưa có đầu việc chi tiết.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

/* ================================================================
   FinancialItemCard — Finance Tab
   ================================================================ */

function FinancialItemCard({ item, idx, token, quotationOptions = [], selectedQuotationId, onSelectQuotation, timeline = [], contracts = [], onViewContractDoc, onViewDoc }: any) {
    const quotation = item.quotation
    const contract = item.contract
    const activeQuotation = quotationOptions.length > 1
        ? quotationOptions.find((q: any) => q.id === selectedQuotationId) || quotation
        : quotation
    const activeAmount = activeQuotation?.total_amount || item.total_amount || 0
    const contractId = contract?.id
    const itemMilestones = contractId ? timeline.filter((t: any) => t.contract_id === contractId && (t.type === 'work' || t.type === 'payment')) : []

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span className="text-muted-foreground font-mono text-xs tabular-nums">{idx + 1}.</span>
                    {item.title}
                </CardTitle>
                <CardAction>
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-semibold tabular-nums">{formatCurrency(activeAmount).replace(/\s*[₫đ]\s*$/g, '').trim()}</span>
                        <span className="text-xs text-muted-foreground">đ</span>
                    </div>
                </CardAction>
            </CardHeader>

            {/* Quotation selector (multi-option) */}
            {quotationOptions.length > 1 && (
                <CardContent className="border-t bg-muted/30 py-3">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-muted-foreground">Phương án:</span>
                        <div className="flex gap-2">
                            {quotationOptions.map((q: any, qIdx: number) => {
                                const isActive = q.id === (selectedQuotationId || quotation?.id)
                                return (
                                    <Badge
                                        key={q.id}
                                        variant={isActive ? "default" : "outline"}
                                        onClick={() => onSelectQuotation?.(q.id)}
                                        className="cursor-pointer"
                                    >
                                        {q.status === 'accepted' ? 'Đã Chọn' : `PA ${qIdx + 1}`} — {formatCurrency(q.total_amount).replace(/\s*[₫đ]\s*$/g, '').trim()}
                                    </Badge>
                                )
                            })}
                        </div>
                    </div>
                </CardContent>
            )}

            <CardContent>
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Legal docs */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                            <FileSignature className="w-4 h-4 text-muted-foreground" /> Pháp lý & Chứng từ
                        </h4>
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tài liệu</TableHead>
                                        <TableHead className="w-24">Trạng thái</TableHead>
                                        <TableHead className="w-20 text-right">Xem</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(() => {
                                        const DOC_TYPE_MAP: Record<string, string> = {
                                            'contract': 'Hợp đồng',
                                            'payment_request': 'Đề nghị thanh toán',
                                            'acceptance': 'Biên bản nghiệm thu',
                                            'appendix': 'Phụ lục',
                                            'addendum': 'Phụ lục bổ sung',
                                            'invoice': 'Hóa đơn',
                                            'receipt': 'Biên nhận',
                                        }
                                        const STATUS_PRIORITY: Record<string, number> = {
                                            'signed': 4, 'active': 4, 'completed': 4,
                                            'sent': 3, 'viewed': 3,
                                            'pending': 2,
                                            'draft': 1,
                                        }
                                        const renderedDocs: any[] = []
                                        if (activeQuotation && ['sent', 'viewed', 'accepted', 'converted'].includes(activeQuotation.status)) {
                                            renderedDocs.push({ title: 'Báo giá', number: activeQuotation.quotation_number, status: activeQuotation.status, link: `/quote/${activeQuotation.public_token || token}` })
                                        }
                                        if (contract) {
                                            const visibleDocs = (contract.documents || []).filter((d: any) => d.is_visible_on_portal !== false)
                                            // Dedup by doc_number — keep the version with the highest status priority
                                            const docByNumber = new Map<string, any>()
                                            visibleDocs.forEach((d: any) => {
                                                const key = d.doc_number || d.id
                                                const existing = docByNumber.get(key)
                                                const currentPriority = STATUS_PRIORITY[d.status] || 0
                                                const existingPriority = existing ? (STATUS_PRIORITY[existing.status] || 0) : -1
                                                if (currentPriority > existingPriority) {
                                                    docByNumber.set(key, d)
                                                }
                                            })
                                            Array.from(docByNumber.values()).forEach((d: any) => renderedDocs.push({
                                                title: DOC_TYPE_MAP[d.type] || d.type, number: d.doc_number || '', status: d.status, docId: d.id, content: d.content
                                            }))
                                        }

                                        if (renderedDocs.length === 0) return <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">Chưa có chứng từ</TableCell></TableRow>

                                        return renderedDocs.map((d, i) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    <div className="text-sm font-medium">{d.title}</div>
                                                    <div className="text-xs text-muted-foreground">#{d.number || '---'}</div>
                                                </TableCell>
                                                <TableCell><StatusBadge status={d.status} /></TableCell>
                                                <TableCell className="text-right">
                                                    {d.link ? (
                                                        <Button variant="outline" size="sm" asChild><a href={d.link} target="_blank">Xem</a></Button>
                                                    ) : d.docId ? (
                                                        <Button variant="outline" size="sm" onClick={() => d.content ? onViewContractDoc?.(d.content) : onViewDoc?.(d.docId)}>
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </Button>
                                                    ) : null}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    })()}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Payment schedule */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-muted-foreground" /> Kế hoạch thanh toán
                        </h4>
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10 text-center">TT</TableHead>
                                        <TableHead>Giai đoạn</TableHead>
                                        <TableHead className="w-28 text-right">Số tiền</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {itemMilestones.length > 0 ? itemMilestones.map((m: any, mIdx: number) => (
                                        <TableRow key={m.id}>
                                            <TableCell className="text-center">
                                                {m.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-muted-foreground mx-auto" /> : <span className="text-xs text-muted-foreground tabular-nums">{mIdx + 1}</span>}
                                            </TableCell>
                                            <TableCell>
                                                <div className={cn("text-sm font-medium", m.status === 'completed' && "text-muted-foreground line-through")}>{m.title}</div>
                                                <div className="text-xs text-muted-foreground">Hạn: {formatDate(m.date)}</div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {m.amount > 0 ? <span className="text-sm font-medium tabular-nums">{formatCurrency(m.amount).replace(/\s*[₫đ]\s*$/g, '').trim()}đ</span> : '—'}
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">Chưa có kế hoạch thanh toán</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

/* ================================================================
   TimelineSection — Events timeline
   ================================================================ */

function TimelineSection({ timeline }: { timeline: any[] }) {
    if (timeline.length === 0) return null

    return (
        <Card>
            <CardHeader>
                <CardTitle>Vòng đời dự án</CardTitle>
                <CardDescription>Các thao tác hệ thống ghi nhận từ khi khởi tạo tới lúc kết thúc dự án</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {timeline.map((event, i) => (
                        <div key={event.id} className="flex gap-3 text-sm">
                            <div className="mt-1 flex flex-col items-center">
                                <div className={cn(
                                    "h-2 w-2 rounded-full",
                                    event.status === 'completed' ? "bg-primary" : "bg-muted-foreground/30"
                                )} />
                                {i !== timeline.length - 1 && (
                                    <div className="w-px flex-1 bg-border mt-1" />
                                )}
                            </div>
                            <div className="flex-1 pb-4">
                                <div className="flex items-center justify-between gap-4">
                                    <p className={cn(
                                        "font-medium leading-none",
                                        event.status === 'completed' ? "text-foreground" : "text-muted-foreground"
                                    )}>{event.title}</p>
                                    <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                                        {formatDate(event.date)}
                                    </span>
                                </div>
                                {event.description && (
                                    <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
