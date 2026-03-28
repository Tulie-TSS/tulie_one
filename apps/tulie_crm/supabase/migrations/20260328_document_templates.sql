-- Create document_templates table for storing editable document templates
-- Previously templates were hardcoded in code; this migration moves them to DB
-- for direct editing and duplication support.

CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('contract', 'invoice', 'payment_request', 'quotation', 'order', 'delivery_minutes')),
  content TEXT NOT NULL DEFAULT '',
  variables JSONB NOT NULL DEFAULT '[]',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- No RLS for simplicity (auth handled at API layer)
ALTER TABLE document_templates DISABLE ROW LEVEL SECURITY;

-- Create portal_feedback_items table for customer feedback/to-do in portal
CREATE TABLE IF NOT EXISTS portal_feedback_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  title TEXT NOT NULL,
  content TEXT, -- rich text / HTML content
  attachments JSONB DEFAULT '[]', -- [{url, type, name}]
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending','in_progress','completed','on_hold','cancelled','revision_needed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  created_by_name TEXT,
  created_by_role TEXT DEFAULT 'customer', -- customer | design | content | cskh | staff
  responded_at TIMESTAMPTZ,
  responded_by TEXT,
  response_content TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE portal_feedback_items DISABLE ROW LEVEL SECURITY;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_document_templates_updated_at
  BEFORE UPDATE ON document_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_portal_feedback_updated_at
  BEFORE UPDATE ON portal_feedback_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
