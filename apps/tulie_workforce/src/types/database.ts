export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type AgentRole =
    | "developer"
    | "marketing"
    | "admin"
    | "sales"
    | "support"
    | "analyst"
    | "custom";

export type AgentStatus = "active" | "inactive" | "training";
export type ThreadSource = "web" | "telegram";
export type ThreadStatus = "active" | "completed" | "archived";
export type MessageRole = "user" | "assistant" | "system";
export type DocumentType = "pdf" | "docx" | "txt" | "markdown" | "url";
export type DocumentStatus = "processing" | "ready" | "failed";
export type TaskStatus = "pending" | "in_progress" | "completed" | "failed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type MemoryType = "fact" | "preference" | "sop" | "reflection";
export type OrgRole = "owner" | "manager" | "specialist" | "viewer";
export type ApprovalStatus = "pending_review" | "approved" | "rejected" | "changes_requested";

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string | null;
                    company_name: string | null;
                    avatar_url: string | null;
                    telegram_user_id: number | null;
                    telegram_username: string | null;
                    timezone: string;
                    organization_id: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    full_name?: string | null;
                    company_name?: string | null;
                    avatar_url?: string | null;
                    telegram_user_id?: number | null;
                    telegram_username?: string | null;
                    timezone?: string;
                    organization_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    full_name?: string | null;
                    company_name?: string | null;
                    avatar_url?: string | null;
                    telegram_user_id?: number | null;
                    telegram_username?: string | null;
                    timezone?: string;
                    organization_id?: string | null;
                    updated_at?: string;
                };
            };
            agents: {
                Row: {
                    id: string;
                    user_id: string;
                    organization_id: string | null;
                    name: string;
                    role: AgentRole;
                    description: string | null;
                    avatar_url: string | null;
                    system_prompt: string;
                    model: string;
                    temperature: number;
                    max_tokens: number;
                    tools: Json;
                    knowledge_base_ids: string[];
                    status: AgentStatus;
                    total_tasks: number;
                    successful_tasks: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    organization_id?: string | null;
                    name: string;
                    role: AgentRole;
                    description?: string | null;
                    avatar_url?: string | null;
                    system_prompt: string;
                    model?: string;
                    temperature?: number;
                    max_tokens?: number;
                    tools?: Json;
                    knowledge_base_ids?: string[];
                    status?: AgentStatus;
                    total_tasks?: number;
                    successful_tasks?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    name?: string;
                    organization_id?: string | null;
                    role?: AgentRole;
                    description?: string | null;
                    avatar_url?: string | null;
                    system_prompt?: string;
                    model?: string;
                    temperature?: number;
                    max_tokens?: number;
                    tools?: Json;
                    knowledge_base_ids?: string[];
                    status?: AgentStatus;
                    total_tasks?: number;
                    successful_tasks?: number;
                    updated_at?: string;
                };
            };
            threads: {
                Row: {
                    id: string;
                    user_id: string;
                    agent_id: string | null;
                    title: string | null;
                    source: ThreadSource;
                    status: ThreadStatus;
                    telegram_chat_id: number | null;
                    message_count: number;
                    last_message_at: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    agent_id?: string | null;
                    title?: string | null;
                    source: ThreadSource;
                    status?: ThreadStatus;
                    telegram_chat_id?: number | null;
                    message_count?: number;
                    last_message_at?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    agent_id?: string | null;
                    title?: string | null;
                    status?: ThreadStatus;
                    message_count?: number;
                    last_message_at?: string;
                    updated_at?: string;
                };
            };
            messages: {
                Row: {
                    id: string;
                    thread_id: string;
                    role: MessageRole;
                    content: string;
                    reasoning: string | null;
                    tool_calls: Json | null;
                    telegram_message_id: number | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    thread_id: string;
                    role: MessageRole;
                    content: string;
                    reasoning?: string | null;
                    tool_calls?: Json | null;
                    telegram_message_id?: number | null;
                    created_at?: string;
                };
                Update: {
                    content?: string;
                    reasoning?: string | null;
                    tool_calls?: Json | null;
                };
            };
            documents: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    type: DocumentType;
                    file_url: string | null;
                    original_filename: string | null;
                    file_size: number | null;
                    content: string | null;
                    metadata: Json;
                    status: DocumentStatus;
                    error_message: string | null;
                    chunk_count: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    type: DocumentType;
                    file_url?: string | null;
                    original_filename?: string | null;
                    file_size?: number | null;
                    content?: string | null;
                    metadata?: Json;
                    status?: DocumentStatus;
                    error_message?: string | null;
                    chunk_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    title?: string;
                    content?: string | null;
                    metadata?: Json;
                    status?: DocumentStatus;
                    error_message?: string | null;
                    chunk_count?: number;
                    updated_at?: string;
                };
            };
            tasks: {
                Row: {
                    id: string;
                    user_id: string;
                    agent_id: string | null;
                    thread_id: string | null;
                    organization_id: string | null;
                    title: string;
                    description: string | null;
                    priority: TaskPriority;
                    status: TaskStatus;
                    approver_id: string | null;
                    approval_status: ApprovalStatus | null;
                    feedback_note: string | null;
                    created_by: string | null;
                    started_at: string | null;
                    completed_at: string | null;
                    result: Json | null;
                    error_message: string | null;
                    estimated_duration: number | null;
                    actual_duration: number | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    agent_id?: string | null;
                    thread_id?: string | null;
                    organization_id?: string | null;
                    title: string;
                    description?: string | null;
                    priority?: TaskPriority;
                    status?: TaskStatus;
                    approver_id?: string | null;
                    approval_status?: ApprovalStatus | null;
                    feedback_note?: string | null;
                    created_by?: string | null;
                    started_at?: string | null;
                    completed_at?: string | null;
                    result?: Json | null;
                    error_message?: string | null;
                    estimated_duration?: number | null;
                    actual_duration?: number | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    agent_id?: string | null;
                    thread_id?: string | null;
                    organization_id?: string | null;
                    title?: string;
                    description?: string | null;
                    priority?: TaskPriority;
                    status?: TaskStatus;
                    approver_id?: string | null;
                    approval_status?: ApprovalStatus | null;
                    feedback_note?: string | null;
                    started_at?: string | null;
                    completed_at?: string | null;
                    result?: Json | null;
                    error_message?: string | null;
                    estimated_duration?: number | null;
                    actual_duration?: number | null;
                    updated_at?: string;
                };
            };
            memories: {
                Row: {
                    id: string;
                    user_id: string;
                    agent_id: string | null;
                    organization_id: string | null;
                    type: MemoryType;
                    content: string;
                    embedding: number[] | null;
                    importance: number;
                    access_level: string;
                    metadata: Json;
                    source: string;
                    source_ref: string | null;
                    access_count: number;
                    last_accessed_at: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    agent_id?: string | null;
                    organization_id?: string | null;
                    type: MemoryType;
                    content: string;
                    embedding?: number[] | null;
                    importance?: number;
                    access_level?: string;
                    metadata?: Json;
                    source?: string;
                    source_ref?: string | null;
                    access_count?: number;
                    last_accessed_at?: string;
                    created_at?: string;
                };
                Update: {
                    type?: MemoryType;
                    content?: string;
                    embedding?: number[] | null;
                    importance?: number;
                    access_level?: string;
                    metadata?: Json;
                    source?: string;
                    source_ref?: string | null;
                    access_count?: number;
                    last_accessed_at?: string;
                };
            };
            organizations: {
                Row: {
                    id: string;
                    name: string;
                    slug: string | null;
                    plan: string;
                    settings: Json;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    slug?: string | null;
                    plan?: string;
                    settings?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    name?: string;
                    slug?: string | null;
                    plan?: string;
                    settings?: Json;
                    updated_at?: string;
                };
            };
            organization_members: {
                Row: {
                    id: string;
                    organization_id: string;
                    user_id: string;
                    role: OrgRole;
                    invited_by: string | null;
                    invited_at: string;
                    joined_at: string;
                };
                Insert: {
                    id?: string;
                    organization_id: string;
                    user_id: string;
                    role?: OrgRole;
                    invited_by?: string | null;
                    invited_at?: string;
                    joined_at?: string;
                };
                Update: {
                    role?: OrgRole;
                };
            };
        };
        Functions: {
            search_documents: {
                Args: {
                    query_embedding: number[];
                    match_threshold?: number;
                    match_count?: number;
                    filter_user_id?: string;
                };
                Returns: {
                    id: string;
                    document_id: string;
                    content: string;
                    similarity: number;
                }[];
            };
            match_memories: {
                Args: {
                    query_embedding: string;
                    match_threshold?: number;
                    match_count?: number;
                    filter_user_id?: string | null;
                    filter_agent_id?: string | null;
                    filter_org_id?: string | null;
                    filter_types?: string[] | null;
                    filter_access_level?: string | null;
                };
                Returns: {
                    id: string;
                    user_id: string;
                    agent_id: string | null;
                    type: string;
                    content: string;
                    importance: number;
                    access_level: string;
                    source: string;
                    source_ref: string | null;
                    similarity: number;
                    weighted_score: number;
                }[];
            };
            get_user_org_role: {
                Args: {
                    p_user_id: string;
                };
                Returns: {
                    organization_id: string;
                    organization_name: string;
                    role: string;
                }[];
            };
            touch_memory: {
                Args: {
                    memory_id: string;
                };
                Returns: void;
            };
        };
    };
}
