-- ============================================
-- 003: Row Level Security Policies
-- ============================================

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- agents
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own agents"
  ON agents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own agents"
  ON agents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own agents"
  ON agents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own agents"
  ON agents FOR DELETE USING (auth.uid() = user_id);

-- threads
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own threads"
  ON threads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own threads"
  ON threads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own threads"
  ON threads FOR UPDATE USING (auth.uid() = user_id);

-- messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from own threads"
  ON messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM threads
      WHERE threads.id = messages.thread_id
      AND threads.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create messages in own threads"
  ON messages FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM threads
      WHERE threads.id = messages.thread_id
      AND threads.user_id = auth.uid()
    )
  );

-- documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create documents"
  ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE USING (auth.uid() = user_id);

-- document_embeddings
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own embeddings"
  ON document_embeddings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create embeddings"
  ON document_embeddings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own embeddings"
  ON document_embeddings FOR DELETE USING (auth.uid() = user_id);

-- agent_memory
ALTER TABLE agent_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own agent memory"
  ON agent_memory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create agent memory"
  ON agent_memory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own agent memory"
  ON agent_memory FOR DELETE USING (auth.uid() = user_id);

-- tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tasks"
  ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE USING (auth.uid() = user_id);
