// ============================================
// Multi-Platform Ads — Mock Data
// ============================================

import type {
  AdAccount,
  UnifiedCampaign,
  AdAlert,
  AgentAction,
  PlatformStats,
  PlatformConfig,
  AdPlatform,
} from "./ads-data";

// ============================================
// Accounts
// ============================================

export const mockAccounts: AdAccount[] = [
  // Facebook
  {
    id: "fb-acc-001",
    platform: "facebook",
    account_id: "act_123456789",
    name: "Tulie Agency",
    currency: "VND",
    timezone: "Asia/Ho_Chi_Minh",
    status: "active",
    daily_budget_limit: 5000000,
    total_spent: 45680000,
    page_count: 3,
  },
  // Google
  {
    id: "gg-acc-001",
    platform: "google",
    customer_id: "123-456-7890",
    name: "Tulie Agency - Google Ads",
    currency: "VND",
    timezone: "Asia/Ho_Chi_Minh",
    status: "active",
    daily_budget_limit: 3000000,
    total_spent: 28750000,
  },
  // TikTok
  {
    id: "tt-acc-001",
    platform: "tiktok",
    advertiser_id: "test_advertiser_001",
    name: "Tulie TikTok Ads",
    currency: "VND",
    timezone: "Asia/Ho_Chi_Minh",
    status: "active",
    daily_budget_limit: 2000000,
    total_spent: 15200000,
  },
];

// ============================================
// Campaigns
// ============================================

