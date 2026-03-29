"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/layouts/header";
import { Button } from "@repo/ui";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@repo/ui";
import { Badge } from "@repo/ui";
import {
    Plus,
    Clock,
    Bot,
    Table,
    Columns3,
    Calendar,
    GanttChart,
    ArrowUpDown,
    ChevronDown,
    Search,
    CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { mockTasks, timeAgo, formatTokens, formatCost } from "@/lib/mock-data";
import type { TaskStatus, TaskPriority } from "@/lib/mock-data";

// ─── Premium Maps ──────────────────────────────────

const statusVariant: Record<TaskStatus, "success" | "warning" | "outline" | "destructive" | "secondary"> = {
    completed: "success",
    in_progress: "warning",
    pending: "outline",
    failed: "destructive",
    cancelled: "secondary",
};

const statusLabel: Record<TaskStatus, string> = {
    completed: "Completed",
    in_progress: "Running",
    pending: "Pending",
    failed: "Failed",
    cancelled: "Cancelled",
};

const priorityVariant: Record<TaskPriority, "destructive" | "info" | "secondary" | "outline"> = {
    urgent: "destructive",
    high: "info",
    medium: "secondary",
    low: "outline",
};

const priorityOrder: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

// ─── Filter / Sort / View Types ───────────────────────────

type FilterStatus = "all" | TaskStatus;
type SortKey = "created" | "priority" | "status";
type ViewMode = "table" | "kanban" | "calendar" | "gantt";

const filterTabs: { value: FilterStatus; label: string }[] = [
    { value: "all", label: "All Tasks" },
    { value: "in_progress", label: "Running" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
];

const viewModes: { value: ViewMode; label: string; icon: typeof Table }[] = [
    { value: "table", label: "Table", icon: Table },
    { value: "kanban", label: "Kanban", icon: Columns3 },
    { value: "calendar", label: "Calendar", icon: Calendar },
    { value: "gantt", label: "Gantt", icon: GanttChart },
];

const sortOptions: { value: SortKey; label: string }[] = [
    { value: "created", label: "Date created" },
    { value: "priority", label: "Priority" },
    { value: "status", label: "Status" },
];

// ─── Kanban Columns ───────────────────────────────────────

const kanbanCols: { status: TaskStatus; title: string; color: string }[] = [
    { status: "pending", title: "Pending", color: "bg-muted" },
    { status: "in_progress", title: "Running", color: "bg-emerald-500" },
    { status: "completed", title: "Completed", color: "bg-indigo-500" },
    { status: "failed", title: "Failed", color: "bg-destructive" },
];

// ─── Calendar Helpers ─────────────────────────────────────

function getWeekDays() {
    const base = new Date("2026-02-09");
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(base);
        d.setDate(base.getDate() + i);
        return d;
    });
}
function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Gantt bar colors (Premium palette) ──────────────────

const ganttBarColor: Record<TaskStatus, string> = {
    completed: "bg-indigo-500 shadow-indigo-500/20",
    in_progress: "bg-emerald-500 shadow-emerald-500/20",
    pending: "bg-zinc-300 text-zinc-700",
    failed: "bg-destructive shadow-destructive/20",
    cancelled: "bg-muted text-muted-foreground",
};

// ─── Page ─────────────────────────────────────────────────

