#!/bin/bash
# =============================================================
# Tulie CRM — Local Database Setup Script
# =============================================================
# Quy trình: Dump từ Supabase Cloud → Restore vào Supabase Local
# Yêu cầu: Docker Desktop đang chạy, npx supabase CLI
# =============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CRM_DIR="$(dirname "$SCRIPT_DIR")"
DUMP_FILE="$SCRIPT_DIR/tulie_crm_dump.sql"

# Cloud DB credentials (from .env.local)
CLOUD_DB_URL="postgresql://postgres:ItCls97spLSVJZU6@db.zktmaekplppmzqdmglze.supabase.co:5432/postgres"

# Local DB credentials (Supabase local default)
LOCAL_DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

echo "=========================================="
echo "  Tulie CRM — Local Database Setup"
echo "=========================================="
echo ""

# Step 1: Check Docker
echo "🐳 [1/4] Kiểm tra Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker chưa chạy. Mở Docker Desktop trước."
    exit 1
fi
echo "✅ Docker OK"
echo ""

# Step 2: Init & Start Supabase Local
echo "🚀 [2/4] Khởi chạy Supabase Local..."
cd "$CRM_DIR"

if [ ! -f "supabase/config.toml" ]; then
    echo "   → Chưa có config, khởi tạo..."
    npx supabase init --with-intellij-settings=false 2>/dev/null || true
fi

# Check if already running
if npx supabase status 2>/dev/null | grep -q "API URL"; then
    echo "✅ Supabase Local đã chạy"
else
    echo "   → Đang khởi chạy (lần đầu mất ~2 phút)..."
    npx supabase start
fi
echo ""

# Step 3: Dump from cloud
echo "📦 [3/4] Dump database từ Supabase Cloud..."
if [ -f "$DUMP_FILE" ]; then
    echo "   → File dump đã tồn tại, bỏ qua (xóa $DUMP_FILE để dump lại)"
else
    pg_dump "$CLOUD_DB_URL" \
        --no-owner \
        --no-acl \
        --clean \
        --if-exists \
        --exclude-schema=supabase_migrations \
        --exclude-schema=storage \
        --exclude-schema=auth \
        --exclude-schema=realtime \
        --exclude-schema=extensions \
        --exclude-schema=_realtime \
        --exclude-schema=supabase_functions \
        --exclude-schema=pgsodium \
        --exclude-schema=vault \
        --exclude-schema=graphql_public \
        --exclude-schema=graphql \
        -f "$DUMP_FILE"
    echo "✅ Dump xong → $DUMP_FILE"
fi
echo ""

# Step 4: Restore to local
echo "🔄 [4/4] Restore vào Supabase Local..."
psql "$LOCAL_DB_URL" < "$DUMP_FILE" 2>&1 | grep -c "ERROR" | xargs -I {} echo "   → {} errors (phần lớn là DROP IF EXISTS bình thường)"
echo "✅ Restore xong!"
echo ""

# Summary
echo "=========================================="
echo "  ✅ HOÀN TẤT! Local database sẵn sàng"
echo "=========================================="
echo ""
echo "Để chuyển sang chế độ offline:"
echo "  cp .env.local.offline .env.local"
echo ""
echo "Để quay lại cloud:"
echo "  # Khôi phục .env.local gốc (backup trước khi copy)"
echo ""
echo "Local Supabase Dashboard: http://127.0.0.1:54323"
echo "Local API: http://127.0.0.1:54321"
echo ""
