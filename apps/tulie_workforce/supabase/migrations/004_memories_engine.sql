-- ============================================
-- 004: Infinite Context Memory Engine
-- Long-term memory with vector similarity search
-- ============================================

-- ============================================
-- ENUM for memory types
-- ============================================

CREATE TYPE memory_type AS ENUM ('fact', 'preference', 'sop', 'reflection');

-- ============================================
-- memories table
-- Stores agent/user knowledge with embeddings
-- ============================================

CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  organization_id UUID,  -- filled in migration 005
  type memory_type NOT NULL DEFAULT 'fact',
  content TEXT NOT NULL,
  embedding vector(1536),
  importance FLOAT DEFAULT 0.5 CHECK (importance >= 0 AND importance <= 1),
  access_level TEXT DEFAULT 'private' CHECK (access_level IN ('public', 'private')),
  metadata JSONB DEFAULT '{}',
  source TEXT DEFAULT 'manual' CHECK (source IN ('task', 'manual', 'document', 'reflection')),
  source_ref TEXT,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_memories_user_id ON memories(user_id);
CREATE INDEX idx_memories_agent_id ON memories(agent_id);
CREATE INDEX idx_memories_type ON memories(type);
CREATE INDEX idx_memories_importance ON memories(importance DESC);
CREATE INDEX idx_memories_vector ON memories
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================
-- match_memories: Vector similarity search RPC
-- Supports filtering by user, agent, org, type
-- Returns results ordered by weighted relevance
-- (similarity * importance), preferences boosted
-- ============================================

CREATE OR REPLACE FUNCTION match_memories(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.65,
  match_count INT DEFAULT 10,
  filter_user_id UUID DEFAULT NULL,
  filter_agent_id UUID DEFAULT NULL,
  filter_org_id UUID DEFAULT NULL,
  filter_types memory_type[] DEFAULT NULL,
  filter_access_level TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  agent_id UUID,
  type memory_type,
  content TEXT,
  importance FLOAT,
  access_level TEXT,
  source TEXT,
  source_ref TEXT,
  similarity FLOAT,
  weighted_score FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.user_id,
    m.agent_id,
    m.type,
    m.content,
    m.importance,
    m.access_level,
    m.source,
    m.source_ref,
    (1 - (m.embedding <=> query_embedding))::FLOAT AS similarity,
    -- Weighted score: base similarity * importance, preferences get 1.5× boost
    (
      (1 - (m.embedding <=> query_embedding)) *
      m.importance *
      CASE WHEN m.type = 'preference' THEN 1.5 ELSE 1.0 END
    )::FLOAT AS weighted_score
  FROM memories m
  WHERE
    m.embedding IS NOT NULL
    AND (filter_user_id IS NULL OR m.user_id = filter_user_id)
    AND (filter_agent_id IS NULL OR m.agent_id = filter_agent_id)
    AND (filter_org_id IS NULL OR m.organization_id = filter_org_id)
    AND (filter_types IS NULL OR m.type = ANY(filter_types))
    AND (filter_access_level IS NULL OR m.access_level = filter_access_level)
    AND (1 - (m.embedding <=> query_embedding)) > match_threshold
  ORDER BY weighted_score DESC
  LIMIT match_count;
END;
$$;

-- ============================================
-- Auto-update access stats on retrieval
-- ============================================

CREATE OR REPLACE FUNCTION touch_memory(memory_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE memories
  SET
    access_count = access_count + 1,
    last_accessed_at = NOW()
  WHERE id = memory_id;
END;
$$;
