import type { Organization } from "@/types/database.types";

export const ORG_ID = "a0000000-0000-0000-0000-000000000001";

export interface Deal {
  id: string;
  organization_id: string;
  name: string;
  company: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  stage: DealStage;
  value: number;
  probability: number;
  expected_close_date: string | null;
  actual_close_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type DealStage =
  | "lead"
  | "prospecting"
  | "qualified"
  | "meeting"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export interface Transaction {
  id: string;
  organization_id: string;
  date: string;
  type: "income" | "expense";
  category: string;
  description: string | null;
  amount: number;
  payment_method: string | null;
  reference: string | null;
  created_at: string;
}

export interface MonthlyFinance {
  id: string;
  organization_id: string;
  month: string;
  revenue: number;
  cogs: number;
  gross_profit: number;
  opex: number;
  net_profit: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface HiringPlan {
  id: string;
  organization_id: string;
  position: string;
  employment_type: "fte" | "parttime" | "ctv" | "intern";
  target_start_month: string;
  status: HiringStatus;
  salary_range_min: number | null;
  salary_range_max: number | null;
  priority: "low" | "medium" | "high";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type HiringStatus =
  | "planning"
  | "interviewing"
  | "offered"
  | "hired"
  | "cancelled";

export interface MarketingMetric {
  id: string;
  organization_id: string;
  date: string;
  channel: string;
  metric_name: string;
  value: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ContentCalendarItem {
  id: string;
  organization_id: string;
  planned_date: string;
  content_type: string;
  topic: string | null;
  platform: string;
  status: ContentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ContentStatus = "planned" | "draft" | "published" | "cancelled";

export interface SalesTarget {
  id: string;
  organization_id: string;
  month: string;
  target_revenue: number;
  actual_revenue: number;
  deals_closed: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentPerformance {
  id: string;
  organization_id: string;
  content_id: string | null;
  platform: string;
  impressions: number;
  clicks: number;
  engagement: number;
  shares: number;
  created_at: string;
  updated_at: string;
}

export const DEAL_STAGE_LABELS: Record<DealStage, { vi: string; en: string }> =
  {
    lead: { vi: "Lead", en: "Lead" },
    prospecting: { vi: "Prospecting", en: "Prospecting" },
    qualified: { vi: "Qualified", en: "Qualified" },
    meeting: { vi: "Meeting", en: "Meeting" },
    proposal: { vi: "Proposal", en: "Proposal" },
    negotiation: { vi: "Negotiation", en: "Negotiation" },
    won: { vi: "Won", en: "Won" },
    lost: { vi: "Lost", en: "Lost" },
  };

export const HIRING_STATUS_LABELS: Record<
  HiringStatus,
  { vi: string; en: string }
> = {
  planning: { vi: "Lên kế hoạch", en: "Planning" },
  interviewing: { vi: "Đang phỏng vấn", en: "Interviewing" },
  offered: { vi: "Đã offer", en: "Offered" },
  hired: { vi: "Đã tuyển", en: "Hired" },
  cancelled: { vi: "Huỷ", en: "Cancelled" },
};

export const CONTENT_TYPE_LABELS: Record<string, { vi: string; en: string }> = {
  image: { vi: "Hình ảnh", en: "Image" },
  video: { vi: "Video", en: "Video" },
  carousel: { vi: "Carousel", en: "Carousel" },
  article: { vi: "Bài viết", en: "Article" },
  story: { vi: "Story", en: "Story" },
  reel: { vi: "Reel", en: "Reel" },
};

export const PLATFORM_LABELS: Record<string, { vi: string; en: string }> = {
  facebook: { vi: "Facebook", en: "Facebook" },
  linkedin: { vi: "LinkedIn", en: "LinkedIn" },
  zalo: { vi: "Zalo", en: "Zalo" },
  instagram: { vi: "Instagram", en: "Instagram" },
  tiktok: { vi: "TikTok", en: "TikTok" },
  youtube: { vi: "YouTube", en: "YouTube" },
};

export const CONTENT_STATUS_LABELS: Record<
  ContentStatus,
  { vi: string; en: string }
> = {
  planned: { vi: "Đã lên kế hoạch", en: "Planned" },
  draft: { vi: "Nháp", en: "Draft" },
  published: { vi: "Đã đăng", en: "Published" },
  cancelled: { vi: "Huỷ", en: "Cancelled" },
};

export interface GrowthTarget {
  id: string;
  organization_id: string;
  month: string;
  mrr_target: number;
  mrr_actual: number | null;
  new_customers_target: number;
  new_customers_actual: number | null;
  churn_rate_target: number;
  arpc_target: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  organization_id: string;
  name: string;
  service_type: ProductType;
  description: string | null;
  price_min: number | null;
  price_max: number | null;
  price_unit: "once" | "monthly" | "yearly";
  features: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductType =
  | "website_design"
  | "chatbot"
  | "studio"
  | "crm_saas"
  | "landing_page"
  | "other";

export interface Milestone {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  target_date: string;
  status: MilestoneStatus;
  phase: MilestonePhase;
  priority: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type MilestoneStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "delayed"
  | "cancelled";
export type MilestonePhase = "phase_1" | "phase_2" | "phase_3" | "phase_4";

export interface ContentPillar {
  id: string;
  organization_id: string;
  name: string;
  pillar_type: ContentPillarType;
  percentage: number;
  description: string | null;
  content_types: string[] | null;
  posting_frequency: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ContentPillarType = "showcase" | "educate" | "trust" | "convert";

export interface SeoTarget {
  id: string;
  organization_id: string;
  keyword: string;
  keyword_cluster: string;
  current_rank: number | null;
  target_rank: number | null;
  monthly_searches: number | null;
  difficulty: string | null;
  priority: "low" | "medium" | "high";
  status: SeoStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type SeoStatus = "not_started" | "in_progress" | "achieved" | "dropped";

export interface MarketingChannel {
  id: string;
  organization_id: string;
  channel_name: string;
  channel_type: ChannelType;
  cac_target: number | null;
  ltv_target: number | null;
  ltv_cac_ratio_target: number | null;
  budget_monthly: number | null;
  budget_spent: number | null;
  leads_target: number | null;
  leads_actual: number | null;
  customers_actual: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ChannelType =
  | "facebook_ads"
  | "google_ads"
  | "cold_outreach"
  | "referral"
  | "seo_organic"
  | "other";

export const PRODUCT_TYPE_LABELS: Record<
  ProductType,
  { vi: string; en: string }
> = {
  website_design: { vi: "Thiết kế Website", en: "Website Design" },
  chatbot: { vi: "Chatbot AI", en: "Chatbot AI" },
  studio: { vi: "Studio Ảnh", en: "Studio" },
  crm_saas: { vi: "CRM SaaS", en: "CRM SaaS" },
  landing_page: { vi: "Landing Page", en: "Landing Page" },
  other: { vi: "Khác", en: "Other" },
};

export const MILESTONE_STATUS_LABELS: Record<
  MilestoneStatus,
  { vi: string; en: string }
> = {
  pending: { vi: "Chưa bắt đầu", en: "Pending" },
  in_progress: { vi: "Đang thực hiện", en: "In Progress" },
  completed: { vi: "Hoàn thành", en: "Completed" },
  delayed: { vi: "Trễ hạn", en: "Delayed" },
  cancelled: { vi: "Huỷ", en: "Cancelled" },
};

export const MILESTONE_PHASE_LABELS: Record<
  MilestonePhase,
  { vi: string; en: string }
> = {
  phase_1: { vi: "Giai đoạn 1 (T4-T5)", en: "Phase 1 (Apr-May)" },
  phase_2: { vi: "Giai đoạn 2 (T6-T7)", en: "Phase 2 (Jun-Jul)" },
  phase_3: { vi: "Giai đoạn 3 (T8-T10)", en: "Phase 3 (Aug-Oct)" },
  phase_4: { vi: "Giai đoạn 4 (T11-T12)", en: "Phase 4 (Nov-Dec)" },
};

export const CONTENT_PILLAR_LABELS: Record<
  ContentPillarType,
  { vi: string; en: string }
> = {
  showcase: { vi: "Showcase", en: "Showcase" },
  educate: { vi: "Educate", en: "Educate" },
  trust: { vi: "Trust", en: "Trust" },
  convert: { vi: "Convert", en: "Convert" },
};

export const CHANNEL_TYPE_LABELS: Record<
  ChannelType,
  { vi: string; en: string }
> = {
  facebook_ads: { vi: "Facebook Ads", en: "Facebook Ads" },
  google_ads: { vi: "Google Ads", en: "Google Ads" },
  cold_outreach: { vi: "Cold Outreach", en: "Cold Outreach" },
  referral: { vi: "Referral", en: "Referral" },
  seo_organic: { vi: "SEO Organic", en: "SEO Organic" },
  other: { vi: "Khác", en: "Other" },
};
