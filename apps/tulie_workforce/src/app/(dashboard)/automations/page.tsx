"use client";

import { useState } from "react";
import { Header } from "@/components/layouts/header";
import { Button } from "@repo/ui";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@repo/ui";
import { Badge } from "@repo/ui";
import { Input } from "@repo/ui";
import { Label } from "@repo/ui";
import {
    Workflow,
    Play,
    Pause,
    Clock,
    CheckCircle2,
    XCircle,
    ExternalLink,
    Settings,
    Plus,
    Zap,
    MessageSquare,
    Facebook,
    Globe,
    Mail,
    Calendar,
    FileText,
    RefreshCw,
    Activity,
    ArrowRight,
    Link2,
    AlertCircle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────

type WorkflowStatus = "active" | "inactive" | "error";

interface WorkflowExec {
    id: string;
    status: "success" | "error" | "running";
    startedAt: string;
    duration: string;
}

interface N8nWorkflow {
    id: string;
    name: string;
    description: string;
    status: WorkflowStatus;
    trigger: string;
    triggerIcon: typeof Zap;
    nodes: string[];
    lastRun?: string;
    totalRuns: number;
    successRate: number;
    recentExecutions: WorkflowExec[];
    tags: string[];
}

// ─── Mock Data ───────────────────────────────────────────

const mockWorkflows: N8nWorkflow[] = [
    {
        id: "wf-1",
        name: "Telegram → AI → Facebook Post",
        description: "Receive a command from Telegram, generate content with AI, then post to Facebook Page automatically.",
        status: "active",
        trigger: "Telegram Trigger",
        triggerIcon: MessageSquare,
        nodes: ["Telegram Trigger", "OpenAI GPT-4o", "Facebook Graph API", "Telegram Response"],
        lastRun: "2026-03-13T14:30:00Z",
        totalRuns: 47,
        successRate: 95.7,
        recentExecutions: [
            { id: "ex-1", status: "success", startedAt: "2026-03-13T14:30:00Z", duration: "3.2s" },
            { id: "ex-2", status: "success", startedAt: "2026-03-13T12:00:00Z", duration: "4.1s" },
            { id: "ex-3", status: "error", startedAt: "2026-03-13T09:15:00Z", duration: "1.5s" },
            { id: "ex-4", status: "success", startedAt: "2026-03-12T18:00:00Z", duration: "2.8s" },
        ],
        tags: ["telegram", "facebook", "ai"],
    },
    {
        id: "wf-2",
        name: "Scheduled Content Calendar",
        description: "Every day at 9 AM, check Google Sheet for scheduled posts, generate content with AI, and auto-post to Facebook.",
        status: "active",
        trigger: "Cron Schedule (9:00 AM)",
        triggerIcon: Calendar,
        nodes: ["Schedule Trigger", "Google Sheets", "OpenAI GPT-4o", "Facebook Graph API", "Slack Notification"],
        lastRun: "2026-03-13T09:00:00Z",
        totalRuns: 28,
        successRate: 100,
        recentExecutions: [
            { id: "ex-5", status: "success", startedAt: "2026-03-13T09:00:00Z", duration: "5.7s" },
            { id: "ex-6", status: "success", startedAt: "2026-03-12T09:00:00Z", duration: "4.3s" },
            { id: "ex-7", status: "success", startedAt: "2026-03-11T09:00:00Z", duration: "6.1s" },
        ],
        tags: ["scheduled", "facebook", "google-sheets"],
    },
    {
        id: "wf-3",
        name: "Website Lead → CRM + Email",
        description: "When a new lead submits the website form, create a CRM record and send a personalized welcome email using AI.",
        status: "active",
        trigger: "Webhook",
        triggerIcon: Globe,
        nodes: ["Webhook Trigger", "OpenAI GPT-4o", "Supabase Insert", "SendGrid Email", "Telegram Notification"],
        lastRun: "2026-03-13T16:45:00Z",
        totalRuns: 156,
        successRate: 98.1,
        recentExecutions: [
            { id: "ex-8", status: "success", startedAt: "2026-03-13T16:45:00Z", duration: "2.1s" },
            { id: "ex-9", status: "success", startedAt: "2026-03-13T15:20:00Z", duration: "1.9s" },
            { id: "ex-10", status: "success", startedAt: "2026-03-13T11:30:00Z", duration: "2.4s" },
        ],
        tags: ["webhook", "crm", "email"],
    },
    {
        id: "wf-4",
        name: "Weekly Report Generator",
        description: "Every Monday 8 AM, aggregate data from all agents, generate a performance report with AI, and email to the team.",
        status: "inactive",
        trigger: "Cron Schedule (Mon 8:00 AM)",
        triggerIcon: Calendar,
        nodes: ["Schedule Trigger", "Supabase Query", "OpenAI GPT-4o", "Generate PDF", "SendGrid Email"],
        lastRun: "2026-03-10T08:00:00Z",
        totalRuns: 8,
        successRate: 87.5,
        recentExecutions: [
            { id: "ex-11", status: "success", startedAt: "2026-03-10T08:00:00Z", duration: "12.3s" },
            { id: "ex-12", status: "error", startedAt: "2026-03-03T08:00:00Z", duration: "8.1s" },
        ],
        tags: ["scheduled", "report", "email"],
    },
    {
        id: "wf-5",
        name: "Promo Post — 20% Off Web Design",
        description: "Telegram command to create and post a promotional offer for web design services to Facebook Page.",
        status: "error",
        trigger: "Telegram Command: /promo",
        triggerIcon: MessageSquare,
        nodes: ["Telegram Trigger", "OpenAI GPT-4o", "Canva API", "Facebook Graph API"],
        lastRun: "2026-03-12T10:30:00Z",
        totalRuns: 5,
        successRate: 60,
        recentExecutions: [
            { id: "ex-13", status: "error", startedAt: "2026-03-12T10:30:00Z", duration: "0.8s" },
            { id: "ex-14", status: "error", startedAt: "2026-03-11T14:00:00Z", duration: "0.5s" },
            { id: "ex-15", status: "success", startedAt: "2026-03-10T16:00:00Z", duration: "7.2s" },
        ],
        tags: ["telegram", "facebook", "promo"],
    },
];

const statusConfig: Record<WorkflowStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
    active: { label: "Active", className: "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm", icon: CheckCircle2 },
    inactive: { label: "Inactive", className: "bg-zinc-100 text-muted-foreground border-border shadow-sm", icon: Pause },
    error: { label: "Error", className: "bg-rose-50 text-rose-600 border-rose-200 shadow-sm", icon: XCircle },
};

