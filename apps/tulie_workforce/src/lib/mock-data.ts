// ===== TYPES =====

export type AgentRole = "developer" | "marketing" | "support" | "analyst" | "custom";
export type AgentStatus = "active" | "inactive" | "training";
export type TaskStatus = "pending" | "in_progress" | "completed" | "failed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type DocType = "pdf" | "docx" | "txt" | "markdown";
export type DocStatus = "processing" | "ready" | "failed";

export interface Agent {
    id: string;
    name: string;
    role: AgentRole;
    description: string;
    status: AgentStatus;
    model: string;
    temperature: number;
    systemPrompt: string;
    webhookUrl?: string; // n8n webhook connection
    totalTasks: number;
    successfulTasks: number;
    totalMessages: number;
    tokensIn: number;
    tokensOut: number;
    costUsd: number;
    knowledgeBaseIds: string[];
    lastActiveAt: string;
    createdAt: string;
}

export interface Task {
    id: string;
    agentId: string;
    agentName: string;
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    steps: TaskStep[];
    messages: Message[];
    result?: TaskResult;
    tokensIn: number;
    tokensOut: number;
    costUsd: number;
    startedAt?: string;
    completedAt?: string;
    createdAt: string;
}

export interface TaskStep {
    label: string;
    status: "done" | "current" | "upcoming";
    timestamp?: string;
    detail?: string;
}

export interface TaskResult {
    summary: string;
    artifacts: string[];
    outputText: string;
}

export interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    reasoning?: string;
    timestamp: string;
}

export interface Document {
    id: string;
    title: string;
    type: DocType;
    fileName: string;
    fileSize: number;
    status: DocStatus;
    chunkCount: number;
    createdAt: string;
}

export interface ActivityEvent {
    id: string;
    type: "task_completed" | "task_failed" | "agent_created" | "document_uploaded" | "task_assigned" | "agent_training";
    title: string;
    description: string;
    timestamp: string;
    agentName?: string;
}

export interface TokenUsageDay {
    date: string;
    tokensIn: number;
    tokensOut: number;
    costUsd: number;
}

export interface ApiKeyConfig {
    provider: string;
    label: string;
    keyMasked: string;
    isConfigured: boolean;
    models: string[];
}

// ===== MOCK DATA =====

export const mockAgents: Agent[] = [
    {
        id: "agent-001",
        name: "AI Planner",
        role: "analyst",
        description: "Brainstorms marketing campaigns, analyzes competitors, and creates strategic project timelines.",
        status: "active",
        model: "gpt-4o",
        temperature: 0.3,
        systemPrompt: "You are an AI Marketing Planner at Tulie agency. You create campaign strategies, detailed timelines, and competitive analysis reports. Always follow the 'No-Nonsense' marketing style.",
        webhookUrl: "https://n8n.tulie.vn/webhook/planner",
        totalTasks: 47,
        successfulTasks: 44,
        totalMessages: 312,
        tokensIn: 1_245_800,
        tokensOut: 892_400,
        costUsd: 28.45,
        knowledgeBaseIds: ["doc-001", "doc-002"],
        lastActiveAt: "2026-02-12T11:30:00Z",
        createdAt: "2026-01-15T09:00:00Z",
    },
    {
        id: "agent-002",
        name: "Content Creator",
        role: "marketing",
        description: "Produces SEO-optimized blog posts, catchy email newsletters, and long-form articles.",
        status: "active",
        model: "gpt-4o",
        temperature: 0.7,
        systemPrompt: "You are a Content King. Your job is to produce 100% human-passing content that ranks and converts. Never use italics or uppercase unless it's a brand name.",
        webhookUrl: "https://n8n.tulie.vn/webhook/content",
        totalTasks: 32,
        successfulTasks: 28,
        totalMessages: 198,
        tokensIn: 856_200,
        tokensOut: 1_123_600,
        costUsd: 22.10,
        knowledgeBaseIds: ["doc-003", "doc-004"],
        lastActiveAt: "2026-02-12T10:15:00Z",
        createdAt: "2026-01-20T14:00:00Z",
    },
    {
        id: "agent-003",
        name: "Design Specialist",
        role: "custom",
        description: "Generates visual assets, social media graphics, and ad mockups using Midjourney/DALL-E.",
        status: "active",
        model: "dall-e-3",
        temperature: 1.0,
        systemPrompt: "You translate marketing briefs into visual masterpieces. You generate prompts for image models and describe layouts clearly for human designers.",
        webhookUrl: "https://n8n.tulie.vn/webhook/design",
        totalTasks: 15,
        successfulTasks: 12,
        totalMessages: 94,
        tokensIn: 324_500,
        tokensOut: 256_800,
        costUsd: 4.85,
        knowledgeBaseIds: ["doc-005", "doc-006"],
        lastActiveAt: "2026-02-11T16:45:00Z",
        createdAt: "2026-02-01T10:00:00Z",
    },
    {
        id: "agent-004",
        name: "Digital Ads Manager",
        role: "support",
        description: "Optimizes Facebook, Google, and LinkedIn ad campaigns. Adjusts budgets and A/B tests copy.",
        status: "inactive",
        model: "gpt-4o",
        temperature: 0.2,
        systemPrompt: "You are the ROI hunter. You watch CPC, CPM, and CPA like a hawk. Your goal is maximum conversion with minimum spend.",
        webhookUrl: "https://n8n.tulie.vn/webhook/ads",
        totalTasks: 8,
        successfulTasks: 7,
        totalMessages: 56,
        tokensIn: 198_300,
        tokensOut: 312_400,
        costUsd: 7.20,
        knowledgeBaseIds: [],
        lastActiveAt: "2026-02-08T09:00:00Z",
        createdAt: "2026-02-05T11:00:00Z",
    },
];