export const mockCampaigns: UnifiedCampaign[] = [
  // Facebook Campaigns
  {
    id: "camp-fb-001",
    account_id: "fb-acc-001",
    platform: "facebook",
    campaign_id: "120213456001",
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
    id: "camp-fb-002",
    account_id: "fb-acc-001",
    platform: "facebook",
    campaign_id: "120213456002",
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
    id: "camp-fb-003",
    account_id: "fb-acc-001",
    platform: "facebook",
    campaign_id: "120213456003",
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
    id: "camp-fb-004",
    account_id: "fb-acc-001",
    platform: "facebook",
    campaign_id: "120213456004",
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
    ctr: 0.7,
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
    id: "camp-fb-005",
    account_id: "fb-acc-001",
    platform: "facebook",
    campaign_id: "120213456005",
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
  // Google Campaigns
  {
    id: "camp-gg-001",
    account_id: "gg-acc-001",
    platform: "google",
    campaign_id: "gg-camp-001",
    name: "Search — Thiết kế website",
    objective: "CONVERSIONS",
    status: "active",
    daily_budget: 800000,
    lifetime_budget: null,
    spent: 15600000,
    results: 67,
    impressions: 89000,
    clicks: 3420,
    cpr: 232836,
    cpr_target: 250000,
    ctr: 3.84,
    cpc: 4561,
    cpm: 175280,
    frequency: 1.0,
    reach: 89000,
    start_date: "2026-02-15",
    end_date: null,
    last_synced: "2026-03-22T23:00:00Z",
    tags: ["search", "web-design"],
    ad_network: "search",
    quality_score: 7,
  },
  {
    id: "camp-gg-002",
    account_id: "gg-acc-001",
    platform: "google",
    campaign_id: "gg-camp-002",
    name: "Display — Retargeting",
    objective: "CONVERSIONS",
    status: "active",
    daily_budget: 500000,
    lifetime_budget: null,
    spent: 8450000,
    results: 34,
    impressions: 234000,
    clicks: 1890,
    cpr: 248529,
    cpr_target: 200000,
    ctr: 0.81,
    cpc: 4471,
    cpm: 36111,
    frequency: 2.4,
    reach: 97500,
    start_date: "2026-03-01",
    end_date: null,
    last_synced: "2026-03-22T23:00:00Z",
    tags: ["display", "retarget"],
    ad_network: "display",
    quality_score: 5,
  },
  {
    id: "camp-gg-003",
    account_id: "gg-acc-001",
    platform: "google",
    campaign_id: "gg-camp-003",
    name: "YouTube — Brand Awareness",
    objective: "VIDEO_VIEWS",
    status: "paused",
    daily_budget: 300000,
    lifetime_budget: 9000000,
    spent: 4700000,
    results: 125000,
    impressions: 567000,
    clicks: 4500,
    cpr: 37,
    cpr_target: 50,
    ctr: 0.79,
    cpc: 1044,
    cpm: 8289,
    frequency: 1.2,
    reach: 472500,
    start_date: "2026-02-20",
    end_date: "2026-03-20",
    last_synced: "2026-03-22T23:00:00Z",
    tags: ["youtube", "branding"],
    ad_network: "youtube",
    quality_score: 6,
  },
  // TikTok Campaigns
  {
    id: "camp-tt-001",
    account_id: "tt-acc-001",
    platform: "tiktok",
    campaign_id: "tt-camp-001",
    name: "Spark Ads — Studio Photos",
    objective: "APP_INSTALL",
    status: "active",
    daily_budget: 400000,
    lifetime_budget: null,
    spent: 9200000,
    results: 45,
    impressions: 456000,
    clicks: 8900,
    cpr: 204444,
    cpr_target: 180000,
    ctr: 1.95,
    cpc: 1034,
    cpm: 20175,
    frequency: 1.3,
    reach: 350769,
    start_date: "2026-03-05",
    end_date: null,
    last_synced: "2026-03-22T22:30:00Z",
    tags: ["spark-ads", "studio"],
    video_views: 156000,
    engagement_rate: 4.2,
  },
  {
    id: "camp-tt-002",
    account_id: "tt-acc-001",
    platform: "tiktok",
    campaign_id: "tt-camp-002",
    name: "Lead Gen — Catalogue Sales",
    objective: "LEAD_GENERATION",
    status: "active",
    daily_budget: 350000,
    lifetime_budget: null,
    spent: 6000000,
    results: 28,
    impressions: 234000,
    clicks: 5600,
    cpr: 214286,
    cpr_target: 200000,
    ctr: 2.39,
    cpc: 1071,
    cpm: 25641,
    frequency: 1.1,
    reach: 212727,
    start_date: "2026-03-10",
    end_date: null,
    last_synced: "2026-03-22T22:30:00Z",
    tags: ["lead-gen", "catalogue"],
    video_views: 89000,
    engagement_rate: 5.8,
  },
];

// ============================================
// Alerts
// ============================================

export const mockAlerts: AdAlert[] = [
  {
    id: "alert-001",
    campaign_id: "camp-fb-003",
    platform: "facebook",
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
    campaign_id: "camp-fb-003",
    platform: "facebook",
    campaign_name: "Retarget — Website Visitors",
    type: "frequency_high",
    severity: "warning",
    message:
      "Tần suất hiển thị đạt 3.2 — người dùng đang thấy quảng cáo quá nhiều lần.",
    value: 3.2,
    threshold: 2.5,
    is_read: false,
    action_taken: null,
    created_at: "2026-03-22T18:00:00Z",
  },
  {
    id: "alert-003",
    campaign_id: "camp-gg-002",
    platform: "google",
    campaign_name: "Display — Retargeting",
    type: "cpr_high",
    severity: "warning",
    message: "CPR Google Display cao hơn 24% so với target.",
    value: 248529,
    threshold: 200000,
    is_read: false,
    action_taken: null,
    created_at: "2026-03-22T19:00:00Z",
  },
  {
    id: "alert-004",
    campaign_id: "camp-tt-001",
    platform: "tiktok",
    campaign_name: "Spark Ads — Studio Photos",
    type: "budget_depleted",
    severity: "warning",
    message: "Đã chi 76% ngân sách ngày.",
    value: 9200000,
    threshold: 12000000,
    is_read: true,
    action_taken: null,
    created_at: "2026-03-22T15:00:00Z",
  },
  {
    id: "alert-005",
    campaign_id: "camp-fb-001",
    platform: "facebook",
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

// ============================================
// Agent Actions
// ============================================

export const mockAgentActions: AgentAction[] = [
  {
    id: "action-001",
    campaign_id: "camp-fb-003",
    platform: "facebook",
    campaign_name: "Retarget — Website Visitors",
    action: "pause_campaign",
    reason:
      "CPR vượt quá ngưỡng cho phép (198,261 vs target 120,000). Tự động tạm dừng để bảo vệ ngân sách.",
    details: { cpr_actual: 198261, cpr_target: 120000, overspend_pct: 65 },
    status: "executed",
    created_at: "2026-03-22T20:30:00Z",
  },
  {
    id: "action-002",
    campaign_id: "camp-fb-002",
    platform: "facebook",
    campaign_name: "Lead Gen — Ảnh thẻ Studio HN",
    action: "increase_budget",
    reason:
      "CPR thấp hơn target 5%, performance tốt. Đề xuất tăng ngân sách 20% để scale.",
    details: {
      current_budget: 300000,
      proposed_budget: 360000,
      cpr_ratio: 0.95,
    },
    status: "pending_approval",
    created_at: "2026-03-22T19:00:00Z",
  },
  {
    id: "action-003",
    campaign_id: "camp-gg-001",
    platform: "google",
    campaign_name: "Search — Thiết kế website",
    action: "optimize_bid",
    reason:
      "Quality score 7/10. Có thể cải thiện bằng cách tối ưu landing page.",
    details: { current_cpc: 4561, suggested_bid: 4800, quality_score: 7 },
    status: "pending_approval",
    created_at: "2026-03-22T18:00:00Z",
  },
  {
    id: "action-004",
    campaign_id: "camp-tt-002",
    platform: "tiktok",
    campaign_name: "Lead Gen — Catalogue Sales",
    action: "increase_budget",
    reason:
      "Engagement rate cao (5.8%), CPR đang trong ngưỡng. Đề xuất tăng budget.",
    details: {
      current_budget: 350000,
      proposed_budget: 450000,
      engagement_rate: 5.8,
    },
    status: "pending_approval",
    created_at: "2026-03-22T17:00:00Z",
  },
];

// ============================================
// Stats by Platform
// ============================================

export function getPlatformStats(platform: AdPlatform): PlatformStats {
  const campaigns = mockCampaigns.filter((c) => c.platform === platform);
  const alerts = mockAlerts.filter((a) => a.platform === platform);
  const actions = mockAgentActions.filter((a) => a.platform === platform);

  const active = campaigns.filter((c) => c.status === "active");
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalResults = campaigns.reduce((sum, c) => sum + c.results, 0);
  const avgCpr = totalResults > 0 ? totalSpent / totalResults : 0;
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);

  return {
    platform,
    active_campaigns: active.length,
    total_campaigns: campaigns.length,
    total_spent: totalSpent,
    total_results: totalResults,
    avg_cpr: avgCpr,
    impressions: totalImpressions,
    alerts: alerts.filter((a) => !a.is_read).length,
    pending_actions: actions.filter((a) => a.status === "pending_approval")
      .length,
  };
}

// ============================================
// Helpers
// ============================================

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "₫";
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + "K";
  }
  return num.toString();
}

export function getPlatformColor(platform: AdPlatform): string {
  const colors: Record<AdPlatform, string> = {
    facebook: "#1877F2",
    google: "#EA4335",
    tiktok: "#000000",
  };
  return colors[platform];
}

export function getPlatformName(platform: AdPlatform): string {
  const names: Record<AdPlatform, string> = {
    facebook: "Facebook",
    google: "Google Ads",
    tiktok: "TikTok Ads",
  };
  return names[platform];
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "bg-emerald-500",
    paused: "bg-amber-500",
    completed: "bg-zinc-500",
    draft: "bg-slate-400",
    error: "bg-red-500",
    archived: "bg-zinc-300",
  };
  return colors[status] || "bg-zinc-400";
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    info: "bg-blue-500",
    warning: "bg-amber-500",
    critical: "bg-red-500",
  };
  return colors[severity] || "bg-zinc-400";
}