const execStatusStyle: Record<string, string> = {
    success: "text-emerald-600",
    error: "text-red-500",
    running: "text-amber-500",
};

// ─── Helpers ─────────────────────────────────────────────

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

// ─── Tabs ────────────────────────────────────────────────

const tabs = [
    { id: "workflows", label: "Workflows", icon: Workflow },
    { id: "editor", label: "Node Editor", icon: Zap },
    { id: "executions", label: "Executions", icon: Activity },
    { id: "settings", label: "Connection", icon: Settings },
] as const;

type Tab = (typeof tabs)[number]["id"];

// ─── Page ────────────────────────────────────────────────

export default function AutomationsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("workflows");
    const [n8nUrl, setN8nUrl] = useState("https://n8n.tulie.vn");
    const [isConnected, setIsConnected] = useState(true);
    const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

    const activeWorkflows = mockWorkflows.filter((w) => w.status === "active").length;
    const totalRuns = mockWorkflows.reduce((sum, w) => sum + w.totalRuns, 0);
    const avgSuccess = mockWorkflows.length > 0
        ? Math.round(mockWorkflows.reduce((sum, w) => sum + w.successRate, 0) / mockWorkflows.length)
        : 0;

    const selected = selectedWorkflow ? mockWorkflows.find((w) => w.id === selectedWorkflow) : null;

    return (
        <>
            <Header title="Automations" />
            <div className="">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
                    <Card className="card-elevated border-transparent bg-gradient-to-br from-white to-zinc-50/50">
                        <CardContent className="pt-6 relative z-10">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Workflow className="h-4 w-4 text-indigo-500" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Total workflows</span>
                            </div>
                            <p className="text-3xl font-bold tracking-tight text-foreground mt-2">{mockWorkflows.length}</p>
                            <p className="text-xs font-medium text-muted-foreground mt-1">{activeWorkflows} active</p>
                        </CardContent>
                    </Card>
                    <Card className="card-elevated border-transparent bg-gradient-to-br from-white to-zinc-50/50">
                        <CardContent className="pt-6 relative z-10">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Play className="h-4 w-4 text-emerald-500" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Total executions</span>
                            </div>
                            <p className="text-3xl font-bold tracking-tight text-foreground mt-2">{totalRuns}</p>
                            <p className="text-xs font-medium text-muted-foreground mt-1">All time</p>
                        </CardContent>
                    </Card>
                    <Card className="card-elevated border-transparent bg-gradient-to-br from-white to-zinc-50/50">
                        <CardContent className="pt-6 relative z-10">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <CheckCircle2 className="h-4 w-4 text-amber-500" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Success rate</span>
                            </div>
                            <p className="text-3xl font-bold tracking-tight text-foreground mt-2">{avgSuccess}%</p>
                            <p className="text-xs font-medium text-muted-foreground mt-1">Average across all</p>
                        </CardContent>
                    </Card>
                    <Card className="card-elevated border-transparent bg-gradient-to-br from-white to-zinc-50/50">
                        <CardContent className="pt-6 relative z-10">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Link2 className="h-4 w-4 text-sky-500" />
                                <span className="text-xs font-semibold uppercase tracking-wider">n8n status</span>
                            </div>
                            <p className="text-3xl font-bold tracking-tight text-foreground mt-2">
                                {isConnected ? "Connected" : "Not connected"}
                            </p>
                            <p className="text-xs font-medium text-muted-foreground mt-1 truncate">{n8nUrl}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <div className="flex w-fit items-center rounded-xl bg-zinc-100/80 p-1 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold transition-all duration-200 rounded-lg ${
                                activeTab === tab.id
                                    ? "bg-white text-foreground shadow-sm ring-1 ring-border/50"
                                    : "text-muted-foreground hover:bg-white/50 hover:text-foreground"
                            }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ─── WORKFLOWS TAB ─── */}
                {activeTab === "workflows" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">n8n Workflows</h3>
                                <p className="text-sm text-muted-foreground">
                                    Automated workflows powered by n8n — trigger via Telegram, schedule, or webhook
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(n8nUrl, '_blank')}
                                    className="gap-1.5 h-9 text-xs font-semibold bg-white hover:bg-zinc-50 shadow-sm"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Open n8n
                                </Button>
                                <Button
                                    onClick={() => setActiveTab("editor")}
                                    className="gap-1.5 h-9 bg-primary text-primary-foreground shadow-sm hover:bg-primary/95 text-xs font-semibold"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Full editor
                                </Button>
                            </div>
                        </div>

                        {/* Workflow Grid */}
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {mockWorkflows.map((workflow) => {
                                const st = statusConfig[workflow.status];
                                const TriggerIcon = workflow.triggerIcon;
                                return (
                                    <Card
                                        key={workflow.id}
                                        className={`cursor-pointer transition-all card-elevated border-transparent hover:border-primary/20 hover:shadow-md ${selectedWorkflow === workflow.id ? "ring-2 ring-primary shadow-md" : ""}`}
                                        onClick={() => setSelectedWorkflow(selectedWorkflow === workflow.id ? null : workflow.id)}
                                    >
                                        <CardContent className="pt-5 pb-4">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 shadow-sm border border-border/50">
                                                        <Workflow className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[15px] font-bold text-foreground">{workflow.name}</p>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <TriggerIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                                            <span className="text-[11px] font-medium text-muted-foreground">{workflow.trigger}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={`text-[10px] font-bold px-2.5 py-0.5 ${st.className}`}>
                                                    {st.label}
                                                </Badge>
                                            </div>

                                            {/* Description */}
                                            <p className="text-[13px] font-medium text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{workflow.description}</p>

                                            {/* Node Flow */}
                                            <div className="flex items-center gap-1 mb-3 overflow-x-auto">
                                                {workflow.nodes.map((node, i) => (
                                                    <div key={i} className="flex items-center gap-1 shrink-0">
                                                        <span className="px-2.5 py-1 bg-zinc-100 border border-border/60 rounded-md text-[11px] text-foreground/80 font-medium">
                                                            {node}
                                                        </span>
                                                        {i < workflow.nodes.length - 1 && (
                                                            <ArrowRight className="h-3 w-3 text-muted-foreground/60" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Stats Row */}
                                            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Play className="h-2.5 w-2.5" />
                                                    {workflow.totalRuns} runs
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                                    {workflow.successRate}% success
                                                </span>
                                                {workflow.lastRun && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-2.5 w-2.5" />
                                                        {timeAgo(workflow.lastRun)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Tags */}
                                            <div className="flex gap-1 mt-2">
                                                {workflow.tags.map((tag) => (
                                                    <span key={tag} className="px-2 py-0.5 bg-zinc-100 border border-border/60 rounded-md text-[11px] text-foreground/70 font-medium">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Selected Workflow Detail */}
                        {selected && (
                            <Card className="card-elevated border-transparent">
                                <CardHeader className="pb-4 border-b border-border/40 bg-zinc-50/50">
                                    <CardTitle className="text-[15px] font-bold text-foreground flex items-center gap-2">
                                        <Activity className="h-4.5 w-4.5 text-primary" />
                                        Recent executions — {selected.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border/60 bg-white">
                                                <th className="text-left py-3 px-5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                                                <th className="text-left py-3 px-5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Execution ID</th>
                                                <th className="text-right py-3 px-5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Duration</th>
                                                <th className="text-right py-3 px-5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Time</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/40">
                                            {selected.recentExecutions.map((exec) => (
                                                <tr key={exec.id} className="group hover:bg-zinc-50/50 transition-colors">
                                                    <td className="py-3 px-5">
                                                        <span className={`flex items-center gap-1.5 text-xs font-semibold ${execStatusStyle[exec.status]}`}>
                                                            {exec.status === "success" ? (
                                                                <CheckCircle2 className="h-4 w-4" />
                                                            ) : exec.status === "error" ? (
                                                                <XCircle className="h-4 w-4" />
                                                            ) : (
                                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                            )}
                                                            {exec.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-5 text-muted-foreground font-mono text-[13px]">{exec.id}</td>
                                                    <td className="py-3 px-5 text-right text-muted-foreground text-[13px] font-medium">{exec.duration}</td>
                                                    <td className="py-3 px-5 text-right text-muted-foreground text-[13px] font-medium">{timeAgo(exec.startedAt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* ─── EXECUTIONS TAB ─── */}
                {activeTab === "executions" && (
                    <div>
                        <h3 className="text-lg font-bold tracking-tight text-foreground mb-4">All executions</h3>
                        <Card className="card-elevated border-transparent overflow-hidden">
                            <CardContent className="p-0">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border/60 bg-zinc-50/50">
                                            <th className="text-left py-3 px-6 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Workflow</th>
                                            <th className="text-left py-3 px-6 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                                            <th className="text-right py-3 px-6 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Duration</th>
                                            <th className="text-right py-3 px-6 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/40">
                                        {mockWorkflows.flatMap((wf) =>
                                            wf.recentExecutions.map((exec) => (
                                                <tr key={exec.id} className="group hover:bg-zinc-50/50 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <p className="text-[14px] font-bold text-foreground">{wf.name}</p>
                                                        <p className="text-[11px] font-medium text-muted-foreground mt-0.5">{wf.trigger}</p>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`flex items-center gap-1 text-xs font-semibold ${execStatusStyle[exec.status]}`}>
                                                            {exec.status === "success" ? (
                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                            ) : exec.status === "error" ? (
                                                                <XCircle className="h-3.5 w-3.5" />
                                                            ) : (
                                                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                                            )}
                                                            {exec.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-right text-muted-foreground text-[13px] font-medium">{exec.duration}</td>
                                                    <td className="py-4 px-6 text-right text-muted-foreground text-[13px] font-medium">{timeAgo(exec.startedAt)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ─── NODE EDITOR TAB ─── */}
                {activeTab === "editor" && (
                    <div className="space-y-6">
                        {/* Launch card */}
                        <Card className="card-elevated border-transparent overflow-hidden relative">
                            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
                            <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
                            <CardContent className="pt-12 pb-12 relative z-10">
                                <div className="flex flex-col items-center text-center gap-5">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm">
                                        <Workflow className="h-8 w-8 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold tracking-tight text-foreground">n8n Workflow Editor</h3>
                                        <p className="text-sm font-medium text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
                                            Create and manage your automation workflows with the full n8n visual editor
                                        </p>
                                    </div>
                                    <Button
                                        size="lg"
                                        onClick={() => window.open(n8nUrl, '_blank')}
                                        className="gap-2 text-[14px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 h-11 transition-all hover:-translate-y-0.5"
                                    >
                                        <ExternalLink className="h-4.5 w-4.5" />
                                        Open n8n editor
                                    </Button>
                                    <p className="text-xs font-semibold text-muted-foreground">Opens at {n8nUrl}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick access cards */}
                        <div>
                            <h4 className="text-[15px] font-bold tracking-tight mb-4">Quick access — jump to workflow</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {[
                                    { name: "AI Planner", desc: "Campaign planning & timelines" },
                                    { name: "Content Creator", desc: "Blog posts & SEO content" },
                                    { name: "Design Specialist", desc: "Visual assets & mockups" },
                                    { name: "Digital Ads Manager", desc: "Ad campaigns & optimization" },
                                ].map((wf) => (
                                    <Card
                                        key={wf.name}
                                        className="cursor-pointer transition-all card-elevated border-transparent hover:border-primary/20 hover:shadow-lg"
                                        onClick={() => window.open(`${n8nUrl}/home/workflows`, '_blank')}
                                    >
                                        <CardContent className="pt-5 pb-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 shrink-0 shadow-sm">
                                                    <Zap className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[14px] font-bold truncate">{wf.name}</p>
                                                    <p className="text-[11px] font-medium text-muted-foreground truncate leading-relaxed">{wf.desc}</p>
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-muted-foreground/30 shrink-0 ml-auto transition-colors group-hover:text-primary" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Webhook endpoints */}
                        <Card className="card-elevated border-transparent">
                            <CardHeader className="pb-3 border-b border-border/40 bg-zinc-50/50">
                                <CardTitle className="text-[15px] font-bold flex items-center gap-2">
                                    <Zap className="h-4.5 w-4.5 text-amber-500" />
                                    Active webhook endpoints
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {[
                                        { label: "Planner", url: `${n8nUrl}/webhook/planner` },
                                        { label: "Content", url: `${n8nUrl}/webhook/content` },
                                        { label: "Design", url: `${n8nUrl}/webhook/design` },
                                        { label: "Ads", url: `${n8nUrl}/webhook/ads` },
                                    ].map((ep) => (
                                        <div key={ep.label} className="flex items-center p-2.5 rounded-lg bg-muted/50 border">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                                                <code className="text-xs text-muted-foreground truncate">POST {ep.url}</code>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ─── SETTINGS TAB ─── */}
                {activeTab === "settings" && (
                    <div className="space-y-6 max-w-2xl">
                        <Card className="card-elevated border-transparent">
                            <CardHeader className="border-b border-border/40 bg-zinc-50/50">
                                <CardTitle className="text-[16px] font-bold flex items-center gap-2">
                                    <Link2 className="h-5 w-5 text-indigo-500" />
                                    n8n Connection
                                </CardTitle>
                                <CardDescription className="font-medium">
                                    Connect to your self-hosted n8n instance to manage workflows
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5 pt-6">
                                <div className="space-y-2.5">
                                    <Label htmlFor="n8n-url" className="text-[13px] font-semibold">n8n Instance URL</Label>
                                    <Input
                                        id="n8n-url"
                                        value={n8nUrl}
                                        onChange={(e) => setN8nUrl(e.target.value)}
                                        placeholder="https://n8n.tulie.vn"
                                        className="h-10 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20"
                                    />
                                    <p className="text-[11px] font-medium text-muted-foreground pl-1">
                                        The URL of your n8n instance (must be accessible from this browser)
                                    </p>
                                </div>
                                <div className="space-y-2.5">
                                    <Label htmlFor="n8n-api-key" className="text-[13px] font-semibold">n8n API Key</Label>
                                    <Input
                                        id="n8n-api-key"
                                        type="password"
                                        placeholder="n8n_api_..."
                                        disabled
                                        className="h-10 shadow-sm"
                                    />
                                    <p className="text-[11px] font-medium text-muted-foreground pl-1">
                                        Generate in n8n → Settings → API → Create API Key
                                    </p>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-zinc-50/50 border border-border/60 p-4 mt-2">
                                    <div>
                                        <p className="text-[14px] font-bold text-foreground">Connection status</p>
                                        <p className="text-xs font-medium text-muted-foreground mt-0.5">
                                            {isConnected ? "Connected to " + n8nUrl : "Not connected"}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className={`font-bold border px-2.5 py-0.5 shadow-sm ${isConnected ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-zinc-100 text-muted-foreground border-border/60"}`}>
                                        {isConnected ? "Connected" : "Disconnected"}
                                    </Badge>
                                </div>
                                <Button onClick={() => setIsConnected(!isConnected)} className="w-full gap-1.5 h-10 font-bold bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/20">
                                    {isConnected ? (
                                        <>
                                            <XCircle className="h-4 w-4" />
                                            Disconnect
                                        </>
                                    ) : (
                                        <>
                                            <Link2 className="h-4 w-4" />
                                            Test & Connect
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="card-elevated border-transparent">
                            <CardHeader className="border-b border-border/40 bg-zinc-50/50">
                                <CardTitle className="text-[16px] font-bold flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-amber-500" />
                                    Webhook Configuration
                                </CardTitle>
                                <CardDescription className="font-medium">
                                    Use these URLs in your n8n workflows to connect with Digital Workforce
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-6">
                                {[
                                    { label: "AI Planner Webhook", url: "https://n8n.tulie.vn/webhook/planner" },
                                    { label: "Content Creator Webhook", url: "https://n8n.tulie.vn/webhook/content" },
                                    { label: "Design Specialist Webhook", url: "https://n8n.tulie.vn/webhook/design" },
                                    { label: "Digital Ads Webhook", url: "https://n8n.tulie.vn/webhook/ads" },
                                ].map((hook) => (
                                    <div key={hook.label} className="flex items-center justify-between p-3 rounded-md bg-accent/50 border border-border">
                                        <div>
                                            <p className="text-xs font-medium text-foreground">{hook.label}</p>
                                            <code className="text-[10px] text-muted-foreground">{hook.url}</code>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                            Copy
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </>
    );
}
