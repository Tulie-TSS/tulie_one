"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Header } from "@/components/layouts/header";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Bot,
    User,
    Send,
    Plus,
    MessageSquare,
    Loader2,
    Sparkles,
    Clock,
} from "lucide-react";
import { mockAgents, timeAgo } from "@/lib/mock-data";

// ─── Types ───────────────────────────────────────────────

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}

interface Thread {
    id: string;
    agentId: string;
    agentName: string;
    title: string;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
}

// ─── Mock Threads ────────────────────────────────────────

const mockThreads: Thread[] = [
    {
        id: "thread-1",
        agentId: "agent-1",
        agentName: "MarketingPro",
        title: "Q1 Campaign Strategy",
        messages: [
            { id: "m1", role: "user", content: "Create a social media plan for Q1 2026 targeting tech startups.", timestamp: "2026-02-12T09:00:00Z" },
            { id: "m2", role: "assistant", content: "Here's a comprehensive Q1 2026 social media plan for tech startups:\n\n**Platform Strategy:**\n1. **LinkedIn** (primary) — Long-form thought leadership, case studies\n2. **Twitter/X** — Quick tips, industry news reactions\n3. **Instagram** — Behind-the-scenes, team culture\n\n**Content Calendar:**\n- Week 1-2: \"AI Automation Myths\" series\n- Week 3-4: Customer success stories\n- Week 5-6: Product feature highlights\n- Week 7-8: Industry trend analysis\n\n**KPIs:**\n- Engagement rate: >3%\n- Lead generation: 50 MQLs/month\n- Follower growth: +500/month\n\nShall I elaborate on any specific platform or create detailed post templates?", timestamp: "2026-02-12T09:00:30Z" },
            { id: "m3", role: "user", content: "Create 3 LinkedIn post templates for the AI Automation Myths series.", timestamp: "2026-02-12T09:05:00Z" },
            { id: "m4", role: "assistant", content: "Here are 3 LinkedIn post templates:\n\n---\n\n**Post 1: \"AI Will Replace All Jobs\"**\n\n🚫 Myth: AI will replace your entire team.\n✅ Reality: AI replaces TASKS, not people.\n\nOur data shows:\n→ 73% of tasks automated are ones your team didn't enjoy doing\n→ Teams using AI automation report 40% higher job satisfaction\n→ The most successful companies are using AI to AUGMENT their workforce\n\nThe question isn't \"Will AI take my job?\"\nIt's \"How can AI make my job better?\"\n\n#AI #FutureOfWork #Automation\n\n---\n\n**Post 2: \"AI is Only for Big Companies\"**\n\n💡 Myth: You need a massive budget for AI.\n💡 Reality: A startup with 3 people can run an AI workforce.\n\nHere's what it actually costs:\n→ AI API calls: ~$5-20/month\n→ Setup time: 1-2 days\n→ ROI: 10x in the first month\n\nWe help startups deploy AI agents that handle:\n☑️ Customer support\n☑️ Content creation\n☑️ Data analysis\n\nAll for less than a coffee subscription ☕\n\n---\n\n**Post 3: \"AI Content is Generic\"**\n\n⚡ Myth: AI-generated content is bland and robotic.\n⚡ Reality: AI + your brand voice = content gold.\n\nThe secret? Context.\n\nWhen you teach an AI agent:\n→ Your brand guidelines\n→ Your tone of voice\n→ Your target audience\n→ Your past successful content\n\nIt doesn't write \"generic AI content.\"\nIt writes YOUR content, 10x faster.\n\n#ContentMarketing #AIContent #MarketingTips", timestamp: "2026-02-12T09:06:00Z" },
        ],
        createdAt: "2026-02-12T09:00:00Z",
        updatedAt: "2026-02-12T09:06:00Z",
    },
    {
        id: "thread-2",
        agentId: "agent-2",
        agentName: "CodeReviewer",
        title: "API Refactoring Discussion",
        messages: [
            { id: "m5", role: "user", content: "Review our current API structure and suggest improvements.", timestamp: "2026-02-11T14:00:00Z" },
            { id: "m6", role: "assistant", content: "Based on the codebase analysis, here are my recommendations:\n\n1. **Consistent Response Format** — Use a standard envelope: `{ data, error, meta }`\n2. **Rate Limiting** — Add per-user rate limits on write endpoints\n3. **Pagination** — Switch from offset to cursor-based pagination\n4. **Validation** — Move all Zod schemas to a shared `/validators` directory\n\nWant me to create a detailed refactoring plan?", timestamp: "2026-02-11T14:01:00Z" },
        ],
        createdAt: "2026-02-11T14:00:00Z",
        updatedAt: "2026-02-11T14:01:00Z",
    },
];

// ─── Mock AI Response ────────────────────────────────────

