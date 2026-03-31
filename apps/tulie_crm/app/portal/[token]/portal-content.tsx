'use client'

import { useState } from 'react'
import {
    Badge, Button,
    Card, CardHeader, CardTitle, CardDescription, CardContent,
    Dialog, DialogContent, DialogTrigger,
    Tabs, TabsList, TabsTrigger, TabsContent,
    Separator,
    Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@repo/ui'
import {
    Clock, CheckCircle, Circle,
    Package, ClipboardCheck, Wallet, Lock,
    Headset, Mail, Phone, GanttChartSquare, CheckCircle2, AlertTriangle, FileText, ExternalLink, ListTodo
} from 'lucide-react'
import { getGeneratedDocumentById } from '@/lib/supabase/services/document-template-service'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { usePortalTracking } from '@/hooks/use-portal-tracking'
import { FeedbackBoard } from '@/components/portal/feedback-board'
import PortalPasswordForm from './password-form'
import { ProjectGanttChart } from '@/components/projects/project-gantt-chart'
import { ProjectActivityHistory } from '@/components/projects/project-activity-history'
import { sanitizeHtml } from '@/lib/security/sanitize'
import { cn } from '@/lib/utils'

/* ===== Types ===== */
interface PortalContentProps {
    data: any // using any for refactoring speed, expecting the new portal-service output
    token: string
    isFinancialAuthenticated?: boolean
    hasFinancialPassword?: boolean
    companyName?: string
}

/* ===== Status Map ===== */
const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    'pending': { label: 'Chờ xử lý', variant: 'secondary' },
    'in_progress': { label: 'Đang thực hiện', variant: 'default' },
    'completed': { label: 'Hoàn thành', variant: 'default' },
    'todo': { label: 'Cần làm', variant: 'outline' },
    'accepted': { label: 'Đã nghiệm thu', variant: 'default' },
    'delivered': { label: 'Đã bàn giao', variant: 'default' },
}

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_MAP[status] || { label: status, variant: 'outline' as const }
    return <Badge variant={s.variant}>{s.label}</Badge>
}

