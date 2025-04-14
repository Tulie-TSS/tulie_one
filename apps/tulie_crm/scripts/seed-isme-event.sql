-- Seed: ISME Career Fair 2026
-- Chạy trên Supabase Dashboard > SQL Editor hoặc via migration

-- Step 1: Thêm cột mới (nếu chưa có)
ALTER TABLE public.event_sales
ADD COLUMN IF NOT EXISTS combo_rules JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS brand_name TEXT,
ADD COLUMN IF NOT EXISTS deadline_time TIMESTAMPTZ;

-- Step 2: Insert event
INSERT INTO public.event_sales (
    name, code, subdomains, is_active,
    banner_text, hero_title, hero_subtitle,
    brand_name, logo_url, deadline_time,
    services, combo_rules, referral_rules
) VALUES (
    'ISME Career Fair 2026',
    'ISME2026',
    ARRAY['isme.tulie.studio', 'localhost'],
    true,
    'Ưu đãi độc quyền ISME Career Fair — Thanh toán giữ chỗ ngay hôm nay!',
    E'Chuẩn bị hồ sơ xin việc\nchuyên nghiệp cùng Tulie',
    'Ảnh thẻ chuẩn Hàn Quốc & Website CV cá nhân — ưu đãi độc quyền tại ISME Career Fair 2026.',
    E'ISME\nCareer Fair 2026',
    NULL,
    NULL,
    '[
        {
            "id": "photo_id_1",
            "name": "Ảnh thẻ",
            "group": "photo_id",
            "originalPrice": 199000,
            "salePrice": 139000,
            "savingText": "Tiết kiệm 60k",
            "tagLabel": "Phổ biến",
            "tagStyle": "tagHot",
            "description": "1 ảnh sửa trang phục gốc + 1 kiểu ghép trang phục",
            "addonPrice": 50000,
            "addonLabel": "+50.000đ/kiểu nếu lấy thêm option trang phục",
            "maxAddon": 5,
            "maxSelect": 1,
            "features": [
                "1 ảnh chỉnh sửa trang phục gốc",
                "1 ảnh ghép kiểu trang phục",
                "File gốc chất lượng cao",
                "Giao trong 24h"
            ]
        },
        {
            "id": "profile_3",
            "name": "Profile 3 ảnh",
            "group": "photo_profile",
            "originalPrice": 599000,
            "salePrice": 399000,
            "savingText": "Tiết kiệm 200k",
            "tagLabel": "Phổ biến",
            "tagStyle": "tagHot",
            "description": "3 ảnh 3 góc sửa trang phục gốc + 3 ảnh ghép cùng 1 kiểu trang phục",
            "addonPrice": 50000,
            "addonLabel": "+50.000đ/kiểu nếu lấy thêm option trang phục khác",
            "maxAddon": 5,
            "maxSelect": 1,
            "features": [
                "3 ảnh 3 góc chỉnh sửa trang phục gốc",
                "3 ảnh ghép cùng 1 kiểu trang phục",
                "File gốc chất lượng cao"
            ]
        },
        {
            "id": "profile_5",
            "name": "Profile 5 ảnh",
            "group": "photo_profile",
            "originalPrice": 999000,
            "salePrice": 679000,
            "savingText": "Tiết kiệm 320k",
            "tagLabel": "Best value",
            "tagStyle": "tagBest",
            "description": "5 ảnh 5 góc sửa trang phục gốc + 5 ảnh ghép cùng 1 kiểu trang phục",
            "addonPrice": 50000,
            "addonLabel": "+50.000đ/kiểu nếu lấy thêm option trang phục khác",
            "maxAddon": 5,
            "maxSelect": 1,
            "features": [
                "5 ảnh 5 góc chỉnh sửa trang phục gốc",
                "5 ảnh ghép cùng 1 kiểu trang phục",
                "File gốc chất lượng cao"
            ]
        },
        {
            "id": "profile_7",
            "name": "Profile 7 ảnh",
            "group": "photo_profile",
            "originalPrice": 1399000,
            "salePrice": 999000,
            "savingText": "Tiết kiệm 400k",
            "description": "7 ảnh 7 góc sửa trang phục gốc + 7 ảnh ghép cùng 2 kiểu trang phục",
            "addonPrice": 50000,
            "addonLabel": "+50.000đ/kiểu nếu lấy thêm option trang phục khác",
            "maxAddon": 5,
            "maxSelect": 1,
            "features": [
                "7 ảnh 7 góc chỉnh sửa trang phục gốc",
                "7 ảnh ghép cùng 2 kiểu trang phục",
                "File gốc chất lượng cao"
            ]
        },
        {
            "id": "web_cv",
            "name": "Website CV",
            "group": "website",
            "originalPrice": 1499000,
            "salePrice": 499000,
            "savingText": "Tiết kiệm 1.000k",
            "tagLabel": "Hot deal",
            "tagStyle": "tagHot",
            "description": "Website CV cá nhân chuyên nghiệp",
            "maxSelect": 1,
            "features": [
                "Website CV responsive đẹp mắt",
                "Tên miền cá nhân miễn phí 1 năm",
                "Hosting miễn phí"
            ]
        },
        {
            "id": "web_portfolio",
            "name": "Website ePortfolio",
            "group": "website",
            "originalPrice": 2999000,
            "salePrice": 1499000,
            "savingText": "Tiết kiệm 1.500k",
            "tagLabel": "Premium",
            "tagStyle": "tagBest",
            "description": "ePortfolio đầy đủ + các trang chi tiết dự án đã làm",
            "maxSelect": 1,
            "features": [
                "Tất cả tính năng của Website CV",
                "Trang chi tiết từng dự án",
                "Gallery ảnh/video",
                "Blog cá nhân",
                "Tên miền cá nhân miễn phí 1 năm"
            ]
        }
    ]'::jsonb,
    '[
        {
            "discountPercent": 20,
            "requireGroups": ["photo_id", "website"],
            "label": "Combo Ảnh thẻ + Website -20%"
        },
        {
            "discountPercent": 20,
            "requireGroups": ["photo_profile", "website"],
            "label": "Combo Ảnh Profile + Website -20%"
        }
    ]'::jsonb,
    '{
        "cashbackPercent": 20,
        "codeType": "order_number",
        "description": "Hoàn 20% giá trị đơn hàng cho người giới thiệu khi đơn mới hoàn thành. Mã giới thiệu = mã đơn hàng đã thành công của bạn."
    }'::jsonb
);
