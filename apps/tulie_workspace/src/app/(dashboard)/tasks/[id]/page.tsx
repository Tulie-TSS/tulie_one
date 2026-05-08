'use client'

import React, { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { 
    TASK_STATUS_LABELS, 
    TASK_STATUS_COLORS, 
    VALID_TRANSITIONS 
} from '@/lib/constants/task-status'
import type { TaskStatus } from '@/types/database.types'
import { CommentForm } from '@/components/tasks/comment-form'
import { 
    PageHeader, 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    Button, 
    Badge, 
    Separator,
    Avatar,
    AvatarFallback,
    toast,
    Textarea
} from '@repo/ui'
import { 
    Loader2, 
    ArrowLeft, 
    Clock, 
    CheckCircle2, 
    MessageSquare, 
    History, 
    Calendar, 
    User as UserIcon,
    Briefcase,
    Edit2,
    ShieldAlert,
    ChevronRight,
    Send
} from 'lucide-react'
import { QuickEditTaskDialog } from '@/components/tasks/quick-edit-task-dialog'
import { useProjects } from '@/hooks/useProjects'

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [task, setTask] = useState<any>(null)
    const [comments, setComments] = useState<any[]>([])
    const [logs, setLogs] = useState<any[]>([])
    const [editOpen, setEditOpen] = useState(false)
    const { projects } = useProjects()

    const fetchData = React.useCallback(async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            
            // 1. Fetch Task
            const { data: taskData, error: taskError } = await supabase
                .from('tasks')
                .select(`
                    *,
                    assignee:user_profiles!tasks_assigned_to_fkey(id, full_name, email, avatar_url),
                    project:projects(id, name),
                    tags:task_tags(tag:tags(id, name, color))
                `)
                .eq('id', id)
                .single()

            if (taskError) throw taskError
            setTask(taskData)

            // 2. Fetch Comments
            const { data: commentsData } = await supabase
                .from('comments')
                .select(`
                    *,
                    user:user_profiles(id, full_name, avatar_url)
                `)
                .eq('task_id', id)
                .order('created_at', { ascending: true })

            setComments(commentsData || [])

            // 3. Fetch Logs
            const { data: logsData } = await supabase
                .from('task_logs')
                .select(`
                    *,
                    user:user_profiles(id, full_name)
                `)
                .eq('task_id', id)
                .order('created_at', { ascending: false })

            setLogs(logsData || [])

        } catch (err: any) {
            toast.error(err.message || 'Lỗi tải chi tiết công việc.')
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleStatusChange = async (newStatus: TaskStatus) => {
        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('tasks')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', id)

            if (error) throw error
            toast.success(`Đã chuyển sang ${TASK_STATUS_LABELS[newStatus]}`)
            fetchData()
        } catch (err: any) {
            toast.error(err.message || 'Lỗi cập nhật trạng thái.')
        }
    }

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!task) {
        return (
            <div className="flex flex-col h-[60vh] items-center justify-center gap-4">
                <ShieldAlert className="size-12 text-muted-foreground" />
                <h1 className="text-xl font-semibold text-muted-foreground">Không tìm thấy công việc</h1>
                <Button onClick={() => router.push('/tasks')}>Quay lại danh sách</Button>
            </div>
        )
    }

    const nextTransitions = VALID_TRANSITIONS[task.status as TaskStatus] || []
    const tags = task.tags?.map((tt: any) => tt.tag).filter(Boolean) || []

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Link href="/tasks" className="hover:text-foreground transition-colors flex items-center gap-1">
                    <ArrowLeft className="size-3" />
                    Công việc
                </Link>
                <span>/</span>
                <Link href={`/projects/${task.project_id}`} className="hover:text-foreground transition-colors truncate max-w-[200px]">
                    {task.project?.name || 'Dự án'}
                </Link>
                <span>/</span>
                <span className="text-foreground font-medium">#{task.id.slice(0, 4)}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge style={{ backgroundColor: TASK_STATUS_COLORS[task.status as TaskStatus] + '20', color: TASK_STATUS_COLORS[task.status as TaskStatus], borderColor: TASK_STATUS_COLORS[task.status as TaskStatus] + '40' }}>
                            {TASK_STATUS_LABELS[task.status as TaskStatus]}
                        </Badge>
                        {task.eisenhower_quadrant && (
                            <Badge variant="outline">{task.eisenhower_quadrant}</Badge>
                        )}
                        {tags.map((tag: any) => (
                            <Badge key={tag.id} variant="outline" className="border-none" style={{ backgroundColor: tag.color + '15', color: tag.color }}>
                                {tag.name}
                            </Badge>
                        ))}
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{task.title}</h1>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                        <Edit2 className="size-3.5 mr-2" />
                        Chỉnh sửa
                    </Button>
                </div>
            </div>

            {/* Transitions Bar */}
            {nextTransitions.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                    <span className="text-xs font-medium text-muted-foreground px-2 flex items-center gap-1">
                        <ChevronRight className="size-3" />
                        Chuyển trạng thái:
                    </span>
                    {nextTransitions.map(status => (
                        <Button 
                            key={status} 
                            variant="secondary" 
                            size="sm" 
                            className="h-8 text-xs font-semibold"
                            onClick={() => handleStatusChange(status)}
                        >
                            {TASK_STATUS_LABELS[status]}
                        </Button>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    {/* Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-bold">Mô tả</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {task.description ? (
                                <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/80">
                                    {task.description}
                                </div>
                            ) : (
                                <p className="text-sm italic text-muted-foreground">Chưa có mô tả chi tiết.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Comments */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <MessageSquare className="size-4" />
                                Bình luận ({comments.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-6">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-4">
                                        <Avatar className="size-8 shrink-0">
                                            <AvatarFallback>{comment.user?.full_name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold">{comment.user?.full_name}</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(comment.created_at).toLocaleString('vi-VN')}
                                                </span>
                                            </div>
                                            <div className="text-sm text-foreground/80 leading-relaxed bg-muted/40 p-3 rounded-lg border">
                                                {comment.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-4 pt-2">
                                <div className="flex gap-4">
                                    <Avatar className="size-8 shrink-0">
                                        <AvatarFallback>Me</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-3">
                                        <CommentForm taskId={task.id} onCommentAdded={fetchData} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity Log */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <History className="size-4" />
                                Lịch sử hoạt động
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y text-xs">
                                {logs.map((log) => (
                                    <div key={log.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="size-2 rounded-full bg-primary/40" />
                                            <span>
                                                <span className="font-bold">{log.user?.full_name || 'Hệ thống'}</span>
                                                {' '}chuyển trạng thái {log.from_value ? `từ ${log.from_value} ` : ''}→ <span className="font-bold">{log.to_value}</span>
                                            </span>
                                        </div>
                                        <span className="text-muted-foreground">
                                            {new Date(log.created_at).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Chi tiết công việc</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <UserIcon className="size-4" />
                                        <span>Thực hiện</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{task.assignee?.full_name || 'Chưa giao'}</span>
                                        <Avatar className="size-5">
                                            <AvatarFallback className="text-[8px]">{task.assignee?.full_name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="size-4" />
                                        <span>Ước tính</span>
                                    </div>
                                    <span className="font-bold">{task.estimated_effort_hours}h</span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Briefcase className="size-4" />
                                        <span>Dự án</span>
                                    </div>
                                    <Link href={`/projects/${task.project_id}`} className="font-medium text-primary hover:underline underline-offset-4 truncate max-w-[120px]">
                                        {task.project?.name}
                                    </Link>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="size-4" />
                                        <span>Hạn hoàn thành</span>
                                    </div>
                                    <span className="font-medium">
                                        {task.requested_deadline ? new Date(task.requested_deadline).toLocaleDateString('vi-VN') : '—'}
                                    </span>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Hiệu suất</span>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Hofstadter Index</span>
                                    <span className="font-mono">x{task.hofstadter_multiplier}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Thời lượng thực</span>
                                    <span className="font-mono">{task.scheduled_duration_hours}h</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <QuickEditTaskDialog
                task={task}
                projects={projects}
                open={editOpen}
                onOpenChange={setEditOpen}
                onSuccess={fetchData}
            />
        </div>
    )
}
