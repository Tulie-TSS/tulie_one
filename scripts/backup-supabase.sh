#!/bin/bash
# =============================================================================
# SUPABASE DATABASE BACKUP SCRIPT - TULIE_ONE
# =============================================================================
# Purpose: Backup all schemas (public, workforce, workspace) before migration
# Usage: ./scripts/backup-supabase.sh [backup_name]
#
# IMPORTANT: Run this BEFORE any migration changes!
#
# Prerequisites:
#   - Supabase CLI installed: https://supabase.com/docs/guides/cli
#   - OR psql client installed
#   - Logged into Supabase CLI: supabase login
# =============================================================================

set -e

BACKUP_NAME="${1:-tulie_one_backup_$(date +%Y%m%d_%H%M%S)}"
PROJECT_REF="zktmaekplppmzqdmglze"
BACKUP_DIR="./backups"

echo "=========================================="
echo "SUPABASE DATABASE BACKUP"
echo "=========================================="
echo "Backup Name: $BACKUP_NAME"
echo "Project Ref: $PROJECT_REF"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Method 1: Using Supabase CLI (recommended)
backup_with_supabase_cli() {
    echo "[Method 1] Using Supabase CLI..."

    # Check if logged in
    if ! supabase projects list 2>/dev/null | grep -q "$PROJECT_REF"; then
        echo "ERROR: Not logged into Supabase CLI or project not found"
        echo "Run: supabase login"
        return 1
    fi

    echo "Creating backup (this may take a few minutes)..."
    FILE_PATH="$BACKUP_DIR/${BACKUP_NAME}.sql"

    # Export all schemas using pg_dump via Supabase CLI
    supabase db dump \
        --project-ref "$PROJECT_REF" \
        --file "$FILE_PATH" \
        --schema public \
        --schema workforce \
        --schema workspace

    echo "Backup created: $FILE_PATH"
    echo "Size: $(du -h "$FILE_PATH" | cut -f1)"
}

# Method 2: Using pg_dump directly
backup_with_pg_dump() {
    echo "[Method 2] Using pg_dump directly..."

    # Get connection string from env or construct it
    source .env.local 2>/dev/null || true

    if [ -z "$SUPABASE_DB_URL" ]; then
        echo "ERROR: SUPABASE_DB_URL not found in .env.local"
        echo "Please set SUPABASE_DB_URL or use Method 1"
        return 1
    fi

    FILE_PATH="$BACKUP_DIR/${BACKUP_NAME}.sql"

    pg_dump "$SUPABASE_DB_URL" \
        --schema='public' \
        --schema='workforce' \
        --schema='workspace' \
        --format=p \
        --clean \
        --if-exists \
        --verbose \
        --file="$FILE_PATH"

    echo "Backup created: $FILE_PATH"
    echo "Size: $(du -h "$FILE_PATH" | cut -f1)"
}

# Try Method 1 first
if command -v supabase &> /dev/null; then
    backup_with_supabase_cli || backup_with_pg_dump
elif command -v pg_dump &> /dev/null; then
    backup_with_pg_dump
else
    echo "ERROR: Neither supabase CLI nor pg_dump found."
    echo ""
    echo "Please install one of them:"
    echo "  - Supabase CLI: https://supabase.com/docs/guides/cli"
    echo "  - PostgreSQL: brew install postgresql"
    exit 1
fi

echo ""
echo "=========================================="
echo "BACKUP VERIFICATION"
echo "=========================================="
echo ""

# Verify backup file exists and has content
if [ -f "$BACKUP_DIR/${BACKUP_NAME}.sql" ]; then
    FILE_SIZE=$(stat -f%z "$BACKUP_DIR/${BACKUP_NAME}.sql" 2>/dev/null || stat -c%s "$BACKUP_DIR/${BACKUP_NAME}.sql" 2>/dev/null)
    if [ "$FILE_SIZE" -gt 1000 ]; then
        echo "✓ Backup file exists and has content"
        echo "✓ Size: $(du -h "$BACKUP_DIR/${BACKUP_NAME}.sql" | cut -f1)"
        echo ""
        echo "NEXT STEP:"
        echo "1. Copy this backup to cloud storage (AWS S3, Google Drive, etc.)"
        echo "2. Then proceed with migration changes."
    else
        echo "⚠ WARNING: Backup file exists but seems too small ($FILE_SIZE bytes)"
        echo "Please verify backup manually before proceeding."
    fi
else
    echo "⚠ WARNING: Backup file not found!"
    echo "Please ensure you have a valid backup before proceeding."
fi

echo ""
echo "Backup command completed at: $(date)"