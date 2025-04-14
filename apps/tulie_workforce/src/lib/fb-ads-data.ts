// ============================================
// Facebook Ads — Types & Mock Data
// ============================================

export interface FbAdAccount {
    id: string;
    account_id: string;
    name: string;
    currency: string;
    timezone: string;
    status: "active" | "disabled";
    daily_budget_limit: number;
    total_spent: number;
}

export interface FbCampaign {
    id: string;
    account_id: string;
    fb_campaign_id: string;
    name: string;
    objective: "LEAD_GENERATION" | "CONVERSIONS" | "TRAFFIC" | "MESSAGES" | "REACH" | "BRAND_AWARENESS";
    status: "active" | "paused" | "completed" | "draft" | "error";
    daily_budget: number;
    lifetime_budget: number | null;
    spent: number;
    results: number;
    impressions: number;
    clicks: number;
    cpr: number;        // Cost Per Result
    cpr_target: number; // Target CPR
    ctr: number;        // Click-Through Rate
    cpc: number;        // Cost Per Click
    cpm: number;        // Cost Per 1000 Impressions
    frequency: number;
    reach: number;
    start_date: string;
    end_date: string | null;
    last_synced: string;
    tags: string[];
}

export interface FbAlert {
    id: string;
    campaign_id: string;
    campaign_name: string;
    type: "cpr_high" | "budget_depleted" | "low_ctr" | "frequency_high" | "no_results" | "cost_spike";
    severity: "info" | "warning" | "critical";
    message: string;
    value: number;
    threshold: number;
    is_read: boolean;
    action_taken: string | null;
    created_at: string;
}

export interface FbAgentAction {
    id: string;
    campaign_id: string;
    campaign_name: string;
    action: "pause_campaign" | "increase_budget" | "decrease_budget" | "adjust_audience" | "create_alert" | "optimize_bid";
    reason: string;
    details: Record<string, any>;
    status: "executed" | "pending_approval" | "rejected";
    created_at: string;
}

// ============================================
// MOCK DATA
// ============================================

export const mockAdAccount: FbAdAccount = {
    id: "acc-001",
    account_id: "act_123456789",
    name: "Tulie Agency",
    currency: "VND",
    timezone: "Asia/Ho_Chi_Minh",
    status: "active",
    daily_budget_limit: 5000000, // 5M VND
    total_spent: 45680000,       // 45.68M VND
};

export const mockCampaigns: FbCampaign[] = [
    {
        id: "camp-001",
        account_id: "acc-001",
        fb_campaign_id: "120213456001",
        name: "Lead Gen — Thiết kế Web HCM",
        objective: "LEAD_GENERATION",
        status: "active",
        daily_budget: 500000,
        lifetime_budget: null,
        spent: 12450000,
        results: 89,
        impressions: 245000,
        clicks: 4320,
        cpr: 139888,
        cpr_target: 150000,
        ctr: 1.76,
        cpc: 2882,
        cpm: 50816,
        frequency: 2.1,
        reach: 116667,
        start_date: "2026-03-01",
        end_date: null,
        last_synced: "2026-03-22T22:00:00Z",
        tags: ["web-design", "hcm"],
    },
    {
        id: "camp-002",
        account_id: "acc-001",
        fb_campaign_id: "120213456002",
        name: "Lead Gen — Ảnh thẻ Studio HN",
        objective: "LEAD_GENERATION",
        status: "active",
        daily_budget: 300000,
        lifetime_budget: null,
        spent: 8920000,
        results: 156,
        impressions: 389000,
        clicks: 6780,
        cpr: 57179,
        cpr_target: 60000,
        ctr: 1.74,
        cpc: 1315,
        cpm: 22930,
        frequency: 1.8,
        reach: 216111,
        start_date: "2026-03-05",
        end_date: null,
        last_synced: "2026-03-22T22:00:00Z",
        tags: ["photo-studio", "hanoi"],
    },
    {
        id: "camp-003",
        account_id: "acc-001",
        fb_campaign_id: "120213456003",
        name: "Retarget — Website Visitors",
        objective: "CONVERSIONS",
        status: "paused",
        daily_budget: 200000,
        lifetime_budget: null,
        spent: 4560000,
        results: 23,
        impressions: 98000,
        clicks: 1560,
        cpr: 198261,
        cpr_target: 120000,
        ctr: 1.59,
        cpc: 2923,
        cpm: 46531,
        frequency: 3.2,
        reach: 30625,
        start_date: "2026-03-10",
        end_date: null,
        last_synced: "2026-03-22T21:00:00Z",
        tags: ["retarget", "conversion"],
    },
    {
        id: "camp-004",
        account_id: "acc-001",
        fb_campaign_id: "120213456004",
        name: "Branding — Tulie Agency",
        objective: "REACH",
        status: "active",
        daily_budget: 150000,
        lifetime_budget: 4500000,
        spent: 3200000,
        results: 0,
        impressions: 456000,
        clicks: 3200,
        cpr: 0,
        cpr_target: 0,
        ctr: 0.70,
        cpc: 1000,
        cpm: 7018,
        frequency: 1.5,
        reach: 304000,
        start_date: "2026-03-01",
        end_date: "2026-03-31",
        last_synced: "2026-03-22T22:00:00Z",
        tags: ["branding"],
    },
    {
        id: "camp-005",
        account_id: "acc-001",
        fb_campaign_id: "120213456005",
        name: "Messages — Tư vấn thiết kế",
        objective: "MESSAGES",
        status: "active",
        daily_budget: 250000,
        lifetime_budget: null,
        spent: 5680000,
        results: 234,
        impressions: 312000,
        clicks: 5600,
        cpr: 24274,
        cpr_target: 30000,
        ctr: 1.79,
        cpc: 1014,
        cpm: 18205,
        frequency: 1.9,
        reach: 164211,
        start_date: "2026-03-08",
        end_date: null,
        last_synced: "2026-03-22T22:00:00Z",
        tags: ["messages", "consultation"],
    },
];

