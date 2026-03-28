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
import { ArrowLeft, Bot, Loader2, Save } from "lucide-react";
import Link from "next/link";

const agentTemplates = [
    { id: "developer", name: "Developer", description: "Code review, documentation, and technical support" },
    { id: "marketing", name: "Marketing", description: "Content creation, campaign analysis, and social media" },
    { id: "support", name: "Support", description: "Customer inquiries, ticket management, and FAQ" },
    { id: "research", name: "Research", description: "Data analysis, market research, and trend monitoring" },
    { id: "custom", name: "Custom", description: "Build a custom agent from scratch" },
];

export default function CreateAgentPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [systemPrompt, setSystemPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // TODO: Create agent via API
        setTimeout(() => {
            setIsLoading(false);
            router.push("/agents");
        }, 1000);
    };

    return (
        <>
            <Header title="Create agent" />
            <div className="max-w-4xl">
                <Link
                    href="/agents"
                    className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-3 w-3" />
                    Back to agents
                </Link>

                <form onSubmit={handleSubmit}>
                    {/* Basic Info */}
                    <Card className="card-elevated border-transparent">
                        <CardHeader className="border-b border-border/40 bg-zinc-50/50 pb-5">
                            <CardTitle className="text-[16px] font-bold text-foreground flex items-center gap-2">
                                <Bot className="h-5 w-5 text-indigo-500" />
                                Agent details
                            </CardTitle>
                            <CardDescription>
                                Configure your AI agent&apos;s identity and behavior
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="space-y-2.5">
                                <Label htmlFor="name" className="text-[13px] font-semibold">Agent name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Code Reviewer"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="h-10 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="description" className="text-[13px] font-semibold">Description</Label>
                                <Input
                                    id="description"
                                    placeholder="What does this agent do?"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="h-10 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Template Selection */}
                    <Card className="mt-6 card-elevated border-transparent">
                        <CardHeader className="border-b border-border/40 bg-zinc-50/50 pb-5">
                            <CardTitle className="text-[16px] font-bold text-foreground">
                                Choose a template
                            </CardTitle>
                            <CardDescription className="font-medium mt-1.5">
                                Start with a pre-configured template or build from scratch
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {agentTemplates.map((template) => (
                                    <button
                                        key={template.id}
                                        type="button"
                                        onClick={() => setSelectedTemplate(template.id)}
                                        className={`flex flex-col items-start rounded-xl p-5 text-left transition-all card-elevated border hover:-translate-y-0.5 ${selectedTemplate === template.id
                                                ? "ring-2 ring-primary shadow-md border-transparent bg-zinc-50/50"
                                                : "border-transparent hover:border-primary/20 hover:shadow-lg bg-white"
                                            }`}
                                    >
                                        <p className="text-[14px] font-bold text-foreground">
                                            {template.name}
                                        </p>
                                        <p className="mt-1.5 text-[12px] font-medium text-muted-foreground leading-relaxed">
                                            {template.description}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Prompt */}
                    <Card className="mt-6 card-elevated border-transparent">
                        <CardHeader className="border-b border-border/40 bg-zinc-50/50 pb-5">
                            <CardTitle className="text-[16px] font-bold text-foreground">
                                System prompt
                            </CardTitle>
                            <CardDescription className="font-medium mt-1.5">
                                Define your agent&apos;s personality and capabilities
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <textarea
                                id="systemPrompt"
                                rows={6}
                                placeholder="You are a helpful AI assistant specialized in..."
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                className="flex min-h-[120px] w-full rounded-xl border border-border/60 bg-white px-4 py-3 text-[14px] shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="mt-8 flex items-center justify-end gap-3 pb-12">
                        <Link href="/agents">
                            <Button type="button" variant="outline" className="h-10 px-6 font-semibold bg-white hover:bg-zinc-50 shadow-sm">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={isLoading || !name} className="h-10 px-6 font-bold bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/95 transition-all">
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-1.5" />
                                    Create agent
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
