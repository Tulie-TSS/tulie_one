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
} from "lucide-react";
import Link from "next/link";
import {
    mockActivity,
    dashboardStats,
    formatTokens,
    formatCost,
    timeAgo,
} from "@/lib/mock-data";

/* ── Premium Stat Cards ── */
const statCards = [
    {
        title: "Active Agents",
        value: `${dashboardStats.activeAgents}/${dashboardStats.totalAgents}`,
        description: "Deployed & running",
        icon: Bot,
        gradient: "from-indigo-500/20 to-violet-500/5",
        iconColor: "text-indigo-600",
        href: "/agents",
    },
    {
        title: "Tasks This Week",
        value: String(dashboardStats.totalTasks),
        description: `${dashboardStats.activeTasks} running now`,
        icon: ClipboardList,
        gradient: "from-emerald-500/20 to-teal-500/5",
        iconColor: "text-emerald-600",
        href: "/tasks",
    },
    {
        title: "Success Rate",
        value: `${dashboardStats.successRate}%`,
        description: "Across all workflows",
        icon: TrendingUp,
        gradient: "from-amber-500/20 to-orange-500/5",
        iconColor: "text-amber-600",
        href: "/tasks",
    },
    {
        title: "Knowledge Base",
        value: String(dashboardStats.totalDocuments),
        description: "Indexed documents",
        icon: FileText,
        gradient: "from-sky-500/20 to-blue-500/5",
        iconColor: "text-sky-600",
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
    task_completed: "text-emerald-600 bg-emerald-50 border-emerald-200",
    task_failed: "text-destructive bg-destructive/10 border-destructive/20",
    agent_created: "text-indigo-600 bg-indigo-50 border-indigo-200",
    document_uploaded: "text-sky-600 bg-sky-50 border-sky-200",
    task_assigned: "text-amber-600 bg-amber-50 border-amber-200",
    agent_training: "text-violet-600 bg-violet-50 border-violet-200",
};

export default function DashboardPage() {
    return (
        <>
            <Header title="Overview" />
            
            <div className="mx-auto max-w-[1600px] space-y-8">
                
                {/* ── Page Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Welcome back
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Here is what's happening with your AI workforce today.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="h-10 border-border bg-white hover:bg-muted shadow-sm text-sm font-medium">
                            <Upload className="h-4 w-4 mr-2 text-muted-foreground" />
                            Import Data
                        </Button>
                        <Button className="h-10 bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/20 text-sm font-medium">
                            <Plus className="h-4 w-4 mr-2" />
                            New Workflow
                        </Button>
                    </div>
                </div>

                {/* ── Stat Grid ── */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat) => (
                        <Link key={stat.title} href={stat.href} className="block group">
                            <Card className="card-elevated relative overflow-hidden h-full border-transparent bg-gradient-to-br from-white to-zinc-50/50">
                                {/* Decorative gradient background */}
                                <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${stat.gradient} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
                                
                                <CardContent className="p-6 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-muted-foreground">{stat.title}</p>
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-md bg-white shadow-sm border border-border`}>
                                            <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                                        </div>
                                    </div>
                                    <div className="mt-6 flex items-baseline gap-2">
                                        <h2 className="text-4xl font-bold text-foreground">
                                            {stat.value}
                                        </h2>
                                        {stat.title === "Tasks This Week" && (
                                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                                        )}
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground mt-2">
                                        {stat.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* ── Main Layout Multi-column ── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:grid-cols-4">
                    
                    {/* Activity Feed (Takes up 2/3 or 3/4) */}
                    <div className="lg:col-span-2 xl:col-span-3 space-y-6">
                        <Card className="card-elevated">
                            <CardHeader className="border-b border-border/40 bg-muted/50 pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Activity className="h-5 w-5 text-primary" />
                                            Live System Activity
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            Real-time logs from all active agents and workflows.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline" className="bg-white px-2.5 py-1 text-xs font-semibold shadow-sm border-border/60">
                                        <span className="mr-1.5 flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                                        System Online
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-border/40">
                                    {mockActivity.slice(0, 8).map((event) => {
                                        const Icon = eventIcons[event.type] || Activity;
                                        const colorClass = eventIconColors[event.type] || "text-muted-foreground bg-secondary border-border";
                                        return (
                                            <div
                                                key={event.id}
                                                className="group flex items-start gap-4 p-5 transition-colors hover:bg-muted/50"
                                            >
                                                <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border shadow-sm ${colorClass}`}>
                                                    <Icon className="h-4.5 w-4.5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <p className="text-[15px] font-medium text-foreground">
                                                            {event.description}
                                                        </p>
                                                        <span className="shrink-0 flex items-center text-[13px] text-muted-foreground font-medium">
                                                            <Clock className="mr-1.5 h-3.5 w-3.5" />
                                                            {timeAgo(event.timestamp)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        {event.agentName && (
                                                            <Badge variant="secondary" className="bg-white border-border text-muted-foreground hover:bg-white shadow-sm font-medium">
                                                                <Bot className="mr-1.5 h-3 w-3" />
                                                                {event.agentName}
                                                            </Badge>
                                                        )}
                                                        {event.type === 'task_failed' && (
                                                            <span className="text-xs font-medium text-destructive cursor-pointer hover:underline">
                                                                View Error Log →
                                                            </span>
                                                        )}
                                                        {event.type === 'task_completed' && (
                                                            <span className="text-xs font-medium text-primary cursor-pointer hover:underline">
                                                                View Result →
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="border-t border-border/40 bg-muted/50 p-4 text-center">
                                    <Button variant="ghost" className="w-full text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/5">
                                        View All Logs <ArrowRight className="ml-1.5 h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column (Takes 1/3 or 1/4) */}
                    <div className="space-y-6">
                        
                        {/* Usage Summary Premium Box */}
                        <Card className="card-elevated overflow-hidden border-transparent bg-[#1a1c23] text-white">
                            <CardHeader className="pb-4 border-b border-white/10">
                                <CardTitle className="flex items-center gap-2 text-white/90 text-base">
                                    <Zap className="h-5 w-5 text-amber-400" />
                                    Resource Usage
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-5 space-y-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-white/60">Tokens Processed</span>
                                        <span className="font-semibold tabular-nums text-white/90">
                                            {formatTokens(dashboardStats.totalTokensIn + dashboardStats.totalTokensOut)}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" style={{ width: '65%' }} />
                                    </div>
                                    <p className="text-[11px] text-white/40 text-right">65% of monthly tier limit</p>
                                </div>

                                <div className="pt-3 border-t border-white/10">
                                    <p className="text-[13px] text-white/60 mb-1">Estimated Cost (Current Cycle)</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-white">
                                            {formatCost(dashboardStats.totalCost)}
                                        </span>
                                        <span className="text-sm text-white/40 mt-1">USD</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Action Tiles */}
                        <h3 className="text-sm font-bold tracking-wider text-muted-foreground uppercase mt-8 mb-4 px-1">
                            Quick Launch
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/agents/new" className="block">
                                <div className="group flex flex-col items-center justify-center gap-3 rounded-md border border-border/60 bg-white p-5 text-center shadow-sm transition-all hover:border-indigo-500/30 hover:shadow-md hover:shadow-indigo-500/5">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-110">
                                        <Bot className="h-6 w-6" />
                                    </div>
                                    <span className="text-[13px] font-semibold text-foreground group-hover:text-indigo-600">New Agent</span>
                                </div>
                            </Link>
                            
                            <Link href="/tasks/new" className="block">
                                <div className="group flex flex-col items-center justify-center gap-3 rounded-md border border-border/60 bg-white p-5 text-center shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-md hover:shadow-emerald-500/5">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110">
                                        <ClipboardList className="h-6 w-6" />
                                    </div>
                                    <span className="text-[13px] font-semibold text-foreground group-hover:text-emerald-600">Assign Task</span>
                                </div>
                            </Link>
                            
                            <Link href="/knowledge" className="block">
                                <div className="group flex flex-col items-center justify-center gap-3 rounded-md border border-border/60 bg-white p-5 text-center shadow-sm transition-all hover:border-sky-500/30 hover:shadow-md hover:shadow-sky-500/5">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-600 transition-transform group-hover:scale-110">
                                        <Upload className="h-6 w-6" />
                                    </div>
                                    <span className="text-[13px] font-semibold text-foreground group-hover:text-sky-600">Import Data</span>
                                </div>
                            </Link>
                            
                            <Link href="/automations" className="block">
                                <div className="group flex flex-col items-center justify-center gap-3 rounded-md border border-border/60 bg-white p-5 text-center shadow-sm transition-all hover:border-amber-500/30 hover:shadow-md hover:shadow-amber-500/5">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 transition-transform group-hover:scale-110">
                                        <Workflow className="h-6 w-6" />
                                    </div>
                                    <span className="text-[13px] font-semibold text-foreground group-hover:text-amber-600">Workflow</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
