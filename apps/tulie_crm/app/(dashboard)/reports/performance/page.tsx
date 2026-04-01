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
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/reports">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Báo cáo hiệu suất team</h1>
                    <p className="text-muted-foreground">Theo dõi KPI và hiệu quả làm việc của nhân viên</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Thành viên</p>
                                <p className="text-3xl font-bold mt-1">{teamOverview.total_members}</p>
                            </div>
                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{teamOverview.active_projects} dự án đang chạy</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Tổng task</p>
                                <p className="text-3xl font-bold mt-1">{teamOverview.total_tasks}</p>
                            </div>
                            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <ClipboardCheck className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{teamOverview.completed_tasks} đã hoàn thành</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Tỉ lệ hoàn thành</p>
                                <p className="text-3xl font-bold mt-1 text-emerald-600">{teamOverview.overall_completion_rate}%</p>
                            </div>
                            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <Zap className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-3">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                style={{ width: `${teamOverview.overall_completion_rate}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Task quá hạn</p>
                                <p className={`text-3xl font-bold mt-1 ${teamOverview.overdue_tasks > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{teamOverview.overdue_tasks}</p>
                            </div>
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${teamOverview.overdue_tasks > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                                <AlertTriangle className={`h-5 w-5 ${teamOverview.overdue_tasks > 0 ? 'text-red-600' : 'text-emerald-600'}`} />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {teamOverview.overdue_tasks === 0 ? 'Không có task quá hạn 🎉' : 'Cần xử lý sớm'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Workload Distribution Chart */}
            {workload.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Phân bổ công việc</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PerformanceCharts workload={workload} />
                    </CardContent>
                </Card>
            )}

            {/* Team Members Performance */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Hiệu suất từng thành viên</CardTitle>
                </CardHeader>
                <CardContent>
                    {teamOverview.members.length > 0 ? (
                        <div className="space-y-4">
                            {/* Header row */}
                            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground pb-2 border-b">
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
                                <div key={member.user.id} className="grid grid-cols-12 gap-2 items-center text-sm">
                                    <div className="col-span-3 flex items-center gap-2 min-w-0">
                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-bold">
                                            {member.user.full_name?.charAt(0) || '?'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">{member.user.full_name}</p>
                                            <p className="text-[10px] text-muted-foreground">{member.user.role}</p>
                                        </div>
                                    </div>
                                    <div className="col-span-1 text-center font-medium">{member.tasks_total}</div>
                                    <div className="col-span-1 text-center text-emerald-600 font-medium">{member.tasks_completed}</div>
                                    <div className="col-span-1 text-center text-blue-600 font-medium">{member.tasks_in_progress}</div>
                                    <div className="col-span-1 text-center">
                                        {member.tasks_overdue > 0 ? (
                                            <span className="text-red-600 font-medium">{member.tasks_overdue}</span>
                                        ) : (
                                            <span className="text-muted-foreground">0</span>
                                        )}
                                    </div>
                                    <div className="col-span-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ${
                                                        member.completion_rate >= 80 ? 'bg-emerald-500'
                                                        : member.completion_rate >= 50 ? 'bg-amber-500'
                                                        : 'bg-red-500'
                                                    }`}
                                                    style={{ width: `${member.completion_rate}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium w-8 text-right">{member.completion_rate}%</span>
                                        </div>
                                    </div>
                                    <div className="col-span-1 text-center text-muted-foreground">{member.avg_completion_days}d</div>
                                    <div className="col-span-2 text-center">
                                        <Badge variant="secondary" className="text-[10px]">
                                            {member.projects_active} dự án
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">Chưa có dữ liệu hiệu suất team.</p>
                            <p className="text-xs text-muted-foreground mt-1">Cần có workspace tasks và members trong hệ thống.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Workload Table */}
            {workload.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Tải công việc hiện tại</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {workload.map((w: any) => {
                                const maxTasks = Math.max(...workload.map((x: any) => x.active_tasks), 1)
                                const pct = (w.active_tasks / maxTasks) * 100
                                return (
                                    <div key={w.user_id} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{w.full_name}</span>
                                                <span className="text-xs text-muted-foreground">({w.role})</span>
                                            </div>
                                            <span className="font-semibold">{w.active_tasks} tasks</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${
                                                    w.active_tasks > 10 ? 'bg-red-500'
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