const mockResponses = [
    "I understand your request. Let me analyze this and provide a detailed response.\n\nBased on the information provided, here are my key recommendations:\n\n1. **Start with a clear objective** — Define measurable goals before execution\n2. **Iterate quickly** — Launch a minimum viable version and gather feedback\n3. **Measure what matters** — Track 2-3 key metrics, not everything\n\nWould you like me to elaborate on any of these points?",
    "Great question! Here's my analysis:\n\n**Current State:**\n- Your approach is solid but could be more structured\n- There's an opportunity to automate the repetitive parts\n\n**Recommendations:**\n- Implement a workflow template for recurring tasks\n- Use data-driven decision making for prioritization\n- Set up automated reporting to track progress\n\nShall I draft a detailed implementation plan?",
    "I've processed your request. Here's what I suggest:\n\n📊 **Analysis Summary:**\n- The data shows a clear trend toward automation\n- Your current process has 3 bottlenecks that can be eliminated\n- Expected time savings: ~15 hours/week\n\n🎯 **Action Items:**\n1. Automate data collection (saves 5h/week)\n2. Streamline approval workflow (saves 6h/week)\n3. Create self-service dashboards (saves 4h/week)\n\nWant me to prioritize these by impact vs. effort?",
];

// ─── Page Component ──────────────────────────────────────