export const mockTasks: Task[] = [
    {
        id: "task-001",
        agentId: "agent-001",
        agentName: "CodeBot",
        title: "Refactor authentication middleware",
        description: "Review and refactor the authentication middleware to support JWT refresh tokens and improve error handling.",
        priority: "high",
        status: "completed",
        steps: [
            { label: "Assigned", status: "done", timestamp: "2026-02-12T08:00:00Z" },
            { label: "Planning", status: "done", timestamp: "2026-02-12T08:01:00Z", detail: "Analyzed current middleware, identified 3 improvement areas" },
            { label: "Review plan", status: "done", timestamp: "2026-02-12T08:02:00Z", detail: "Plan approved by user" },
            { label: "Executing", status: "done", timestamp: "2026-02-12T08:03:00Z", detail: "Refactored 4 files, added refresh token logic" },
            { label: "Completed", status: "done", timestamp: "2026-02-12T08:15:00Z" },
        ],
        messages: [
            { id: "m1", role: "user", content: "Please refactor the authentication middleware to support JWT refresh tokens. The current implementation doesn't handle token expiry gracefully.", timestamp: "2026-02-12T08:00:00Z" },
            { id: "m2", role: "assistant", content: "I've analyzed the current middleware. Here's my plan:\n\n1. **Add refresh token rotation** — Store refresh tokens in httpOnly cookies with 7-day expiry\n2. **Token validation** — Add a middleware layer that checks access token validity and auto-refreshes\n3. **Error handling** — Return proper 401 responses with `token_expired` error codes\n\nShall I proceed?", reasoning: "The current middleware only validates access tokens and returns generic 401. Adding refresh token support requires changes to: middleware.ts, auth/callback route, and the Supabase client configuration.", timestamp: "2026-02-12T08:01:00Z" },
            { id: "m3", role: "user", content: "Looks good, proceed.", timestamp: "2026-02-12T08:02:00Z" },
            { id: "m4", role: "assistant", content: "Done! Here's what I changed:\n\n- **middleware.ts** — Added refresh token check before returning 401\n- **auth/callback/route.ts** — Now sets refresh token cookie on login\n- **lib/supabase/server.ts** — Updated cookie config for refresh tokens\n- **lib/supabase/client.ts** — Added auto-refresh on 401 response\n\nAll changes follow the existing code patterns. The refresh token rotates on each use for security.", timestamp: "2026-02-12T08:15:00Z" },
        ],
        result: {
            summary: "Refactored auth middleware with JWT refresh token support. 4 files modified, 0 breaking changes.",
            artifacts: ["middleware.ts", "auth/callback/route.ts", "lib/supabase/server.ts", "lib/supabase/client.ts"],
            outputText: "Successfully implemented JWT refresh token rotation with automatic token renewal on 401 responses. The refresh token is stored in an httpOnly cookie with 7-day expiry and rotates on each use.",
        },
        tokensIn: 4_200,
        tokensOut: 3_800,
        costUsd: 0.12,
        startedAt: "2026-02-12T08:00:00Z",
        completedAt: "2026-02-12T08:15:00Z",
        createdAt: "2026-02-12T08:00:00Z",
    },
    {
        id: "task-002",
        agentId: "agent-002",
        agentName: "MarketingPro",
        title: "Write Q1 product launch blog post",
        description: "Create a 1500-word blog post announcing the Q1 product features with SEO optimization.",
        priority: "medium",
        status: "completed",
        steps: [
            { label: "Assigned", status: "done", timestamp: "2026-02-11T14:00:00Z" },
            { label: "Planning", status: "done", timestamp: "2026-02-11T14:01:00Z" },
            { label: "Review plan", status: "done", timestamp: "2026-02-11T14:05:00Z" },
            { label: "Executing", status: "done", timestamp: "2026-02-11T14:06:00Z" },
            { label: "Completed", status: "done", timestamp: "2026-02-11T14:25:00Z" },
        ],
        messages: [
            { id: "m5", role: "user", content: "Write a 1500-word blog post for our Q1 product launch. Focus on the new AI agent features, use SEO best practices, and include a CTA.", timestamp: "2026-02-11T14:00:00Z" },
            { id: "m6", role: "assistant", content: "I'll create a comprehensive blog post. Here's my content plan:\n\n**Title:** \"Introducing Digital Workforce 2.0: Your AI Team Just Got Smarter\"\n**Keywords:** AI agents, digital workforce, automation, enterprise AI\n**Structure:** Hook → Problem → Solution → Features → CTA\n\nApprove to proceed?", timestamp: "2026-02-11T14:01:00Z" },
            { id: "m7", role: "user", content: "Approved, go ahead.", timestamp: "2026-02-11T14:05:00Z" },
            { id: "m8", role: "assistant", content: "Blog post completed! 1,523 words with:\n- SEO-optimized title and meta description\n- 3 target keywords naturally integrated\n- Clear H2/H3 structure\n- Stats and metrics included\n- Strong CTA at the end\n\nReady for your review.", timestamp: "2026-02-11T14:25:00Z" },
        ],
        result: {
            summary: "1,523-word SEO-optimized blog post about Q1 product launch.",
            artifacts: ["q1-launch-blogpost.md"],
            outputText: "Blog post: 'Introducing Digital Workforce 2.0: Your AI Team Just Got Smarter' — 1,523 words, Flesch readability score 62, 3 target keywords, meta description included.",
        },
        tokensIn: 2_800,
        tokensOut: 6_200,
        costUsd: 0.18,
        startedAt: "2026-02-11T14:00:00Z",
        completedAt: "2026-02-11T14:25:00Z",
        createdAt: "2026-02-11T14:00:00Z",
    },
    {
        id: "task-003",
        agentId: "agent-001",
        agentName: "CodeBot",
        title: "Add unit tests for payment service",
        description: "Write comprehensive unit tests for the payment processing service covering edge cases.",
        priority: "high",
        status: "in_progress",
        steps: [
            { label: "Assigned", status: "done", timestamp: "2026-02-12T10:00:00Z" },
            { label: "Planning", status: "done", timestamp: "2026-02-12T10:01:00Z" },
            { label: "Review plan", status: "done", timestamp: "2026-02-12T10:05:00Z" },
            { label: "Executing", status: "current", timestamp: "2026-02-12T10:06:00Z", detail: "Writing test cases... 12 of 18 done" },
            { label: "Completed", status: "upcoming" },
        ],
        messages: [
            { id: "m9", role: "user", content: "Write unit tests for the payment service. Cover all edge cases including failed charges, refunds, and webhook handling.", timestamp: "2026-02-12T10:00:00Z" },
            { id: "m10", role: "assistant", content: "I've analyzed the payment service module and identified 18 test cases. Currently writing tests for:\n\n✅ Successful charge (3 tests)\n✅ Failed charge scenarios (4 tests)\n✅ Refund processing (3 tests)\n🔄 Webhook validation (2 of 4 tests done)\n⏳ Idempotency checks (4 tests)\n\nProgress: 12/18 tests completed.", reasoning: "The payment service has 6 main methods. I'm using vitest with mock Stripe responses. Edge cases include: expired cards, insufficient funds, duplicate charges, partial refunds, and webhook signature verification failures.", timestamp: "2026-02-12T10:30:00Z" },
        ],
        tokensIn: 3_100,
        tokensOut: 2_400,
        costUsd: 0.08,
        startedAt: "2026-02-12T10:00:00Z",
        createdAt: "2026-02-12T10:00:00Z",
    },
    {
        id: "task-004",
        agentId: "agent-002",
        agentName: "MarketingPro",
        title: "Analyze competitor social media strategy",
        description: "Research and analyze the top 5 competitors' social media presence and compile a report.",
        priority: "medium",
        status: "pending",
        steps: [
            { label: "Assigned", status: "done", timestamp: "2026-02-12T11:00:00Z" },
            { label: "Planning", status: "current" },
            { label: "Review plan", status: "upcoming" },
            { label: "Executing", status: "upcoming" },
            { label: "Completed", status: "upcoming" },
        ],
        messages: [
            { id: "m11", role: "user", content: "Analyze the social media strategies of our top 5 competitors. Focus on posting frequency, engagement rates, content types, and platform preference.", timestamp: "2026-02-12T11:00:00Z" },
        ],
        tokensIn: 800,
        tokensOut: 0,
        costUsd: 0.01,
        startedAt: "2026-02-12T11:00:00Z",
        createdAt: "2026-02-12T11:00:00Z",
    },
    {
        id: "task-005",
        agentId: "agent-003",
        agentName: "SupportBot",
        title: "Generate FAQ from support tickets",
        description: "Analyze the last 100 support tickets and generate a structured FAQ document.",
        priority: "low",
        status: "completed",
        steps: [
            { label: "Assigned", status: "done", timestamp: "2026-02-10T09:00:00Z" },
            { label: "Planning", status: "done", timestamp: "2026-02-10T09:01:00Z" },
            { label: "Review plan", status: "done", timestamp: "2026-02-10T09:03:00Z" },
            { label: "Executing", status: "done", timestamp: "2026-02-10T09:04:00Z" },
            { label: "Completed", status: "done", timestamp: "2026-02-10T09:30:00Z" },
        ],
        messages: [
            { id: "m12", role: "user", content: "Generate a FAQ document from our support ticket data.", timestamp: "2026-02-10T09:00:00Z" },
            { id: "m13", role: "assistant", content: "FAQ document generated with 24 entries across 5 categories: Billing (6), Account (5), Technical (7), Feature Requests (3), General (3).", timestamp: "2026-02-10T09:30:00Z" },
        ],
        result: {
            summary: "FAQ document with 24 entries across 5 categories.",
            artifacts: ["faq-document.md"],
            outputText: "Generated a comprehensive FAQ with 24 Q&A pairs organized in 5 categories. Top issue: password reset (23% of tickets).",
        },
        tokensIn: 5_600,
        tokensOut: 4_200,
        costUsd: 0.06,
        startedAt: "2026-02-10T09:00:00Z",
        completedAt: "2026-02-10T09:30:00Z",
        createdAt: "2026-02-10T09:00:00Z",
    },
    {
        id: "task-006",
        agentId: "agent-001",
        agentName: "CodeBot",
        title: "Fix memory leak in WebSocket handler",
        description: "Investigate and fix the memory leak reported in production WebSocket connections.",
        priority: "urgent",
        status: "completed",
        steps: [
            { label: "Assigned", status: "done", timestamp: "2026-02-11T08:00:00Z" },
            { label: "Planning", status: "done", timestamp: "2026-02-11T08:01:00Z" },
            { label: "Review plan", status: "done", timestamp: "2026-02-11T08:02:00Z" },
            { label: "Executing", status: "done", timestamp: "2026-02-11T08:03:00Z" },
            { label: "Completed", status: "done", timestamp: "2026-02-11T08:20:00Z" },
        ],
        messages: [],
        result: {
            summary: "Found and fixed memory leak — event listeners not being cleaned up on disconnect.",
            artifacts: ["websocket-handler.ts"],
            outputText: "Root cause: Event listeners were not removed when clients disconnected. Fixed by adding proper cleanup in the 'close' event handler. Memory usage dropped 40% in testing.",
        },
        tokensIn: 3_400,
        tokensOut: 2_800,
        costUsd: 0.09,
        startedAt: "2026-02-11T08:00:00Z",
        completedAt: "2026-02-11T08:20:00Z",
        createdAt: "2026-02-11T08:00:00Z",
    },
    {
        id: "task-007",
        agentId: "agent-004",
        agentName: "DataAnalyst",
        title: "Monthly revenue report — January 2026",
        description: "Generate the monthly revenue breakdown report with trends and projections.",
        priority: "medium",
        status: "failed",
        steps: [
            { label: "Assigned", status: "done", timestamp: "2026-02-09T10:00:00Z" },
            { label: "Planning", status: "done", timestamp: "2026-02-09T10:01:00Z" },
            { label: "Review plan", status: "done", timestamp: "2026-02-09T10:03:00Z" },
            { label: "Executing", status: "done", timestamp: "2026-02-09T10:04:00Z" },
            { label: "Failed", status: "done", timestamp: "2026-02-09T10:10:00Z" },
        ],
        messages: [
            { id: "m14", role: "user", content: "Generate the January 2026 revenue report.", timestamp: "2026-02-09T10:00:00Z" },
            { id: "m15", role: "assistant", content: "Error: Unable to access the revenue database. The connection timed out after 30 seconds. This may be due to a network configuration issue or the database being temporarily unavailable.", timestamp: "2026-02-09T10:10:00Z" },
        ],
        tokensIn: 1_200,
        tokensOut: 600,
        costUsd: 0.02,
        startedAt: "2026-02-09T10:00:00Z",
        completedAt: "2026-02-09T10:10:00Z",
        createdAt: "2026-02-09T10:00:00Z",
    },
    {
        id: "task-008",
        agentId: "agent-002",
        agentName: "MarketingPro",
        title: "Create social media content calendar",
        description: "Plan a 2-week social media content calendar with posts for LinkedIn, Twitter, and Instagram.",
        priority: "low",
        status: "in_progress",
        steps: [
            { label: "Assigned", status: "done", timestamp: "2026-02-12T09:00:00Z" },
            { label: "Planning", status: "done", timestamp: "2026-02-12T09:01:00Z" },
            { label: "Review plan", status: "current", timestamp: "2026-02-12T09:05:00Z", detail: "Waiting for your approval" },
            { label: "Executing", status: "upcoming" },
            { label: "Completed", status: "upcoming" },
        ],
        messages: [
            { id: "m16", role: "user", content: "Create a 2-week social media content calendar.", timestamp: "2026-02-12T09:00:00Z" },
            { id: "m17", role: "assistant", content: "Here's my proposed content plan:\n\n**Week 1:** Product feature highlights (Mon, Wed, Fri)\n**Week 2:** Customer success stories + industry insights\n\n**Platforms:** LinkedIn (professional), Twitter (quick updates), Instagram (visual)\n**Cadence:** 3 posts/week/platform = 18 total posts\n\nApprove to proceed with writing all posts?", reasoning: "Analyzed our brand voice, recent engagement data, and competitor posting patterns. Product content performs 2.3x better on LinkedIn, while visual content drives 4x more engagement on Instagram.", timestamp: "2026-02-12T09:05:00Z" },
        ],
        tokensIn: 1_800,
        tokensOut: 1_200,
        costUsd: 0.04,
        startedAt: "2026-02-12T09:00:00Z",
        createdAt: "2026-02-12T09:00:00Z",
    },
];