export default function TasksPage() {
    const [filter, setFilter] = useState<FilterStatus>("all");
    const [sortKey, setSortKey] = useState<SortKey>("created");
    const [view, setView] = useState<ViewMode>("table");
    const [showSort, setShowSort] = useState(false);

    const filtered = useMemo(() => {
        let tasks = filter === "all" ? mockTasks : mockTasks.filter((t) => t.status === filter);
        tasks = [...tasks].sort((a, b) => {
            if (sortKey === "priority") return priorityOrder[a.priority] - priorityOrder[b.priority];
            if (sortKey === "status") return a.status.localeCompare(b.status);
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        return tasks;
    }, [filter, sortKey]);

    const activeCount = mockTasks.filter((t) => t.status === "in_progress" || t.status === "pending").length;

    return (
        <>
            <Header title="Tasks" />
            
            <main className="mx-auto max-w-[1600px] space-y-6">
                {/* ── Page Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl text-foreground flex items-center gap-3">
                            Task Management
                            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-0">
                                {activeCount} Active
                            </Badge>
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Track, assign, and monitor tasks across your AI workforce.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/tasks/new">
                            <Button className="h-9 bg-primary text-primary-foreground hover:bg-primary/95 shadow-primary/20 text-sm font-medium">
                                <Plus className="h-4 w-4 mr-2" />
                                Assign Task
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* ── Toolbar: Filter tabs + View + Sort ── */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-2 rounded-md border border-border">
                    {/* Modern Segmented Control for Filters */}
                    <div className="flex gap-1 rounded-lg bg-muted/80 p-1 w-full md:w-auto overflow-x-auto no-scrollbar">
                        {filterTabs.map((tab) => {
                            const count = tab.value === "all" ? mockTasks.length : mockTasks.filter(t => t.status === tab.value).length;
                            return (
                                <button
                                    key={tab.value}
                                    onClick={() => setFilter(tab.value)}
                                    className={`relative flex items-center justify-center gap-2 px-4 py-2 rounded-md text-[13px] font-semibold transition-all shrink-0 ${ filter === tab.value ? "bg-white text-foreground ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground hover:bg-white/50" }`}
                                >
                                    {tab.label}
                                    <span className={`flex h-5 items-center justify-center rounded-full px-1.5 text-[10px] ${ filter === tab.value ? "bg-primary/10 text-primary" : "bg-black/5 text-muted-foreground" }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Search Bar - Visual only for aesthetic premium feel */}
                        <div className="relative hidden lg:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input 
                                type="text" 
                                placeholder="Search tasks..." 
                                className="h-9 w-64 rounded-lg border border-border bg-muted pl-10 pr-4 text-[13px] outline-none transition-colors focus:border-primary/50 focus:bg-white focus:ring-1 focus:ring-primary/20"
                            />
                        </div>

                        <div className="h-6 w-px bg-border hidden md:block" />

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSort(!showSort)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-white text-[13px] font-medium text-foreground hover:bg-muted transition-colors"
                            >
                                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                                <span className="hidden sm:inline">Sort: {sortOptions.find((s) => s.value === sortKey)?.label}</span>
                                <span className="sm:hidden">Sort</span>
                                <ChevronDown className="h-3 w-3 text-muted-foreground ml-1" />
                            </button>
                            {showSort && (
                                <div className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-popover z-20 overflow-hidden py-1">
                                    {sortOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => {
                                                setSortKey(opt.value);
                                                setShowSort(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors flex justify-between items-center ${ sortKey === opt.value ? "bg-primary/5 text-primary font-semibold" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground font-medium" }`}
                                        >
                                            {opt.label}
                                            {sortKey === opt.value && <CheckCircle2 className="h-4 w-4" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex rounded-lg border border-border p-1 bg-muted">
                            {viewModes.map((v) => (
                                <button
                                    key={v.value}
                                    onClick={() => setView(v.value)}
                                    title={v.label}
                                    className={`flex items-center justify-center w-8 h-8 rounded-md transition-all ${ view === v.value ? "bg-white text-primary ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground" }`}
                                >
                                    <v.icon className={`h-4 w-4 ${view === v.value ? "stroke-[2.5px]" : "stroke-2"}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Views ── */}
                
                {/* Table View */}
                {view === "table" && (
                    <Card className="card-elevated border-transparent">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/50">
                                            <th className="text-left px-6 py-4 text-[11px] uppercase tracking-widest text-muted-foreground">Task Overview</th>
                                            <th className="text-left px-6 py-4 text-[11px] uppercase tracking-widest text-muted-foreground">Assigned Agent</th>
                                            <th className="text-left px-6 py-4 text-[11px] uppercase tracking-widest text-muted-foreground">Priority</th>
                                            <th className="text-left px-6 py-4 text-[11px] uppercase tracking-widest text-muted-foreground">Status</th>
                                            <th className="text-right px-6 py-4 text-[11px] uppercase tracking-widest text-muted-foreground">Cost/Tokens</th>
                                            <th className="text-right px-6 py-4 text-[11px] uppercase tracking-widest text-muted-foreground">Timeline</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((task) => (
                                            <tr key={task.id} className="border-b border-border/40 transition-colors hover:bg-muted/50 group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${ task.status === 'in_progress' ? 'bg-emerald-500 animate-pulse-dot' : task.status === 'failed' ? 'bg-destructive' : 'bg-transparent' }`} />
                                                        <div>
                                                            <Link href={`/tasks/${task.id}`} className="text-[14px] font-semibold text-foreground group-hover:text-primary transition-colors block">
                                                                {task.title}
                                                            </Link>
                                                            <p className="text-[13px] text-muted-foreground mt-1 line-clamp-1 max-w-sm">{task.description}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
                                                            <Bot className="h-4 w-4" />
                                                        </div>
                                                        <span className="text-[13px] font-medium text-foreground">{task.agentName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={priorityVariant[task.priority]} className="font-semibold">{task.priority}</Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={statusVariant[task.status]} className="font-semibold">{statusLabel[task.status]}</Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[13px] text-foreground">{formatCost(task.costUsd)}</span>
                                                        <span className="text-[11px] text-muted-foreground font-medium">{formatTokens(task.tokensIn + task.tokensOut)} tkns</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5 text-[13px] font-medium text-muted-foreground">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        {timeAgo(task.createdAt)}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filtered.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                                    No tasks found matching your filters.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Kanban View */}
                {view === "kanban" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                        {kanbanCols.map((col) => {
                            const colTasks = filtered.filter((t) => t.status === col.status);
                            return (
                                <div key={col.status} className="bg-muted/50 rounded-md p-4 border border-border">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                                            <h3 className="text-sm text-foreground tracking-wide uppercase">{col.title}</h3>
                                        </div>
                                        <Badge variant="secondary" className="bg-white px-2 py-0.5">
                                            {colTasks.length}
                                        </Badge>
                                    </div>
                                    <div className="space-y-3 min-h-[500px]">
                                        {colTasks.length === 0 && (
                                            <div className="rounded-md border border-dashed border-border/80 p-8 text-center flex flex-col items-center justify-center h-32">
                                                <p className="text-xs font-medium text-muted-foreground">Drop tasks here</p>
                                            </div>
                                        )}
                                        {colTasks.map((task) => (
                                            <Link key={task.id} href={`/tasks/${task.id}`} className="block group">
                                                <Card className="card-elevated border-transparent hover:border-primary/20 cursor-pointer">
                                                    <CardContent className="p-4">
                                                        <div className="flex justify-between items-start gap-2 mb-2">
                                                            <Badge variant={priorityVariant[task.priority]} className="text-[10px] px-1.5 py-0">
                                                                {task.priority}
                                                            </Badge>
                                                            <span className="text-[10px] text-muted-foreground font-medium flex items-center">
                                                                <Clock className="mr-1 h-3 w-3" />
                                                                {timeAgo(task.createdAt).replace(' hours ago', 'h').replace(' days ago', 'd')}
                                                            </span>
                                                        </div>
                                                        <p className="text-[13px] text-foreground leading-snug group-hover:text-primary transition-colors">{task.title}</p>
                                                        <div className="mt-4 flex items-center gap-2">
                                                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0">
                                                                <Bot className="h-3.5 w-3.5" />
                                                            </div>
                                                            <span className="text-[11px] font-semibold text-muted-foreground truncate">{task.agentName}</span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Calendar View */}
                {view === "calendar" && (
                    <Card className="card-elevated overflow-hidden border-transparent">
                        <CardHeader className="bg-muted border-b border-border">
                            <CardTitle className="text-lg">Week of Feb 9 – 15, 2026</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-7 divide-x divide-border/50">
                                {getWeekDays().map((day, i) => {
                                    const dayTasks = filtered.filter((t) => isSameDay(new Date(t.createdAt), day));
                                    const isToday = day.getDate() === 12;
                                    return (
                                        <div
                                            key={i}
                                            className={`min-h-[600px] ${isToday ? "bg-primary/[0.02]" : "bg-white"}`}
                                        >
                                            <div className={`px-3 py-3 text-center border-b border-border ${isToday ? "bg-primary/5" : ""}`}>
                                                <p className={`text-[11px] uppercase tracking-wider ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                                                    {dayLabels[i]}
                                                </p>
                                                <p className={`text-2xl mt-0.5 font-light ${isToday ? "text-primary font-medium" : "text-foreground"}`}>
                                                    {day.getDate()}
                                                </p>
                                            </div>
                                            <div className="p-2 space-y-1.5">
                                                {dayTasks.map((task) => (
                                                    <Link key={task.id} href={`/tasks/${task.id}`} className="block">
                                                        <div className="px-2 py-2 rounded-lg bg-white border border-border hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group">
                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${ task.status === 'in_progress' ? 'bg-emerald-500' : task.status === 'completed' ? 'bg-indigo-500' : task.status === 'failed' ? 'bg-destructive' : 'bg-zinc-300' }`} />
                                                                <p className="text-[11px] text-foreground truncate group-hover:text-primary">{task.title}</p>
                                                            </div>
                                                            <p className="text-[10px] text-muted-foreground font-medium truncate">{task.agentName}</p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Gantt View */}
                {view === "gantt" && (
                    <Card className="card-elevated border-transparent overflow-hidden">
                        <CardHeader className="bg-muted border-b border-border">
                            <CardTitle className="text-lg">Timeline — Feb 2026</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto">
                            {/* Day Headers */}
                            <div className="flex border-b border-border bg-muted/50">
                                <div className="w-[300px] shrink-0 px-6 py-3 border-r border-border flex flex-col justify-end">
                                    <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Task Overview</span>
                                </div>
                                <div className="flex-1 flex">
                                    {Array.from({ length: 14 }, (_, i) => i + 1).map((d) => (
                                        <div
                                            key={d}
                                            className={`flex-1 min-w-[60px] flex flex-col items-center justify-end py-3 border-r border-border/30 last:border-r-0 ${ d === 12 ? "bg-primary/5" : "" }`}
                                        >
                                            <span className={`text-[12px] font-semibold ${d === 12 ? "text-primary bg-primary/10 px-2 py-0.5 rounded-full" : "text-muted-foreground"}`}>
                                                Feb {d}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Task Rows */}
                            {filtered.map((task) => {
                                const start = new Date(task.createdAt).getDate();
                                const end = task.completedAt ? new Date(task.completedAt).getDate() : (task.status === "in_progress" ? 14 : start);
                                const duration = Math.max(end - start + 1, 1);
                                const leftPct = ((start - 1) / 14) * 100;
                                const widthPct = Math.min((duration / 14) * 100, 100 - leftPct);

                                return (
                                    <div key={task.id} className="flex border-b border-border/40 hover:bg-muted/50 transition-colors group">
                                        <div className="w-[300px] shrink-0 px-6 py-4 border-r border-border">
                                            <Link href={`/tasks/${task.id}`} className="text-[13px] text-foreground hover:text-primary transition-colors truncate block">
                                                {task.title}
                                            </Link>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <Badge variant={statusVariant[task.status]} className="text-[9px] px-1 py-0 h-4">
                                                    {statusLabel[task.status]}
                                                </Badge>
                                                <span className="text-[11px] font-medium text-muted-foreground truncate">{task.agentName}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 relative py-4 px-1 min-h-[64px]">
                                            {/* Background grid lines */}
                                            <div className="absolute inset-0 flex pointer-events-none">
                                                {Array.from({ length: 14 }).map((_, i) => (
                                                    <div key={i} className="flex-1 border-r border-border/20 last:border-r-0" />
                                                ))}
                                            </div>
                                            
                                            <div
                                                className={`absolute top-1/2 -translate-y-1/2 h-8 rounded-lg flex items-center px-3 transition-transform group-hover:scale-[1.02] cursor-pointer ${ganttBarColor[task.status]} ${task.status === 'pending' || task.status === 'cancelled' ? 'border border-border' : 'text-white'}`}
                                                style={{ left: `calc(${leftPct}% + 8px)`, width: `calc(${widthPct}% - 16px)`, minWidth: '40px' }}
                                            >
                                                <span className="text-[11px] tracking-wide truncate">
                                                    {task.title}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}
            </main>
        </>
    );
}