export default function ChatPage() {
    const [threads, setThreads] = useState<Thread[]>(mockThreads);
    const [activeThreadId, setActiveThreadId] = useState<string>(mockThreads[0]?.id ?? "");
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState(mockAgents[0]?.id ?? "");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeThread = threads.find((t) => t.id === activeThreadId);
    const activeAgents = mockAgents.filter((a) => a.status === "active");

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [activeThread?.messages.length, scrollToBottom]);

    const handleNewThread = () => {
        const agent = mockAgents.find((a) => a.id === selectedAgentId) ?? mockAgents[0];
        const newThread: Thread = {
            id: `thread-${Date.now()}`,
            agentId: agent.id,
            agentName: agent.name,
            title: "New conversation",
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setThreads([newThread, ...threads]);
        setActiveThreadId(newThread.id);
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading || !activeThread) return;

        const userMessage: Message = {
            id: `msg-${Date.now()}`,
            role: "user",
            content: input.trim(),
            timestamp: new Date().toISOString(),
        };

        // Update thread with user message
        const updatedThreads = threads.map((t) => {
            if (t.id !== activeThreadId) return t;
            const title = t.messages.length === 0 ? input.trim().slice(0, 50) : t.title;
            return {
                ...t,
                title,
                messages: [...t.messages, userMessage],
                updatedAt: new Date().toISOString(),
            };
        });
        setThreads(updatedThreads);
        setInput("");
        setIsLoading(true);

        // Simulate AI response
        await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

        const aiMessage: Message = {
            id: `msg-${Date.now() + 1}`,
            role: "assistant",
            content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
            timestamp: new Date().toISOString(),
        };

        setThreads((prev) =>
            prev.map((t) => {
                if (t.id !== activeThreadId) return t;
                return {
                    ...t,
                    messages: [...t.messages, aiMessage],
                    updatedAt: new Date().toISOString(),
                };
            })
        );
        setIsLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            <Header title="Chat" />
            <div className="flex -mx-6 md:-mx-10 -mb-6 md:-mb-8 h-[calc(100vh-73px)] bg-[#f8fbfa]">
                {/* Thread List */}
                <div className="w-80 border-r border-border/60 bg-white flex flex-col z-10 shadow-sm">
                    <div className="p-4 border-b border-border/60">
                        <Button onClick={handleNewThread} className="w-full h-10 text-[13px] font-bold gap-2 bg-primary hover:bg-primary/95 text-white shadow-md shadow-primary/20 transition-transform active:scale-95" size="sm">
                            <Plus className="h-4.5 w-4.5" />
                            New chat
                        </Button>
                    </div>

                    {/* Agent selector for new threads */}
                    <div className="p-4 border-b border-border/40 bg-zinc-50/30">
                        <p className="text-[10px] font-bold text-muted-foreground mb-2.5 uppercase tracking-wider">Agent</p>
                        <div className="flex flex-wrap gap-1.5">
                            {activeAgents.map((agent) => (
                                <button
                                    key={agent.id}
                                    onClick={() => setSelectedAgentId(agent.id)}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all duration-200 ${
                                        selectedAgentId === agent.id
                                            ? "bg-foreground text-white shadow-sm"
                                            : "bg-white border border-border text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground hover:shadow-sm"
                                    }`}
                                >
                                    {agent.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Thread list */}
                    <div className="flex-1 overflow-y-auto">
                        {threads.map((thread) => (
                            <button
                                key={thread.id}
                                onClick={() => setActiveThreadId(thread.id)}
                                className={`w-full text-left px-4 py-4 border-b border-border/40 transition-colors group ${
                                    activeThreadId === thread.id
                                        ? "bg-accent/80 border-l-2 border-l-primary"
                                        : "hover:bg-accent/50 border-l-2 border-l-transparent"
                                }`}
                            >
                                <div className="flex items-start gap-3 mb-1.5">
                                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0 group-hover:text-primary transition-colors" />
                                    <p className={`text-[13px] font-bold truncate transition-colors ${activeThreadId === thread.id ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                                        {thread.title}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 pl-7">
                                    <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider bg-zinc-100 border-border text-muted-foreground px-2">
                                        {thread.agentName}
                                    </Badge>
                                    <span className="text-[10px] font-medium text-muted-foreground ml-auto">
                                        {timeAgo(thread.updatedAt)}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-[#f8fbfa]">
                    {activeThread ? (
                        <>
                            {/* Chat header */}
                            <div className="h-14 border-b border-border/60 bg-white px-6 flex items-center gap-3 shadow-sm z-10 transition-all">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100 shadow-sm">
                                    <Bot className="h-4.5 w-4.5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-[14px] font-bold text-foreground">
                                        {activeThread.agentName}
                                    </p>
                                </div>
                                <Badge variant="outline" className="text-[10px] font-bold ml-auto px-2 bg-zinc-50 border-border/60 text-muted-foreground uppercase tracking-wider">
                                    {activeThread.messages.length} messages
                                </Badge>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
                                {activeThread.messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm mb-5">
                                            <Sparkles className="h-8 w-8 text-indigo-600" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight text-foreground">
                                            Start a conversation
                                        </h3>
                                        <p className="text-[14px] font-medium text-muted-foreground mt-2 max-w-sm leading-relaxed">
                                            Ask {activeThread.agentName} anything — write content,
                                            analyze data, review code, or brainstorm ideas.
                                        </p>
                                    </div>
                                )}

                                {activeThread.messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex gap-3 max-w-4xl mx-auto ${
                                            msg.role === "user" ? "justify-end" : "justify-start"
                                        }`}
                                    >
                                        {msg.role === "assistant" && (
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 shadow-sm mt-0.5">
                                                <Bot className="h-5 w-5 text-indigo-600" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm ${
                                                msg.role === "user"
                                                    ? "bg-foreground text-white rounded-tr-sm"
                                                    : "bg-white border border-border/60 rounded-tl-sm"
                                            }`}
                                        >
                                            <div
                                                className={`text-[14px] leading-relaxed whitespace-pre-wrap ${
                                                    msg.role === "user"
                                                        ? "text-white font-medium"
                                                        : "text-foreground font-medium"
                                                }`}
                                            >
                                                {msg.content}
                                            </div>
                                            <p
                                                className={`text-[10px] mt-2 flex items-center gap-1 font-semibold ${
                                                    msg.role === "user"
                                                        ? "text-zinc-300"
                                                        : "text-muted-foreground"
                                                }`}
                                            >
                                                <Clock className="h-3 w-3" />
                                                {timeAgo(msg.timestamp)}
                                            </p>
                                        </div>
                                        {msg.role === "user" && (
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 border border-border mt-0.5">
                                                <User className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Loading state placeholder for syntax parsing */}
                                {isLoading && (
                                    <div className="flex gap-3 max-w-4xl mx-auto">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 shadow-sm mt-0.5">
                                            <Bot className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div className="bg-white border border-border/60 rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm">
                                            <div className="flex items-center gap-2 text-[13px] font-bold text-muted-foreground">
                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                Thinking...
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="border-t border-border/60 bg-white p-4 lg:p-6 shadow-[0_-4px_24px_rgba(0,0,0,0.02)] z-10">
                                <div className="flex gap-3 max-w-4xl mx-auto relative group">
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={`Message ${activeThread.agentName}...`}
                                        rows={1}
                                        className="flex-1 resize-none py-3.5 pl-5 pr-14 text-[14px] font-medium leading-relaxed bg-white border border-border/60 rounded-2xl shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 placeholder:text-muted-foreground/70"
                                    />
                                    <Button
                                        onClick={handleSend}
                                        disabled={!input.trim() || isLoading}
                                        size="icon"
                                        className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                                    >
                                        <Send className="h-4.5 w-4.5" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-white">
                            <div className="text-center">
                                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-accent mb-6 mx-auto">
                                    <MessageSquare className="h-10 w-10 text-muted-foreground/60" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight text-foreground">
                                    No conversation selected
                                </h3>
                                <p className="text-[14px] font-medium text-muted-foreground mt-2">
                                    Select a conversation from the sidebar or start a new one
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
