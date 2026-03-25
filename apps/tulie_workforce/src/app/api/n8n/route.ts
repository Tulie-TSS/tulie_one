// ============================================
// n8n Webhook Endpoints
// 
// These API routes are called by n8n workflows:
// 1. GET /api/n8n/overdue    → Get overdue tasks for alerts
// 2. GET /api/n8n/report     → Get daily report data
// 3. POST /api/n8n/fb-sync   → Sync FB Ads metrics from n8n
// 4. POST /api/n8n/fb-alert  → Create FB Ads alert from AI analysis
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createWorkspaceAdminClient } from "@/lib/supabase/admin";

// Simple API key auth for n8n
function validateN8nAuth(request: NextRequest): boolean {
    const authHeader = request.headers.get("Authorization");
    const apiKey = process.env.N8N_WEBHOOK_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!authHeader || !apiKey) return false;
    return authHeader === `Bearer ${apiKey}`;
}

// ============================================
// GET /api/n8n — Health check
// ============================================
export async function GET(request: NextRequest) {
    if (!validateN8nAuth(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    return NextResponse.json({
        status: "ok",
        endpoints: [
            "GET /api/n8n/overdue",
            "GET /api/n8n/report",
            "POST /api/n8n/fb-sync",
            "POST /api/n8n/fb-alert",
        ],
    });
}
