import { Header } from "@/components/layouts/header";
import { Button } from "@repo/ui";
import {
    Card,
    CardContent,
} from "@repo/ui";
import { Badge } from "@repo/ui";
import { StatusBadge } from "@/components/shared/status-badge";
import {
    Bot,
    Plus,
    MessageSquare,
    ClipboardList,
    Clock,
} from "lucide-react";
import Link from "next/link";
import { mockAgents, timeAgo, formatTokens, formatCost } from "@/lib/mock-data";
import type { AgentStatus } from "@/lib/mock-data";

const statusStyles: Record<AgentStatus, { label: string; className: string }> = {
    active: { label: "Active", className: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    training: { label: "Training", className: "bg-amber-50 text-amber-600 border-amber-200 animate-pulse" },
    inactive: { label: "Inactive", className: "bg-muted text-muted-foreground border-border" },
};

const roleLabels: Record<string, string> = {
    developer: "Developer",
    marketing: "Marketing",
    support: "Support",
    analyst: "Analyst",
    custom: "Custom",
};

const roleColors: Record<string, { bg: string, text: string }> = {
    developer: { bg: "bg-indigo-50 border border-indigo-100", text: "text-indigo-600" },
    marketing: { bg: "bg-pink-50 border border-pink-100", text: "text-pink-600" },
    support: { bg: "bg-emerald-50 border border-emerald-100", text: "text-emerald-600" },
    analyst: { bg: "bg-amber-50 border border-amber-100", text: "text-amber-600" },
    custom: { bg: "bg-muted border border-border", text: "text-muted-foreground" },
};

export default function AgentsPage() {
    return (
        <>
            <Header title="Agents" />
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">
                            AI Workforce
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {mockAgents.length} agents · {mockAgents.filter(a => a.status === "active").length} active
                        </p>
                    </div>
                    <Link href="/agents/new">
                        <Button className="h-9 px-4 bg-primary hover:bg-primary/95 text-primary-foreground shadow-primary/20 text-xs font-semibold gap-1.5 transition-all">
                            <Plus className="h-4 w-4" />
                            Create Agent
                        </Button>
                    </Link>
                </div>

                {/* agent cards grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {mockAgents.map((agent) => {
                        const statusInfo = statusStyles[agent.status];
                        const colorClass = roleColors[agent.role] || roleColors.custom;
                        return (
                            <Link key={agent.id} href={`/agents/${agent.id}`}>
                                <Card className="group transition-all cursor-pointer h-full card-elevated border-transparent hover:border-primary/20 hover:shadow-lg">
                                    <CardContent className="p-5">
                                        <div className="flex items-start gap-4">
                                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${colorClass.bg}`}>
                                                <Bot className={`h-5 w-5 ${colorClass.text}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-1">
                                                    <h3 className="text-[15px] text-foreground truncate pr-2">
                                                        {agent.name}
                                                    </h3>
                                                    <StatusBadge status={agent.status} label={statusInfo.label} />
                                                </div>
                                                <p className="text-[11px] font-medium text-muted-foreground mb-3">
                                                    {roleLabels[agent.role]} · {agent.model}
                                                </p>
                                                <p className="text-[13px] font-medium text-muted-foreground line-clamp-2 leading-relaxed">
                                                    {agent.description}
                                                </p>

                                                {/* stats row */}
                                                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <ClipboardList className="h-3.5 w-3.5" />
                                                        <span>{agent.totalTasks} tasks</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <MessageSquare className="h-3.5 w-3.5" />
                                                        <span>{agent.totalMessages} msgs</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                                                        <span>{formatTokens(agent.tokensIn + agent.tokensOut)} · {formatCost(agent.costUsd)}</span>
                                                    </div>
                                                    <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        <span>{timeAgo(agent.lastActiveAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
