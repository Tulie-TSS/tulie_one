'use client'

import { useState, useMemo, useCallback } from 'react'
import { Badge, Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Tabs, TabsList, TabsTrigger, TabsContent, Separator, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@repo/ui'
import { CheckCircle2, Clock, FileText, Building2, FileSignature, ExternalLink, ChevronRight, Package, Link2, ClipboardCheck, ListTodo, AlertCircle, Circle, CheckCircle, ArrowRight, Wallet, CreditCard, Banknote, Activity, FileCheck, Check, BookOpen, Eye, Receipt, Lock, Menu } from 'lucide-react'
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
    const s = STATUS_MAP[status] || { label: status, variant: 'outline' }
    return (
        <Badge variant={s.variant} className="whitespace-nowrap px-2 py-0.5 text-[11px] font-semibold">
            {s.label}
        </Badge>
    )
}

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

    const totalPaid = invoices.filter((inv: any) => inv.status === 'paid').reduce((sum: any, inv: any) => sum + (inv.total_amount || 0), 0)
    const balanceDue = totalInvestment - totalPaid
    const completedItems = workItems.filter((w: any) => w.status === 'accepted').length
    const projectProgress = workItems.length > 0
        ? Math.round((completedItems / workItems.length) * 100)
        : (timeline.length > 0
            ? Math.round((timeline.filter((t: any) => t.status === 'completed').length / timeline.length) * 100)
            : 0)

    const hasContracts = contracts.length > 0
    const projectStatusLabel = hasContracts ? "Đang triển khai" : "Chờ triển khai"
    const displayName = companyName || customer?.company_name || customer?.full_name || 'Khách hàng'

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40 font-sans">
            {/* Standard Shadcn Top Navigation Header */}
            <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-8 shadow-sm">
                <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 flex-1">
                    <div className="flex items-center gap-4">
                        <img
                            src={brandConfig?.logo_url || "/file/tulie-agency-logo.png"}
                            alt="Logo"
                            className="h-8 w-auto object-contain grayscale"
                        />
                        <Separator orientation="vertical" className="h-6" />
                        <h1 className="text-base font-semibold text-foreground ml-2">Customer Portal</h1>
                    </div>
                </nav>
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-semibold">{displayName}</span>
                        <div className="flex items-center gap-2">
                             <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", hasContracts ? "bg-emerald-500" : "bg-muted-foreground")} />
                             <span className="text-[11px] text-muted-foreground font-medium">{projectStatusLabel}</span>
                        </div>
                    </div>
                    {/* Unlock Logic mapped to standard secondary Button/Dialog */}
                    {hasFinancialPassword && !isFinancialAuthenticated && (
                        <Dialog open={isUnlockModalOpen} onOpenChange={setIsUnlockModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="secondary" size="sm" className="h-8 gap-2 font-medium">
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Bộ chứng từ</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <PortalPasswordForm token={token} companyName={companyName} isModal={true} type="financial" />
                            </DialogContent>
                        </Dialog>
                    )}
                    {isFinancialAuthenticated && hasFinancialPassword && (
                        <Badge variant="outline" className="h-8 gap-1.5 px-3 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                            <Lock className="w-3.5 h-3.5 opacity-70" />
                            Đã mở khóa
                        </Badge>
                    )}
                </div>
            </header>

            {/* Dashboard Main Content Area */}
            <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8 md:pt-10">
                <Tabs orientation="vertical" defaultValue="overview" className="mx-auto grid w-full max-w-7xl items-start gap-6 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]">
                    
                    {/* Sidebar Navigation (TabsList) */}
                        <nav className="flex flex-col gap-2 sticky top-[88px] h-[calc(100vh-100px)] overflow-y-auto">
                            <TabsList className="flex flex-col h-auto w-full items-start bg-transparent p-0 gap-1">
                                <TabsTrigger 
                                    value="overview" 
                                    className="w-full justify-start gap-2 h-9 px-3 text-left bg-transparent hover:bg-muted data-[state=active]:bg-muted data-[state=active]:font-semibold data-[state=active]:shadow-none border-none text-muted-foreground data-[state=active]:text-foreground"
                                >
                                    <ListTodo className="w-4 h-4 shrink-0" /> Tổng quan dự án
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="gantt" 
                                    className="w-full justify-start gap-2 h-9 px-3 text-left bg-transparent hover:bg-muted data-[state=active]:bg-muted data-[state=active]:font-semibold data-[state=active]:shadow-none border-none text-muted-foreground data-[state=active]:text-foreground"
                                >
                                    <Clock className="w-4 h-4 shrink-0" /> Lộ trình & Lịch trình
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="feedback" 
                                    className="w-full justify-start gap-2 h-9 px-3 text-left bg-transparent hover:bg-muted data-[state=active]:bg-muted data-[state=active]:font-semibold data-[state=active]:shadow-none border-none text-muted-foreground data-[state=active]:text-foreground"
                                >
                                    <ClipboardCheck className="w-4 h-4 shrink-0" /> Nhật ký xử lý
                                </TabsTrigger>
                                {isFinancialAuthenticated && (
                                    <>
                                        <Separator className="my-2" />
                                        <TabsTrigger 
                                            value="finance" 
                                            className="w-full justify-start gap-2 h-9 px-3 text-left bg-transparent hover:bg-muted data-[state=active]:bg-muted data-[state=active]:font-semibold data-[state=active]:shadow-none border-none text-muted-foreground data-[state=active]:text-foreground"
                                        >
                                            <Wallet className="w-4 h-4 shrink-0" /> Báo giá & Pháp lý
                                        </TabsTrigger>
                                    </>
                                )}
                            </TabsList>
                            
                            {/* Update Info CTA - Sidebar Widget */}
                            {!isCustomerInfoComplete(customer) && (
                                <Card className="mt-6 bg-primary text-primary-foreground border-none shadow-md overflow-hidden relative">
                                    <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                                    <CardHeader className="p-4 relativ z-10">
                                        <CardTitle className="text-sm">Hồ sơ chưa hoàn thiện</CardTitle>
                                        <CardDescription className="text-xs text-primary-foreground/70 mt-1">Cập nhật thông tin xuất hóa đơn tại đây.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 relative z-10">
                                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="secondary" className="w-full text-xs h-8">Cập nhật ngay</Button>
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
                                    </CardContent>
                                </Card>
                            )}
                        </nav>

                        {/* Main Tab Contents */}
                        <div className="grid gap-6">
                            {/* Tab 1: Công việc */}
                            <TabsContent value="overview" className="space-y-6 mt-0">
                                {project?.description && (
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base flex items-center gap-2"><BookOpen className="w-4 h-4 opacity-50"/> Mô tả dự án</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{project.description}</p>
                                        </CardContent>
                                    </Card>
                                )}

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-semibold">Hạng mục & Công việc</h2>
                                        <Badge variant="secondary" className="font-normal">{completedItems}/{displayItems.length} hoàn thành</Badge>
                                    </div>
                                    <div className="grid gap-4">
                                        {displayItems.length > 0 ? displayItems.map((item: any, idx: number) => (
                                            <WorkItemCard key={item.id} item={item} idx={idx} />
                                        )) : (
                                            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-lg bg-background">
                                                <Package className="w-10 h-10 text-muted-foreground/30 mb-4" />
                                                <p className="text-sm text-muted-foreground font-medium">Chưa có hạng mục công việc nào.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Tab 2: Gantt & Timeline */}
                            <TabsContent value="gantt" className="space-y-6 mt-0">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold">Kế hoạch triển khai</h2>
                                </div>
                                <ProjectGanttChart tasks={data.tasks || []} />
                                <TimelineSection timeline={timeline} />
                            </TabsContent>

                            {/* Tab 3: Feedback & History */}
                            <TabsContent value="feedback" className="space-y-6 mt-0">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold">Kênh giao tiếp & Phản hồi</h2>
                                </div>
                                {project?.id && (
                                    <FeedbackBoard
                                        projectId={project.id}
                                        customerId={customer?.id}
                                        customerName={displayName}
                                        isAdmin={isFinancialAuthenticated}
                                    />
                                )}
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold mb-4">Lịch sử hoạt động</h3>
                                    <ProjectActivityHistory projectId={project?.id} activities={data.activities} />
                                </div>
                            </TabsContent>

                            {/* Tab 4: Finance (Protected) */}
                            {isFinancialAuthenticated && (
                                <TabsContent value="finance" className="space-y-6 mt-0">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-semibold">Tài chính & Pháp lý</h2>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Tổng đầu tư', value: totalInvestment, icon: Wallet },
                                            { label: 'Đã thanh toán', value: totalPaid, icon: CreditCard },
                                            { label: 'Còn lại', value: balanceDue, icon: Banknote },
                                            { label: 'Tiến độ', value: `${projectProgress}%`, icon: Activity },
                                        ].map((stat, i) => (
                                            <Card key={i}>
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase">{stat.label}</CardTitle>
                                                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">
                                                        {typeof stat.value === 'number' ? formatCurrency(stat.value).replace(/\s*[₫đ]\s*$/g, '').trim() : stat.value}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                    <div className="grid gap-6 mt-6">
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
                                </TabsContent>
                            )}
                        </div>
                    </Tabs>

                {/* Document Viewer Dialog */}
                <Dialog open={isViewingDoc} onOpenChange={setIsViewingDoc}>
                    <DialogContent className="max-w-5xl h-[90vh] p-0 flex flex-col bg-muted/20" showCloseButton={true}>
                        <div className="px-6 py-4 flex-1 overflow-auto bg-background/50 flex align-center justify-center">
                            <div
                                className="bg-white shadow-xl border border-border text-black mx-auto relative rounded-sm my-6 p-12"
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

/* ===== Work Item Card (Overview Tab) ===== */
function WorkItemCard({ item, idx }: { item: any; idx: number }) {
    const deliveryLinks = item.delivery_links || []
    const itemTasks = item.tasks || []
    const completedTasks = itemTasks.filter((t: any) => t.status === 'completed').length
    const totalTasks = itemTasks.length

    return (
        <Card className="overflow-hidden p-0">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 border-b pt-4 px-6">
                <div className="flex gap-4 items-start">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-background text-xs font-semibold shrink-0">
                        {idx + 1}
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{item.title}</CardTitle>
                            <StatusBadge status={item.status} />
                        </div>
                        {item.description && <CardDescription className="max-w-xl">{item.description}</CardDescription>}
                    </div>
                </div>
                {deliveryLinks.length > 0 && (
                     <div className="flex flex-col gap-2 shrink-0 text-right">
                         <span className="text-xs font-medium text-muted-foreground">Tài liệu bàn giao</span>
                         {deliveryLinks.map((link: any, lIdx: number) => (
                             <a key={lIdx} href={link.url} target="_blank" className="text-sm font-medium text-primary hover:underline flex items-center gap-1 justify-end">
                                 {link.label} <ExternalLink className="w-3 h-3" />
                             </a>
                         ))}
                     </div>
                )}
            </CardHeader>
            <CardContent className="p-0">
                 {/* Unified inner table approach inside Card for tasks */}
                 <Table>
                    <TableBody>
                         {totalTasks > 0 ? itemTasks.map((task: any) => (
                             <TableRow key={task.id} className="border-b last:border-0 hover:bg-muted/50">
                                 <TableCell className="w-8 pl-6">
                                     {task.status === 'completed' ? (
                                         <CheckCircle className="w-4 h-4 text-muted-foreground" />
                                     ) : task.status === 'in_progress' ? (
                                         <Clock className="w-4 h-4 text-primary" />
                                     ) : (
                                         <Circle className="w-4 h-4 text-muted-foreground/50" />
                                     )}
                                 </TableCell>
                                 <TableCell className={cn("font-medium", task.status === 'completed' && "text-muted-foreground line-through")}>
                                     {task.title}
                                 </TableCell>
                             </TableRow>
                         )) : (
                             <TableRow><TableCell className="text-center text-muted-foreground py-6 border-b-0 h-24">Chưa có đầu việc chi tiết.</TableCell></TableRow>
                         )}
                    </TableBody>
                 </Table>
            </CardContent>
        </Card>
    )
}

/* ===== Financial Item Card (Finance Tab) ===== */
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
        <Card className="overflow-hidden p-0">
            <CardHeader className="border-b flex flex-row items-center justify-between pb-4 pt-4 px-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-background text-xs font-semibold">
                        {idx + 1}
                    </div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{formatCurrency(activeAmount).replace(/\s*[₫đ]\s*$/g, '').trim()}</span>
                    <span className="text-sm font-medium text-muted-foreground">đ</span>
                </div>
            </CardHeader>

            {quotationOptions.length > 1 && (
                <div className="px-6 py-4 flex items-center gap-4 bg-muted/20 border-b">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Hạng mức:</span>
                    <div className="flex gap-2">
                        {quotationOptions.map((q: any, qIdx: number) => {
                            const isActive = q.id === (selectedQuotationId || quotation?.id)
                            return (
                                <Badge
                                    key={q.id}
                                    variant={isActive ? "default" : "outline"}
                                    onClick={() => onSelectQuotation?.(q.id)}
                                    className={cn("px-3 py-1.5 cursor-pointer text-sm font-medium", !isActive && "hover:bg-muted font-normal text-muted-foreground")}
                                >
                                    {q.status === 'accepted' ? 'Đã Chọn' : `PA ${qIdx + 1}`} - {formatCurrency(q.total_amount).replace(/\s*[₫đ]\s*$/g, '').trim()}
                                </Badge>
                            )
                        })}
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-2">
                <div className="p-0 border-r border-border h-full flex flex-col">
                    <div className="px-6 py-4 border-b bg-muted/10 font-medium text-sm text-muted-foreground">Pháp lý & Chứng từ đính kèm</div>
                    <Table>
                        <TableBody>
                            {(() => {
                                const renderedDocs: any[] = []
                                if (activeQuotation && ['sent', 'viewed', 'accepted', 'converted'].includes(activeQuotation.status)) {
                                    renderedDocs.push({ title: 'Báo giá', number: activeQuotation.quotation_number, status: activeQuotation.status, link: `/quote/${activeQuotation.public_token || token}` })
                                }
                                if (contract) {
                                    const visibleDocs = (contract.documents || []).filter((d: any) => d.is_visible_on_portal !== false)
                                    const uniqueMap = new Map(); visibleDocs.forEach((d: any) => uniqueMap.set(d.id, d));
                                    Array.from(uniqueMap.values()).forEach((d: any) => renderedDocs.push({
                                        title: d.type === 'contract' ? 'Hợp đồng' : d.type, number: d.doc_number || '', status: d.status, docId: d.id, content: d.content
                                    }))
                                }
                                
                                if (renderedDocs.length === 0) return <TableRow><TableCell className="text-center text-muted-foreground py-8">Chưa có chứng từ</TableCell></TableRow>

                                return renderedDocs.map((d, i) => (
                                    <TableRow key={i}>
                                        <TableCell>
                                            <div className="font-medium text-sm">{d.title}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">#{d.number || '---'}</div>
                                        </TableCell>
                                        <TableCell><StatusBadge status={d.status} /></TableCell>
                                        <TableCell className="text-right">
                                            {d.link ? (
                                                <Button variant="outline" size="sm" asChild className="h-7 text-xs"><a href={d.link} target="_blank">Xem</a></Button>
                                            ) : d.docId ? (
                                                <Button variant="secondary" size="sm" onClick={() => d.content ? onViewContractDoc?.(d.content) : onViewDoc?.(d.docId)} className="h-7 text-xs">Xem Doc</Button>
                                            ) : null}
                                        </TableCell>
                                    </TableRow>
                                ))
                            })()}
                        </TableBody>
                    </Table>
                </div>
                
                <div className="p-0 h-full flex flex-col bg-muted/5">
                    <div className="px-6 py-4 border-b border-border font-medium text-sm text-muted-foreground bg-muted/10">Kế hoạch thanh toán</div>
                    <Table>
                        <TableBody>
                            {itemMilestones.length > 0 ? itemMilestones.map((m: any, mIdx: number) => (
                                <TableRow key={m.id}>
                                    <TableCell className="pr-1 text-muted-foreground w-8">
                                        {m.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <div className="text-xs">{mIdx + 1}</div>}
                                    </TableCell>
                                    <TableCell>
                                        <div className={cn("text-sm font-medium", m.status === 'completed' && "text-muted-foreground line-through")}>{m.title}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">Hạn: {formatDate(m.date)}</div>
                                    </TableCell>
                                    <TableCell className="text-right whitespace-nowrap">
                                        {m.amount > 0 && <span className="text-sm font-medium tabular-nums">{formatCurrency(m.amount).replace(/\s*[₫đ]\s*$/g, '').trim()}đ</span>}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8 border-b-0 h-full">Chưa có hạng mức</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </Card>
    )
}

/* ===== Timeline Section ===== */
function TimelineSection({ timeline }: { timeline: any[] }) {
    if (timeline.length === 0) return null;

    return (
        <Card>
            <CardHeader className="border-b bg-muted/20">
                <CardTitle className="text-lg">Dòng chảy sự kiện</CardTitle>
                <CardDescription>Các thao tác hệ thống tự động ghi nhận theo thời gian thực.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {timeline.map((event, i) => (
                        <div key={event.id} className="grid grid-cols-[1fr_auto] gap-4 text-sm relative">
                            <div className="absolute left-[-2px] top-6 bottom-[-24px] w-px bg-border/50 hidden last:block" />
                            <div className="flex gap-4">
                                <div className="mt-0.5">
                                    <div className={cn("h-2.5 w-2.5 rounded-full", event.status === 'completed' ? "bg-emerald-500" : "bg-muted-foreground/30")} />
                                    {i !== timeline.length - 1 && <div className="h-full w-px bg-border/50 ml-[4px] mt-2 absolute bottom-[-16px]" />}
                                </div>
                                <div className="space-y-1 pb-6">
                                    <p className={cn("font-medium leading-none", event.status === 'completed' ? "text-foreground" : "text-muted-foreground")}>{event.title}</p>
                                    {event.description && <p className="text-xs text-muted-foreground">{event.description}</p>}
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5 tabular-nums tabular-nums">
                                {formatDate(event.date)}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
