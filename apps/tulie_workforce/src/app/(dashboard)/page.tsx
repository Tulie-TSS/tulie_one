import { Header } from "@/components/layouts/header";
import { Button } from "@repo/ui";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@repo/ui";
import { Badge } from "@repo/ui";
import {
    Bot,
    ClipboardList,
    FileText,
    TrendingUp,
    Plus,
    ArrowRight,
    Zap,
    DollarSign,
    Activity,
    CheckCircle2,
    XCircle,
    Upload,
    Sparkles,
    Clock,
    Workflow,
    ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import {
    mockActivity,
    dashboardStats,
    formatTokens,
    formatCost,
    timeAgo,
} from "@/lib/mock-data";

const statCards = [
    {
        title: "Active Agents",
        value: `${dashboardStats.activeAgents}/${dashboardStats.totalAgents}`,
        description: "Deployed & running",
        icon: Bot,
        href: "/agents",
    },
    {
        title: "Tasks This Week",
        value: String(dashboardStats.totalTasks),
        description: `${dashboardStats.activeTasks} running now`,
        icon: ClipboardList,
        href: "/tasks",
    },
    {
        title: "Success Rate",
        value: `${dashboardStats.successRate}%`,
        description: "Across all workflows",
        icon: TrendingUp,
        href: "/tasks",
    },
    {
        title: "Knowledge Base",
        value: String(dashboardStats.totalDocuments),
        description: "Indexed documents",
        icon: FileText,
        href: "/knowledge",
    },
];

const eventIcons: Record<string, typeof CheckCircle2> = {
    task_completed: CheckCircle2,
    task_failed: XCircle,
    agent_created: Bot,
    document_uploaded: Upload,
    task_assigned: ClipboardList,
    agent_training: Sparkles,
};

const eventIconColors: Record<string, string> = {
    task_completed: "text-emerald-500",
    task_failed: "text-destructive",
    agent_created: "text-indigo-500",
    document_uploaded: "text-sky-500",
    task_assigned: "text-amber-500",
    agent_training: "text-violet-500",
};

export default function DashboardPage() {
    return (
        <>
            <Header title="Overview" />
            
            <div className="mx-auto max-w-[1600px] w-full space-y-6">
                
                {/* ── Page Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Here is what's happening with your AI workforce today.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="h-9">
                            <Upload className="h-4 w-4 mr-2" />
                            Import Data
                        </Button>
                        <Button className="h-9">
                            <Plus className="h-4 w-4 mr-2" />
                            New Workflow
                        </Button>
                    </div>
                </div>

                {/* ── Stat Grid ── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat) => (
                        <Card key={stat.title} className="shadow-sm transition-colors hover:bg-muted/50">
                            <Link href={stat.href} className="flex flex-col h-full rounded-xl">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="text-2xl">{stat.value}</div>
                                        {stat.title === "Tasks This Week" && (
                                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {stat.description}
                                    </p>
                                </CardContent>
                            </Link>
                        </Card>
                    ))}
                </div>

                {/* ── Main Layout Multi-column ── */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                    
                    {/* Activity Feed */}
                    <div className="lg:col-span-2 xl:col-span-3 space-y-4">
                        <Card className="shadow-sm h-full flex flex-col">
                            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-base font-medium">
                                        <Activity className="h-4 w-4 text-primary" />
                                        Live System Activity
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-1">
                                        Real-time logs from all active agents and workflows.
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="px-2 font-medium flex items-center gap-1.5">
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Online
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-0 flex-1">
                                <div className="divide-y divide-border">
                                    {mockActivity.slice(0, 8).map((event) => {
                                        const Icon = eventIcons[event.type] || Activity;
                                        const colorClass = eventIconColors[event.type] || "text-muted-foreground";
                                        return (
                                            <div
                                                key={event.id}
                                                className="flex items-start gap-4 p-4 transition-colors hover:bg-muted/30"
                                            >
                                                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background ${colorClass}`}>
                                                    <Icon className="h-4 w-4 current-color" style={{ color: "currentColor" }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <p className="text-sm font-medium text-foreground">
                                                            {event.description}
                                                        </p>
                                                        <span className="shrink-0 text-xs text-muted-foreground">
                                                            {timeAgo(event.timestamp)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        {event.agentName && (
                                                            <Badge variant="secondary" className="font-normal text-xs bg-muted/50">
                                                                <Bot className="mr-1 h-3 w-3" />
                                                                {event.agentName}
                                                            </Badge>
                                                        )}
                                                        {event.type === 'task_failed' && (
                                                            <span className="text-xs font-medium text-destructive cursor-pointer hover:underline pl-1">
                                                                View Error Log →
                                                            </span>
                                                        )}
                                                        {event.type === 'task_completed' && (
                                                            <span className="text-xs font-medium text-primary cursor-pointer hover:underline pl-1">
                                                                View Result →
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                            <div className="border-t p-3 text-center">
                                <Button variant="ghost" size="sm" className="w-full text-sm font-medium">
                                    View All Logs <ArrowRight className="ml-1.5 h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        
                        {/* Usage Summary */}
                        <Card className="shadow-sm border bg-zinc-950 text-zinc-50">
                            <CardHeader className="pb-3 border-b border-zinc-900">
                                <CardTitle className="flex items-center gap-2 text-white text-base font-medium">
                                    <Zap className="h-4 w-4 text-amber-500" />
                                    Resource Usage
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-zinc-400">Tokens Processed</span>
                                        <span className="font-semibold text-zinc-100">
                                            {formatTokens(dashboardStats.totalTokensIn + dashboardStats.totalTokensOut)}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                                        <div className="h-full bg-primary rounded-full" style={{ width: '65%' }} />
                                    </div>
                                    <p className="text-[11px] text-zinc-500 text-right">65% of monthly limit</p>
                                </div>

                                <div className="pt-3 border-t border-zinc-900">
                                    <p className="text-xs text-zinc-400 mb-1">Estimated Cost</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl text-zinc-100">
                                            {formatCost(dashboardStats.totalCost)}
                                        </span>
                                        <span className="text-xs text-zinc-500 font-medium">USD</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Action Tiles */}
                        <Card className="shadow-sm flex flex-col h-full">
                            <CardHeader className="pb-3 border-b flex-none">
                                <CardTitle className="text-base font-medium">Quick Launch</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 grid grid-cols-2 gap-3 flex-1 content-start">
                                <Link href="/agents/new" className="block">
                                    <div className="flex flex-col items-center justify-center gap-2 rounded-md border p-4 text-center transition-colors hover:bg-muted">
                                        <Bot className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-xs font-medium text-foreground">New Agent</span>
                                    </div>
                                </Link>
                                
                                <Link href="/tasks/new" className="block">
                                    <div className="flex flex-col items-center justify-center gap-2 rounded-md border p-4 text-center transition-colors hover:bg-muted">
                                        <ClipboardList className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-xs font-medium text-foreground">Assign Task</span>
                                    </div>
                                </Link>
                                
                                <Link href="/knowledge" className="block">
                                    <div className="flex flex-col items-center justify-center gap-2 rounded-md border p-4 text-center transition-colors hover:bg-muted">
                                        <Upload className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-xs font-medium text-foreground">Import Data</span>
                                    </div>
                                </Link>
                                
                                <Link href="/automations" className="block">
                                    <div className="flex flex-col items-center justify-center gap-2 rounded-md border p-4 text-center transition-colors hover:bg-muted">
                                        <Workflow className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-xs font-medium text-foreground">Workflow</span>
                                    </div>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
