'use client'

import React, { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCycle } from '@/hooks/useCycle'
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Separator
} from '@repo/ui'
import { 
    Loader2, 
    ArrowLeft, 
    Calendar, 
    Target, 
    Briefcase, 
    CheckCircle2, 
    Clock, 
    MoreHorizontal,
    Edit2,
    Settings,
    Plus
} from 'lucide-react'
import { TASK_STATUS_LABELS } from '@/lib/constants/task-status'
import { EditCycleDialog } from '@/components/cycles/edit-cycle-dialog'
import { useNewTaskStore } from '@/lib/stores/use-new-task-store'

export default function CycleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const { t } = useLocaleStore()
    const { cycle, projects, tasks, loading, error, refetch } = useCycle(id)
    const [editOpen, setEditOpen] = React.useState(false)
    const openNewTask = useNewTaskStore(state => state.openWithDefaults)

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error || !cycle) {
        return (
            <div className="flex flex-col h-[60vh] items-center justify-center gap-4">
                <div className="p-4 rounded-full bg-destructive/10">
                    <Settings className="size-8 text-destructive" />
                </div>
                <h1 className="text-xl font-semibold">{error || 'Không tìm thấy chu kỳ'}</h1>
                <Button onClick={() => router.push('/cycles')}>Quay lại danh sách</Button>
            </div>
        )
    }

    // Calculations
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'done').length
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    
    const goals = Array.isArray(cycle.goals) ? cycle.goals : []
    const avgGoalProgress = goals.length > 0 
        ? Math.round(goals.reduce((acc, g) => acc + (g.progress || 0), 0) / goals.length) 
        : 0

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Link href="/cycles" className="hover:text-foreground transition-colors flex items-center gap-1">
                    <ArrowLeft className="size-3" />
                    {t('nav.cycles')}
                </Link>
                <span>/</span>
                <span className="text-foreground font-medium">{cycle.name}</span>
            </div>

            <PageHeader 
                title={cycle.name} 
                description={`${cycle.start_date ? new Date(cycle.start_date).toLocaleDateString('vi-VN') : '—'} — ${cycle.end_date ? new Date(cycle.end_date).toLocaleDateString('vi-VN') : '—'}`}
            >
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                        <Edit2 className="size-3.5 mr-2" />
                        Chỉnh sửa
                    </Button>
                    <Badge variant={cycle.status === 'active' ? 'default' : 'secondary'}>
                        {cycle.status === 'active' ? 'Đang diễn ra' : cycle.status}
                    </Badge>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Goals Section */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Target className="size-5 text-primary" />
                                {t('cycles.goals')}
                            </CardTitle>
                            <span className="text-sm font-medium text-muted-foreground">{avgGoalProgress}% Hoàn thành</span>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-5">
                            {goals.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic py-4">Chưa có mục tiêu chiến lược nào được thiết lập.</p>
                            ) : (
                                goals.map((g, i) => {
                                    const progressVal = Number(g.progress) || 0;
                                    return (
                                        <div key={i} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium">{g.title}</span>
                                                <span className="text-muted-foreground font-semibold">{progressVal}%</span>
                                            </div>
                                            <Progress value={progressVal} className="h-2" />
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>

                    {/* Content Tabs */}
                    <Tabs defaultValue="projects" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="projects">Dự án ({projects.length})</TabsTrigger>
                            <TabsTrigger value="tasks">Công việc ({tasks.length})</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="projects" className="mt-4 space-y-4">
                            {projects.length === 0 ? (
                                <Card className="border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-10 gap-3">
                                        <Briefcase className="size-10 text-muted-foreground/30" />
                                        <p className="text-sm text-muted-foreground text-center">Chưa có dự án nào được gán vào chu kỳ này.</p>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href="/projects/new">Tạo dự án mới</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {projects.map(p => (
                                        <Link key={p.id} href={`/projects/${p.id}`}>
                                            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                                                <CardHeader className="p-4 pb-2">
                                                    <Badge variant="outline" className="mb-2 w-fit">{p.status}</Badge>
                                                    <CardTitle className="text-base">{p.name}</CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-4 pt-0">
                                                    <p className="text-xs text-muted-foreground line-clamp-2">{p.description || 'Không có mô tả'}</p>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="tasks" className="mt-4 space-y-2">
                            <div className="flex justify-end mb-2">
                                <Button size="sm" variant="outline" onClick={() => openNewTask({ cycle_id: cycle.id })}>
                                    <Plus className="size-3.5 mr-1" />
                                    Thêm công việc
                                </Button>
                            </div>
                            {tasks.length === 0 ? (
                                <p className="text-center py-10 text-muted-foreground text-sm">Chưa có công việc nào.</p>
                            ) : (
                                <div className="border rounded-md divide-y overflow-hidden">
                                    {tasks.map(t => (
                                        <div key={t.id} className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors group">
                                            {t.status === 'done' 
                                                ? <CheckCircle2 className="size-4 text-primary shrink-0" />
                                                : <div className="size-4 rounded-full border border-muted-foreground/30 shrink-0" />
                                            }
                                            <span className={`text-sm flex-1 truncate ${t.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                                                {t.title}
                                            </span>
                                            <Badge variant="secondary" className="text-[10px] uppercase font-bold py-0 h-4">
                                                {TASK_STATUS_LABELS[t.status as keyof typeof TASK_STATUS_LABELS] || t.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Thống kê tiến độ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col items-center justify-center py-4">
                                <div className="relative size-32">
                                    <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted" strokeWidth="2" />
                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-primary" strokeWidth="2" 
                                            strokeDasharray={`${taskCompletionRate}, 100`} strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold">{taskCompletionRate}%</span>
                                        <span className="text-[10px] text-muted-foreground">Tasks</span>
                                    </div>
                                </div>
                            </div>
                            
                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-muted-foreground" />
                                        <span>Hoàn thành</span>
                                    </div>
                                    <span className="font-bold">{completedTasks}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <Clock className="size-4 text-muted-foreground" />
                                        <span>Đang thực hiện</span>
                                    </div>
                                    <span className="font-bold">{totalTasks - completedTasks}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Milestones Sidebar */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Cột mốc (Milestones)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {cycle.milestones?.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic">Chưa thiết lập cột mốc.</p>
                            ) : (
                                cycle.milestones?.map(ms => {
                                    const rate = Number(ms.completion_rate) || 0;
                                    return (
                                        <div key={ms.id} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-medium line-clamp-1">{ms.name}</span>
                                                <span className="text-muted-foreground">{rate}%</span>
                                            </div>
                                            <Progress value={rate} className="h-1" />
                                            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <Calendar className="size-2.5" />
                                                {ms.target_date ? new Date(ms.target_date).toLocaleDateString('vi-VN') : '—'}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
            <EditCycleDialog 
                cycle={cycle} 
                open={editOpen} 
                onOpenChange={setEditOpen} 
                onSuccess={refetch}
            />
        </div>
    )
}
