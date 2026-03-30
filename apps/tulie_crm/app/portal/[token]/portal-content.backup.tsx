'use client'

import { useState, useMemo, useCallback } from 'react'
import { Badge } from '@repo/ui'
import { Button } from '@repo/ui'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@repo/ui"
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@repo/ui'
import {
    CheckCircle2, Clock, FileText, Building2, FileSignature, ExternalLink,
    ChevronRight, Package, Link2, ClipboardCheck, ListTodo, AlertCircle,
    Circle, CheckCircle, ArrowRight, Wallet, CreditCard, Banknote,
    Activity, FileCheck, Check, BookOpen, Eye, Receipt, Lock
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
    hasPassword?: boolean
    companyName?: string
}

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
    'pending': { label: 'Chờ xử lý', bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-zinc-400', border: 'border-border' },
    'in_progress': { label: 'Đang thực hiện', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
    'delivered': { label: 'Đã bàn giao', bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500', border: 'border-sky-200' },
    'accepted': { label: 'Đã nghiệm thu', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
    'rejected': { label: 'Từ chối', bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500', border: 'border-rose-200' },
    'draft': { label: 'Nháp', bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-zinc-300', border: 'border-border' },
    'sent': { label: 'Đã gửi', bg: 'bg-white', text: 'text-muted-foreground', dot: 'bg-zinc-500', border: 'border-border' },
    'viewed': { label: 'Đã xem', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
    'active': { label: 'Đang triển khai', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
    'completed': { label: 'Hoàn thành', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
    'signed': { label: 'Đã ký', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
    'paid': { label: 'Đã thanh toán', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
    'todo': { label: 'Cần làm', bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-zinc-400', border: 'border-border' },
    'blocked': { label: 'Bị chặn', bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500', border: 'border-rose-200' },
    'upcoming': { label: 'Sắp tới', bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-zinc-300', border: 'border-border' },
    'overdue': { label: 'Trễ hạn', bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500', border: 'border-rose-200' },
}

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_MAP[status] || { label: status, bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-zinc-400', border: 'border-border' }
    return (
        <div className={cn("flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border shrink-0", s.bg, s.border)}>
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dot)} />
            <span className={cn("text-[11px] font-normal whitespace-nowrap", s.text)}>{s.label}</span>
        </div>
    )
}

export default function PortalContent({ data, token, isFinancialAuthenticated = false, hasPassword = false, companyName }: PortalContentProps) {
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

    return (
        <div className="min-h-screen bg-muted/50 font-sans text-foreground pb-20 selection:bg-black selection:text-white">
            {/* Header */}
            <div className="bg-white border-b border-border pt-10 pb-8 px-6 sticky top-0 z-40 shadow-sm">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <img
                            src={brandConfig?.logo_url || "/file/tulie-agency-logo.png"}
                            alt="Logo"
                            className="h-14 w-auto object-contain grayscale"
                        />
                        <div className="w-px h-10 bg-muted" />
                        <div>
                            <h1 className="text-xl font-semibold text-foreground">Customer Portal</h1>
                            <p className="text-xs text-muted-foreground mt-0.5 font-medium">Hệ thống giám sát dự án</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end">
                        <h2 className="text-2xl font-bold text-foreground tracking-tighter">{companyName || customer?.company_name || customer?.full_name || 'Khách hàng'}</h2>
                        <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
                            <div className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border",
                                hasContracts ? "bg-blue-50 border-blue-200" : "bg-muted border-border"
                            )}>
                                <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", hasContracts ? "bg-blue-500" : "bg-zinc-400")} />
                                <span className={cn("text-[11px] font-semibold", hasContracts ? "text-blue-700" : "text-muted-foreground")}>{projectStatusLabel}</span>
                            </div>

                            {/* Unlock Button Logic */}
                            {hasPassword && !isFinancialAuthenticated && (
                                <Dialog open={isUnlockModalOpen} onOpenChange={setIsUnlockModalOpen}>
                                    <DialogTrigger asChild>
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-white hover:bg-muted shadow-sm text-foreground transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98]">
                                            <Lock className="w-3.5 h-3.5 text-muted-foreground group-hover:text-zinc-700" />
                                            <span className="text-[11px] font-semibold tracking-wide">Bộ chứng từ dự án</span>
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-[400px] p-0 bg-transparent border-none shadow-none rounded-3xl overflow-hidden [&>button]:hidden">
                                        <PortalPasswordForm token={token} companyName={companyName} isModal={true} />
                                    </DialogContent>
                                </Dialog>
                            )}

                            {isFinancialAuthenticated && hasPassword && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm">
                                    <Lock className="w-3.5 h-3.5 opacity-60" />
                                    <span className="text-[11px] font-semibold">Đã mở khóa</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 mt-8 space-y-8">
                {/* Update Info CTA */}
                {!isCustomerInfoComplete(customer) && (
                <div className="relative rounded-md p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden text-white bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-800 shadow-xl shadow-zinc-900/10 border border-zinc-800">
                    <div className="absolute inset-0 opacity-[0.15] pointer-events-none"
                         style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '16px 16px', WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)', maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)' }}>
                    </div>
                    <div className="relative z-10 space-y-1">
                        <h3 className="text-base font-semibold">Cần hoàn thiện hồ sơ khởi tạo?</h3>
                        <p className="text-sm text-muted-foreground max-w-md font-normal">Vui lòng cập nhật đầy đủ thông tin xuất hóa đơn hoặc yêu cầu thay đổi trực tiếp tại đây.</p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="relative z-10 bg-white text-foreground hover:bg-muted font-semibold rounded-md px-8 h-10 shadow-lg transition-all text-xs border border-border">
                                Cập nhật hồ sơ
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px] rounded-md p-0 overflow-hidden border-none shadow-2xl [&_[data-slot=dialog-close]_svg]:text-white">
                            <div className="bg-zinc-950 text-white p-8 border-b border-zinc-800">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold">Cập nhật hồ sơ khách hàng</DialogTitle>
                                    <p className="text-muted-foreground text-xs mt-1 font-semibold">Customer Information & Identity</p>
                                </DialogHeader>
                            </div>
                            <div className="p-8 bg-muted">
                                <CustomerInfoForm
                                    customer={customer}
                                    token={token}
                                    onComplete={() => {
                                        setIsDialogOpen(false)
                                        router.refresh()
                                        toast.success('Đã cập nhật thông tin thành công!')
                                    }}
                                    onDraftSave={() => {
                                        setIsDialogOpen(false)
                                        router.refresh()
                                    }}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                )}

                {/* Tabs Layout */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="mb-8 w-full justify-start h-auto p-1.5 bg-muted/50 border border-border/60 rounded-md overflow-x-auto flex-nowrap shrink-0 hide-scrollbar">
                        <TabsTrigger value="overview" className="flex items-center gap-2 py-2.5 px-4 text-[13px] font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/60 text-muted-foreground whitespace-nowrap transition-all">
                            <ListTodo className="w-4 h-4 shrink-0" /> Tổng quan tiến độ
                        </TabsTrigger>
                        <TabsTrigger value="gantt" className="flex items-center gap-2 py-2.5 px-4 text-[13px] font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/60 text-muted-foreground whitespace-nowrap transition-all">
                            <Clock className="w-4 h-4 shrink-0" /> Lộ trình & Lịch trình
                        </TabsTrigger>
                        <TabsTrigger value="feedback" className="flex items-center gap-2 py-2.5 px-4 text-[13px] font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/60 text-muted-foreground whitespace-nowrap transition-all">
                            <ClipboardCheck className="w-4 h-4 shrink-0" /> Nhật ký xử lý
                        </TabsTrigger>
                        {isFinancialAuthenticated && (
                            <TabsTrigger value="finance" className="flex items-center gap-2 py-2.5 px-4 text-[13px] font-semibold rounded-lg data-[state=active]:bg-zinc-950 data-[state=active]:text-white text-muted-foreground shadow-sm whitespace-nowrap transition-all">
                                <Wallet className="w-4 h-4 shrink-0" /> Báo giá & Pháp lý
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* Tab 1: Công việc */}
                    <TabsContent value="overview" className="space-y-6 mt-0 focus-visible:outline-none focus-visible:ring-0">
                        {project?.description && (
                            <div className="bg-white rounded-md border border-border p-6 shadow-sm">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <BookOpen className="w-3.5 h-3.5" /> Mô tả dự án
                                </h3>
                                <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line font-medium">{project.description}</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-zinc-800" />
                                <h3 className="text-lg font-bold text-foreground leading-tight">Hạng mục & Công việc</h3>
                            </div>
                            <span className="text-[13px] font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border shadow-sm">
                                {completedItems}/{displayItems.length} hạng mục hoàn thành
                            </span>
                        </div>

                        <div className="grid gap-4">
                            {displayItems.length > 0 ? displayItems.map((item: any, idx: number) => (
                                <WorkItemAccordionCard key={item.id} item={item} idx={idx} />
                            )) : (
                                <div className="bg-white rounded-md border border-border border-dashed p-12 text-center">
                                    <Package className="w-10 h-10 text-zinc-200 mx-auto mb-4" />
                                    <p className="text-sm text-muted-foreground font-medium">Chưa có hạng mục công việc nào được khởi tạo.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Tab 2: Gantt & Timeline */}
                    <TabsContent value="gantt" className="space-y-8 mt-0 focus-visible:outline-none focus-visible:ring-0">
                         <ProjectGanttChart tasks={data.tasks || []} />
                         <TimelineSection timeline={timeline} />
                    </TabsContent>

                    {/* Tab 3: Feedback & History */}
                    <TabsContent value="feedback" className="space-y-8 mt-0 focus-visible:outline-none focus-visible:ring-0">
                        {project?.id && (
                            <FeedbackBoard
                                projectId={project.id}
                                customerId={customer?.id}
                                customerName={companyName || customer?.company_name || customer?.full_name || 'Khách hàng'}
                                isAdmin={isFinancialAuthenticated}
                            />
                        )}
                        <ProjectActivityHistory projectId={project?.id} activities={data.activities} />
                    </TabsContent>

                    {/* Tab 4: Finance (Protected) */}
                    {isFinancialAuthenticated && (
                        <TabsContent value="finance" className="space-y-8 mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Stats Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Tổng đầu tư', value: totalInvestment, icon: Wallet, color: 'text-muted-foreground', bgColor: 'bg-muted' },
                                    { label: 'Đã thanh toán', value: totalPaid, icon: CreditCard, color: 'text-foreground', bgColor: 'bg-muted' },
                                    { label: 'Còn lại', value: balanceDue, icon: Banknote, color: 'text-foreground', bgColor: 'bg-muted' },
                                    { label: 'Tiến độ', value: `${projectProgress}%`, icon: Activity, color: 'text-foreground', bgColor: 'bg-muted' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white p-5 rounded-md border border-border shadow-sm transition-all hover:shadow-md hover:border-input">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={cn("p-1.5 rounded-lg border border-border/60 shadow-xs", stat.bgColor)}>
                                                <stat.icon className={cn("w-4 h-4", stat.color)} />
                                            </div>
                                            <span className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                                        </div>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <div className="text-xl sm:text-2xl font-bold text-foreground tracking-tighter tabular-nums truncate">
                                                {typeof stat.value === 'number' ? formatCurrency(stat.value).replace(/\s*[₫đ]\s*$/g, '').replace(/^[₫đ]\s*/g, '').trim() : stat.value}
                                            </div>
                                            {typeof stat.value === 'number' && (
                                                <div className="text-sm font-bold text-muted-foreground">đ</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 px-2 mt-2">
                                <Receipt className="w-5 h-5 text-zinc-800" />
                                <h3 className="text-lg font-bold text-foreground leading-tight">Chi tiết báo giá & Pháp lý</h3>
                            </div>

                            <div className="grid gap-6">
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
                </Tabs>

                {/* Document Viewer Dialog */}
                <Dialog open={isViewingDoc} onOpenChange={setIsViewingDoc}>
                    <DialogContent className="max-w-[95vw] lg:max-w-[1100px] w-full p-0 overflow-hidden bg-muted border-none rounded-md shadow-2xl" showCloseButton={false}>
                        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center border border-border">
                                    <FileText className="w-4 h-4 text-foreground" />
                                </div>
                                <DialogTitle className="text-sm font-bold text-foreground uppercase tracking-widest">Chi tiết tài liệu</DialogTitle>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setIsViewingDoc(false)}
                                className="text-xs font-bold text-zinc-700 hover:text-foreground border-border bg-white shadow-sm"
                            >
                                Đóng tài liệu
                            </Button>
                        </div>
                        <div className="px-2 py-4 sm:px-8 sm:py-8 overflow-auto max-h-[calc(100vh-120px)] sm:max-h-[85vh]">
                            <style>{`
                                .portal-doc-viewer > div { padding: 10mm 15mm !important; }
                                @media (min-width: 1024px) { .portal-doc-viewer > div { padding: 15mm 20mm !important; } }
                            `}</style>
                            <div
                                className="portal-doc-viewer bg-white shadow-xl border border-border text-[#000] mx-auto relative shrink-0 rounded-sm"
                                style={{ width: '210mm', minWidth: '210mm', minHeight: '297mm' }}
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedDocContent || '') }}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    )
}

/* ===== Work Item Accordion (Overview Tab) ===== */
function WorkItemAccordionCard({ item, idx }: { item: any; idx: number }) {
    const deliveryLinks = item.delivery_links || []
    const itemTasks = item.tasks || []
    const completedTasks = itemTasks.filter((t: any) => t.status === 'completed').length
    const totalTasks = itemTasks.length

    return (
        <div className="bg-white rounded-md border border-border overflow-hidden shadow-sm hover:border-input transition-all p-5 group">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                    <div className="flex shrink-0 items-center justify-center w-10 h-10 rounded-md bg-muted text-muted-foreground font-bold border border-border">
                        {idx + 1}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-base font-bold text-foreground">{item.title}</h4>
                            <StatusBadge status={item.status} />
                        </div>
                        {item.description && <p className="text-[13px] text-muted-foreground leading-relaxed max-w-2xl font-medium">{item.description}</p>}
                    </div>
                </div>

                {/* Delivery Links inline at top */}
                {deliveryLinks.length > 0 && (
                    <div className="flex flex-col gap-2 shrink-0 md:min-w-[200px]">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                            <Link2 className="w-3 h-3" /> Link Bàn Giao
                        </span>
                        {deliveryLinks.map((link: any, lIdx: number) => (
                            <a key={lIdx} href={link.url} target="_blank"
                                className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted hover:bg-white hover:border-input transition-all">
                                <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                                <span className="text-[12px] font-semibold text-zinc-700 truncate">{link.label}</span>
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Todo List Inline */}
            <div className="mt-6 pt-5 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <ListTodo className="w-3.5 h-3.5" /> Danh sách công việc ({completedTasks}/{totalTasks})
                    </p>
                    {totalTasks > 0 && (
                        <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden border border-border">
                            <div 
                                className="h-full bg-zinc-900 rounded-full transition-all duration-500" 
                                style={{ width: `${(completedTasks / totalTasks) * 100}%` }} 
                            />
                        </div>
                    )}
                </div>

                {totalTasks > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {itemTasks.map((task: any) => (
                            <div key={task.id} className="flex items-start gap-3 p-3 rounded-md border border-border bg-muted/50 hover:bg-muted transition-colors">
                                {task.status === 'completed' ? (
                                    <CheckCircle className="w-4 h-4 text-foreground mt-0.5 shrink-0" />
                                ) : task.status === 'in_progress' ? (
                                    <Clock className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                ) : (
                                    <Circle className="w-4 h-4 text-zinc-300 mt-0.5 shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className={cn(
                                        "text-[13px] font-semibold",
                                        task.status === 'completed' ? "line-through text-muted-foreground" : "text-zinc-800"
                                    )}>
                                        {task.title}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-4 text-center text-muted-foreground text-xs font-medium">Lộ trình công việc trống.</div>
                )}
            </div>
        </div>
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
        <div className="bg-white rounded-md border border-border overflow-hidden shadow-sm hover:border-input transition-all">
            <div className="flex items-center justify-between p-5 border-b border-border bg-muted/50">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted text-muted-foreground text-[13px] font-bold">
                        {idx + 1}
                    </div>
                    <h4 className="text-[15px] font-bold text-foreground">{item.title}</h4>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-[22px] font-bold text-foreground tracking-tighter tabular-nums">{formatCurrency(activeAmount).replace(/\s*[₫đ]\s*$/g, '').replace(/^[₫đ]\s*/g, '').trim()}</span>
                    <span className="text-sm font-bold text-muted-foreground">đ</span>
                </div>
            </div>

            {quotationOptions.length > 1 && (
                <div className="px-5 py-4 border-b border-border flex flex-wrap items-center gap-3 bg-white">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mr-2">Chọn giải pháp mưc phí:</span>
                    <div className="flex gap-2">
                        {quotationOptions.map((q: any, qIdx: number) => {
                            const isActive = q.id === (selectedQuotationId || quotation?.id)
                            return (
                                <button
                                    key={q.id}
                                    onClick={() => onSelectQuotation?.(q.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-md transition-all border",
                                        isActive
                                            ? "bg-zinc-950 border-zinc-950 text-white shadow-md ring-2 ring-zinc-950/20"
                                            : "bg-white text-muted-foreground border-border hover:border-input hover:bg-muted"
                                    )}
                                >
                                    <span className="text-[12px] font-bold uppercase">{q.status === 'accepted' ? 'Đã Chọn' : `PA${qIdx + 1}`}</span>
                                    <span className="text-sm font-bold tabular-nums ml-1">
                                        {formatCurrency(q.total_amount).replace(/\s*[₫đ]\s*$/g, '').trim()}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row bg-white">
                {/* Documents linked */}
                <div className="lg:w-1/2 p-5 border-b lg:border-b-0 lg:border-r border-border">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Hồ sơ pháp lý đính kèm</p>
                    <div className="space-y-3">
                        {(() => {
                            const renderedDocs: any[] = []
                            if (activeQuotation && ['sent', 'viewed', 'accepted', 'converted'].includes(activeQuotation.status)) {
                                renderedDocs.push({
                                    title: 'Báo giá',
                                    key: 'quotation',
                                    number: activeQuotation.quotation_number,
                                    status: activeQuotation.status,
                                    icon: FileText,
                                    link: `/quote/${activeQuotation.public_token || token}`
                                })
                            }
                            if (contract) {
                                const visibleDocs = (contract.documents || []).filter((d: any) => d.is_visible_on_portal !== false)
                                const uniqueDocsMap = new Map<string, any>()
                                for (const d of visibleDocs) uniqueDocsMap.set(`${d.type}:${d.milestone_id || 'none'}`, d)
                                const uniqueVisibleDocs = Array.from(uniqueDocsMap.values())
                                const paymentDocs = uniqueVisibleDocs.filter((d: any) => d.type === 'payment_request')
                                const DOC_TYPE_LABELS: Record<string, string> = { contract: 'Hợp đồng', order: 'Đơn đặt hàng', payment_request: 'Đề nghị thanh toán', delivery_minutes: 'Biên bản bàn giao', acceptance: 'Biên bản nghiệm thu' }

                                for (const d of uniqueVisibleDocs) {
                                    const metaTitle = DOC_TYPE_LABELS[d.type] || d.type
                                    let docTitle = metaTitle
                                    if (d.type === 'payment_request' && paymentDocs.length > 1) {
                                        docTitle = `${metaTitle} đợt ${paymentDocs.indexOf(d) + 1}`
                                    }
                                    renderedDocs.push({ title: docTitle, key: d.id, number: d.doc_number || (d.type === 'contract' ? contract.contract_number : ''), status: d.status, icon: FileSignature, docId: d.id, content: d.content })
                                }
                            }
                            if (renderedDocs.length === 0) return <div className="text-xs text-muted-foreground py-2">Chưa có chứng từ.</div>

                            return renderedDocs.map((d, i) => (
                                <div key={d.key || i} className="flex items-center justify-between p-3 rounded-md border border-border bg-white hover:border-zinc-400 hover:shadow-sm transition-all shadow-xs">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-muted border border-border">
                                            <d.icon className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-bold text-foreground">{d.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-[11px] font-bold font-mono text-muted-foreground">#{d.number || '---'}</p>
                                                <StatusBadge status={d.status} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {d.link ? (
                                            <a href={d.link} target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-border hover:bg-muted transition-colors shadow-xs text-[11px] font-bold text-zinc-700">
                                                Xem <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                            </a>
                                        ) : d.docId ? (
                                            <button onClick={() => d.content ? onViewContractDoc?.(d.content) : onViewDoc?.(d.docId)} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white rounded-lg shadow-md hover:bg-zinc-800 transition-colors text-[11px] font-bold">
                                                <Eye className="w-3 h-3" /> Xem Doc
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            ))
                        })()}
                    </div>
                </div>

                {/* Payment Milestones */}
                <div className="lg:w-1/2 p-5 bg-muted/30">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Wallet className="w-3.5 h-3.5" /> Lộ trình thanh toán
                    </p>
                    {itemMilestones.length > 0 ? (
                        <div className="space-y-2">
                            {itemMilestones.map((m: any, mIdx: number) => (
                                <div key={m.id} className="flex flex-col gap-2 p-3 rounded-md border border-border bg-white shadow-xs hover:border-input transition-all">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className={cn("w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 border", m.status === 'completed' ? "bg-emerald-500 text-white border-emerald-600" : "bg-muted text-muted-foreground border-border")}>
                                                {m.status === 'completed' ? <Check className="w-3.5 h-3.5" /> : mIdx + 1}
                                            </div>
                                            <div>
                                                <p className={cn("text-[13px] font-bold", m.status === 'completed' ? "text-muted-foreground line-through" : "text-foreground")}>
                                                    {m.title}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                                                    Hạn: <span className="text-muted-foreground">{formatDate(m.date)}</span>
                                                </p>
                                            </div>
                                        </div>
                                        {m.amount > 0 && (
                                            <div className="text-right shrink-0 bg-muted px-3 py-1.5 rounded-lg border border-border">
                                                <span className="text-[13px] font-bold text-foreground tabular-nums">{formatCurrency(m.amount).replace(/\s*[₫đ]\s*$/g, '').replace(/^[₫đ]\s*/g, '').trim()}</span>
                                                <span className="text-[10px] text-muted-foreground ml-1 font-bold">VNĐ</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center bg-white rounded-md border border-border border-dashed">
                            <Receipt className="w-6 h-6 text-zinc-300 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground font-medium">Lộ trình thanh toán trống</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

/* ===== Timeline Section ===== */
function TimelineSection({ timeline }: { timeline: any[] }) {
    if (timeline.length === 0) return (
        <div className="bg-white rounded-md border border-border border-dashed p-12 text-center">
            <Clock className="w-10 h-10 text-zinc-200 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground font-medium">Lộ trình thời gian trống</p>
        </div>
    )

    return (
        <div className="bg-white rounded-md border border-border overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center border border-border">
                        <Activity className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-0.5">
                        <h3 className="text-lg font-bold text-foreground leading-tight">Biểu đồ thời gian thao tác</h3>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">Lịch sử Lộ trình hệ thống</p>
                    </div>
                </div>
            </div>
            <div className="p-6">
                <div className="relative pl-6 border-l-2 border-border ml-2 space-y-8">
                    {timeline.map((event, eIdx) => (
                        <div key={event.id} className="relative pt-1">
                            {/* Dot */}
                            <div className={cn(
                                "absolute -left-[29px] top-1.5 h-4 w-4 rounded-full border-[3px] bg-white transition-colors",
                                event.status === 'completed' ? "border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]" : "border-input"
                            )} />

                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                                <div>
                                    <h6 className={cn("text-[14px] font-bold ", event.status === 'completed' ? "text-foreground" : "text-muted-foreground")}>
                                        {event.title}
                                    </h6>
                                    {event.description && <p className="text-[12px] text-muted-foreground mt-1 max-w-lg font-medium leading-relaxed">{event.description}</p>}
                                </div>
                                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded-md border border-border shrink-0">
                                    {formatDate(event.date)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
