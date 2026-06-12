import { getProjectById } from '@/lib/supabase/services/project-service'
import { getUsers } from '@/lib/supabase/services/user-service'
import { getWorkItemsByProject } from '@/lib/supabase/services/work-item-service'
import { notFound } from 'next/navigation'
import { Button } from '@repo/ui'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui'
import { Badge } from '@repo/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { StatusBadge } from '@/components/shared/status-badge'
import { ArrowLeft, Globe, TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import Link from 'next/link'
import { ProjectMetadataForm } from '@/components/projects/project-metadata-form'
import { ProjectTasks } from '@/components/projects/project-tasks'
import { ProjectSidebar } from '@/components/projects/project-sidebar'
import { WorkItemsManager } from '@/components/projects/work-items-manager'
import { ProjectDescriptionForm } from '@/components/projects/project-description-form'
import { SetPasswordDialog } from '@/components/shared/set-password-dialog'
import { DeleteProjectButton } from '@/components/projects/delete-project-button'
import { ProjectGanttChart } from '@/components/projects/project-gantt-chart'
import { ProjectDocumentationSet } from '@/components/projects/project-documentation-set'
import { ProjectActivityHistory } from '@/components/projects/project-activity-history'
import { getProjectTasks } from '@/lib/supabase/services/task-service'
import { PortalViewAnalytics } from '@/components/portal/portal-view-analytics'
import { FeedbackBoard } from '@/components/portal/feedback-board'
import { EntityPipelineTracker } from '@/components/shared/entity-pipeline-tracker'
import { createClient } from '@/lib/supabase/server'

export default async function ProjectDetailPage({ params }: any) {
    const { id } = await params
    const [project, teamMembers, workItems, tasks] = await Promise.all([
        getProjectById(id),
        getUsers(),
        getWorkItemsByProject(id),
        getProjectTasks(id)
    ])

    if (!project) notFound()

    // Totals logic: contracts if any, else primary quotation only
    const contracts = project.contracts || []
    const quotations = project.quotations || []

    // Fetch invoices related to project contracts
    const supabase = await createClient()
    const contractIds = contracts.map((c: any) => c.id)
    let invoices: any[] = []
    
    const filters = [`project_id.eq.${id}`]
    if (contractIds.length > 0) {
        filters.push(`contract_id.in.(${contractIds.join(',')})`)
    }
    
    const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*, customer:customers(id, company_name), vendor:vendors(id, name), payments:invoice_payments(*)')
        .or(filters.join(','))
        
    if (!invoicesError && invoicesData) {
        invoices = invoicesData
    }

    // B2B Customer Contracts (Revenue)
    const customerContracts = contracts.filter((c: any) => !c.category || c.category === 'customer')
    const b2bRevenue = customerContracts.reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0)

    // Freelancer Subcontractor Contracts (Cost)
    const freelancerContracts = contracts.filter((c: any) => c.category === 'freelancer')
    const freelancerCost = freelancerContracts.reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0)

    // Gross Profit (Expected Profit)
    const grossProfit = b2bRevenue - freelancerCost

    // Cash Collected (Revenue output invoices paid amount)
    const cashCollected = invoices
        .filter((inv: any) => inv.type === 'output')
        .reduce((sum: number, inv: any) => sum + (inv.paid_amount || 0), 0)

    // Cash Paid (Freelancer input invoices paid amount)
    const cashPaid = invoices
        .filter((inv: any) => inv.type === 'input')
        .reduce((sum: number, inv: any) => sum + (inv.paid_amount || 0), 0)

    // Cash Flow Profit (Actual Cash Collected - Cash Paid)
    const cashFlowProfit = cashCollected - cashPaid

    const portalUrl = contracts.length > 0 && contracts[0].public_token ? `/portal/${contracts[0].public_token}` : null

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80">
                        <Link href="/projects">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">{project.title}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <StatusBadge status={project.status} entityType="project" />
                        </div>
                        {project.customer && (
                            <p className="text-muted-foreground mt-1">
                                Khách hàng: <Link href={`/customers/${project.customer.id}`} className="hover:underline font-medium">{project.customer.company_name}</Link>
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <DeleteProjectButton projectId={project.id} />
                    <SetPasswordDialog
                        entityId={project.id}
                        tableName="projects"
                        hasPassword={!!project.password_hash}
                        hasFinancialPassword={!!project.financial_password_hash}
                    />
                    {portalUrl && (
                        <Button variant="outline" asChild>
                            <Link href={portalUrl} target="_blank">
                                <Globe className="h-4 w-4" />
                                Mở Portal Dự Án
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <EntityPipelineTracker entityType="project" entityId={id} />

            {/* Cash Flow KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* 1. B2B Customer Contract Value (Revenue) */}
                <div className="bg-card border border-emerald-500/20 dark:border-emerald-500/10 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Doanh thu B2B</span>
                        <h3 className="text-xl font-bold tracking-tight mt-1 tabular-nums text-foreground">{formatCurrency(b2bRevenue)}</h3>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-muted-foreground">{customerContracts.length} HĐ khách hàng</span>
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                {/* 2. Freelancer Subcontractor Cost */}
                <div className="bg-card border border-rose-500/20 dark:border-rose-500/10 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-rose-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Chi phí Freelancer</span>
                        <h3 className="text-xl font-bold tracking-tight mt-1 tabular-nums text-foreground">{formatCurrency(freelancerCost)}</h3>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-muted-foreground">{freelancerContracts.length} HĐ thầu phụ</span>
                        <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                            <TrendingDown className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                {/* 3. Gross Profit (Expected Profit) */}
                <div className="bg-card border border-blue-500/20 dark:border-blue-500/10 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-blue-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Lợi nhuận gộp (D/K)</span>
                        <h3 className="text-xl font-bold tracking-tight mt-1 tabular-nums text-foreground">{formatCurrency(grossProfit)}</h3>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-muted-foreground">Tỷ suất: {b2bRevenue > 0 ? `${Math.round((grossProfit / b2bRevenue) * 100)}%` : '0%'}</span>
                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <DollarSign className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                {/* 4. Cash Collected */}
                <div className="bg-card border border-emerald-500/25 dark:border-emerald-500/15 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Thực thu từ KH</span>
                        <h3 className="text-xl font-bold tracking-tight mt-1 tabular-nums text-foreground">{formatCurrency(cashCollected)}</h3>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-muted-foreground">Thu đạt: {b2bRevenue > 0 ? `${Math.round((cashCollected / b2bRevenue) * 100)}%` : '0%'}</span>
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                            <ArrowUpRight className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                {/* 5. Cash Paid */}
                <div className="bg-card border border-rose-500/25 dark:border-rose-500/15 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-rose-500/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300">Thực chi Freelancer</span>
                        <h3 className="text-xl font-bold tracking-tight mt-1 tabular-nums text-foreground">{formatCurrency(cashPaid)}</h3>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-muted-foreground">Chi đạt: {freelancerCost > 0 ? `${Math.round((cashPaid / freelancerCost) * 100)}%` : '0%'}</span>
                        <div className="h-8 w-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-700 dark:text-rose-300">
                            <ArrowDownLeft className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                {/* 6. Cash Flow Profit */}
                <div className="bg-card border border-violet-500/25 dark:border-violet-500/15 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-violet-500/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-300">Dòng tiền ròng</span>
                        <h3 className="text-xl font-bold tracking-tight mt-1 tabular-nums text-foreground">{formatCurrency(cashFlowProfit)}</h3>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-muted-foreground">Khả dụng</span>
                        <div className="h-8 w-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-700 dark:text-violet-300">
                            <Wallet className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Redesigned Project Management Dashboard Tabs */}
            <Tabs defaultValue="tasks" className="space-y-6">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                    <TabsTrigger 
                        value="tasks" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 pt-2 font-medium"
                    >
                        Hạng mục & Công việc
                    </TabsTrigger>
                    <TabsTrigger 
                        value="quotations_contracts"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 pt-2 font-medium"
                    >
                        Báo giá & Hợp đồng
                    </TabsTrigger>
                    <TabsTrigger 
                        value="finance"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 pt-2 font-medium"
                    >
                        Hóa đơn & Kế hoạch tiền
                    </TabsTrigger>
                    <TabsTrigger 
                        value="documents"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 pt-2 font-medium"
                    >
                        Bộ chứng từ ({project.acceptance_reports?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger 
                        value="settings_logs"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 pt-2 font-medium"
                    >
                        Cấu hình & Nhật ký
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="tasks" className="space-y-6 mt-6">
                    {/* Work Items Manager */}
                    <WorkItemsManager project={project} workItems={workItems} />
                    
                    {/* Gantt Chart Progress */}
                    <ProjectGanttChart tasks={tasks} />

                    {/* Detailed Tasks */}
                    <ProjectTasks project={project} workItems={workItems} />
                </TabsContent>

                <TabsContent value="quotations_contracts" className="space-y-6 mt-6">
                    {/* Quotations List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Danh sách báo giá liên quan</CardTitle>
                            <CardDescription>Các báo giá được liên kết hoặc tạo cho dự án này.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {quotations.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground text-sm">Không có báo giá nào liên quan.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-muted-foreground border-collapse">
                                        <thead className="text-xs uppercase bg-muted text-muted-foreground font-semibold border-b">
                                            <tr>
                                                <th className="p-3">Số báo giá</th>
                                                <th className="p-3">Tiêu đề</th>
                                                <th className="p-3">Giá trị</th>
                                                <th className="p-3">Trạng thái</th>
                                                <th className="p-3">Ngày tạo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {quotations.map((q: any) => (
                                                <tr key={q.id} className="border-b hover:bg-muted/50 transition-colors">
                                                    <td className="p-3 font-medium text-foreground">
                                                        <Link href={`/quotations/${q.id}`} className="hover:underline text-primary font-semibold">
                                                            {q.quotation_number}
                                                        </Link>
                                                    </td>
                                                    <td className="p-3 text-foreground">{q.title}</td>
                                                    <td className="p-3 font-medium text-foreground">{formatCurrency(q.total_amount)}</td>
                                                    <td className="p-3">
                                                        <StatusBadge entityType="quotation" status={q.status} />
                                                    </td>
                                                    <td className="p-3">{formatDate(q.created_at)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Contracts List */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle>Danh sách hợp đồng</CardTitle>
                                <CardDescription>Bao gồm hợp đồng ký với khách hàng và hợp đồng CTV thầu phụ.</CardDescription>
                            </div>
                            <Button size="sm" asChild>
                                <Link href={`/contracts/new?projectId=${project.id}`}>Tạo hợp đồng</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {contracts.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground text-sm">Không có hợp đồng nào liên quan.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-muted-foreground border-collapse">
                                        <thead className="text-xs uppercase bg-muted text-muted-foreground font-semibold border-b">
                                            <tr>
                                                <th className="p-3">Số hợp đồng</th>
                                                <th className="p-3">Phân loại</th>
                                                <th className="p-3">Đối tác / Khách hàng</th>
                                                <th className="p-3">Tiêu đề</th>
                                                <th className="p-3">Giá trị</th>
                                                <th className="p-3">Thời hạn</th>
                                                <th className="p-3">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {contracts.map((c: any) => {
                                                const partnerName = c.category === 'freelancer' 
                                                    ? (c.freelancer_metadata?.name || 'Freelancer') 
                                                    : (project.customer?.company_name || 'Khách hàng B2B');
                                                return (
                                                    <tr key={c.id} className="border-b hover:bg-muted/50 transition-colors">
                                                        <td className="p-3 font-medium text-foreground">
                                                            <Link href={`/contracts/${c.id}`} className="hover:underline text-primary font-semibold">
                                                                {c.contract_number}
                                                            </Link>
                                                        </td>
                                                        <td className="p-3">
                                                            <Badge variant={c.category === 'freelancer' ? 'outline' : 'secondary'}>
                                                                {c.category === 'freelancer' ? 'Thầu phụ (Freelancer)' : 'Khách hàng (B2B)'}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-3 font-medium text-foreground">{partnerName}</td>
                                                        <td className="p-3 text-foreground truncate max-w-[200px]">{c.title}</td>
                                                        <td className="p-3 font-semibold text-foreground">{formatCurrency(c.total_amount)}</td>
                                                        <td className="p-3 text-xs">
                                                            {formatDate(c.start_date)} {c.end_date ? `→ ${formatDate(c.end_date)}` : ''}
                                                        </td>
                                                        <td className="p-3">
                                                            <StatusBadge entityType="contract" status={c.status} />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="finance" className="space-y-6 mt-6">
                    {/* Invoices List */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Output Invoices */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Hóa đơn đầu ra (Thu khách hàng)</CardTitle>
                                    <CardDescription>Các hóa đơn yêu cầu thanh toán gửi cho khách hàng.</CardDescription>
                                </div>
                                <Button size="sm" asChild variant="outline">
                                    <Link href="/invoices/new?type=output">Tạo Hóa đơn</Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {invoices.filter((i: any) => i.type === 'output').length === 0 ? (
                                    <div className="text-center py-6 text-muted-foreground text-sm">Không có hóa đơn đầu ra nào.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left text-muted-foreground border-collapse">
                                            <thead className="text-xs uppercase bg-muted text-muted-foreground font-semibold border-b">
                                                <tr>
                                                    <th className="p-3">Số HĐ</th>
                                                    <th className="p-3">Giá trị</th>
                                                    <th className="p-3">Đã thu</th>
                                                    <th className="p-3">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoices.filter((i: any) => i.type === 'output').map((inv: any) => (
                                                    <tr key={inv.id} className="border-b hover:bg-muted/50 transition-colors">
                                                        <td className="p-3">
                                                            <Link href={`/invoices/${inv.id}`} className="hover:underline text-primary font-semibold">
                                                                {inv.invoice_number}
                                                            </Link>
                                                        </td>
                                                        <td className="p-3 font-semibold text-foreground">{formatCurrency(inv.total_amount)}</td>
                                                        <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(inv.paid_amount)}</td>
                                                        <td className="p-3">
                                                            <StatusBadge entityType="invoice" status={inv.status} />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Input Invoices */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Hóa đơn đầu vào (Chi thầu phụ)</CardTitle>
                                    <CardDescription>Các yêu cầu thanh toán nhận được từ freelancer.</CardDescription>
                                </div>
                                <Button size="sm" asChild variant="outline">
                                    <Link href="/invoices/new?type=input">Ghi nhận chi phí</Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {invoices.filter((i: any) => i.type === 'input').length === 0 ? (
                                    <div className="text-center py-6 text-muted-foreground text-sm">Không có chi phí đầu vào nào.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left text-muted-foreground border-collapse">
                                            <thead className="text-xs uppercase bg-muted text-muted-foreground font-semibold border-b">
                                                <tr>
                                                    <th className="p-3">Số HĐ / Tên</th>
                                                    <th className="p-3">Đối tác</th>
                                                    <th className="p-3">Giá trị</th>
                                                    <th className="p-3">Đã chi</th>
                                                    <th className="p-3">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoices.filter((i: any) => i.type === 'input').map((inv: any) => (
                                                    <tr key={inv.id} className="border-b hover:bg-muted/50 transition-colors">
                                                        <td className="p-3">
                                                            <Link href={`/invoices/${inv.id}`} className="hover:underline text-primary font-semibold">
                                                                {inv.invoice_number}
                                                            </Link>
                                                        </td>
                                                        <td className="p-3 text-foreground truncate max-w-[120px]">{inv.vendor?.name || 'Freelancer'}</td>
                                                        <td className="p-3 font-semibold text-foreground">{formatCurrency(inv.total_amount)}</td>
                                                        <td className="p-3 font-medium text-rose-600 dark:text-rose-400">{formatCurrency(inv.paid_amount)}</td>
                                                        <td className="p-3">
                                                            <StatusBadge entityType="invoice" status={inv.status} />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Milestones / Payment Schedule */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Đợt thanh toán theo kế hoạch (Milestones)</CardTitle>
                            <CardDescription>Kế hoạch dòng tiền tương ứng với các giai đoạn hoàn thành.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {project.milestones && project.milestones.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-muted-foreground border-collapse">
                                        <thead className="text-xs uppercase bg-muted text-muted-foreground font-semibold border-b">
                                            <tr>
                                                <th className="p-3">Tên đợt</th>
                                                <th className="p-3">Mô tả</th>
                                                <th className="p-3">Hạn thanh toán</th>
                                                <th className="p-3">Số tiền</th>
                                                <th className="p-3">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {project.milestones.map((m: any) => (
                                                <tr key={m.id} className="border-b hover:bg-muted/50 transition-colors">
                                                    <td className="p-3 font-medium text-foreground">{m.name}</td>
                                                    <td className="p-3 text-foreground">{m.description}</td>
                                                    <td className="p-3">{formatDate(m.due_date)}</td>
                                                    <td className="p-3 font-semibold text-foreground">{formatCurrency(m.amount)}</td>
                                                    <td className="p-3">
                                                        <StatusBadge entityType="milestone" status={m.status} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground text-sm">Không có kế hoạch thanh toán nào.</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="documents" className="space-y-6 mt-6">
                    <ProjectDocumentationSet project={project} workItems={workItems} />
                </TabsContent>

                <TabsContent value="settings_logs" className="space-y-6 mt-6">
                    {/* Overview & Metadata */}
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle>Tài nguyên dự án (Agency Assets)</CardTitle>
                            <CardDescription>Các liên kết bàn giao, thiết kế, tên miền.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProjectMetadataForm project={project} />
                        </CardContent>
                    </Card>

                    {/* Description Section */}
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle>Mô tả dự án</CardTitle>
                            <CardDescription>Thông tin chi tiết về dự án</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProjectDescriptionForm project={project} />
                        </CardContent>
                    </Card>

                    {/* Sidebar components */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <ProjectSidebar project={project} teamMembers={teamMembers} />
                        <PortalViewAnalytics projectId={project.id} />
                    </div>

                    <FeedbackBoard projectId={project.id} customerId={project.customer_id} customerName="Agency Admin" isAdmin={true} />
                    <ProjectActivityHistory projectId={project.id} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

