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
