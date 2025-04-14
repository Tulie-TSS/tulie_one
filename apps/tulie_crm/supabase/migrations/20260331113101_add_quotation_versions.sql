-- Khởi tạo các cột mới cho tính năng Quotation Versions
ALTER TABLE "public"."quotations" 
ADD COLUMN "version_name" text,
ADD COLUMN "is_primary" boolean DEFAULT true;

-- Áp dụng giá trị mặc định cho tất cả row hiện tại
UPDATE "public"."quotations" SET "is_primary" = true WHERE "is_primary" IS NULL;
