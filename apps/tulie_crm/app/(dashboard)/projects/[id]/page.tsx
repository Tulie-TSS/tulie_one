import { getProjectById } from '@/lib/supabase/services/project-service'
import { getUsers } from '@/lib/supabase/services/user-service'
import { getWorkItemsByProject } from '@/lib/supabase/services/work-item-service'
import { notFound } from 'next/navigation'
import { Button } from '@repo/ui'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui'
import { Badge } from '@repo/ui'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { StatusBadge } from '@/components/shared/status-badge'
import { ArrowLeft, Globe, Layout, FileCheck } from 'lucide-react'
import Link from 'next/link'
import { ProjectMetadataForm } from '@/components/projects/project-metadata-form'

import { ProjectTasks } from '@/components/projects/project-tasks'
import { ProjectSidebar } from '@/components/projects/project-sidebar'
import { WorkItemsManager } from '@/components/projects/work-items-manager'
import { FileText as FileTextIcon, Lock } from 'lucide-react'
import { ProjectDescriptionForm } from '@/components/projects/project-description-form'
import { SetPasswordDialog } from '@/components/shared/set-password-dialog'
import { DeleteProjectButton } from '@/components/projects/delete-project-button'
import { ProjectGanttChart } from '@/components/projects/project-gantt-chart'
import { ProjectDocumentationSet } from '@/components/projects/project-documentation-set'
import { ProjectActivityHistory } from '@/components/projects/project-activity-history'
import { getProjectTasks } from '@/lib/supabase/services/task-service'
import { PortalViewAnalytics } from '@/components/portal/portal-view-analytics'
import { FeedbackBoard } from '@/components/portal/feedback-board'

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

    // Fix: use contract total if exists, else sum accepted quotations, fallback to all
    const acceptedTotal = quotations.filter((q: any) => q.status === 'accepted').reduce((sum: number, q: any) => sum + (q.total_amount || 0), 0)
    const allQuoteTotal = quotations.reduce((sum: number, q: any) => sum + (q.total_amount || 0), 0)
    const contractTotal = contracts.reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0)
    const projectTotal = contractTotal > 0 ? contractTotal : (acceptedTotal > 0 ? acceptedTotal : allQuoteTotal)

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
                        <p className="text-muted-foreground mt-1">
                            Khách hàng: <Link href={`/customers/${project.customer?.id}`} className="hover:underline font-medium">{project.customer?.company_name}</Link>
                        </p>
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

            <div className="space-y-6">
                <div className="space-y-6">
                    {/* Work Items Manager */}
                    <WorkItemsManager project={project} workItems={workItems} />

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



                    {/* Gantt Chart Progress */}
                    <ProjectGanttChart tasks={tasks} />

                    {/* Documentation Set (Bộ chứng từ dự án) */}
                    <ProjectDocumentationSet project={project} workItems={workItems} />


                    {/* Detailed Tasks */}
                    <ProjectTasks project={project} workItems={workItems} />

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
                </div>

                {/* Sidebar components - full width below */}
                <div className="grid gap-6 md:grid-cols-2">
                    <ProjectSidebar project={project} teamMembers={teamMembers} />
                    <PortalViewAnalytics projectId={project.id} />
                </div>
                <FeedbackBoard projectId={project.id} customerId={project.customer_id} customerName="Agency Admin" isAdmin={true} />
                <ProjectActivityHistory projectId={project.id} />
            </div>
        </div>
    )
}
