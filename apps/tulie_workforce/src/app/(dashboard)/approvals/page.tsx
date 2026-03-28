"use client";

import { useState } from "react";
import { Header } from "@/components/layouts/header";
import { Button } from "@repo/ui";
import {
    Card,
    CardContent,
} from "@repo/ui";
import { Badge } from "@repo/ui";
import { Input } from "@repo/ui";
import {
    CheckCircle2,
    XCircle,
    MessageSquare,
    Clock,
    Bot,
    User,
    Send,
    AlertTriangle,
    Inbox,
    Filter,
} from "lucide-react";

// ─── Mock Approval Data ───

type ApprovalStatus = "pending_review" | "approved" | "rejected" | "changes_requested";

interface Approval {
    id: string;
    taskId: string;
    title: string;
    description: string;
    agentName: string;
    agentRole: string;
    createdByName: string;
    createdByRole: string;
    priority: string;
    approvalStatus: ApprovalStatus;
    feedbackNote: string | null;
    result: string | null;
    createdAt: string;
}

const mockApprovals: Approval[] = [
    {
        id: "appr-1",
        taskId: "task-101",
        title: "Facebook Post — Q1 Product Launch",
        description: "MarketingPro generated a Facebook ad post for the Q1 product launch campaign targeting CTOs.",
        agentName: "MarketingPro",
        agentRole: "marketing",
        createdByName: "Linh Pham",
        createdByRole: "specialist",
        priority: "high",
        approvalStatus: "pending_review",
        feedbackNote: null,
        result: "🚀 Exciting news! Introducing Digital Workforce 2.0 — the future of AI-powered team management. Our new platform helps CTOs automate 80% of routine tasks.\n\n✅ Smart Agent Routing\n✅ Real-time Analytics\n✅ Enterprise Security\n\nBook a demo today! Link in bio.\n\n#DigitalWorkforce #AI #Automation #Enterprise",
        createdAt: "2026-02-12T08:30:00Z",
    },
    {
        id: "appr-2",
        taskId: "task-102",
        title: "Customer Response — Billing Dispute",
        description: "SupportBot drafted a response to a billing dispute from a premium-tier customer.",
        agentName: "SupportBot",
        agentRole: "support",
        createdByName: "Hoa Le",
        createdByRole: "specialist",
        priority: "urgent",
        approvalStatus: "pending_review",
        feedbackNote: null,
        result: "Dear Ms. Chen,\n\nThank you for reaching out regarding the charge on your February invoice. I've reviewed your account and can confirm that the $49.99 charge was for your Pro plan renewal on Feb 1.\n\nHowever, I can see your request to downgrade was submitted on Jan 30 — before the renewal date. I've processed a full refund of $49.99 which should appear within 3-5 business days.\n\nPlease don't hesitate to reach out if you have any further questions.\n\nBest regards,\nTulie Support Team",
        createdAt: "2026-02-12T09:15:00Z",
    },
    {
        id: "appr-3",
        taskId: "task-103",
        title: "Sales Quote — Acme Corp Enterprise",
        description: "SalesAssistant generated a quote with 15% discount for Acme Corp (50 seats).",
        agentName: "SalesAssistant",
        agentRole: "sales",
        createdByName: "Linh Pham",
        createdByRole: "specialist",
        priority: "high",
        approvalStatus: "pending_review",
        feedbackNote: null,
        result: "QUOTE #Q-2026-0451\nClient: Acme Corp\nPlan: Enterprise (50 seats)\nBase Price: $4,990/mo\nDiscount: 15% (volume)\nFinal Price: $4,241.50/mo\nTerm: 12 months\nTotal Contract: $50,898.00\n\n⚠️ NOTE: Discount exceeds 10% threshold — requires Manager approval.",
        createdAt: "2026-02-12T10:00:00Z",
    },
    {
        id: "appr-4",
        taskId: "task-104",
        title: "Blog Post — AI Agent Best Practices",
        description: "MarketingPro wrote a 1,200-word blog post on AI agent implementation best practices.",
        agentName: "MarketingPro",
        agentRole: "marketing",
        createdByName: "Hoa Le",
        createdByRole: "specialist",
        priority: "medium",
        approvalStatus: "approved",
        feedbackNote: "Great content. Added one internal link before publishing.",
        result: null,
        createdAt: "2026-02-11T14:00:00Z",
    },
    {
        id: "appr-5",
        taskId: "task-105",
        title: "Instagram Carousel — Feature Highlights",
        description: "MarketingPro designed text for a 5-slide Instagram carousel.",
        agentName: "MarketingPro",
        agentRole: "marketing",
        createdByName: "Linh Pham",
        createdByRole: "specialist",
        priority: "low",
        approvalStatus: "rejected",
        feedbackNote: "Tone is too casual for our brand. Needs more data-driven messaging.",
        result: null,
        createdAt: "2026-02-10T16:30:00Z",
    },
];