export const mockDocuments: Document[] = [
    { id: "doc-001", title: "Engineering Standards v2.1", type: "pdf", fileName: "engineering-standards.pdf", fileSize: 2_450_000, status: "ready", chunkCount: 48, createdAt: "2026-01-15T10:00:00Z" },
    { id: "doc-002", title: "API Design Guidelines", type: "markdown", fileName: "api-guidelines.md", fileSize: 85_000, status: "ready", chunkCount: 12, createdAt: "2026-01-18T14:00:00Z" },
    { id: "doc-003", title: "Brand Voice & Messaging", type: "pdf", fileName: "brand-guidelines.pdf", fileSize: 5_200_000, status: "ready", chunkCount: 72, createdAt: "2026-01-20T09:00:00Z" },
    { id: "doc-004", title: "Q1 Marketing Strategy", type: "docx", fileName: "q1-marketing-strategy.docx", fileSize: 1_800_000, status: "ready", chunkCount: 36, createdAt: "2026-01-22T11:00:00Z" },
    { id: "doc-005", title: "Product FAQ Database", type: "markdown", fileName: "product-faq.md", fileSize: 120_000, status: "ready", chunkCount: 24, createdAt: "2026-02-01T08:00:00Z" },
    { id: "doc-006", title: "Support Playbook 2026", type: "pdf", fileName: "support-playbook.pdf", fileSize: 3_100_000, status: "processing", chunkCount: 0, createdAt: "2026-02-12T10:00:00Z" },
];

