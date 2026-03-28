"use client";

import { useState, useMemo } from "react";
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
import { Separator } from "@repo/ui";
import {
    Bot,
    ArrowLeft,
    Settings,
    MessageSquare,
    Activity,
    Clock,
    CheckCircle2,
    TrendingUp,
    DollarSign,
    Zap,
    FileText,
    Brain,
    Database,
    BookOpen,
    Target,
    Lightbulb,
    History,
    Search,
    Plus,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getAgent, getAgentMemory, mockTasks, mockDocuments, formatTokens, formatCost, timeAgo } from "@/lib/mock-data";
import type { AgentStatus, MemoryCategory } from "@/lib/mock-data";

const statusStyles: Record<AgentStatus, { label: string; className: string }> = {
    active: { label: "Active", className: "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm font-semibold px-2.5 py-1 text-[10px]" },
    training: { label: "Training", className: "bg-amber-50 text-amber-600 border-amber-200 shadow-sm font-semibold px-2.5 py-1 text-[10px] animate-pulse" },
    inactive: { label: "Inactive", className: "bg-zinc-100 text-muted-foreground border-border shadow-sm font-semibold px-2.5 py-1 text-[10px]" },
};

const memCategoryMeta: Record<MemoryCategory, { label: string; icon: typeof Brain; color: string }> = {
    fact: { label: "Fact", icon: Database, color: "bg-foreground text-white" },
    preference: { label: "Preference", icon: Target, color: "bg-foreground/80 text-background" },
    instruction: { label: "Instruction", icon: BookOpen, color: "bg-foreground/70 text-background" },
    context: { label: "Context", icon: History, color: "bg-accent/500 text-white" },
};

const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "config", label: "Configuration", icon: Settings },
    { id: "memory", label: "Memory", icon: Brain },
    { id: "conversations", label: "Conversations", icon: MessageSquare },
    { id: "usage", label: "Usage", icon: TrendingUp },
] as const;

type Tab = (typeof tabs)[number]["id"];

