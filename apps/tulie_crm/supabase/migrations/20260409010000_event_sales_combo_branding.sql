-- Thêm các cột mới cho event_sales
-- combo_rules: luật combo discount (VD: giảm 20% khi chọn ảnh + website)
-- logo_url: logo sự kiện
-- brand_name: tên thương hiệu đối tác
-- deadline_time: thời hạn ưu đãi

ALTER TABLE public.event_sales
ADD COLUMN IF NOT EXISTS combo_rules JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS brand_name TEXT,
ADD COLUMN IF NOT EXISTS deadline_time TIMESTAMPTZ;