export const mockActivity: ActivityEvent[] = [
    { id: "ev-01", type: "task_completed", title: "Task completed", description: "\"Refactor authentication middleware\" completed successfully", timestamp: "2026-02-12T08:15:00Z", agentName: "CodeBot" },
    { id: "ev-02", type: "task_assigned", title: "Task assigned", description: "\"Add unit tests for payment service\" assigned to CodeBot", timestamp: "2026-02-12T10:00:00Z", agentName: "CodeBot" },
    { id: "ev-03", type: "task_assigned", title: "Task assigned", description: "\"Analyze competitor social media\" assigned to MarketingPro", timestamp: "2026-02-12T11:00:00Z", agentName: "MarketingPro" },
    { id: "ev-04", type: "document_uploaded", title: "Document uploaded", description: "\"Support Playbook 2026\" is being processed (62 pages)", timestamp: "2026-02-12T10:00:00Z" },
    { id: "ev-05", type: "task_completed", title: "Task completed", description: "\"Write Q1 product launch blog post\" completed — 1,523 words", timestamp: "2026-02-11T14:25:00Z", agentName: "MarketingPro" },
    { id: "ev-06", type: "task_completed", title: "Task completed", description: "\"Fix memory leak in WebSocket handler\" — memory usage down 40%", timestamp: "2026-02-11T08:20:00Z", agentName: "CodeBot" },
    { id: "ev-07", type: "agent_training", title: "Agent training", description: "SupportBot is training on \"Product FAQ Database\" (24 chunks)", timestamp: "2026-02-11T16:45:00Z", agentName: "SupportBot" },
    { id: "ev-08", type: "task_completed", title: "Task completed", description: "\"Generate FAQ from support tickets\" — 24 FAQ entries created", timestamp: "2026-02-10T09:30:00Z", agentName: "SupportBot" },
    { id: "ev-09", type: "task_failed", title: "Task failed", description: "\"Monthly revenue report\" failed — database connection timeout", timestamp: "2026-02-09T10:10:00Z", agentName: "DataAnalyst" },
    { id: "ev-10", type: "agent_created", title: "Agent created", description: "DataAnalyst agent created with GPT-4o model", timestamp: "2026-02-05T11:00:00Z" },
];

