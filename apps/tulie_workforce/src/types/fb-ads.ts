export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CampaignObjective =
  | "LEAD_GENERATION"
  | "CONVERSIONS"
  | "TRAFFIC"
  | "MESSAGES"
  | "REACH"
  | "BRAND_AWARENESS"
  | "POST_ENGAGEMENT"
  | "VIDEO_VIEWS";

export type CampaignStatus =
  | "active"
  | "paused"
  | "completed"
  | "draft"
  | "error";

export type CreativeType = "image" | "video" | "carousel" | "collection";

export type AdStatus = "active" | "paused" | "completed" | "draft" | "error";

export type FbAdAccountStatus = "active" | "disconnected" | "error";

export interface FbAdAccount {
  id: string;
  organization_id: string;
  fb_account_id: string;
  fb_account_name: string | null;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  status: FbAdAccountStatus;
  daily_budget_limit: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface FbPage {
  id: string;
  fb_ad_account_id: string;
  fb_page_id: string;
  page_name: string | null;
  access_token: string;
  follower_count: number;
  status: string;
  created_at: string;
}

export interface Campaign {
  id: string;
  fb_ad_account_id: string;
  fb_campaign_id: string | null;
  name: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  daily_budget: number;
  lifetime_budget: number | null;
  cpr_target: number;
  start_date: string | null;
  end_date: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface AdSet {
  id: string;
  campaign_id: string;
  fb_adset_id: string | null;
  name: string;
  status: string;
  daily_budget: number;
  targeting: AdTargeting;
  created_at: string;
  updated_at: string;
}

export interface AdTargeting {
  age_min?: number;
  age_max?: number;
  genders?: number[];
  geo_locations?: string[];
  interests?: number[];
  placements?: {
    facebook_feed?: boolean;
    instagram?: boolean;
    audience_network?: boolean;
  };
}

export interface AdCreative {
  image_url?: string;
  body?: string;
  title?: string;
  call_to_action?: {
    type: string;
    value: {
      page_id?: string;
      app_link?: string;
    };
  };
}

export interface Ad {
  id: string;
  adset_id: string;
  fb_ad_id: string | null;
  name: string;
  status: AdStatus;
  creative_type: CreativeType;
  creative_data: AdCreative;
  created_at: string;
  updated_at: string;
}

export interface CampaignMetric {
  id: string;
  campaign_id: string;
  date: string;
  spent: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  results: number;
  cpr: number;
  frequency: number;
  video_views: number;
  engagement: number;
  platform_data: Json;
  created_at: string;
}

export type RecommendationType =
  | "increase_budget"
  | "decrease_budget"
  | "pause_campaign"
  | "resume_campaign"
  | "adjust_audience"
  | "optimize_bid"
  | "create_new_creative"
  | "test_different_copy"
  | "lower_cpr_target"
  | "raise_cpr_target";

export type RecommendationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "executed";

export interface Recommendation {
  id: string;
  campaign_id: string;
  organization_id: string;
  type: RecommendationType;
  reason: string;
  details: Json;
  status: RecommendationStatus;
  priority: number;
  is_auto_exec: boolean;
  executed_at: string | null;
  created_by: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
  campaign?: Campaign;
}

export type RuleTrigger =
  | "keyword"
  | "intent"
  | "first_message"
  | "no_response"
  | "time_based";
export type RuleAction =
  | "reply"
  | "tag"
  | "assign"
  | "escalate"
  | "auto_resolve";

export interface AutoReplyRule {
  id: string;
  organization_id: string;
  name: string;
  trigger_type: RuleTrigger;
  trigger_config: Json;
  actions: Json;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface ResponseTemplate {
  id: string;
  organization_id: string;
  name: string;
  category: string | null;
  content: string;
  variables: Json;
  ai_prompt: string | null;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface AISettings {
  id: string;
  organization_id: string;
  auto_execution_enabled: boolean;
  max_budget_increase_percent: number;
  max_budget_decrease_percent: number;
  cpr_threshold_multiplier: number;
  daily_analysis_enabled: boolean;
  notification_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          company_name: string | null;
          avatar_url: string | null;
          telegram_user_id: number | null;
          telegram_username: string | null;
          timezone: string;
          organization_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          company_name?: string | null;
          avatar_url?: string | null;
          telegram_user_id?: number | null;
          telegram_username?: string | null;
          timezone?: string;
          organization_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          company_name?: string | null;
          avatar_url?: string | null;
          telegram_user_id?: number | null;
          telegram_username?: string | null;
          timezone?: string;
          organization_id?: string | null;
          updated_at?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string | null;
          plan: string;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string | null;
          plan?: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string | null;
          plan?: string;
          settings?: Json;
          updated_at?: string;
        };
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: string;
          invited_by: string | null;
          invited_at: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: string;
          invited_by?: string | null;
          invited_at?: string;
          joined_at?: string;
        };
        Update: {
          role?: string;
        };
      };
      fb_ad_accounts: {
        Row: FbAdAccount;
        Insert: Omit<FbAdAccount, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<FbAdAccount, "id" | "created_at">>;
      };
      fb_pages: {
        Row: FbPage;
        Insert: Omit<FbPage, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<FbPage, "id" | "created_at">>;
      };
      campaigns: {
        Row: Campaign;
        Insert: Omit<Campaign, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Campaign, "id" | "created_at">>;
      };
      ad_sets: {
        Row: AdSet;
        Insert: Omit<AdSet, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<AdSet, "id" | "created_at">>;
      };
      ads: {
        Row: Ad;
        Insert: Omit<Ad, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Ad, "id" | "created_at">>;
      };
      campaign_metrics: {
        Row: CampaignMetric;
        Insert: Omit<CampaignMetric, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<CampaignMetric, "id" | "created_at">>;
      };
      recommendations: {
        Row: Recommendation;
        Insert: Omit<Recommendation, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Recommendation, "id" | "created_at">>;
      };
      auto_reply_rules: {
        Row: AutoReplyRule;
        Insert: Omit<AutoReplyRule, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<AutoReplyRule, "id" | "created_at">>;
      };
      response_templates: {
        Row: ResponseTemplate;
        Insert: Omit<ResponseTemplate, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ResponseTemplate, "id" | "created_at">>;
      };
      ai_settings: {
        Row: AISettings;
        Insert: Omit<AISettings, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<AISettings, "id" | "created_at">>;
      };
    };
  };
}
