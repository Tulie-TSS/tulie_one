"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layouts/header";
import { Button } from "@repo/ui";
import { Input } from "@repo/ui";
import { Label } from "@repo/ui";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@repo/ui";
import { ArrowLeft, Bot, ClipboardList, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { mockAgents } from "@/lib/mock-data";
import type { TaskPriority } from "@/lib/mock-data";

const priorities: TaskPriority[] = ["low", "medium", "high", "urgent"];

export default function CreateTaskPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [agentId, setAgentId] = useState("");
    const [priority, setPriority] = useState<TaskPriority>("medium");
    const [isLoading, setIsLoading] = useState(false);

    const activeAgents = mockAgents.filter((a) => a.status === "active");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    agentId,
                    priority,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "something went wrong");
            }

            router.push("/tasks");
        } catch (error) {
            console.error("failed to assign task:", error);
            alert("failed to assign task. please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header title="Assign task" />
            <div className="max-w-4xl">
                <Link
                    href="/tasks"
                    className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-3 w-3" />
                    Back to tasks
                </Link>

                <form onSubmit={handleSubmit}>
                    {/* task info */}
                    <Card className="card-elevated border-transparent">
                        <CardHeader className="border-b border-border/40 bg-muted/50 pb-5">
                            <CardTitle className="text-[16px] font-bold text-foreground flex items-center gap-2">
                                <ClipboardList className="h-5 w-5 text-indigo-500" />
                                Task details
                            </CardTitle>
                            <CardDescription className="text-[13px] font-medium mt-1.5">
                                Describe what you want the agent to do
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="space-y-2.5">
                                <Label htmlFor="title" className="text-[13px] font-semibold">Task title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Write social media plan"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="h-10 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20"
                                    required
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="desc" className="text-[13px] font-semibold">Instructions</Label>
                                <textarea
                                    id="desc"
                                    rows={5}
                                    placeholder="Provide detailed instructions for the agent..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="flex min-h-[120px] w-full rounded-md border border-border/60 bg-white px-4 py-3 text-[14px] shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* agent selection */}
                    <Card className="mt-6 card-elevated border-transparent">
                        <CardHeader className="border-b border-border/40 bg-muted/50 pb-5">
                            <CardTitle className="text-[16px] font-bold text-foreground flex items-center gap-2">
                                <Bot className="h-5 w-5 text-emerald-500" />
                                Assign to agent
                            </CardTitle>
                            <CardDescription className="text-[13px] font-medium mt-1.5">
                                Select which agent should execute this task
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {activeAgents.map((agent) => (
                                    <button
                                        key={agent.id}
                                        type="button"
                                        onClick={() => setAgentId(agent.id)}
                                        className={`flex items-start gap-4 rounded-md border p-4 text-left transition-all ${agentId === agent.id ? "ring-2 ring-primary shadow-md border-transparent bg-muted/50" : "border-transparent card-elevated shadow-sm hover:border-primary/20 hover:shadow-lg bg-white" }`}
                                    >
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-indigo-50 border border-indigo-100 shadow-sm text-indigo-600">
                                            <Bot className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[14px] font-bold text-foreground truncate">
                                                {agent.name}
                                            </p>
                                            <p className="text-[12px] text-muted-foreground mt-0.5 font-medium">
                                                {agent.role} &middot; {agent.model}
                                            </p>
                                            <p className="text-[12px] text-muted-foreground mt-1.5 font-medium">
                                                {agent.successfulTasks}/{agent.totalTasks} tasks succeeded
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* priority */}
                    <Card className="mt-6 card-elevated border-transparent">
                        <CardHeader className="border-b border-border/40 bg-muted/50 pb-5">
                            <CardTitle className="text-[16px] font-bold text-foreground">
                                Priority Level
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-wrap gap-2.5">
                                {priorities.map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        className={`px-5 py-2.5 rounded-md text-[13px] font-bold tracking-wide uppercase transition-all shadow-sm ${priority === p ? "bg-foreground text-white ring-2 ring-foreground/20" : "bg-white border border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground" }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* submit */}
                    <div className="mt-8 flex items-center justify-end gap-3 pb-12">
                        <Link href="/tasks">
                            <Button type="button" variant="outline" className="h-10 px-6 font-semibold bg-white hover:bg-muted shadow-sm">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={isLoading || !title || !agentId} className="h-10 px-6 font-bold bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/95 transition-all">
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                    Assigning...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-1.5" />
                                    Assign task
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
