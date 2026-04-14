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
  created_at: string;
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
    };
  };
}