export default function AgentDetailPage() {
    const params = useParams();
    const agentId = params.id as string;
    const agent = getAgent(agentId);
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [memFilter, setMemFilter] = useState<MemoryCategory | "all">("all");

    // Fallback for unknown IDs
    if (!agent) {
        return (
            <>
                <Header title="Agent not found" />
                <div className="">
                    <p className="text-muted-foreground">This agent does not exist.</p>
                    <Link href="/agents" className="text-sm text-foreground underline mt-2 inline-block">
                        Back to agents
                    </Link>
                </div>
            </>
        );
    }

    const agentTasks = mockTasks.filter((t) => t.agentId === agent.id);
    const agentDocs = mockDocuments.filter((d) => agent.knowledgeBaseIds.includes(d.id));
    const agentMemories = getAgentMemory(agent.id);
    const statusInfo = statusStyles[agent.status];
    const successRate = agent.totalTasks > 0 ? Math.round((agent.successfulTasks / agent.totalTasks) * 100) : 0;

    const filteredMemories = useMemo(() => {
        if (memFilter === "all") return agentMemories;
        return agentMemories.filter((m) => m.category === memFilter);
    }, [agentMemories, memFilter]);

    return (
        <>
            <Header title={agent.name} />
            <div className="max-w-5xl">
                <Link
                    href="/agents"
                    className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-3 w-3" />
                    Back to agents
                </Link>

                {/* Agent Hero */}
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm">
                            <Bot className="h-8 w-8 text-indigo-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                    {agent.name}
                                </h2>
                                <Badge variant="outline" className={statusInfo.className}>{statusInfo.label}</Badge>
                            </div>
                            <p className="text-[14px] font-medium text-muted-foreground mt-1">
                                {agent.description}
                            </p>
                        </div>
                    </div>
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

                {/* Tab Content */}
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                            <Card className="card-elevated border-transparent bg-gradient-to-br from-white to-zinc-50/50">
                                <CardContent className="pt-6 relative z-10">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        <span className="text-xs font-semibold uppercase tracking-wider">Tasks completed</span>
                                    </div>
                                    <p className="text-3xl font-bold tracking-tight text-foreground mt-2">{agent.successfulTasks}</p>
                                    <p className="text-xs font-medium text-muted-foreground mt-1">{agent.totalTasks} total assigned</p>
                                </CardContent>
                            </Card>
                            <Card className="card-elevated border-transparent bg-gradient-to-br from-white to-zinc-50/50">
                                <CardContent className="pt-6 relative z-10">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <TrendingUp className="h-4 w-4 text-indigo-500" />
                                        <span className="text-xs font-semibold uppercase tracking-wider">Success rate</span>
                                    </div>
                                    <p className="text-3xl font-bold tracking-tight text-foreground mt-2">{successRate}%</p>
                                    <p className="text-xs font-medium text-muted-foreground mt-1">{agent.totalTasks - agent.successfulTasks} failed</p>
                                </CardContent>
                            </Card>
                            <Card className="card-elevated border-transparent bg-gradient-to-br from-white to-zinc-50/50">
                                <CardContent className="pt-6 relative z-10">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <Zap className="h-4 w-4 text-amber-500" />
                                        <span className="text-xs font-semibold uppercase tracking-wider">Total tokens</span>
                                    </div>
                                    <p className="text-3xl font-bold tracking-tight text-foreground mt-2">{formatTokens(agent.tokensIn + agent.tokensOut)}</p>
                                    <p className="text-xs font-medium text-muted-foreground mt-1">{formatTokens(agent.tokensIn)} in · {formatTokens(agent.tokensOut)} out</p>
                                </CardContent>
                            </Card>
                            <Card className="card-elevated border-transparent bg-gradient-to-br from-white to-zinc-50/50">
                                <CardContent className="pt-6 relative z-10">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <DollarSign className="h-4 w-4 text-rose-500" />
                                        <span className="text-xs font-semibold uppercase tracking-wider">Total cost</span>
                                    </div>
                                    <p className="text-3xl font-bold tracking-tight text-foreground mt-2">{formatCost(agent.costUsd)}</p>
                                    <p className="text-xs font-medium text-muted-foreground mt-1">Lifetime spend</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Tasks */}
                        <Card className="card-elevated border-transparent">
                            <CardHeader className="border-b border-border/40 bg-zinc-50/50 pb-4">
                                <CardTitle className="text-[15px] font-bold text-foreground">Recent tasks</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {agentTasks.length === 0 ? (
                                    <p className="text-[13px] font-medium text-muted-foreground">No tasks assigned yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {agentTasks.slice(0, 5).map((task) => (
                                            <Link key={task.id} href={`/tasks/${task.id}`} className="block">
                                                <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-white hover:border-primary/20 hover:shadow-md transition-all">
                                                    <div>
                                                        <p className="text-[14px] font-bold text-foreground">{task.title}</p>
                                                        <p className="text-[12px] font-medium text-muted-foreground mt-0.5">
                                                            {timeAgo(task.createdAt)} · {formatTokens(task.tokensIn + task.tokensOut)} tokens
                                                        </p>
                                                    </div>
                                                    <Badge variant={task.status === "completed" ? "default" : task.status === "failed" ? "destructive" : "outline"} className={`text-[10px] font-semibold px-2.5 py-1 ${task.status === "completed" ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-50" : task.status === "failed" ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-50" : ""}`}>
                                                        {task.status.replace("_", " ")}
                                                    </Badge>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === "config" && (
                    <div className="space-y-6">
                        <Card className="card-elevated border-transparent">
                            <CardHeader className="border-b border-border/40 bg-zinc-50/50 pb-4">
                                <CardTitle className="text-[15px] font-bold text-foreground">Model settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5 pt-6">
                                <div>
                                    <p className="text-[13px] font-semibold text-foreground">Model</p>
                                    <p className="text-[13px] font-medium text-muted-foreground mt-1">{agent.model}</p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-[13px] font-semibold text-foreground">Temperature</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden border border-border/50">
                                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${agent.temperature * 100}%` }} />
                                        </div>
                                        <span className="text-[13px] font-bold text-foreground w-8">{agent.temperature}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="card-elevated border-transparent">
                            <CardHeader className="border-b border-border/40 bg-zinc-50/50 pb-4">
                                <CardTitle className="text-[15px] font-bold text-foreground flex items-center gap-2">
                                    <Brain className="h-4.5 w-4.5 text-indigo-500" />
                                    System prompt
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="rounded-xl bg-zinc-50 border border-border/60 p-5 shadow-inner">
                                    <p className="text-[13px] font-medium leading-relaxed text-muted-foreground whitespace-pre-wrap">{agent.systemPrompt}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="card-elevated border-transparent">
                            <CardHeader className="border-b border-border/40 bg-zinc-50/50 pb-4">
                                <CardTitle className="text-[15px] font-bold text-foreground flex items-center gap-2">
                                    <FileText className="h-4.5 w-4.5 text-amber-500" />
                                    Knowledge sources
                                </CardTitle>
                                <CardDescription className="font-medium mt-1">
                                    Documents this agent can reference via RAG
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {agentDocs.length === 0 ? (
                                    <p className="text-[13px] font-medium text-muted-foreground">No knowledge sources attached.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {agentDocs.map((doc) => (
                                            <div key={doc.id} className="flex items-center gap-4 p-3 rounded-xl border border-border/50 bg-white">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 border border-amber-100">
                                                    <FileText className="h-5 w-5 text-amber-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-bold text-foreground">{doc.title}</p>
                                                    <p className="text-[11px] font-medium text-muted-foreground mt-0.5">{doc.chunkCount} chunks · {doc.type.toUpperCase()}</p>
                                                </div>
                                                <Button variant="ghost" size="sm" className="ml-auto text-xs font-semibold h-8 text-primary">View</Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === "conversations" && (
                    <Card className="card-elevated border-transparent">
                        <CardHeader className="border-b border-border/40 bg-zinc-50/50 pb-4">
                            <CardTitle className="text-[15px] font-bold text-foreground flex items-center gap-2">
                                <MessageSquare className="h-4.5 w-4.5 text-sky-500" />
                                Conversation threads
                            </CardTitle>
                            <CardDescription className="font-medium mt-1">
                                {agentTasks.length} threads from assigned tasks
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-3">
                                {agentTasks.filter(t => t.messages.length > 0).map((task) => (
                                    <Link key={task.id} href={`/tasks/${task.id}`} className="block">
                                        <div className="p-4 rounded-xl border border-border/50 bg-white hover:border-primary/30 hover:shadow-md transition-all group">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[14px] font-bold text-foreground group-hover:text-primary transition-colors">{task.title}</p>
                                                <span className="text-[12px] font-medium text-muted-foreground">{timeAgo(task.createdAt)}</span>
                                            </div>
                                            <p className="text-[13px] font-medium text-muted-foreground mt-2 line-clamp-1 leading-relaxed">
                                                {task.messages[task.messages.length - 1]?.content}
                                            </p>
                                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
                                                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-[11px] font-semibold text-muted-foreground">{task.messages.length} messages</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === "usage" && (
                    <div className="space-y-6">
                        <Card className="card-elevated border-transparent">
                            <CardHeader className="border-b border-border/40 bg-zinc-50/50 pb-4">
                                <CardTitle className="text-[15px] font-bold text-foreground">Token usage &mdash; lifetime</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-zinc-50 rounded-xl border border-border/50">
                                        <p className="text-2xl font-semibold text-foreground">{formatTokens(agent.tokensIn)}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Input tokens</p>
                                    </div>
                                    <div className="text-center p-4 bg-zinc-50 rounded-xl border border-border/50">
                                        <p className="text-2xl font-semibold text-foreground">{formatTokens(agent.tokensOut)}</p>
                                        <p className="text-xs text-muted-foreground mt-1 font-medium">Output tokens</p>
                                    </div>
                                    <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                        <p className="text-2xl font-semibold text-foreground">{formatCost(agent.costUsd)}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Total cost</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Per-session breakdown */}
                        <Card className="card-elevated border-transparent">
                            <CardHeader className="border-b border-border/40 bg-zinc-50/50 pb-4">
                                <CardTitle className="text-[15px] font-bold text-foreground">Per-task breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="text-left py-2 font-medium text-muted-foreground">Task</th>
                                                <th className="text-right py-2 font-medium text-muted-foreground">Tokens in</th>
                                                <th className="text-right py-2 font-medium text-muted-foreground">Tokens out</th>
                                                <th className="text-right py-2 font-medium text-muted-foreground">Cost</th>
                                                <th className="text-right py-2 font-medium text-muted-foreground">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {agentTasks.map((task) => (
                                                <tr key={task.id} className="border-b border-border/50">
                                                    <td className="py-2">
                                                        <Link href={`/tasks/${task.id}`} className="text-foreground hover:underline">
                                                            {task.title}
                                                        </Link>
                                                    </td>
                                                    <td className="text-right py-2 text-muted-foreground">{formatTokens(task.tokensIn)}</td>
                                                    <td className="text-right py-2 text-muted-foreground">{formatTokens(task.tokensOut)}</td>
                                                    <td className="text-right py-2 text-muted-foreground">{formatCost(task.costUsd)}</td>
                                                    <td className="text-right py-2 text-muted-foreground">{timeAgo(task.createdAt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Daily usage chart (mock bars) */}
                        <Card className="card-elevated border-transparent">
                            <CardHeader className="border-b border-border/40 bg-zinc-50/50 pb-4">
                                <CardTitle className="text-[15px] font-bold text-foreground">Daily usage (last 7 days)</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex items-end gap-2 h-32">
                                    {[65, 82, 45, 91, 58, 100, 74].map((pct, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                            <div
                                                className="w-full bg-foreground rounded-t"
                                                style={{ height: `${pct}%` }}
                                            />
                                            <span className="text-[10px] text-muted-foreground">
                                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ── MEMORY TAB ── */}
                {activeTab === "memory" && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <Brain className="h-5 w-5" />
                                    Long-term memory
                                </h3>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    {agentMemories.length} stored entries · Agent scans these for context-aware responses
                                </p>
                            </div>
                            <Button variant="outline" size="sm">
                                <Plus className="h-4 w-4" />
                                Add memory
                            </Button>
                        </div>

                        {/* How it works */}
                        <Card className="bg-primary/5 border border-dashed border-primary/20 xl:rounded-2xl shadow-none">
                            <CardContent className="pt-5 pb-5">
                                <div className="flex items-start gap-3">
                                    <Lightbulb className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                                    <div className="text-sm text-muted-foreground">
                                        <p className="font-medium text-foreground">How agent memory works</p>
                                        <p className="mt-1">
                                            Memory entries are automatically extracted from tasks, documents, and manual inputs.
                                            Before each response, the agent performs a <strong>vector similarity search</strong> across
                                            its memory to retrieve relevant context — facts, user preferences, past decisions,
                                            and conversation history — resulting in more accurate, personalized responses.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Category Filters */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setMemFilter("all")}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${memFilter === "all"
                                        ? "bg-foreground text-white"
                                        : "bg-accent text-muted-foreground hover:bg-secondary"
                                    }`}
                            >
                                All ({agentMemories.length})
                            </button>
                            {(["fact", "preference", "instruction", "context"] as MemoryCategory[]).map((cat) => {
                                const meta = memCategoryMeta[cat];
                                const count = agentMemories.filter((m) => m.category === cat).length;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setMemFilter(cat)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${memFilter === cat
                                                ? "bg-foreground text-white"
                                                : "bg-accent text-muted-foreground hover:bg-secondary"
                                            }`}
                                    >
                                        {meta.label} ({count})
                                    </button>
                                );
                            })}
                        </div>

                        {/* Memory Entries */}
                        <div className="space-y-3">
                            {filteredMemories.map((mem) => {
                                const meta = memCategoryMeta[mem.category];
                                const Icon = meta.icon;
                                return (
                                    <Card key={mem.id} className="card-elevated border-transparent hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-lg transition-all">
                                        <CardContent className="pt-5 pb-5">
                                            <div className="flex items-start gap-3">
                                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${meta.color}`}>
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline" className="text-[10px]">
                                                            {meta.label}
                                                        </Badge>
                                                        <Badge variant="secondary" className="text-[10px]">
                                                            {mem.source === "task" ? "From task" : mem.source === "document" ? "From document" : "Manual"}
                                                        </Badge>
                                                        <span className="text-[10px] text-muted-foreground ml-auto">
                                                            Confidence: {Math.round(mem.confidence * 100)}%
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-foreground">{mem.content}</p>
                                                    <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                                                        <span>Accessed {mem.accessCount}× </span>
                                                        <span>Created {timeAgo(mem.createdAt)}</span>
                                                        <span>Last used {timeAgo(mem.lastAccessedAt)}</span>
                                                        {mem.sourceRef && (
                                                            <Link
                                                                href={mem.sourceRef.startsWith("task") ? `/tasks/${mem.sourceRef}` : `/knowledge`}
                                                                className="text-muted-foreground hover:text-foreground underline"
                                                            >
                                                                {mem.sourceRef}
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                            {filteredMemories.length === 0 && (
                                <div className="text-center py-8">
                                    <Brain className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">No memories in this category</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
