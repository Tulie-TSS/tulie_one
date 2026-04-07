CREATE TABLE public.event_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    subdomains TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    banner_text TEXT,
    hero_title TEXT,
    hero_subtitle TEXT,
    services JSONB NOT NULL DEFAULT '[]',
    referral_rules JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bật RLS
ALTER TABLE public.event_sales ENABLE ROW LEVEL SECURITY;

-- Policy ẩn danh: Chỉ đọc sự kiện public
CREATE POLICY "Public read event_sales"
ON public.event_sales FOR SELECT
USING (is_active = true);

-- Policy nội bộ: Full quyền quản trị cho nhân sự
CREATE POLICY "Staff all operations event_sales"
ON public.event_sales FOR ALL
TO authenticated
USING (true);

-- Cho admin
CREATE POLICY "Admin all operations event_sales"
ON public.event_sales FOR ALL
TO service_role
USING (true);

-- Function auto cập nhật ngày giờ
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.event_sales
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
