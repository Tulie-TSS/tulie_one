'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, Button, ScrollArea, Badge } from '@repo/ui'
import { format, differenceInDays, startOfDay, addDays, isSameDay } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectGanttChartProps {
    tasks: any[]
}

export function ProjectGanttChart({ tasks }: ProjectGanttChartProps) {
    const [viewDate, setViewDate] = useState(startOfDay(new Date()))

    // Display 14 days view
    const daysInView = 21
    const timelineDates = useMemo(() => {
        return Array.from({ length: daysInView }).map((_, i) => addDays(addDays(viewDate, -7), i))
    }, [viewDate])

    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    const today = startOfDay(now)

    const todayLinePosition = useMemo(() => {
        const index = timelineDates.findIndex(d => isSameDay(d, now))
        if (index === -1) return null
        
        // Snap to center of the day cell for perfect alignment with header
        return ((index + 0.5) / daysInView) * 100
    }, [now, timelineDates, daysInView])

    const monthSegments = useMemo(() => {
        const segments: { label: string, count: number }[] = [];
        timelineDates.forEach(date => {
            const label = format(date, 'MMMM, yyyy', { locale: vi });
            if (segments.length === 0 || segments[segments.length - 1].label !== label) {
                segments.push({ label, count: 1 });
            } else {
                segments[segments.length - 1].count++;
            }
        });
        return segments;
    }, [timelineDates])

    const getTaskStyle = (task: any) => {
        const start = task.start_date ? startOfDay(new Date(task.start_date)) : null
        const end = task.end_date ? startOfDay(new Date(task.end_date)) : null

        if (!start || !end) return null

        const viewStart = timelineDates[0]
        const viewEnd = timelineDates[timelineDates.length - 1]

        // Check overlapping
        if (end < viewStart || start > viewEnd) return null

        const dayWidth = 100 / daysInView
        const leftDays = differenceInDays(start < viewStart ? viewStart : start, viewStart)
        const durationDays = differenceInDays(end > viewEnd ? viewEnd : end, start < viewStart ? viewStart : start) + 1

        return {
            left: `${leftDays * dayWidth}%`,
            width: `${durationDays * dayWidth}%`,
        }
    }

    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'completed': return 'default'
            case 'in_progress': return 'secondary'
            case 'blocked': return 'destructive'
            default: return 'outline'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-500'
            case 'in_progress': return 'bg-blue-500'
            case 'blocked': return 'bg-destructive'
            default: return 'bg-muted-foreground'
        }
    }

    return (
        <Card className="overflow-hidden flex flex-col h-[700px]">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold leading-none tracking-tight">Kế hoạch triển khai (Gantt View)</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">Trực quan hoá lộ trình dự án</CardDescription>
                </div>
                <div className="shrink-0">
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setViewDate(addDays(viewDate, -7))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs font-medium" onClick={() => setViewDate(today)}>Hôm nay</Button>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setViewDate(addDays(viewDate, 7))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 relative overflow-auto custom-scrollbar">
                <div className="min-w-[1000px] h-full flex flex-col relative w-full">
                    
                    {/* Gantt Header - Months & Days */}
                    <div className="bg-background w-full z-20 sticky top-0 border-b shadow-sm">
                        {/* Month Row */}
                        <div className="flex border-b border-border/50">
                            <div className="w-[280px] shrink-0 bg-muted/30 border-r border-border/50 font-semibold text-xs tracking-wider text-muted-foreground uppercase flex items-center px-4">
                                Đầu việc
                            </div>
                            <div className="flex-1 flex overflow-hidden">
                                {monthSegments.map((seg, i) => (
                                    <div 
                                        key={i} 
                                        className="py-1.5 px-4 border-r border-border/50 text-xs font-semibold text-muted-foreground text-center bg-muted/10"
                                        style={{ width: `${(100 / daysInView) * seg.count}%` }}
                                    >
                                        <span className="capitalize">{seg.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Days Row */}
                        <div className="flex bg-background">
                            <div className="w-[280px] shrink-0 border-r border-border/50 bg-muted/30 px-4 h-11 flex items-center z-30 font-semibold text-xs tracking-wider text-muted-foreground uppercase">
                                Tên Task
                            </div>
                            <div className="flex-1 flex relative">
                                {timelineDates.map((date, i) => {
                                    const dayOfWeek = format(date, 'i', { locale: vi });
                                    const isWeekend = dayOfWeek === '6' || dayOfWeek === '7';
                                    const isToday = isSameDay(date, today);
                                    
                                    return (
                                        <div
                                            key={i}
                                            className={cn(
                                                "p-2 text-center border-r border-border/50 flex flex-col items-center justify-center min-h-[44px] transition-colors relative",
                                                isToday ? "bg-primary/5" : isWeekend ? "bg-muted/20" : "bg-transparent"
                                            )}
                                            style={{ width: `${100 / daysInView}%` }}
                                        >
                                            <span className={cn(
                                                "text-[10px] font-semibold tracking-wider uppercase mb-0.5",
                                                isToday ? "text-primary" : "text-muted-foreground"
                                            )}>
                                                {dayOfWeek === '7' ? 'CN' : `T${Number(dayOfWeek) + 1}`}
                                            </span>
                                            <span className={cn(
                                                "text-sm font-semibold tabular-nums leading-none",
                                                isToday ? "text-primary" : "text-foreground"
                                            )}>
                                                {format(date, 'dd')}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Gantt Body / Rows */}
                    <div className="divide-y border-b relative h-max">
                        {/* Red "Today" Line connecting body vertically */}
                        {todayLinePosition !== null && (
                            <div
                                className="absolute top-0 bottom-0 w-0 border-l-[2px] border-dashed border-primary/50 z-10 pointer-events-none"
                                style={{
                                    left: `calc(280px + ${todayLinePosition} * calc(100% - 280px) / 100)`
                                }}
                            >
                                <div className="absolute -top-1.5 -left-[5px] w-2 h-2 rounded-full bg-primary" />
                            </div>
                        )}

                        {tasks.length === 0 ? (
                            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm relative z-20 bg-background/80">
                                Chưa có dữ liệu lịch trình cho các task.
                            </div>
                        ) : tasks.map((task) => {
                            const style = getTaskStyle(task)
                            return (
                                <div key={task.id} className="flex hover:bg-muted/50 transition-colors h-[50px]">
                                    {/* Locked Left Column */}
                                    <div className="w-[280px] shrink-0 px-4 py-3 border-r border-border/50 flex items-center bg-muted/5 z-20 group-hover:bg-muted/50">
                                        <p className="text-sm font-medium text-foreground truncate" title={task.title}>{task.title}</p>
                                    </div>
                                    
                                    {/* Timeline Column */}
                                    <div className="flex-1 relative h-full flex items-center">
                                        {/* Background Grid Lines matching the header logic */}
                                        <div className="absolute inset-0 flex">
                                            {Array.from({ length: daysInView }).map((_, i) => (
                                                <div key={i} className="border-r border-border/30 last:border-r-0" style={{ width: `${100 / daysInView}%` }} />
                                            ))}
                                        </div>

                                        {/* Colored Task Bar overlay */}
                                        {style && (
                                            <div
                                                className={cn(
                                                    "absolute h-7 rounded hover:shadow-md max-w-full flex items-center px-3 z-[15] transition-all cursor-default border",
                                                    getStatusColor(task.status),
                                                    task.status === 'completed' || task.status === 'active' || task.status === 'in_progress' ? "text-primary-foreground border-transparent" : "text-foreground bg-background border-border"
                                                )}
                                                style={style}
                                            >
                                                <span className="text-xs font-medium truncate">{task.title}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </CardContent>

            {/* Footer Legend */}
            <div className="shrink-0 p-4 border-t bg-muted/40 flex flex-wrap items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                    <span className="text-xs font-medium text-muted-foreground">Hoàn thành</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-blue-500" />
                    <span className="text-xs font-medium text-muted-foreground">Đang tiến hành</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-destructive" />
                    <span className="text-xs font-medium text-muted-foreground">Bị chặn/Huỷ</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-background border border-border" />
                    <span className="text-xs font-medium text-muted-foreground">Chưa bắt đầu</span>
                </div>
            </div>
        </Card>
    )
}