export const mockApiKeys: ApiKeyConfig[] = [
    { provider: "openai", label: "OpenAI", keyMasked: "sk-••••••••••••••••••••abcd", isConfigured: true, models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"] },
    { provider: "anthropic", label: "Anthropic", keyMasked: "", isConfigured: false, models: ["claude-3.5-sonnet", "claude-3-haiku", "claude-3-opus"] },
    { provider: "google", label: "Google AI", keyMasked: "", isConfigured: false, models: ["gemini-2.0-flash", "gemini-2.0-pro"] },
];

export const mockTokenUsage: TokenUsageDay[] = [
    { date: "2026-02-06", tokensIn: 45_200, tokensOut: 38_400, costUsd: 1.12 },
    { date: "2026-02-07", tokensIn: 62_800, tokensOut: 51_200, costUsd: 1.48 },
    { date: "2026-02-08", tokensIn: 38_600, tokensOut: 42_100, costUsd: 1.05 },
    { date: "2026-02-09", tokensIn: 71_400, tokensOut: 58_900, costUsd: 1.72 },
    { date: "2026-02-10", tokensIn: 54_200, tokensOut: 48_600, costUsd: 1.35 },
    { date: "2026-02-11", tokensIn: 89_300, tokensOut: 72_400, costUsd: 2.18 },
    { date: "2026-02-12", tokensIn: 68_500, tokensOut: 55_200, costUsd: 1.65 },
];

// ===== AGENT MEMORY =====

export type MemoryCategory = "fact" | "preference" | "instruction" | "context";

export interface MemoryEntry {
    id: string;
    agentId: string;
    category: MemoryCategory;
    content: string;
    source: "task" | "manual" | "document";
    sourceRef?: string;
    confidence: number;         // 0-1
    accessCount: number;
    createdAt: string;
    lastAccessedAt: string;
}

export const mockMemory: MemoryEntry[] = [
    // CodeBot memories
    { id: "mem-001", agentId: "agent-001", category: "fact", content: "The project uses Next.js 16 with the App Router, TypeScript strict mode, and Supabase for auth and database.", source: "document", sourceRef: "doc-001", confidence: 1.0, accessCount: 47, createdAt: "2026-01-15T10:00:00Z", lastAccessedAt: "2026-02-12T11:30:00Z" },
    { id: "mem-002", agentId: "agent-001", category: "preference", content: "User prefers functional components with hooks. No class components. Always use 'const' arrow functions for components.", source: "task", sourceRef: "task-001", confidence: 0.95, accessCount: 34, createdAt: "2026-01-16T14:00:00Z", lastAccessedAt: "2026-02-12T10:00:00Z" },
    { id: "mem-003", agentId: "agent-001", category: "instruction", content: "Always run 'npm run build' to verify changes compile before marking a task as complete.", source: "manual", confidence: 1.0, accessCount: 42, createdAt: "2026-01-15T09:30:00Z", lastAccessedAt: "2026-02-12T08:15:00Z" },
    { id: "mem-004", agentId: "agent-001", category: "context", content: "Auth middleware was refactored on Feb 12 to support JWT refresh tokens. Refresh tokens stored in httpOnly cookies with 7-day expiry and rotate on use.", source: "task", sourceRef: "task-001", confidence: 1.0, accessCount: 3, createdAt: "2026-02-12T08:15:00Z", lastAccessedAt: "2026-02-12T10:30:00Z" },
    { id: "mem-005", agentId: "agent-001", category: "fact", content: "The payment service uses Stripe API v2023-10-16. Test mode keys start with sk_test_. Webhook signing secret is stored in STRIPE_WEBHOOK_SECRET env var.", source: "task", sourceRef: "task-003", confidence: 0.98, accessCount: 12, createdAt: "2026-02-12T10:05:00Z", lastAccessedAt: "2026-02-12T10:30:00Z" },
    { id: "mem-006", agentId: "agent-001", category: "context", content: "WebSocket handler had a memory leak caused by event listeners not being removed on disconnect. Fixed on Feb 11, memory usage dropped 40%.", source: "task", sourceRef: "task-006", confidence: 1.0, accessCount: 2, createdAt: "2026-02-11T08:20:00Z", lastAccessedAt: "2026-02-12T08:00:00Z" },
    // MarketingPro memories
    { id: "mem-007", agentId: "agent-002", category: "preference", content: "Brand tone is professional yet approachable. Avoid jargon. Use data points to support claims. Target audience: CTOs and engineering managers.", source: "document", sourceRef: "doc-003", confidence: 0.92, accessCount: 28, createdAt: "2026-01-20T10:00:00Z", lastAccessedAt: "2026-02-12T09:05:00Z" },
    { id: "mem-008", agentId: "agent-002", category: "fact", content: "Product posts perform 2.3× better on LinkedIn vs Twitter. Visual/carousel content drives 4× engagement on Instagram.", source: "task", sourceRef: "task-008", confidence: 0.88, accessCount: 8, createdAt: "2026-02-12T09:05:00Z", lastAccessedAt: "2026-02-12T09:05:00Z" },
    { id: "mem-009", agentId: "agent-002", category: "instruction", content: "Every blog post must include: SEO meta description, alt text for images, internal links to at least 2 other posts, and a CTA section.", source: "manual", confidence: 1.0, accessCount: 15, createdAt: "2026-01-22T11:00:00Z", lastAccessedAt: "2026-02-11T14:00:00Z" },
    { id: "mem-010", agentId: "agent-002", category: "context", content: "Q1 launch blog post titled 'Introducing Digital Workforce 2.0' was published Feb 11. 1,523 words, Flesch score 62. Keywords: AI agents, digital workforce, automation.", source: "task", sourceRef: "task-002", confidence: 1.0, accessCount: 4, createdAt: "2026-02-11T14:25:00Z", lastAccessedAt: "2026-02-12T09:00:00Z" },
    // SupportBot memories
    { id: "mem-011", agentId: "agent-003", category: "fact", content: "Top support issue is password reset (23% of all tickets). Second is billing questions (18%). Third is feature requests (12%).", source: "task", sourceRef: "task-005", confidence: 0.95, accessCount: 18, createdAt: "2026-02-10T09:30:00Z", lastAccessedAt: "2026-02-11T16:45:00Z" },
    { id: "mem-012", agentId: "agent-003", category: "instruction", content: "If issue cannot be resolved within 3 exchanges, escalate to human support with a summary including: ticket ID, customer tier, issue category, and attempted resolutions.", source: "manual", confidence: 1.0, accessCount: 22, createdAt: "2026-02-01T10:30:00Z", lastAccessedAt: "2026-02-11T16:00:00Z" },
    { id: "mem-013", agentId: "agent-003", category: "context", content: "FAQ document generated on Feb 10 with 24 entries across 5 categories: Billing (6), Account (5), Technical (7), Feature Requests (3), General (3).", source: "task", sourceRef: "task-005", confidence: 1.0, accessCount: 6, createdAt: "2026-02-10T09:30:00Z", lastAccessedAt: "2026-02-11T16:00:00Z" },
    // DataAnalyst memories
    { id: "mem-014", agentId: "agent-004", category: "fact", content: "Revenue database connection string uses port 5432 and requires SSL. Connection timeout is set to 30s. Database may be unreachable during maintenance windows (Sun 02:00-04:00 UTC).", source: "task", sourceRef: "task-007", confidence: 0.85, accessCount: 5, createdAt: "2026-02-09T10:10:00Z", lastAccessedAt: "2026-02-09T10:10:00Z" },
    { id: "mem-015", agentId: "agent-004", category: "preference", content: "Reports should use markdown tables for data presentation. Include trend arrows (↑↓→) for month-over-month changes. Currency in USD with 2 decimal places.", source: "manual", confidence: 1.0, accessCount: 7, createdAt: "2026-02-05T11:30:00Z", lastAccessedAt: "2026-02-09T10:00:00Z" },
    { id: "mem-016", agentId: "agent-004", category: "context", content: "Jan 2026 revenue report task failed on Feb 9 due to database connection timeout. Root cause not yet resolved — may need VPN or IP whitelist update.", source: "task", sourceRef: "task-007", confidence: 0.90, accessCount: 1, createdAt: "2026-02-09T10:10:00Z", lastAccessedAt: "2026-02-09T10:10:00Z" },
];

export function getAgentMemory(agentId: string): MemoryEntry[] {
    return mockMemory.filter((m) => m.agentId === agentId);
}

// ===== HELPERS =====

export function getAgent(id: string): Agent | undefined {
    return mockAgents.find((a) => a.id === id);
}

export function getTask(id: string): Task | undefined {
    return mockTasks.find((t) => t.id === id);
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatTokens(n: number): string {
    if (n < 1000) return String(n);
    if (n < 1_000_000) return `${(n / 1000).toFixed(1)}K`;
    return `${(n / 1_000_000).toFixed(2)}M`;
}

export function formatCost(usd: number): string {
    return `$${usd.toFixed(2)}`;
}

export function timeAgo(dateStr: string): string {
    const now = new Date("2026-02-12T12:00:00Z");
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
}

export const dashboardStats = {
    totalAgents: mockAgents.length,
    activeAgents: mockAgents.filter((a) => a.status === "active").length,
    totalTasks: mockTasks.length,
    activeTasks: mockTasks.filter((t) => t.status === "in_progress" || t.status === "pending").length,
    completedTasks: mockTasks.filter((t) => t.status === "completed").length,
    totalDocuments: mockDocuments.length,
    successRate: Math.round((mockTasks.filter((t) => t.status === "completed").length / mockTasks.filter((t) => t.status !== "pending" && t.status !== "in_progress").length) * 100),
    totalTokensIn: mockAgents.reduce((sum, a) => sum + a.tokensIn, 0),
    totalTokensOut: mockAgents.reduce((sum, a) => sum + a.tokensOut, 0),
    totalCost: mockAgents.reduce((sum, a) => sum + a.costUsd, 0),
};
