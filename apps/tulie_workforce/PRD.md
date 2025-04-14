# Product Requirements Document (PRD)
# Digital Workforce - AI Agent Management Platform

**Version:** 1.0  
**Last Updated:** February 12, 2026  
**Document Owner:** Senior Technical Product Manager & Lead Software Architect  
**Status:** Draft for Implementation

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [Design System & UI Guidelines](#3-design-system--ui-guidelines)
4. [Technology Stack](#4-technology-stack)
5. [System Architecture](#5-system-architecture)
6. [Database Schema](#6-database-schema)
7. [Core Features & Functional Requirements](#7-core-features--functional-requirements)
8. [API Specifications](#8-api-specifications)
9. [Security & Compliance](#9-security--compliance)
10. [Implementation Phases](#10-implementation-phases)
11. [Testing Strategy](#11-testing-strategy)
12. [Performance Requirements](#12-performance-requirements)
13. [Deployment & DevOps](#13-deployment--devops)
14. [Appendix](#14-appendix)

---

## 1. Executive Summary

### 1.1 Project Vision

Digital Workforce is an enterprise-grade web application that enables businesses to deploy, manage, and orchestrate multiple AI agents as virtual employees. The platform transforms how organizations handle routine tasks by creating a digital workforce that learns, adapts, and operates autonomously while maintaining human oversight.

### 1.2 Core Value Proposition

- **Automation at Scale:** Replace repetitive manual processes with intelligent AI agents
- **Contextual Intelligence:** Agents learn from company-specific knowledge through RAG (Retrieval-Augmented Generation)
- **Multi-Channel Access:** Interact via web dashboard or Telegram for mobile-first workflows
- **Agent Collaboration:** Multiple specialized agents work together to solve complex tasks
- **Continuous Learning:** Memory system enables agents to improve over time

### 1.3 Success Metrics

- **Task Completion Rate:** >90% of assigned tasks completed without human intervention
- **Response Time:** <3 seconds for agent responses
- **User Satisfaction:** NPS score >50
- **System Uptime:** 99.9% availability
- **Cost Efficiency:** 60% reduction in operational overhead for automated tasks

---

## 2. Project Overview

### 2.1 Product Concept

Digital Workforce is a platform where users can:

1. **Create specialized AI agents** (Developer, Marketing Manager, Admin Assistant, etc.)
2. **Assign tasks** through web interface or Telegram
3. **Monitor execution** in real-time with full transparency
4. **Build knowledge bases** by uploading company documents
5. **Review history** and agent performance analytics

### 2.2 Target Audience

- **Primary:** Small to medium businesses (10-100 employees)
- **Secondary:** Freelancers and solopreneurs seeking automation
- **Tertiary:** Enterprise teams for departmental automation

### 2.3 Key Differentiators

1. **Context-Aware Agents:** Deep integration with company knowledge via RAG
2. **Multi-Agent Orchestration:** Agents can delegate tasks to each other
3. **Telegram-First Mobile Experience:** Natural conversation interface
4. **Transparent Reasoning:** Users can see agent thought process
5. **Zero-Code Configuration:** Non-technical users can create and customize agents

---

## 3. Design System & UI Guidelines

### 3.1 Visual Identity

**Design Philosophy:** Minimalist, Modern, Professional  
**Approach:** Content-first, distraction-free, enterprise-grade aesthetics

### 3.2 Color System (STRICT ENFORCEMENT)

**Palette Type:** Monochrome only

```typescript
// tailwind.config.ts
colors: {
  // Primary scale - Zinc
  background: 'hsl(0 0% 100%)',        // #FFFFFF
  foreground: 'hsl(240 10% 3.9%)',     // Near black
  
  // Zinc scale for all UI elements
  zinc: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
  
  // Semantic colors (minimal use)
  success: 'hsl(142 76% 36%)',   // Green - only for success states
  error: 'hsl(0 84% 60%)',       // Red - only for errors
  warning: 'hsl(38 92% 50%)',    // Amber - only for warnings
}
```

**Color Usage Rules:**
- ✅ Use zinc/slate for 95% of UI elements
- ✅ Use semantic colors (success/error/warning) sparingly
- ❌ NO brand colors (blue, purple, teal, etc.)
- ❌ NO gradients or color overlays
- ❌ NO colored backgrounds except white/zinc

### 3.3 Typography System

**Font Family:** Inter (Google Fonts)

```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

**Font Weight Rules (STRICT):**
- `400` - Regular (body text)
- `500` - Medium (labels, captions)
- `600` - Semibold (subheadings)
- `700` - Bold (headings, emphasis)
- ❌ **NEVER use 800 or 900**

**Text Transform Rules (STRICT):**
- ✅ Normal case for ALL text elements
- ❌ NO `text-transform: uppercase`
- ❌ NO `text-transform: capitalize` on headings/buttons

**Letter Spacing Rules (STRICT):**
- ✅ Use `tracking-normal` (0em) for all text
- ❌ NO `tracking-tight`, `tracking-wide`, or custom letter-spacing

**Type Scale:**
```css
.text-xs      /* 12px - Captions, labels */
.text-sm      /* 14px - Body small, secondary text */
.text-base    /* 16px - Body text (default) */
.text-lg      /* 18px - Large body */
.text-xl      /* 20px - H4 */
.text-2xl     /* 24px - H3 */
.text-3xl     /* 30px - H2 */
.text-4xl     /* 36px - H1 */
```

### 3.4 Component Library

**Base Framework:** Shadcn UI (https://ui.shadcn.com)

**Component Style Modifications:**
```typescript
// All Shadcn components must be customized to follow these rules:
{
  borderRadius: 'rounded-md',      // 6px - consistent across all components
  shadows: 'shadow-sm',            // Minimal shadows only
  borders: 'border-zinc-200',      // Subtle borders
  hover: 'hover:bg-zinc-50',       // Subtle state changes
}
```

**Icon System:** Lucide React only
```typescript
import { Icon } from 'lucide-react';
// Standard icon size: 20px (w-5 h-5)
// Large icons: 24px (w-6 h-6)
// Color: text-zinc-600 (default), text-zinc-900 (active)
```

### 3.5 Layout Principles

**Spacing System:** Tailwind's default scale (4px base)
- Small gaps: `gap-2` (8px)
- Medium gaps: `gap-4` (16px)
- Large gaps: `gap-6` (24px)
- Section padding: `p-8` (32px)

**Container Widths:**
- Maximum width: `max-w-7xl` (1280px)
- Content width: `max-w-4xl` (896px)
- Form width: `max-w-md` (448px)

**Grid System:**
```tsx
// Dashboard layout
<div className="grid grid-cols-12 gap-6">
  <aside className="col-span-2" /> {/* Sidebar */}
  <main className="col-span-10" />  {/* Content */}
</div>
```

### 3.6 Component Examples

**Button Variants:**
```tsx
// Primary button
<Button className="bg-zinc-900 text-white hover:bg-zinc-800">
  Create agent
</Button>

// Secondary button
<Button variant="outline" className="border-zinc-300 text-zinc-900">
  Cancel
</Button>

// Ghost button
<Button variant="ghost" className="text-zinc-600 hover:text-zinc-900">
  Learn more
</Button>
```

**Card Component:**
```tsx
<Card className="border-zinc-200 shadow-sm">
  <CardHeader className="border-b border-zinc-100">
    <CardTitle className="text-xl font-semibold text-zinc-900">
      Agent configuration
    </CardTitle>
  </CardHeader>
  <CardContent className="p-6">
    {/* Content */}
  </CardContent>
</Card>
```

**Input Fields:**
```tsx
<Input 
  className="border-zinc-300 focus:border-zinc-400 focus:ring-zinc-400"
  placeholder="Enter task description"
/>
```

---

## 4. Technology Stack

### 4.1 Frontend Stack

**Framework & Language:**
- Next.js 15.x (App Router)
- React 18.x
- TypeScript 5.x (strict mode enabled)

**Styling:**
- Tailwind CSS 3.x
- Shadcn UI components
- Lucide React icons

**State Management:**
- React Context API (for global state)
- React Query / TanStack Query (for server state)
- Zustand (for complex client state if needed)

**Form Handling:**
- React Hook Form
- Zod (schema validation)

**Date/Time:**
- date-fns (lightweight alternative to moment.js)

### 4.2 Backend Stack

**Database & Auth:**
- Supabase (PostgreSQL 15+)
- Supabase Auth (JWT-based authentication)
- Row Level Security (RLS) enabled on all tables

**Vector Database:**
- pgvector extension on Supabase
- Embedding dimensions: 1536 (OpenAI ada-002)

**Edge Functions:**
- Supabase Edge Functions (Deno runtime)
- For webhook processing and background jobs

### 4.3 AI/ML Stack

**LLM Provider:**
- OpenAI API
  - GPT-4o (primary model)
  - GPT-4o-mini (for lightweight tasks)
  - text-embedding-ada-002 (for embeddings)

**Agent Orchestration:**
- LangGraph (TypeScript version)
- LangChain.js (utilities only)

**Vector Search:**
- pgvector with cosine similarity
- Hybrid search (vector + full-text)

### 4.4 Integration Layer

**Messaging:**
- Telegram Bot API (Webhook mode)
- Telegram Bot SDK (@telegraf/telegraf)

**File Processing:**
- pdf-parse (PDF extraction)
- mammoth (DOCX extraction)
- xlsx (Excel processing)

### 4.5 Infrastructure

**Hosting:**
- Vercel (Next.js deployment)
- Serverless functions on Vercel Edge Network

**CDN & Storage:**
- Supabase Storage (for documents)
- Vercel Edge Network (static assets)

**Monitoring:**
- Vercel Analytics
- Sentry (error tracking)
- OpenTelemetry (traces)

**CI/CD:**
- GitHub Actions
- Vercel Git integration

### 4.6 Development Tools

**Code Quality:**
- ESLint (with TypeScript rules)
- Prettier
- Husky (git hooks)
- lint-staged

**Type Safety:**
- TypeScript strict mode
- Zod runtime validation
- Supabase generated types

**Testing:**
- Vitest (unit tests)
- Playwright (e2e tests)
- React Testing Library

---

## 5. System Architecture

### 5.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACES                       │
├──────────────────────┬──────────────────────────────────────┤
│   Web Dashboard      │      Telegram Bot                    │
│   (Next.js)          │      (Webhook)                       │
└──────────┬───────────┴────────────┬─────────────────────────┘
           │                        │
           └────────────┬───────────┘
                        ▼
           ┌────────────────────────┐
           │   API Routes Layer     │
           │   (Next.js API)        │
           └────────┬───────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   ┌────────┐  ┌────────┐  ┌─────────┐
   │  Auth  │  │ Agent  │  │   RAG   │
   │ Service│  │Orchestr│  │ Service │
   └───┬────┘  └───┬────┘  └────┬────┘
       │           │             │
       └───────────┼─────────────┘
                   ▼
        ┌──────────────────────┐
        │   Supabase Backend   │
        ├──────────────────────┤
        │  PostgreSQL + RLS    │
        │  pgvector            │
        │  Storage             │
        │  Auth                │
        └──────────┬───────────┘
                   │
                   ▼
            ┌──────────────┐
            │  OpenAI API  │
            └──────────────┘
```

### 5.2 Directory Structure

```
digital-workforce/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth routes
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/              # Protected routes
│   │   │   ├── agents/               # Agent management
│   │   │   ├── knowledge/            # Knowledge base
│   │   │   ├── tasks/                # Task management
│   │   │   └── settings/             # User settings
│   │   ├── api/                      # API routes
│   │   │   ├── agents/
│   │   │   ├── chat/
│   │   │   ├── documents/
│   │   │   ├── telegram/             # Webhook endpoint
│   │   │   └── embeddings/
│   │   └── layout.tsx
│   │
│   ├── components/                   # Shared components
│   │   ├── ui/                       # Shadcn components
│   │   ├── agents/                   # Agent-specific components
│   │   ├── chat/                     # Chat components
│   │   └── layouts/                  # Layout components
│   │
│   ├── features/                     # Feature modules
│   │   ├── auth/
│   │   │   ├── hooks/
│   │   │   ├── components/
│   │   │   └── utils/
│   │   ├── agents/
│   │   │   ├── hooks/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── chat/
│   │   ├── knowledge/
│   │   └── telegram/
│   │
│   ├── lib/                          # Shared libraries
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── types.ts
│   │   ├── openai/
│   │   │   ├── client.ts
│   │   │   └── embeddings.ts
│   │   ├── langgraph/
│   │   │   ├── graph.ts
│   │   │   └── nodes.ts
│   │   └── utils/
│   │
│   ├── types/                        # Global types
│   │   ├── database.ts
│   │   ├── agents.ts
│   │   └── api.ts
│   │
│   └── styles/
│       └── globals.css
│
├── supabase/                         # Supabase configuration
│   ├── migrations/                   # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_enable_pgvector.sql
│   │   └── 003_rls_policies.sql
│   └── seed.sql                      # Seed data
│
├── public/                           # Static assets
├── tests/                            # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.local.example
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 5.3 Code Organization Principles

**1. Feature-Based Structure:**
Each feature is self-contained with its own components, hooks, services, and types.

**2. Separation of Concerns:**
- `components/`: Presentational components only
- `features/`: Business logic and feature-specific components
- `lib/`: External service integrations
- `app/api/`: API route handlers

**3. File Size Limits:**
- Max 200 lines per file (preferred)
- Max 300 lines (hard limit)
- Extract to smaller modules if exceeded

**4. Naming Conventions:**
```typescript
// Files
component-name.tsx
use-custom-hook.ts
api-service.ts

// Components
export const ComponentName = () => { }

// Hooks
export const useCustomHook = () => { }

// Services
export const apiService = { }

// Types
export type UserProfile = { }
export interface AgentConfig { }
```

### 5.4 Data Flow Architecture

**Request Flow:**
```
User Action
  ↓
Next.js Route/API
  ↓
Feature Service Layer
  ↓
Supabase Client
  ↓
PostgreSQL (with RLS)
  ↓
Response
```

**Agent Execution Flow:**
```
User Task Input
  ↓
Task Parser
  ↓
Agent Selector (LangGraph)
  ↓
┌─────────────────┐
│ Agent Reasoning │
│ (GPT-4o)        │
└────────┬────────┘
         ├─→ RAG Search (pgvector)
         ├─→ Tool Execution
         └─→ Memory Update
  ↓
Response Generation
  ↓
Store in threads/messages
  ↓
Return to User
```

---

## 6. Database Schema

### 6.1 Schema Overview

**Database:** PostgreSQL 15+ on Supabase  
**Extensions Required:**
- `uuid-ossp` - UUID generation
- `pgvector` - Vector similarity search
- `pg_trgm` - Full-text search

### 6.2 Core Tables

#### 6.2.1 profiles

Extended user profile information beyond Supabase Auth.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  telegram_user_id BIGINT UNIQUE,
  telegram_username TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### 6.2.2 agents

AI agent configurations and metadata.

```sql
CREATE TYPE agent_role AS ENUM (
  'developer',
  'marketing',
  'admin',
  'sales',
  'support',
  'analyst',
  'custom'
);

CREATE TYPE agent_status AS ENUM (
  'active',
  'inactive',
  'training'
);

CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role agent_role NOT NULL,
  description TEXT,
  avatar_url TEXT,
  
  -- AI Configuration
  system_prompt TEXT NOT NULL,
  model TEXT DEFAULT 'gpt-4o',
  temperature DECIMAL(2,1) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,
  
  -- Capabilities
  tools JSONB DEFAULT '[]',
  knowledge_base_ids UUID[] DEFAULT '{}',
  
  -- Metadata
  status agent_status DEFAULT 'active',
  total_tasks INTEGER DEFAULT 0,
  successful_tasks INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_role ON agents(role);

-- RLS Policies
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own agents"
  ON agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own agents"
  ON agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agents"
  ON agents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own agents"
  ON agents FOR DELETE
  USING (auth.uid() = user_id);
```

#### 6.2.3 threads

Conversation threads between users and agents.

```sql
CREATE TYPE thread_source AS ENUM ('web', 'telegram');
CREATE TYPE thread_status AS ENUM ('active', 'completed', 'archived');

CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  
  title TEXT,
  source thread_source NOT NULL,
  status thread_status DEFAULT 'active',
  
  -- Telegram specific
  telegram_chat_id BIGINT,
  
  -- Metadata
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_threads_user_id ON threads(user_id);
CREATE INDEX idx_threads_agent_id ON threads(agent_id);
CREATE INDEX idx_threads_telegram_chat_id ON threads(telegram_chat_id);
CREATE INDEX idx_threads_last_message ON threads(last_message_at DESC);

-- RLS Policies
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own threads"
  ON threads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own threads"
  ON threads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own threads"
  ON threads FOR UPDATE
  USING (auth.uid() = user_id);
```

#### 6.2.4 messages

Individual messages within threads.

```sql
CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  
  role message_role NOT NULL,
  content TEXT NOT NULL,
  
  -- Agent reasoning (if role = assistant)
  reasoning TEXT,
  tool_calls JSONB,
  
  -- Telegram specific
  telegram_message_id INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- RLS Policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from own threads"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM threads
      WHERE threads.id = messages.thread_id
      AND threads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own threads"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM threads
      WHERE threads.id = messages.thread_id
      AND threads.user_id = auth.uid()
    )
  );
```

#### 6.2.5 documents

Knowledge base documents for RAG.

```sql
CREATE TYPE document_type AS ENUM (
  'pdf',
  'docx',
  'txt',
  'markdown',
  'url'
);

CREATE TYPE document_status AS ENUM (
  'processing',
  'ready',
  'failed'
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  type document_type NOT NULL,
  file_url TEXT,
  original_filename TEXT,
  file_size INTEGER,
  
  -- Content
  content TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Processing
  status document_status DEFAULT 'processing',
  error_message TEXT,
  chunk_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);

-- RLS Policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);
```

#### 6.2.6 document_embeddings

Vector embeddings for semantic search.

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  
  -- Metadata for hybrid search
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for vector search
CREATE INDEX idx_embeddings_document_id ON document_embeddings(document_id);
CREATE INDEX idx_embeddings_user_id ON document_embeddings(user_id);
CREATE INDEX idx_embeddings_vector ON document_embeddings 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- RLS Policies
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own embeddings"
  ON document_embeddings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create embeddings"
  ON document_embeddings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own embeddings"
  ON document_embeddings FOR DELETE
  USING (auth.uid() = user_id);
```

#### 6.2.7 agent_memory

Long-term memory for agents to remember context.

```sql
CREATE TABLE agent_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  memory_type TEXT NOT NULL, -- 'fact', 'preference', 'instruction'
  content TEXT NOT NULL,
  embedding vector(1536),
  
  importance DECIMAL(2,1) DEFAULT 0.5,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  access_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_memory_agent_id ON agent_memory(agent_id);
CREATE INDEX idx_memory_vector ON agent_memory 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- RLS Policies
ALTER TABLE agent_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own agent memory"
  ON agent_memory FOR SELECT
  USING (auth.uid() = user_id);
```

#### 6.2.8 tasks

Structured task tracking.

```sql
CREATE TYPE task_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'failed',
  'cancelled'
);

CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  thread_id UUID REFERENCES threads(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'pending',
  
  -- Execution details
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result JSONB,
  error_message TEXT,
  
  -- Metadata
  estimated_duration INTEGER, -- in minutes
  actual_duration INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_agent_id ON tasks(agent_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- RLS Policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);
```

### 6.3 Database Functions

#### 6.3.1 Vector Similarity Search

```sql
CREATE OR REPLACE FUNCTION search_documents(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    de.id,
    de.document_id,
    de.content,
    1 - (de.embedding <=> query_embedding) AS similarity
  FROM document_embeddings de
  WHERE 
    (filter_user_id IS NULL OR de.user_id = filter_user_id)
    AND 1 - (de.embedding <=> query_embedding) > match_threshold
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

#### 6.3.2 Update Thread Statistics

```sql
CREATE OR REPLACE FUNCTION update_thread_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE threads
  SET 
    message_count = message_count + 1,
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.thread_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_thread_stats
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_stats();
```

---

## 7. Core Features & Functional Requirements

### 7.1 User Authentication & Management

#### 7.1.1 Authentication Methods

**Email/Password:**
- User can sign up with email and password
- Email verification required before access
- Password reset via email link
- Minimum password requirements: 8 characters, 1 uppercase, 1 number

**OAuth Providers (Future):**
- Google OAuth
- GitHub OAuth

#### 7.1.2 User Profile

**Required Fields:**
- Email (from auth)
- Full name
- Company name (optional)

**Optional Fields:**
- Avatar upload
- Timezone selection
- Telegram connection

**Telegram Integration:**
- User can connect Telegram account via bot
- Verification code flow
- Disconnect option available

### 7.2 Agent Management

#### 7.2.1 Create Agent

**User Flow:**
1. Click "Create new agent"
2. Select role from predefined templates
3. Customize agent configuration
4. Save and activate

**Configuration Options:**
- **Name:** Human-friendly identifier
- **Role:** Developer, Marketing, Admin, Sales, Support, Analyst, or Custom
- **Description:** What this agent does
- **System Prompt:** Custom instructions (optional, defaults provided)
- **Model:** GPT-4o or GPT-4o-mini
- **Temperature:** 0.0 - 1.0 slider
- **Tools:** Select which tools agent can use
  - Web search
  - Document search (RAG)
  - Code execution
  - Email sending
  - Calendar management

**Validation Rules:**
- Name: 1-50 characters
- Description: 0-500 characters
- System prompt: Max 2000 characters
- Temperature: 0.0 - 1.0, step 0.1

#### 7.2.2 Agent Templates

**Predefined Templates:**

```typescript
const AGENT_TEMPLATES = {
  developer: {
    name: 'Development assistant',
    role: 'developer',
    systemPrompt: `You are an expert software developer...`,
    temperature: 0.3,
    tools: ['code_execution', 'web_search', 'document_search']
  },
  marketing: {
    name: 'Marketing manager',
    role: 'marketing',
    systemPrompt: `You are a creative marketing strategist...`,
    temperature: 0.7,
    tools: ['web_search', 'document_search']
  },
  // ... more templates
};
```

#### 7.2.3 Agent List View

**Display:**
- Card grid layout
- Agent avatar/icon
- Name and role
- Status indicator (active/inactive)
- Quick stats: Total tasks, Success rate
- Actions: Edit, Deactivate, Delete

**Sorting Options:**
- Most recently created
- Most active
- Highest success rate
- Alphabetical

**Filtering:**
- By role
- By status
- By creation date

#### 7.2.4 Agent Detail View

**Information Displayed:**
- Full configuration
- Performance metrics:
  - Total tasks assigned
  - Completed tasks
  - Success rate
  - Average response time
- Recent activity timeline
- Knowledge base access

**Actions Available:**
- Edit configuration
- View conversation history
- Assign task
- Deactivate/Activate
- Delete agent

### 7.3 Task Assignment & Execution

#### 7.3.1 Create Task via Web

**User Flow:**
1. Navigate to "Tasks" section
2. Click "Assign new task"
3. Fill task form
4. Submit

**Form Fields:**
- **Task description:** Textarea (required, 10-1000 characters)
- **Assign to agent:** Dropdown (required)
- **Priority:** Low/Medium/High/Urgent
- **Attachments:** Optional file upload
- **Due date:** Optional date picker

**Validation:**
- Task description cannot be empty
- Must select an active agent
- File size limit: 10MB per file, max 5 files

#### 7.3.2 Create Task via Telegram

**User Flow:**
1. User sends message to bot: `/task Write blog post about AI`
2. Bot confirms task receipt
3. Bot asks for agent selection (if multiple agents)
4. Agent processes task
5. Bot sends updates and final result

**Command Structure:**
```
/task <description>
/task to @AgentName <description>
/priority high <description>
```

#### 7.3.3 Task Execution Pipeline

**Stages:**

1. **Task Parsing:**
   - Extract intent and entities
   - Determine urgency
   - Identify required tools

2. **Agent Selection:**
   - If specified: Use designated agent
   - If auto: Match task to best agent based on role/capabilities

3. **Planning (LangGraph):**
   - Agent breaks down task into steps
   - Identifies information needs
   - Plans tool usage

4. **Execution:**
   - Execute steps sequentially
   - Retrieve context from RAG if needed
   - Call tools as required
   - Update progress

5. **Result Generation:**
   - Compile findings
   - Format response
   - Include references/sources

6. **Delivery:**
   - Save to database
   - Notify user via web/Telegram
   - Update task status

**Error Handling:**
- Retry logic: Max 3 retries for transient errors
- Fallback: Route to human if agent fails
- Logging: All errors logged with context

### 7.4 Chat Interface

#### 7.4.1 Web Chat

**Layout:**
```
┌─────────────────────────────────────────┐
│  [Thread Sidebar] │ [Chat Area]         │
│                   │                     │
│  Recent Threads   │  Agent Messages     │
│  - Thread 1       │  User Messages      │
│  - Thread 2       │                     │
│  - Thread 3       │  [Input Box]        │
│                   │  [Send Button]      │
└─────────────────────────────────────────┘
```

**Features:**
- Real-time message updates
- Typing indicator when agent is responding
- Message timestamp
- Agent reasoning toggle (show/hide thinking process)
- Copy message button
- Regenerate response button
- Message reactions (thumbs up/down for feedback)

**Input Box:**
- Auto-resize textarea
- Max height: 200px
- File attachment button
- Send button (or Enter to send, Shift+Enter for newline)
- Character counter (soft limit 2000 chars)

#### 7.4.2 Telegram Chat

**Features:**
- Natural conversation flow
- Inline buttons for quick actions
- Command shortcuts:
  - `/start` - Initialize bot
  - `/agents` - List available agents
  - `/task` - Create new task
  - `/status` - Check task status
  - `/help` - Show commands

**Message Formatting:**
- Use Telegram markdown for formatting
- Code blocks for code snippets
- Bullet points for lists

### 7.5 Knowledge Base (RAG System)

#### 7.5.1 Document Upload

**Supported Formats:**
- PDF
- DOCX
- TXT
- Markdown (.md)
- URLs (webpage scraping)

**Upload Flow:**
1. User drags/drops file or clicks upload
2. File validation (type, size)
3. Upload to Supabase Storage
4. Trigger background processing
5. Show processing status
6. Notify when ready

**Processing Pipeline:**
```
Upload → Extract Text → Chunk Text → Generate Embeddings → Store in DB
```

**Chunking Strategy:**
- Chunk size: 500 tokens
- Overlap: 50 tokens
- Preserve paragraph boundaries
- Maintain metadata (page number, section)

#### 7.5.2 Document Management

**List View:**
- Document title
- Type icon
- Upload date
- Status (processing/ready/failed)
- Chunk count
- Actions: View, Delete

**Detail View:**
- Full document content (read-only)
- Metadata
- Chunk preview
- Associated agents

**Search:**
- Full-text search in document titles
- Filter by type
- Sort by date/name

#### 7.5.3 Semantic Search

**Search Function:**
```typescript
const searchDocuments = async (
  query: string,
  userId: string,
  limit: number = 5
) => {
  // 1. Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);
  
  // 2. Search pgvector
  const { data, error } = await supabase.rpc('search_documents', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: limit,
    filter_user_id: userId
  });
  
  // 3. Return results with scores
  return data;
};
```

**Usage by Agents:**
- Automatic: Agent decides when to search based on task
- Explicit: User can request "search my documents for X"
- Context injection: Top results added to agent prompt

### 7.6 Analytics & Reporting

#### 7.6.1 Dashboard Overview

**Metrics Displayed:**
- Total agents
- Active tasks
- Tasks completed this week
- Average task completion time
- Success rate

**Visualizations:**
- Line chart: Tasks over time
- Bar chart: Tasks by agent
- Pie chart: Task status distribution

#### 7.6.2 Agent Performance

**Per-Agent Metrics:**
- Total tasks assigned
- Completed tasks
- Failed tasks
- Average response time
- Success rate (completed/total)
- User satisfaction (from feedback)

**Time Range Filters:**
- Last 7 days
- Last 30 days
- Last 90 days
- All time

---

## 8. API Specifications

### 8.1 Authentication Endpoints

#### POST /api/auth/signup
```typescript
// Request
{
  email: string;
  password: string;
  fullName: string;
  companyName?: string;
}

// Response (201 Created)
{
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  session: {
    accessToken: string;
    refreshToken: string;
  };
}

// Errors
400 - Invalid email/password
409 - Email already exists
```

#### POST /api/auth/login
```typescript
// Request
{
  email: string;
  password: string;
}

// Response (200 OK)
{
  user: { /* ... */ };
  session: { /* ... */ };
}

// Errors
401 - Invalid credentials
403 - Email not verified
```

### 8.2 Agent Endpoints

#### GET /api/agents
```typescript
// Query Parameters
?status=active|inactive
?role=developer|marketing|...
?limit=10
?offset=0

// Response (200 OK)
{
  agents: Array<{
    id: string;
    name: string;
    role: string;
    status: string;
    totalTasks: number;
    successRate: number;
    createdAt: string;
  }>;
  total: number;
}
```

#### POST /api/agents
```typescript
// Request
{
  name: string;
  role: 'developer' | 'marketing' | ...;
  description?: string;
  systemPrompt?: string;
  model?: 'gpt-4o' | 'gpt-4o-mini';
  temperature?: number;
  tools?: string[];
}

// Response (201 Created)
{
  agent: {
    id: string;
    name: string;
    // ... full agent object
  };
}

// Validation Errors (400)
{
  errors: {
    name?: string[];
    role?: string[];
    // ...
  };
}
```

#### GET /api/agents/:id
```typescript
// Response (200 OK)
{
  agent: {
    id: string;
    name: string;
    role: string;
    description: string;
    systemPrompt: string;
    model: string;
    temperature: number;
    tools: string[];
    status: string;
    stats: {
      totalTasks: number;
      successfulTasks: number;
      successRate: number;
      avgResponseTime: number;
    };
    createdAt: string;
    updatedAt: string;
  };
}

// Errors
404 - Agent not found
```

#### PATCH /api/agents/:id
```typescript
// Request (partial update)
{
  name?: string;
  description?: string;
  systemPrompt?: string;
  temperature?: number;
  status?: 'active' | 'inactive';
}

// Response (200 OK)
{
  agent: { /* updated agent */ };
}
```

#### DELETE /api/agents/:id
```typescript
// Response (204 No Content)

// Errors
404 - Agent not found
409 - Agent has active tasks
```

### 8.3 Chat/Thread Endpoints

#### GET /api/threads
```typescript
// Query Parameters
?status=active|completed|archived
?limit=20
?offset=0

// Response (200 OK)
{
  threads: Array<{
    id: string;
    title: string;
    agentId: string;
    agentName: string;
    source: 'web' | 'telegram';
    status: string;
    messageCount: number;
    lastMessageAt: string;
    createdAt: string;
  }>;
  total: number;
}
```

#### POST /api/threads
```typescript
// Request
{
  agentId: string;
  message: string;
  source?: 'web' | 'telegram';
}

// Response (201 Created)
{
  thread: {
    id: string;
    title: string;
    agentId: string;
  };
  message: {
    id: string;
    role: 'user';
    content: string;
    createdAt: string;
  };
}
```

#### GET /api/threads/:id/messages
```typescript
// Query Parameters
?limit=50
?before=<message_id>  // for pagination

// Response (200 OK)
{
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    reasoning?: string;
    toolCalls?: Array<any>;
    createdAt: string;
  }>;
  hasMore: boolean;
}
```

#### POST /api/threads/:id/messages
```typescript
// Request
{
  content: string;
  attachments?: Array<{
    type: string;
    url: string;
  }>;
}

// Response (201 Created)
{
  userMessage: {
    id: string;
    role: 'user';
    content: string;
    createdAt: string;
  };
  assistantMessage: {
    id: string;
    role: 'assistant';
    content: string;
    reasoning?: string;
    createdAt: string;
  };
}
```

### 8.4 Document Endpoints

#### POST /api/documents/upload
```typescript
// Request (multipart/form-data)
{
  file: File;
  title?: string;
}

// Response (202 Accepted)
{
  document: {
    id: string;
    title: string;
    type: string;
    status: 'processing';
    createdAt: string;
  };
}

// Errors
400 - Invalid file type
413 - File too large
```

#### GET /api/documents
```typescript
// Query Parameters
?status=processing|ready|failed
?type=pdf|docx|txt|markdown
?limit=20
?offset=0

// Response (200 OK)
{
  documents: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    fileSize: number;
    chunkCount: number;
    createdAt: string;
  }>;
  total: number;
}
```

#### GET /api/documents/:id
```typescript
// Response (200 OK)
{
  document: {
    id: string;
    title: string;
    type: string;
    content: string;
    metadata: object;
    status: string;
    chunkCount: number;
    createdAt: string;
  };
}
```

#### DELETE /api/documents/:id
```typescript
// Response (204 No Content)

// Also deletes:
// - File from Supabase Storage
// - All associated embeddings
```

#### POST /api/documents/search
```typescript
// Request
{
  query: string;
  limit?: number;  // default: 5
}

// Response (200 OK)
{
  results: Array<{
    documentId: string;
    documentTitle: string;
    content: string;
    similarity: number;
    metadata: object;
  }>;
}
```

### 8.5 Task Endpoints

#### GET /api/tasks
```typescript
// Query Parameters
?status=pending|in_progress|completed|failed
?priority=low|medium|high|urgent
?agentId=<uuid>
?limit=20
?offset=0

// Response (200 OK)
{
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    agentId: string;
    agentName: string;
    createdAt: string;
    completedAt?: string;
  }>;
  total: number;
}
```

#### POST /api/tasks
```typescript
// Request
{
  title: string;
  description: string;
  agentId: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  attachments?: Array<string>; // URLs
}

// Response (201 Created)
{
  task: {
    id: string;
    title: string;
    status: 'pending';
    // ... full task object
  };
}
```

#### GET /api/tasks/:id
```typescript
// Response (200 OK)
{
  task: {
    id: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    agentId: string;
    threadId?: string;
    startedAt?: string;
    completedAt?: string;
    result?: object;
    errorMessage?: string;
    createdAt: string;
  };
}
```

### 8.6 Telegram Webhook

#### POST /api/telegram/webhook
```typescript
// Request (from Telegram)
{
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: 'private' | 'group';
    };
    text?: string;
    // ... other fields
  };
}

// Response (200 OK)
{
  ok: true;
}

// Internal Processing:
// 1. Verify webhook signature
// 2. Parse message/command
// 3. Identify user (by telegram_user_id)
// 4. Route to appropriate handler
// 5. Generate response via agent
// 6. Send back via Telegram API
```

---

## 9. Security & Compliance

### 9.1 Authentication & Authorization

**JWT Strategy:**
- Supabase Auth handles JWT generation
- Access token expiry: 1 hour
- Refresh token expiry: 30 days
- Tokens stored in httpOnly cookies

**Session Management:**
- Server-side session validation on every request
- Automatic token refresh on client
- Session invalidation on logout
- Concurrent session limit: 5 devices

**Password Security:**
- Bcrypt hashing (handled by Supabase)
- Password requirements enforced client and server-side
- Password reset: Time-limited magic link (1 hour)
- Rate limiting on auth endpoints

### 9.2 Row Level Security (RLS)

**Principle:** Every table must have RLS enabled. Users can only access their own data.

**Implementation Checklist:**
- ✅ Enable RLS on all tables
- ✅ Create SELECT policy for read access
- ✅ Create INSERT policy for write access
- ✅ Create UPDATE policy for modifications
- ✅ Create DELETE policy for removals
- ✅ Test policies with different user contexts

**Policy Pattern:**
```sql
-- Template for all tables
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Read own data
CREATE POLICY "Users can view own data"
  ON table_name FOR SELECT
  USING (auth.uid() = user_id);

-- Insert own data
CREATE POLICY "Users can insert own data"
  ON table_name FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update own data
CREATE POLICY "Users can update own data"
  ON table_name FOR UPDATE
  USING (auth.uid() = user_id);

-- Delete own data
CREATE POLICY "Users can delete own data"
  ON table_name FOR DELETE
  USING (auth.uid() = user_id);
```

### 9.3 Input Validation

**Client-Side (Zod):**
```typescript
import { z } from 'zod';

const createAgentSchema = z.object({
  name: z.string().min(1).max(50),
  role: z.enum(['developer', 'marketing', 'admin', 'sales', 'support', 'analyst', 'custom']),
  description: z.string().max(500).optional(),
  systemPrompt: z.string().max(2000).optional(),
  temperature: z.number().min(0).max(1),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
```

**Server-Side (API Routes):**
```typescript
export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const validatedData = createAgentSchema.parse(body);
    
    // Proceed with validated data
    // ...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { errors: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
};
```

**Validation Rules:**
- All user inputs must be validated
- Use Zod schemas consistently across client/server
- Sanitize inputs before database operations
- Validate file uploads (type, size, content)

### 9.4 XSS Prevention

**Content Sanitization:**
```typescript
import DOMPurify from 'isomorphic-dompurify';

const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre'],
    ALLOWED_ATTR: [],
  });
};
```

**Markdown Rendering:**
```typescript
import ReactMarkdown from 'react-markdown';

const MessageContent = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      components={{
        // Override components to prevent XSS
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
```

### 9.5 API Security

**Rate Limiting:**
```typescript
// Implement rate limiting on all API routes
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
});

export const middleware = async (request: Request) => {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // Continue
};
```

**CORS Configuration:**
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGIN },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

### 9.6 Secrets Management

**Environment Variables:**
```bash
# .env.local
# Never commit this file to git

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# OpenAI
OPENAI_API_KEY=sk-xxx

# Telegram
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_WEBHOOK_SECRET=random_secret_string

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Best Practices:**
- Never hardcode API keys
- Use different keys for dev/staging/production
- Rotate keys regularly
- Use Vercel environment variables for production
- Prefix public variables with NEXT_PUBLIC_

### 9.7 Data Privacy

**GDPR Compliance:**
- User data export: API endpoint to download all user data
- Right to deletion: Complete data removal on request
- Data minimization: Only collect necessary data
- Consent tracking: Log user consent for data processing

**Data Retention:**
- Active users: Data retained indefinitely
- Deleted accounts: Hard delete after 30 days
- Logs: Retained for 90 days
- Backups: Encrypted, 30-day retention

---

## 10. Implementation Phases

### Phase 1: Foundation Setup (Week 1-2)

**Objective:** Establish project structure, authentication, and basic UI

#### Tasks:

1. **Project Initialization**
   - [ ] Create Next.js project with TypeScript
   - [ ] Install dependencies (Tailwind, Shadcn, Supabase)
   - [ ] Configure ESLint and Prettier
   - [ ] Setup Git repository and .gitignore
   - [ ] Configure environment variables

2. **Design System Setup**
   - [ ] Install Inter font from Google Fonts
   - [ ] Configure tailwind.config.ts with zinc color palette
   - [ ] Create globals.css with custom styles
   - [ ] Install and configure Shadcn UI
   - [ ] Create reusable component primitives

3. **Supabase Setup**
   - [ ] Create Supabase project
   - [ ] Configure Supabase client (client.ts and server.ts)
   - [ ] Setup Supabase Auth
   - [ ] Create initial database schema (profiles table)
   - [ ] Enable RLS on profiles

4. **Authentication Pages**
   - [ ] Create /login page
   - [ ] Create /signup page
   - [ ] Implement email/password auth
   - [ ] Add email verification flow
   - [ ] Create password reset page
   - [ ] Setup auth state management

5. **Base Layout**
   - [ ] Create dashboard layout with sidebar
   - [ ] Implement navigation component
   - [ ] Add user menu with logout
   - [ ] Create protected route wrapper
   - [ ] Add loading states

**Deliverables:**
- Working authentication system
- Basic dashboard layout
- Design system components library
- Database with RLS configured

**Testing:**
- User can sign up and receive verification email
- User can log in and access dashboard
- RLS prevents unauthorized access
- Design matches specifications (monochrome, Inter font)

---

### Phase 2: Database & RAG System (Week 3-4)

**Objective:** Build knowledge base infrastructure

#### Tasks:

1. **Database Schema**
   - [ ] Create documents table
   - [ ] Create document_embeddings table
   - [ ] Enable pgvector extension
   - [ ] Create vector similarity search function
   - [ ] Setup RLS policies for documents

2. **Document Upload**
   - [ ] Create document upload UI
   - [ ] Implement file validation (type, size)
   - [ ] Setup Supabase Storage bucket
   - [ ] Create upload API endpoint
   - [ ] Add progress indicator

3. **Text Extraction**
   - [ ] Implement PDF text extraction
   - [ ] Implement DOCX text extraction
   - [ ] Implement TXT/Markdown reading
   - [ ] Create text chunking algorithm
   - [ ] Handle extraction errors

4. **Embedding Generation**
   - [ ] Setup OpenAI client
   - [ ] Create embedding generation function
   - [ ] Implement batch processing
   - [ ] Store embeddings in pgvector
   - [ ] Add retry logic for API failures

5. **Document Management UI**
   - [ ] Create documents list page
   - [ ] Implement document detail view
   - [ ] Add delete functionality
   - [ ] Show processing status
   - [ ] Add search/filter options

6. **Semantic Search**
   - [ ] Implement search function
   - [ ] Create search API endpoint
   - [ ] Test similarity threshold tuning
   - [ ] Add search UI component
   - [ ] Display search results with scores

**Deliverables:**
- Document upload and processing pipeline
- Vector search functionality
- Document management interface

**Testing:**
- Upload PDF, DOCX, TXT files successfully
- Text extraction works correctly
- Embeddings generated and stored
- Semantic search returns relevant results
- Processing status updates in real-time

---

### Phase 3: Agent Core (Week 5-7)

**Objective:** Build AI agent system with LangGraph

#### Tasks:

1. **Database Schema**
   - [ ] Create agents table
   - [ ] Create agent_memory table
   - [ ] Create threads table
   - [ ] Create messages table
   - [ ] Setup RLS policies

2. **Agent Management UI**
   - [ ] Create agent templates
   - [ ] Build agent creation form
   - [ ] Implement agent list view
   - [ ] Create agent detail page
   - [ ] Add edit/delete functionality

3. **LangGraph Setup**
   - [ ] Install LangGraph and dependencies
   - [ ] Define agent state structure
   - [ ] Create graph nodes (plan, execute, respond)
   - [ ] Define conditional edges
   - [ ] Implement graph compilation

4. **Agent Tools**
   - [ ] Document search tool (RAG)
   - [ ] Web search tool (optional)
   - [ ] Calculator tool
   - [ ] Create tool registry
   - [ ] Implement tool calling logic

5. **Chat Interface**
   - [ ] Create chat UI component
   - [ ] Implement message streaming
   - [ ] Add typing indicators
   - [ ] Show agent reasoning toggle
   - [ ] Save messages to database

6. **Agent Memory**
   - [ ] Implement short-term memory (conversation context)
   - [ ] Build long-term memory storage
   - [ ] Create memory retrieval function
   - [ ] Add memory to agent prompts
   - [ ] Test memory persistence

**Deliverables:**
- Agent creation and management system
- Functional chat interface
- Agent reasoning with LangGraph
- Tool integration (RAG search)
- Memory system

**Testing:**
- Create agent with custom configuration
- Agent responds to messages correctly
- RAG integration retrieves relevant documents
- Agent memory persists across conversations
- Reasoning steps are visible to user

---

### Phase 4: Telegram Integration (Week 8-9)

**Objective:** Enable task assignment via Telegram

#### Tasks:

1. **Telegram Bot Setup**
   - [ ] Create Telegram bot via BotFather
   - [ ] Configure bot token
   - [ ] Setup webhook URL
   - [ ] Implement webhook signature verification
   - [ ] Create webhook handler

2. **User Linking**
   - [ ] Create Telegram connection flow
   - [ ] Generate verification codes
   - [ ] Store telegram_user_id in profiles
   - [ ] Add disconnect option
   - [ ] Show connection status in settings

3. **Command Handlers**
   - [ ] Implement /start command
   - [ ] Implement /help command
   - [ ] Implement /agents command
   - [ ] Implement /task command
   - [ ] Implement /status command

4. **Message Processing**
   - [ ] Parse incoming messages
   - [ ] Route to correct agent
   - [ ] Generate responses
   - [ ] Send messages back to Telegram
   - [ ] Handle errors gracefully

5. **Telegram UI Components**
   - [ ] Inline keyboards for agent selection
   - [ ] Status updates with emojis
   - [ ] Formatted responses (Markdown)
   - [ ] File upload support (future)

**Deliverables:**
- Functional Telegram bot
- User account linking
- Command system
- Message routing to agents

**Testing:**
- User can connect Telegram account
- Bot responds to /start and /help
- /agents command lists user's agents
- /task command creates and executes task
- Agent responses sent back to Telegram

---

### Phase 5: Dashboard & Analytics (Week 10-11)

**Objective:** Build comprehensive dashboard with analytics

#### Tasks:

1. **Database Schema**
   - [ ] Create tasks table
   - [ ] Add analytics tracking fields
   - [ ] Create materialized views for stats
   - [ ] Setup scheduled refresh

2. **Overview Dashboard**
   - [ ] Create dashboard page
   - [ ] Build metric cards (total agents, active tasks, etc.)
   - [ ] Implement charts (tasks over time)
   - [ ] Add recent activity feed
   - [ ] Show quick actions

3. **Task Management**
   - [ ] Create tasks list page
   - [ ] Implement task creation form
   - [ ] Add task detail view
   - [ ] Show task status updates
   - [ ] Enable task cancellation

4. **Agent Analytics**
   - [ ] Build agent performance metrics
   - [ ] Create performance charts
   - [ ] Show task distribution
   - [ ] Calculate success rates
   - [ ] Display response time stats

5. **Settings Page**
   - [ ] Profile settings
   - [ ] Account preferences
   - [ ] Telegram connection
   - [ ] API keys management (future)
   - [ ] Delete account option

**Deliverables:**
- Complete dashboard with metrics
- Task management interface
- Agent analytics
- Settings page

**Testing:**
- Dashboard loads quickly (<2s)
- Metrics update in real-time
- Charts render correctly
- Task list shows accurate data
- Settings changes persist

---

### Phase 6: Polish & Launch (Week 12)

**Objective:** Final testing, optimization, and deployment

#### Tasks:

1. **Performance Optimization**
   - [ ] Implement code splitting
   - [ ] Optimize images and assets
   - [ ] Add database indexes
   - [ ] Implement caching strategy
   - [ ] Run Lighthouse audits

2. **Error Handling**
   - [ ] Add global error boundaries
   - [ ] Implement error logging (Sentry)
   - [ ] Create user-friendly error messages
   - [ ] Add retry mechanisms
   - [ ] Test edge cases

3. **Security Audit**
   - [ ] Review all RLS policies
   - [ ] Test authentication flows
   - [ ] Verify input validation
   - [ ] Check for XSS vulnerabilities
   - [ ] Penetration testing

4. **Documentation**
   - [ ] Write user guide
   - [ ] Create API documentation
   - [ ] Document deployment process
   - [ ] Add inline code comments
   - [ ] Create README

5. **Deployment**
   - [ ] Setup production Supabase project
   - [ ] Configure production environment variables
   - [ ] Deploy to Vercel
   - [ ] Setup custom domain
   - [ ] Configure monitoring and alerts

6. **Post-Launch**
   - [ ] Monitor error rates
   - [ ] Track user feedback
   - [ ] Fix critical bugs
   - [ ] Plan next iteration
   - [ ] Celebrate! 🎉

**Deliverables:**
- Production-ready application
- Complete documentation
- Monitoring and alerting setup

**Testing:**
- Full end-to-end testing
- Load testing
- Security testing
- User acceptance testing

---

## 11. Testing Strategy

### 11.1 Unit Testing

**Framework:** Vitest + React Testing Library

**Coverage Goals:**
- Utility functions: 90%
- React components: 80%
- API routes: 85%

**Example Tests:**
```typescript
// features/agents/utils/validate-agent-config.test.ts
import { describe, it, expect } from 'vitest';
import { validateAgentConfig } from './validate-agent-config';

describe('validateAgentConfig', () => {
  it('should validate correct config', () => {
    const config = {
      name: 'Test Agent',
      role: 'developer',
      temperature: 0.7,
    };
    
    expect(validateAgentConfig(config)).toBe(true);
  });
  
  it('should reject invalid temperature', () => {
    const config = {
      name: 'Test Agent',
      role: 'developer',
      temperature: 1.5, // Invalid
    };
    
    expect(() => validateAgentConfig(config)).toThrow();
  });
});
```

### 11.2 Integration Testing

**Framework:** Playwright

**Test Scenarios:**
1. **Authentication Flow**
   - Sign up with email
   - Verify email
   - Log in
   - Log out

2. **Agent Creation Flow**
   - Create agent
   - Edit configuration
   - Deactivate agent
   - Delete agent

3. **Chat Flow**
   - Send message to agent
   - Receive response
   - View conversation history

4. **Document Upload Flow**
   - Upload PDF
   - Wait for processing
   - Search document content

**Example Test:**
```typescript
// tests/e2e/agent-creation.spec.ts
import { test, expect } from '@playwright/test';

test('create and configure agent', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'TestPass123');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('/dashboard');
  await page.click('text=Create new agent');
  
  await page.fill('[name="name"]', 'Dev Assistant');
  await page.selectOption('[name="role"]', 'developer');
  await page.click('button:has-text("Create agent")');
  
  await expect(page.locator('text=Dev Assistant')).toBeVisible();
});
```

### 11.3 Manual Testing Checklist

**Pre-Release Checklist:**
- [ ] Authentication works on all devices
- [ ] All forms validate correctly
- [ ] Error messages are user-friendly
- [ ] Loading states show appropriately
- [ ] Mobile responsive design works
- [ ] Telegram integration functional
- [ ] RAG search returns relevant results
- [ ] Agent responses are coherent
- [ ] No console errors in browser
- [ ] Database queries are optimized

---

## 12. Performance Requirements

### 12.1 Response Time Targets

| Action | Target | Maximum |
|--------|--------|---------|
| Page load (initial) | <1.5s | <3s |
| Page navigation | <500ms | <1s |
| API response | <500ms | <2s |
| Agent response (first token) | <2s | <5s |
| Document search | <1s | <3s |
| File upload (progress visible) | Immediate | 100ms |

### 12.2 Optimization Strategies

**Frontend:**
- Code splitting by route
- Lazy load non-critical components
- Image optimization (next/image)
- Font optimization (next/font)
- Minimize bundle size

**Backend:**
- Database query optimization
- Connection pooling
- Caching strategy (React Query)
- Batch operations where possible
- Use database indexes

**AI/LLM:**
- Stream responses for better UX
- Cache common queries
- Use faster models for simple tasks
- Implement request debouncing

---

## 13. Deployment & DevOps

### 13.1 Deployment Pipeline

```
Git Push
  ↓
GitHub Actions (CI)
  ├─ Lint
  ├─ Type check
  ├─ Run tests
  └─ Build check
  ↓
Vercel (CD)
  ├─ Build Next.js
  ├─ Deploy to preview (PR)
  └─ Deploy to production (main)
```

### 13.2 Environment Setup

**Development:**
- Local PostgreSQL (optional) or Supabase dev project
- Local Next.js dev server
- Environment: `.env.local`

**Staging:**
- Separate Supabase project
- Vercel preview deployment
- Environment: Vercel environment variables

**Production:**
- Production Supabase project
- Vercel production deployment
- Custom domain
- Monitoring and alerts enabled

### 13.3 Monitoring

**Tools:**
- Vercel Analytics (page views, performance)
- Sentry (error tracking)
- Supabase Dashboard (database metrics)
- OpenAI Usage Dashboard (API costs)

**Alerts:**
- Error rate >1%
- Response time >3s average
- Database CPU >80%
- API rate limit warnings

---

## 14. Appendix

### 14.1 Glossary

- **Agent:** An AI entity with specific role and capabilities
- **RAG:** Retrieval-Augmented Generation - technique to ground LLM responses in specific documents
- **RLS:** Row Level Security - PostgreSQL feature to restrict data access
- **Thread:** A conversation between user and agent
- **Embedding:** Vector representation of text for semantic search
- **LangGraph:** Framework for building stateful multi-agent applications

### 14.2 Reference Links

**Documentation:**
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- OpenAI API: https://platform.openai.com/docs
- LangGraph: https://langchain-ai.github.io/langgraphjs
- Shadcn UI: https://ui.shadcn.com
- Tailwind CSS: https://tailwindcss.com/docs

**Design:**
- Inter Font: https://fonts.google.com/specimen/Inter
- Lucide Icons: https://lucide.dev

### 14.3 Code Style Guide

**TypeScript:**
```typescript
// Use arrow functions
const myFunction = () => { };

// Use const/let, never var
const value = 'hello';
let counter = 0;

// Use template literals
const message = `Hello, ${name}`;

// Use optional chaining
const city = user?.profile?.address?.city;

// Use nullish coalescing
const port = process.env.PORT ?? 3000;

// Type everything
const add = (a: number, b: number): number => a + b;
```

**React Components:**
```typescript
// Use arrow functions for components
export const Button = ({ children, ...props }: ButtonProps) => {
  return <button {...props}>{children}</button>;
};

// Use named exports
export const Card = () => { };
export const CardHeader = () => { };

// Destructure props
const ProfileCard = ({ name, email, avatar }: ProfileCardProps) => { };
```

**File Naming:**
- Components: `my-component.tsx`
- Hooks: `use-my-hook.ts`
- Utils: `format-date.ts`
- Types: `agent.types.ts`
- Constants: `constants.ts`

### 14.4 Git Workflow

**Branch Naming:**
```
feature/agent-creation
bugfix/chat-scroll-issue
hotfix/security-patch
```

**Commit Messages:**
```
feat: add agent creation form
fix: resolve chat scroll issue
docs: update README with setup instructions
style: format code with prettier
refactor: extract validation logic
test: add unit tests for agent service
```

**Pull Request Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Screenshots (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
```

---

## Conclusion

This PRD serves as the single source of truth for the Digital Workforce project. All development should strictly adhere to the specifications outlined in this document, particularly:

1. **Design Guidelines:** Monochrome palette, Inter font, no uppercase, max font-weight 700
2. **Security First:** RLS on all tables, input validation, XSS prevention
3. **Code Quality:** TypeScript, modular structure, comprehensive testing
4. **Performance:** Fast response times, optimized queries, efficient rendering

The implementation should be executed in phases, with each phase delivering working, tested features. This iterative approach allows for continuous validation and adjustment while maintaining momentum.

**Next Steps:**
1. Review and approve this PRD
2. Setup development environment
3. Begin Phase 1 implementation
4. Regular progress reviews and iterations

---

**Document Status:** Ready for Implementation  
**Approval Required:** Product Owner, Tech Lead  
**Questions/Feedback:** Contact project lead