/* ===== Main Component ===== */
export default function PortalContent({ data, token, isFinancialAuthenticated = false, hasFinancialPassword = false, companyName }: PortalContentProps) {
    const {
        type, contract, project, customer, invoices = [],
        tasks = [], timeline = [], projectMetadata, brandConfig,
        workItems = [], activities = []
    } = data

    const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false)
    const [selectedDocContent, setSelectedDocContent] = useState<string | null>(null)
    const [isViewingDoc, setIsViewingDoc] = useState(false)

    const { trackInteraction } = usePortalTracking({
        portalToken: token,
        projectId: project?.id,
        customerId: customer?.id
    })

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

    const displayName = companyName || customer?.company_name || customer?.full_name || 'Khách hàng'

    // Derived Stats
    const completedTasks = tasks.filter((t: any) => t.status === 'completed').length
    const totalTasks = tasks.length
    const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const activeContract = contract || (data.contracts ? data.contracts[0] : null)
    const totalInvestment = activeContract?.total_amount || 0
    const totalPaid = timeline.filter((t: any) => t.type === 'payment' && t.status === 'completed').reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
    const balanceDue = Math.max(0, totalInvestment - totalPaid)
    
    // Top Nav
    const navItems = [
        { value: 'progress', label: 'Tiến độ dự án', icon: GanttChartSquare },
        { value: 'feedback', label: 'Nhật ký xử lý', icon: ClipboardCheck },
    ]

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/20">
            {/* ===== Header ===== */}
            <header className="sticky top-0 z-40 flex h-[60px] items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
                <div className="flex items-center gap-4 flex-1">
                    <img
                        src={brandConfig?.logo_url || "/file/tulie-agency-logo.png"}
                        alt="Logo"
                        className="h-8 w-auto object-contain"
                    />
                    <Separator orientation="vertical" className="h-6" />
                    <div className="flex flex-col">
                        <span className="text-base font-bold tracking-tight text-foreground leading-none">
                            Project Portal
                        </span>
                        <span className="text-[0.65rem] uppercase font-medium text-muted-foreground mt-0.5">
                            Cổng theo dõi dự án
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="hidden md:inline text-sm font-medium text-foreground">{displayName}</span>
                    <Badge variant="default" className="hidden sm:inline-flex">
                        {project?.status === 'in_progress' ? 'Đang triển khai' : 'Đang thực hiện'}
                    </Badge>
                    {hasFinancialPassword && !isFinancialAuthenticated && (
                        <Dialog open={isUnlockModalOpen} onOpenChange={setIsUnlockModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 group">
                                    <Lock className="w-3.5 h-3.5 mr-1.5 text-muted-foreground group-hover:text-foreground" />
                                    <span>Tài chính</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <PortalPasswordForm token={token} companyName={displayName} isModal={true} type="financial" />
                            </DialogContent>
                        </Dialog>
                    )}
                    {isFinancialAuthenticated && hasFinancialPassword && (
                        <Badge variant="outline" className="h-8 gap-1.5 px-2.5 shadow-sm bg-muted/30">
                            <Lock className="w-3 h-3 text-emerald-500" />
                            <span className="font-medium">Tài chính</span>
                        </Badge>
                    )}
                </div>
            </header>

            {/* ===== Main Layout ===== */}
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                <Tabs defaultValue="progress" className="mx-auto w-full max-w-6xl flex flex-col gap-6">
                    {/* Navigation */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <TabsList className="bg-background border justify-start h-10 w-full md:w-auto p-1 overflow-x-auto">
                            {navItems.map(item => (
                                <TabsTrigger key={item.value} value={item.value} className="gap-2 h-8 px-4 font-medium data-[state=active]:bg-primary/5 data-[state=active]:text-primary">
                                    <item.icon className="w-4 h-4 shrink-0" />
                                    <span>{item.label}</span>
                                </TabsTrigger>
                            ))}
                            {isFinancialAuthenticated && (
                                <TabsTrigger value="finance" className="gap-2 h-8 px-4 font-medium data-[state=active]:bg-primary/5 data-[state=active]:text-primary">
                                    <Wallet className="w-4 h-4 shrink-0" />
                                    <span>Tài chính & Pháp lý</span>
                                </TabsTrigger>
                            )}
                        </TabsList>
                        
                        <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground shrink-0 px-2">
                            <Headset className="w-4 h-4 shrink-0" />
                            <div className="flex items-center gap-2.5">
                                <span className="hidden sm:inline">Support:</span>
                                <a href="tel:0988984554" className="hover:text-foreground hover:underline flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5 hidden sm:block" /> 098 898 4554
                                </a>
                                <span>|</span>
                                <a href="mailto:lienhe@tulie.vn" className="hover:text-foreground hover:underline flex items-center gap-1">
                                    <Mail className="w-3.5 h-3.5 hidden sm:block" /> lienhe@tulie.vn
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Tab 1: Execution / Progress */}
                    <TabsContent value="progress" className="mt-0 space-y-6 focus-visible:outline-none">
                        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                            <div className="space-y-6">
                                {/* Project Description */}
                                {(project?.description || contract?.description) && (
                                    <Card className="bg-white border shadow-sm">
                                        <CardHeader className="py-4 bg-muted/20 border-b">
                                            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-muted-foreground" />
                                                Mô tả dự án
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                                                {project?.description || contract?.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                                
                                {/* Work Items / Tasks */}
                                <Card className="bg-white border shadow-sm">
                                    <CardHeader className="py-4 bg-muted/20 border-b flex flex-row items-center justify-between">
                                        <CardTitle className="text-base font-semibold">Danh sách công việc</CardTitle>
                                        <Badge variant="secondary" className="bg-white font-medium">
                                            {completedTasks}/{totalTasks} Hoàn thành
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {workItems && workItems.length > 0 ? (
                                            <div className="divide-y divide-border">
                                                {workItems.map((wi: any) => (
                                                    <div key={wi.id} className="p-4 sm:p-5">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div>
                                                                <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                                                                    {wi.title}
                                                                    <StatusBadge status={wi.status} />
                                                                </h4>
                                                                {wi.description && <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{wi.description}</p>}
                                                            </div>
                                                            {wi.delivery_links?.map((link: any, lIdx: number) => (
                                                                <Button key={lIdx} variant="outline" size="sm" asChild className="h-7 text-xs">
                                                                    <a href={link.url} target="_blank"><ExternalLink className="w-3 h-3 mr-1.5"/> {link.label || 'Link'}</a>
                                                                </Button>
                                                            ))}
                                                        </div>
                                                        <div className="space-y-1 mt-3 pl-1">
                                                            {wi.tasks?.length > 0 ? (
                                                                wi.tasks.map((t: any) => (
                                                                    <div key={t.id} className="flex items-center gap-2.5 py-1.5 group">
                                                                        {t.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Circle className="w-4 h-4 text-border group-hover:text-muted-foreground transition-colors" />}
                                                                        <span className={cn("text-sm", t.status === 'completed' ? "text-muted-foreground line-through" : "text-foreground font-medium")}>
                                                                            {t.title}
                                                                        </span>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground italic">Chưa phân rã công việc chi tiết</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center flex flex-col items-center">
                                                <ListTodo className="w-10 h-10 text-muted-foreground/30 mb-3" />
                                                <p className="text-sm font-medium text-muted-foreground">Chưa có hạng mục công việc nào.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Gantt Chart */}
                                {tasks && tasks.length > 0 && (
                                    <div className="space-y-4 pt-2">
                                        <h2 className="text-lg font-bold flex items-center gap-2">
                                            <GanttChartSquare className="w-5 h-5 text-muted-foreground" />
                                            Lộ trình báo cáo
                                        </h2>
                                        <div className="rounded-xl overflow-hidden border bg-card shadow-sm">
                                            <ProjectGanttChart tasks={tasks} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar Resources */}
                            <div className="space-y-6">
                                <Card className="bg-white border shadow-sm overflow-hidden">
                                    <CardHeader className="py-4 bg-muted/20 border-b">
                                        <CardTitle className="text-sm font-semibold flex items-center gap-2">Tài nguyên dự án</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0 divide-y divide-border text-sm">
                                        {projectMetadata?.source_link && (
                                            <div className="p-4 flex flex-col gap-1.5 hover:bg-muted/30 transition-colors">
                                                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Source Code / Figma</span>
                                                <a href={projectMetadata.source_link} target="_blank" className="text-primary font-medium truncate flex items-center gap-1.5">
                                                    Truy cập tài nguyên <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        )}
                                        {projectMetadata?.ai_folder_link && (
                                            <div className="p-4 flex flex-col gap-1.5 hover:bg-muted/30 transition-colors">
                                                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Thư mục AI / Design</span>
                                                <a href={projectMetadata.ai_folder_link} target="_blank" className="text-primary font-medium truncate flex items-center gap-1.5">
                                                    Google Drive <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        )}
                                        {projectMetadata?.figma_link && (
                                            <div className="p-4 flex flex-col gap-1.5 hover:bg-muted/30 transition-colors">
                                                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Bản vẽ Figma</span>
                                                <a href={projectMetadata.figma_link} target="_blank" className="text-primary font-medium truncate flex items-center gap-1.5">
                                                    Bản thiết kế UI/UX <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        )}
                                        {!projectMetadata?.source_link && !projectMetadata?.ai_folder_link && !projectMetadata?.figma_link && (
                                            <div className="p-6 text-center text-xs text-muted-foreground">
                                                Tài nguyên đang được cập nhật
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab 2: Feedback & History */}
                    <TabsContent value="feedback" className="mt-0 space-y-6 focus-visible:outline-none">
                        <div className="grid gap-6 md:grid-cols-[1fr_350px]">
                            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                                {project?.id && (
                                    <FeedbackBoard
                                        projectId={project.id}
                                        customerId={customer?.id}
                                        customerName={displayName}
                                        isAdmin={isFinancialAuthenticated}
                                    />
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold mb-4 text-foreground">Lịch sử hoạt động</h3>
                                <ProjectActivityHistory projectId={project?.id} activities={activities} />
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab 3: Finance (Protected) */}
                    {isFinancialAuthenticated && (
                        <TabsContent value="finance" className="mt-0 space-y-6 focus-visible:outline-none">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: 'Tổng Đầu Tư', value: totalInvestment },
                                    { label: 'Đã Thanh Toán', value: totalPaid },
                                    { label: 'Công Nợ', value: balanceDue },
                                    { label: 'Tiến Độ', value: `${taskProgress}%` },
                                ].map((stat, i) => (
                                    <Card key={i} className="bg-white border shadow-sm">
                                        <CardHeader className="py-4">
                                            <CardDescription className="text-xs font-medium uppercase tracking-wider">{stat.label}</CardDescription>
                                            <CardTitle className="text-2xl font-bold tabular-nums tracking-tight">
                                                {typeof stat.value === 'number' ? formatCurrency(stat.value).replace(/\s*[₫đ]\s*$/g, '').trim() : stat.value}
                                            </CardTitle>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>

                            <Card className="bg-white border shadow-sm">
                                <CardHeader className="py-4 bg-muted/20 border-b flex flex-row items-center justify-between">
                                    <CardTitle className="text-base font-semibold">Giai đoạn & Thanh toán</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-muted/10">
                                            <TableRow>
                                                <TableHead className="w-[80px] text-center">TT</TableHead>
                                                <TableHead>Nội dung thanh toán</TableHead>
                                                <TableHead>Hạn</TableHead>
                                                <TableHead className="text-right">Số tiền</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {timeline.filter((t: any) => t.type === 'payment' || (t.type === 'milestone' && t.amount)).map((m: any, i: number) => (
                                                <TableRow key={i}>
                                                    <TableCell className="text-center">
                                                        {m.status === 'completed' ? (
                                                            <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-500" />
                                                        ) : m.status === 'overdue' ? (
                                                            <AlertTriangle className="w-5 h-5 mx-auto text-destructive" />
                                                        ) : (
                                                            <span className="text-xs font-medium text-muted-foreground">{i + 1}</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-foreground">{m.title}</TableCell>
                                                    <TableCell className="text-muted-foreground tabular-nums">{formatDate(m.date)}</TableCell>
                                                    <TableCell className="text-right font-bold tabular-nums">
                                                        {m.amount ? formatCurrency(m.amount) : '---'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {timeline.filter((t: any) => t.type === 'payment' || (t.type === 'milestone' && t.amount)).length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">Không có dữ liệu thanh toán.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                            
                            {activeContract?.documents && activeContract.documents.filter((d: any) => d.is_visible_on_portal).length > 0 && (
                                <Card className="bg-white border shadow-sm">
                                    <CardHeader className="border-b py-4 bg-muted/20">
                                        <CardTitle className="text-base font-semibold">Hợp đồng & Văn bản pháp lý</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0 divide-y">
                                        {activeContract.documents.filter((d: any) => d.is_visible_on_portal).map((doc: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center px-5 py-4 hover:bg-muted/30 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                                                        <FileText className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm">{doc.type === 'quote' ? 'Bản đề xuất' : doc.type === 'contract' ? 'Hợp đồng' : doc.type === 'acceptance' ? 'Nghiệm thu' : 'Tài liệu'}</p>
                                                        <p className="text-xs text-muted-foreground">{doc.doc_number || doc.id}</p>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="outline" onClick={() => handleViewDoc(doc.id)}>
                                                    Xem bản mềm
                                                </Button>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                        </TabsContent>
                    )}
                </Tabs>

                {/* Document Viewer Dialog */}
                <Dialog open={isViewingDoc} onOpenChange={setIsViewingDoc}>
                    <DialogContent className="max-w-5xl h-[90vh] p-0 flex flex-col overflow-hidden bg-muted/30" showCloseButton={true}>
                        <div className="flex-1 overflow-auto p-4 md:p-8 flex items-start justify-center">
                            <style>{`
                                .portal-doc-viewer > div { padding: 10mm 15mm !important; }
                                @media (min-width: 1024px) { .portal-doc-viewer > div { padding: 15mm 20mm !important; } }
                            `}</style>
                            <div
                                className="portal-doc-viewer bg-white shadow-lg ring-1 ring-border/50 text-black mx-auto overflow-hidden rounded shadow-sm"
                                style={{ width: '210mm', minHeight: '297mm', maxWidth: '100%' }}
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedDocContent || '') }}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    )
}
