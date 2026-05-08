'use client'

import React, { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useProject } from '@/hooks/useProject'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { 
    PageHeader, 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    Button, 
    Badge, 
    Progress,
    Separator
} from '@repo/ui'
import { 
    Loader2, 
    ArrowLeft, 
    Briefcase, 
    CheckCircle2, 
    Clock, 
    Edit2,
    Settings,
    Plus,
    Calendar,
    User,
    Users
} from 'lucide-react'
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '@/lib/constants/task-status'
import { useNewTaskStore } from '@/lib/stores/use-new-task-store'
import { EditProjectDialog } from '@/components/projects/edit-project-dialog'
import { QuickEditTaskDialog } from '@/components/tasks/quick-edit-task-dialog'
import { useProjects } from '@/hooks/useProjects'

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const { t } = useLocaleStore()
    const { project, tasks, loading, error, refetch } = useProject(id)
    const [members, setMembers] = React.useState<any[]>([])
    const { projects } = useProjects()
    const openNewTask = useNewTaskStore(state => state.openWithDefaults)

    const [editProjectOpen, setEditProjectOpen] = React.useState(false)
    const [taskToEdit, setTaskToEdit] = React.useState<any>(null)

    const fetchData = React.useCallback(async () => {
        const supabase = await import('@/lib/supabase').then(m => m.createClient())
        const { data: membersData } = await supabase
            .from('project_members')
            .select('user:user_profiles(id, full_name, avatar_url)')
            .eq('project_id', id)
        if (membersData) setMembers(membersData.map((m: any) => m.user))
        refetch()
    }, [id, refetch])

    React.useEffect(() => {
        fetchData()
    }, [fetchData])

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error || !project) {
        return (
            <div className="flex flex-col h-[60vh] items-center justify-center gap-4">
                <div className="p-4 rounded-full bg-destructive/10">
                    <Briefcase className="size-8 text-destructive" />
                </div>
                <h1 className="text-xl font-semibold">{error || 'Không tìm thấy dự án'}</h1>
                <Button onClick={() => router.push('/projects')}>Quay lại danh sách</Button>
            </div>
        )
    }

    const completedTasks = tasks.filter(t => t.status === 'done').length
    const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Link href="/projects" className="hover:text-foreground transition-colors flex items-center gap-1">
                    <ArrowLeft className="size-3" />
                    Dự án
                </Link>
                <span>/</span>
                <span className="text-foreground font-medium">{project.name}</span>
            </div>

            <PageHeader 
                title={project.name} 
                description={project.description || 'Chưa có mô tả cho dự án này.'}
            >
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditProjectOpen(true)}>
                        <Edit2 className="size-3.5 mr-2" />
                        Chỉnh sửa
                    </Button>
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status === 'active' ? 'Đang thực hiện' : project.status}
                    </Badge>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-bold">Danh sách công việc</CardTitle>
                            <Button size="sm" variant="outline" onClick={() => openNewTask({ project_id: project.id, cycle_id: project.cycle_id || undefined })}>
                                <Plus className="size-3.5 mr-1" />
                                Thêm việc
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {tasks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <Clock className="size-8 opacity-20 mb-2" />
                                    <p className="text-sm italic">Chưa có công việc nào.</p>
                                </div>
                            ) : (
                                <div className="divide-y border-t">
                                    {tasks.map(task => (
                                        <div key={task.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group">
                                            {task.status === 'done' 
                                                ? <CheckCircle2 className="size-4 text-primary shrink-0" />
                                                : <div className="size-4 rounded-full border border-muted-foreground/30 shrink-0" />
                                            }
                                            <div className="flex-1 min-w-0">
                                                <div className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                                                    {task.title}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <Badge variant="outline" className="text-[10px] py-0 h-4 bg-muted/50 border-none">
                                                        {TASK_STATUS_LABELS[task.status as keyof typeof TASK_STATUS_LABELS]}
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <Clock className="size-2.5" />
                                                        {task.estimated_effort_hours}h
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="size-7" onClick={() => setTaskToEdit(task)}>
                                                    <Edit2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Thông tin dự án</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Tiến độ</span>
                                    <span className="font-bold">{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <User className="size-4" />
                                        <span>Người phụ trách</span>
                                    </div>
                                    <span className="font-medium text-xs">Owner</span>
                                </div>
                                
                                <Separator />
                                
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        <Users className="size-3.5" />
                                        Thành viên ({members.length})
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {members.map((m) => (
                                            <Avatar key={m.id} className="size-8 border-2 border-background">
                                                <AvatarFallback className="text-[10px]">{m.full_name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        ))}
                                        {members.length === 0 && <span className="text-xs italic text-muted-foreground">Chưa có thành viên</span>}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="size-4" />
                                        <span>Chu kỳ</span>
                                    </div>
                                    {project.cycle_id ? (
                                        <Link href={`/cycles/${project.cycle_id}`} className="font-medium hover:text-primary underline underline-offset-4">
                                            Xem chu kỳ
                                        </Link>
                                    ) : (
                                        <span className="text-muted-foreground italic">Không có</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <EditProjectDialog 
                project={project} 
                open={editProjectOpen} 
                onOpenChange={setEditProjectOpen}
                onSuccess={refetch}
            />

            {taskToEdit && (
                <QuickEditTaskDialog
                    task={taskToEdit}
                    projects={projects}
                    open={!!taskToEdit}
                    onOpenChange={(open) => !open && setTaskToEdit(null)}
                    onSuccess={refetch}
                />
            )}
        </div>
    )
}
