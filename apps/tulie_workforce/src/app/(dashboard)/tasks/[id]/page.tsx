"use client";

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
    ArrowLeft,
    Bot,
    User,
    CheckCircle2,
    Clock,
    XCircle,
    PlayCircle,
    PauseCircle,
    DollarSign,
    Zap,
    FileText,
    ThumbsUp,
    ThumbsDown,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getTask, formatTokens, formatCost, timeAgo } from "@/lib/mock-data";
import type { TaskStatus } from "@/lib/mock-data";

const statusVariant: Record<TaskStatus, "default" | "secondary" | "outline" | "destructive" | "warning"> = {
    completed: "default",
    in_progress: "warning",
    pending: "outline",
    failed: "destructive",
    cancelled: "secondary",
};

const stepIcons: Record<string, typeof CheckCircle2> = {
    done: CheckCircle2,
    current: PlayCircle,
    upcoming: PauseCircle,
};

export default function TaskDetailPage() {
    const params = useParams();
    const taskId = params.id as string;
    const task = getTask(taskId);

    if (!task) {
        return (
            <>
                <Header title="Task not found" />
                <div className="">
                    <p className="text-muted-foreground">This task does not exist.</p>
                    <Link href="/tasks" className="text-sm text-foreground underline mt-2 inline-block">
                        Back to tasks
                    </Link>
                </div>
            </>
        );
    }

    const hasPlanReview = task.steps.some(s => s.label === "Review plan");
    const planReviewStep = task.steps.find(s => s.label === "Review plan");

    return (
        <>
            <Header title={task.title} />
            <div className="max-w-5xl">
                <Link
                    href="/tasks"
                    className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-3 w-3" />
                    Back to tasks
                </Link>

                {/* Task Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-semibold text-foreground">
                                {task.title}
                            </h2>
                            <Badge variant={statusVariant[task.status]}>
                                {task.status.replace("_", " ")}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Bot className="h-3.5 w-3.5" />
                                {task.agentName}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {timeAgo(task.createdAt)}
                            </span>
                            <span>Priority: {task.priority}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Execution Timeline */}
                        <Card className="card-elevated border-transparent">
                            <CardHeader className="border-b border-border/40 bg-muted/50 pb-4">
                                <CardTitle className="text-[15px] font-bold text-foreground">
                                    Execution timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="relative">
                                    {task.steps.map((step, i) => {
                                        const Icon = stepIcons[step.status];
                                        const isLast = i === task.steps.length - 1;
                                        return (
                                            <div key={i} className="flex gap-3 pb-6 last:pb-0">
                                                <div className="flex flex-col items-center">
                                                    <Icon
                                                        className={`h-5 w-5 shrink-0 ${step.status === "done" ? "text-foreground" : step.status === "current" ? "text-muted-foreground" : "text-muted-foreground/60" }`}
                                                    />
                                                    {!isLast && (
                                                        <div className={`w-px flex-1 mt-1 ${step.status === "done" ? "bg-foreground" : "bg-secondary" }`} />
                                                    )}
                                                </div>
                                                <div className="pb-2">
                                                    <p className={`text-sm font-medium ${step.status === "upcoming" ? "text-muted-foreground" : "text-foreground" }`}>
                                                        {step.label}
                                                    </p>
                                                    {step.detail && (
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {step.detail}
                                                        </p>
                                                    )}
                                                    {step.timestamp && (
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {timeAgo(step.timestamp)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Plan Review (if applicable) */}
                        {hasPlanReview && planReviewStep?.status === "current" && (
                            <Card className="card-elevated border-dashed border-2 border-primary/20 bg-primary/5 shadow-none rounded-md">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-[15px] font-bold text-foreground">
                                        Review agent plan
                                    </CardTitle>
                                    <CardDescription className="font-medium mt-1">
                                        The agent is waiting for your approval to proceed
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md bg-accent/50 border border-border p-4 mb-4">
                                        <p className="text-sm text-muted-foreground">
                                            {task.messages.find(m => m.role === "assistant")?.content || "Plan pending..."}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button className="gap-1">
                                            <ThumbsUp className="h-4 w-4" />
                                            Approve
                                        </Button>
                                        <Button variant="outline" className="gap-1">
                                            <ThumbsDown className="h-4 w-4" />
                                            Reject
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Conversation */}
                        {task.messages.length > 0 && (
                            <Card className="card-elevated border-transparent">
                                <CardHeader className="border-b border-border/40 bg-muted/50 pb-4">
                                    <CardTitle className="text-[15px] font-bold text-foreground flex items-center gap-2">
                                        <Bot className="h-4.5 w-4.5 text-sky-500" />
                                        Conversation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {task.messages.map((msg) => (
                                            <div key={msg.id} className="flex gap-3">
                                                <div className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${msg.role === "user" ? "bg-secondary" : "bg-foreground" }`}>
                                                    {msg.role === "user" ? (
                                                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                    ) : (
                                                        <Bot className="h-3.5 w-3.5 text-white" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-medium text-foreground">
                                                            {msg.role === "user" ? "You" : task.agentName}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {timeAgo(msg.timestamp)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">
                                                        {msg.content}
                                                    </p>
                                                    {msg.reasoning && (
                                                        <div className="mt-2 rounded-md bg-accent/50 border border-border p-3">
                                                            <p className="text-xs font-medium text-muted-foreground mb-1">Reasoning</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {msg.reasoning}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Result */}
                        {task.result && (
                            <Card className="card-elevated border-transparent">
                                <CardHeader className="border-b border-border/40 bg-muted/50 pb-4">
                                    <CardTitle className="text-[15px] font-bold text-foreground">
                                        Result
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-6">
                                    <div className="rounded-md bg-muted border border-border p-5 shadow-inner">
                                        <p className="text-sm text-foreground">
                                            {task.result.outputText}
                                        </p>
                                    </div>
                                    {task.result.artifacts.length > 0 && (
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                                Artifacts
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {task.result.artifacts.map((art) => (
                                                    <div
                                                        key={art}
                                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-accent text-xs text-foreground"
                                                    >
                                                        <FileText className="h-3 w-3" />
                                                        {art}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column — Cost & Metadata */}
                    <div className="space-y-6">
                        <Card className="card-elevated border-transparent">
                            <CardHeader className="border-b border-border/40 bg-muted/50 pb-4">
                                <CardTitle className="text-[15px] font-bold text-foreground">
                                    Cost summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Zap className="h-3 w-3" /> Tokens in
                                    </span>
                                    <span className="text-xs font-medium text-foreground">
                                        {formatTokens(task.tokensIn)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Zap className="h-3 w-3" /> Tokens out
                                    </span>
                                    <span className="text-xs font-medium text-foreground">
                                        {formatTokens(task.tokensOut)}
                                    </span>
                                </div>
                                <div className="border-t border-border pt-3 flex items-center justify-between">
                                    <span className="text-xs font-medium text-foreground flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" /> Total cost
                                    </span>
                                    <span className="text-sm font-semibold text-foreground">
                                        {formatCost(task.costUsd)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="card-elevated border-transparent">
                            <CardHeader className="border-b border-border/40 bg-muted/50 pb-4">
                                <CardTitle className="text-[15px] font-bold text-foreground">
                                    Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs pt-5">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Agent</span>
                                    <Link href={`/agents/${task.agentId}`} className="text-foreground hover:underline">
                                        {task.agentName}
                                    </Link>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Priority</span>
                                    <span className="text-foreground">{task.priority}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Created</span>
                                    <span className="text-foreground">{timeAgo(task.createdAt)}</span>
                                </div>
                                {task.completedAt && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Completed</span>
                                        <span className="text-foreground">{timeAgo(task.completedAt)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Messages</span>
                                    <span className="text-foreground">{task.messages.length}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
