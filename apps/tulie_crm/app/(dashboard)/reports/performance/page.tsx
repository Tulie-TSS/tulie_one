import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { Button } from '@repo/ui'
import { Badge } from '@repo/ui'
import { ArrowLeft, Users, ClipboardCheck, Clock, AlertTriangle, Trophy, Zap } from 'lucide-react'
import Link from 'next/link'
import { getTeamOverview, getWorkloadDistribution } from '@/lib/supabase/services/team-performance-service'
import { PerformanceCharts } from './performance-charts'

export default async function PerformanceReportPage() {
    const [teamOverview, workload] = await Promise.all([
        getTeamOverview(),
        getWorkloadDistribution(),
    ])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild className="h-9 w-9">
                    <Link href="/reports">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Báo cáo hiệu suất team</h1>
                    <p className="text-sm text-muted-foreground mt-1">Theo dõi KPI và hiệu quả làm việc của nhân viên</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Thành viên</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teamOverview.total_members}</div>
                        <p className="text-xs text-muted-foreground mt-1">{teamOverview.active_projects} dự án đang chạy</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Tổng task</CardTitle>
                        <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teamOverview.total_tasks}</div>
                        <p className="text-xs text-muted-foreground mt-1">{teamOverview.completed_tasks} đã hoàn thành</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Tỉ lệ hoàn thành</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{teamOverview.overall_completion_rate}%</div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-3">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                style={{ width: `${teamOverview.overall_completion_rate}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Task quá hạn</CardTitle>
                        <AlertTriangle className={`h-4 w-4 ${teamOverview.overdue_tasks > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${teamOverview.overdue_tasks > 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-500'}`}>
                            {teamOverview.overdue_tasks}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {teamOverview.overdue_tasks === 0 ? 'Không có task quá hạn 🎉' : 'Cần xử lý sớm'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Workload Distribution Chart */}
            {workload.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Phân bổ công việc</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PerformanceCharts workload={workload} />
                    </CardContent>
                </Card>
            )}

            {/* Team Members Performance */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Hiệu suất từng thành viên</CardTitle>
                </CardHeader>
                <CardContent>
                    {teamOverview.members.length > 0 ? (
                        <div className="space-y-4">
                            {/* Header row */}
                            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground pb-2 border-b">
                                <div className="col-span-3">Thành viên</div>
                                <div className="col-span-1 text-center">Task</div>
                                <div className="col-span-1 text-center">Xong</div>
                                <div className="col-span-1 text-center">Đang</div>
                                <div className="col-span-1 text-center">Quá hạn</div>
                                <div className="col-span-2 text-center">Hoàn thành</div>
                                <div className="col-span-1 text-center">TB ngày</div>
                                <div className="col-span-2 text-center">Dự án</div>
                            </div>

                            {teamOverview.members.map((member) => (
                                <div key={member.user.id} className="grid grid-cols-12 gap-2 items-center text-sm py-1 group">
                                    <div className="col-span-3 flex items-center gap-3 min-w-0">
                                        <div className="h-8 w-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center shrink-0 text-xs font-bold">
                                            {member.user.full_name?.charAt(0) || '?'}
                                        </div>
                                        <div className="min-w-0 flex flex-col">
                                            <p className="font-medium text-foreground leading-none truncate">{member.user.full_name}</p>
                                            <p className="text-[10px] text-muted-foreground mt-1">{member.user.role}</p>
                                        </div>
                                    </div>
                                    <div className="col-span-1 text-center font-mono font-medium text-muted-foreground">{member.tasks_total}</div>
                                    <div className="col-span-1 text-center text-emerald-600 dark:text-emerald-500 font-mono font-medium">{member.tasks_completed}</div>
                                    <div className="col-span-1 text-center text-blue-600 dark:text-blue-500 font-mono font-medium">{member.tasks_in_progress}</div>
                                    <div className="col-span-1 text-center font-mono font-medium">
                                        {member.tasks_overdue > 0 ? (
                                            <span className="text-destructive">{member.tasks_overdue}</span>
                                        ) : (
                                            <span className="text-muted-foreground/50">0</span>
                                        )}
                                    </div>
                                    <div className="col-span-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ${
                                                        member.completion_rate >= 80 ? 'bg-emerald-500'
                                                        : member.completion_rate >= 50 ? 'bg-amber-500'
                                                        : 'bg-destructive'
                                                    }`}
                                                    style={{ width: `${member.completion_rate}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium font-mono text-muted-foreground w-9 text-right">{member.completion_rate}%</span>
                                        </div>
                                    </div>
                                    <div className="col-span-1 text-center font-mono text-xs text-muted-foreground">{member.avg_completion_days}d</div>
                                    <div className="col-span-2 flex justify-center">
                                        <Badge variant="outline" className="font-normal text-[10px] px-1.5 py-0 h-4 bg-secondary/50">
                                            {member.projects_active} dự án
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Users className="h-8 w-8 text-muted-foreground/30 mb-3" />
                            <p className="text-sm font-medium text-foreground">Chưa có dữ liệu hiệu suất team.</p>
                            <p className="text-xs text-muted-foreground mt-1">Cần có workspace tasks và members trong hệ thống.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Workload Table */}
            {workload.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Tải công việc hiện tại</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {workload.map((w: any) => {
                                const maxTasks = Math.max(...workload.map((x: any) => x.active_tasks), 1)
                                const pct = (w.active_tasks / maxTasks) * 100
                                return (
                                    <div key={w.user_id} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-foreground">{w.full_name}</span>
                                                <span className="text-xs text-muted-foreground font-mono">({w.role})</span>
                                            </div>
                                            <span className="font-medium text-foreground text-xs">{w.active_tasks} tasks</span>
                                        </div>
                                        <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${
                                                    w.active_tasks > 10 ? 'bg-destructive'
                                                    : w.active_tasks > 5 ? 'bg-amber-500'
                                                    : 'bg-emerald-500'
                                                }`}
                                                style={{ width: `${Math.max(pct, 4)}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