export const mockAlerts: FbAlert[] = [
    {
        id: "alert-001",
        campaign_id: "camp-003",
        campaign_name: "Retarget — Website Visitors",
        type: "cpr_high",
        severity: "critical",
        message: "CPR vượt 65% so với target. Đã tự động tạm dừng chiến dịch.",
        value: 198261,
        threshold: 120000,
        is_read: false,
        action_taken: "Chiến dịch đã bị tạm dừng tự động",
        created_at: "2026-03-22T20:30:00Z",
    },
    {
        id: "alert-002",
        campaign_id: "camp-003",
        campaign_name: "Retarget — Website Visitors",
        type: "frequency_high",
        severity: "warning",
        message: "Tần suất hiển thị đạt 3.2 — người dùng đang thấy quảng cáo quá nhiều lần.",
        value: 3.2,
        threshold: 2.5,
        is_read: false,
        action_taken: null,
        created_at: "2026-03-22T18:00:00Z",
    },
    {
        id: "alert-003",
        campaign_id: "camp-004",
        campaign_name: "Branding — Tulie Agency",
        type: "budget_depleted",
        severity: "warning",
        message: "Đã chi 71% ngân sách tổng. Còn 9 ngày còn lại trong chiến dịch.",
        value: 3200000,
        threshold: 4500000,
        is_read: true,
        action_taken: null,
        created_at: "2026-03-22T15:00:00Z",
    },
    {
        id: "alert-004",
        campaign_id: "camp-001",
        campaign_name: "Lead Gen — Thiết kế Web HCM",
        type: "cost_spike",
        severity: "info",
        message: "CPR tăng 12% trong 24h gần nhất. Theo dõi thêm.",
        value: 12,
        threshold: 20,
        is_read: true,
        action_taken: null,
        created_at: "2026-03-22T10:00:00Z",
    },
];

export const mockAgentActions: FbAgentAction[] = [
    {
        id: "action-001",
        campaign_id: "camp-003",
        campaign_name: "Retarget — Website Visitors",
        action: "pause_campaign",
        reason: "CPR vượt quá ngưỡng cho phép (198,261 vs target 120,000). Tự động tạm dừng để bảo vệ ngân sách.",
        details: { cpr_actual: 198261, cpr_target: 120000, overspend_pct: 65 },
        status: "executed",
        created_at: "2026-03-22T20:30:00Z",
    },
    {
        id: "action-002",
        campaign_id: "camp-002",
        campaign_name: "Lead Gen — Ảnh thẻ Studio HN",
        action: "increase_budget",
        reason: "CPR thấp hơn target 5%, performance tốt. Đề xuất tăng ngân sách 20% để scale.",
        details: { current_budget: 300000, proposed_budget: 360000, cpr_ratio: 0.95 },
        status: "pending_approval",
        created_at: "2026-03-22T19:00:00Z",
    },
    {
        id: "action-003",
        campaign_id: "camp-005",
        campaign_name: "Messages — Tư vấn thiết kế",
        action: "optimize_bid",
        reason: "CPC đang thấp, có thể tối ưu bid để tăng reach mà không tăng chi phí.",
        details: { current_cpc: 1014, suggested_bid: 1200, estimated_reach_increase: "15%" },
        status: "pending_approval",
        created_at: "2026-03-22T18:00:00Z",
    },
];

// ============================================
// HELPERS
// ============================================

export function formatVND(amount: number): string {
    return new Intl.NumberFormat("vi-VN").format(amount) + "₫";
}

export function getCampaignStatusColor(status: FbCampaign["status"]): string {
    const colors: Record<FbCampaign["status"], string> = {
        active: "#22C55E",
        paused: "#F59E0B",
        completed: "#6B7280",
        draft: "#94A3B8",
        error: "#EF4444",
    };
    return colors[status];
}

export function getAlertSeverityColor(severity: FbAlert["severity"]): string {
    return { info: "#3B82F6", warning: "#F59E0B", critical: "#EF4444" }[severity];
}