const statusConfig: Record<ApprovalStatus, { label: string; color: string; icon: typeof Clock }> = {
    pending_review: { label: "Pending review", color: "bg-amber-50 text-amber-600 border-amber-200 shadow-sm", icon: Clock },
    approved: { label: "Approved", color: "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm", icon: CheckCircle2 },
    rejected: { label: "Rejected", color: "bg-rose-50 text-rose-600 border-rose-200 shadow-sm", icon: XCircle },
    changes_requested: { label: "Changes requested", color: "bg-indigo-50 text-indigo-600 border-indigo-200 shadow-sm", icon: MessageSquare },
};

export default function ApprovalsPage() {
    const [approvals, setApprovals] = useState<Approval[]>(mockApprovals);
    const [filter, setFilter] = useState<ApprovalStatus | "all">("all");
    const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const filtered = filter === "all"
        ? approvals
        : approvals.filter((a) => a.approvalStatus === filter);

    const pendingCount = approvals.filter((a) => a.approvalStatus === "pending_review").length;

    const handleAction = (id: string, action: "approve" | "reject" | "request_changes") => {
        setApprovals(approvals.map((a) => {
            if (a.id !== id) return a;
            const statusMap = {
                approve: "approved" as ApprovalStatus,
                reject: "rejected" as ApprovalStatus,
                request_changes: "changes_requested" as ApprovalStatus,
            };
            return {
                ...a,
                approvalStatus: statusMap[action],
                feedbackNote: feedbackInputs[id] || a.feedbackNote,
            };
        }));
        setExpandedId(null);
    };

    return (
        <>
            <Header title="Approvals" />
            <div className="max-w-5xl mx-auto">
                {/* Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-[20px] font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Inbox className="h-5.5 w-5.5 text-primary" />
                            Approval inbox
                        </h2>
                        <p className="text-[14px] font-medium text-muted-foreground mt-1.5">
                            {pendingCount} pending review · {approvals.length} total
                        </p>
                    </div>
                    <div className="flex w-fit items-center rounded-xl bg-zinc-100/80 p-1">
                        <div className="pl-3 pr-2 flex items-center justify-center">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {(["all", "pending_review", "approved", "rejected", "changes_requested"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200 ${filter === f
                                        ? "bg-white text-foreground shadow-sm ring-1 ring-border/50"
                                        : "text-muted-foreground hover:bg-white/50 hover:text-foreground"
                                    }`}
                            >
                                {f === "all" ? "All" : f === "pending_review" ? "Pending" : f === "changes_requested" ? "Changes" : f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Approval List */}
                <div className="space-y-4">
                    {filtered.map((approval) => {
                        const status = statusConfig[approval.approvalStatus];
                        const StatusIcon = status.icon;
                        const isExpanded = expandedId === approval.id;
                        const isPending = approval.approvalStatus === "pending_review";

                        return (
                            <Card
                                key={approval.id}
                                className={`transition-all card-elevated border-transparent ${isPending ? "ring-1 ring-amber-200/50 hover:ring-amber-300 shadow-amber-500/5 hover:-translate-y-0.5" : "hover:border-primary/20 hover:shadow-lg hover:-translate-y-0.5"}`}
                            >
                                <CardContent className="pt-5 pb-4 px-6">
                                    {/* Header Row */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1.5">
                                                <button
                                                    onClick={() => setExpandedId(isExpanded ? null : approval.id)}
                                                    className="text-[15px] font-bold text-foreground hover:text-primary transition-colors text-left"
                                                >
                                                    {approval.title}
                                                </button>
                                                <Badge variant="outline" className={`text-[10px] font-semibold px-2.5 py-1 uppercase tracking-wider ${status.color}`}>
                                                    <StatusIcon className="h-3.5 w-3.5 mr-1" />
                                                    {status.label}
                                                </Badge>
                                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 border-border text-muted-foreground px-2 py-0.5">
                                                    {approval.priority}
                                                </Badge>
                                            </div>
                                            <p className="text-[13px] font-medium text-muted-foreground line-clamp-1 leading-relaxed">{approval.description}</p>
                                        </div>
                                    </div>

                                    {/* Metadata */}
                                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold text-muted-foreground mb-2">
                                        <span className="flex items-center gap-1.5">
                                            <div className="flex h-5 w-5 items-center justify-center rounded bg-indigo-50 border border-indigo-100">
                                                <Bot className="h-3 w-3 text-indigo-600" />
                                            </div>
                                            {approval.agentName}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-100 border border-border">
                                                <User className="h-3 w-3 text-muted-foreground" />
                                            </div>
                                            {approval.createdByName} <span className="text-muted-foreground/60 font-medium">({approval.createdByRole})</span>
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            {new Date(approval.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>

                                    {/* Expanded: Result Preview + Actions */}
                                    {isExpanded && (
                                        <div className="mt-4 pt-4 border-t border-border/60">
                                            {/* AI-generated result */}
                                            {approval.result && (
                                                <div className="mb-4">
                                                    <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2">AI-generated content</p>
                                                    <div className="rounded-xl bg-zinc-50 border border-border/60 p-4 shadow-inner">
                                                        <p className="text-[13px] font-medium leading-relaxed text-foreground whitespace-pre-wrap">{approval.result}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Existing feedback */}
                                            {approval.feedbackNote && (
                                                <div className="mb-4 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/50">
                                                    <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-1">Manager feedback</p>
                                                    <p className="text-[13px] font-medium text-indigo-900 leading-relaxed">{approval.feedbackNote}</p>
                                                </div>
                                            )}

                                            {/* Actions (only for pending) */}
                                            {isPending && (
                                                <div className="space-y-4 bg-amber-50/30 -mx-6 -mb-4 px-6 py-5 border-t border-amber-100 mt-2 rounded-b-[var(--radius)]">
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            placeholder="Add feedback or critique for AI to improve..."
                                                            className="text-[13px] h-10 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 bg-white border-border/60 rounded-xl"
                                                            value={feedbackInputs[approval.id] ?? ""}
                                                            onChange={(e) =>
                                                                setFeedbackInputs({ ...feedbackInputs, [approval.id]: e.target.value })
                                                            }
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Button
                                                            size="sm"
                                                            className="h-10 px-5 text-[13px] font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 text-white transition-all hover:-translate-y-0.5"
                                                            onClick={() => handleAction(approval.id, "approve")}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-10 px-5 text-[13px] font-bold bg-white hover:bg-zinc-50 shadow-sm transition-all"
                                                            onClick={() => handleAction(approval.id, "request_changes")}
                                                        >
                                                            <Send className="h-4 w-4 mr-1.5 text-primary" />
                                                            Critique & regenerate
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-10 px-5 text-[13px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 shadow-sm bg-white transition-all ml-auto"
                                                            onClick={() => handleAction(approval.id, "reject")}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1.5" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Click to expand hint for pending */}
                                    {!isExpanded && isPending && (
                                        <button
                                            onClick={() => setExpandedId(approval.id)}
                                            className="text-[11px] font-semibold text-primary hover:text-primary mt-1.5 flex items-center gap-1"
                                        >
                                            Click to review <span className="text-xl leading-none -mt-0.5">→</span>
                                        </button>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}

                    {filtered.length === 0 && (
                        <div className="text-center py-12">
                            <CheckCircle2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No approvals to review</p>
                            <p className="text-xs text-muted-foreground mt-1">All caught up!</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
