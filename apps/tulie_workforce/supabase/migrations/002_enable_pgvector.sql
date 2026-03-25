-- ============================================
-- 002: Enable pgvector & Knowledge Base Tables
-- ============================================

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- ENUMs for documents
-- ============================================

CREATE TYPE document_type AS ENUM ('pdf', 'docx', 'txt', 'markdown', 'url');
CREATE TYPE document_status AS ENUM ('processing', 'ready', 'failed');

-- ============================================
-- documents
-- ============================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type document_type NOT NULL,
  file_url TEXT,
  original_filename TEXT,
  file_size INTEGER,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  status document_status DEFAULT 'processing',
  error_message TEXT,
  chunk_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);

-- ============================================
-- document_embeddings
-- ============================================

CREATE TABLE document_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_embeddings_document_id ON document_embeddings(document_id);
CREATE INDEX idx_embeddings_user_id ON document_embeddings(user_id);
CREATE INDEX idx_embeddings_vector ON document_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================
-- agent_memory
-- ============================================

CREATE TABLE agent_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  importance DECIMAL(2,1) DEFAULT 0.5,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  access_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_memory_agent_id ON agent_memory(agent_id);
CREATE INDEX idx_memory_vector ON agent_memory
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================
-- Vector similarity search function
-- ============================================

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
