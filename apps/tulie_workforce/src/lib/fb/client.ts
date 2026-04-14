import type {
  Campaign,
  AdSet,
  Ad,
  AdTargeting,
  CampaignObjective,
} from "@/types/fb-ads";

const FB_API_BASE = "https://graph.facebook.com/v21.0";

export interface FBApiError {
  message: string;
  type: string;
  code: number;
  fbtrace_id: string;
}

export function isFBApiError(err: unknown): err is FBApiError {
  return typeof err === "object" && err !== null && "code" in err;
}

export function handleFBError(error: unknown): string {
  if (isFBApiError(error)) {
    switch (error.code) {
      case 190:
        return "Facebook access token expired. Please reconnect your account.";
      case 100:
        return `Invalid parameter: ${error.message}`;
      case 200:
        return "Permission denied. Please check your ad account permissions.";
      default:
        return `Facebook API error: ${error.message}`;
    }
  }
  return "An unknown error occurred";
}

export interface FBCampaignCreateParams {
  name: string;
  objective: CampaignObjective;
  status?: "PAUSED" | "ACTIVE";
  daily_budget?: number;
  special_ad_categories?: string[];
}

export interface FBAdSetCreateParams {
  name: string;
  campaign_id: string;
  daily_budget: number;
  billing_event?: string;
  optimization_goal?: string;
  targeting: {
    age_min?: number;
    age_max?: number;
    geo_locations?: { countries?: string[] };
    genders?: number[];
  };
  status?: "PAUSED" | "ACTIVE";
}

export interface FBAdCreateParams {
  name: string;
  adset_id: string;
  creative: {
    body?: string;
    title?: string;
    image_url?: string;
    call_to_action?: {
      type: string;
      value: {
        page_id?: string;
      };
    };
  };
  status?: "PAUSED" | "ACTIVE";
}

export interface FBInsightsParams {
  fields?: string;
  date_preset?: string;
  level?: string;
}

export class FBAdClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(
    endpoint: string,
    method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
    body?: Record<string, unknown>,
  ): Promise<T> {
    const url = new URL(`${FB_API_BASE}${endpoint}`);
    url.searchParams.append("access_token", this.accessToken);

    const options: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url.toString(), options);
    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data as T;
  }

  async createCampaign(accountId: string, params: FBCampaignCreateParams) {
    return this.request<{ id: string; success: boolean }>(
      `/act_${accountId}/campaigns`,
      "POST",
      {
        ...params,
        special_ad_categories: params.special_ad_categories || ["NONE"],
      },
    );
  }

  async updateCampaign(campaignId: string, params: Record<string, unknown>) {
    return this.request<{ success: boolean }>(`/${campaignId}`, "POST", params);
  }

  async createAdSet(accountId: string, params: FBAdSetCreateParams) {
    return this.request<{ id: string; success: boolean }>(
      `/act_${accountId}/adsets`,
      "POST",
      {
        billing_event: params.billing_event || "IMPRESSIONS",
        optimization_goal: params.optimization_goal || "LEAD_GENERATION",
        ...params,
      },
    );
  }

  async updateAdSet(adsetId: string, params: Record<string, unknown>) {
    return this.request<{ success: boolean }>(`/${adsetId}`, "POST", params);
  }

  async createAd(accountId: string, params: FBAdCreateParams) {
    return this.request<{ id: string; success: boolean }>(
      `/act_${accountId}/ads`,
      "POST",
      params,
    );
  }

  async updateAd(adId: string, params: Record<string, unknown>) {
    return this.request<{ success: boolean }>(`/${adId}`, "POST", params);
  }

  async getCampaignInsights(campaignId: string, params?: FBInsightsParams) {
    return this.request<Array<Record<string, unknown>>>(
      `/${campaignId}/insights`,
      "GET",
      params as Record<string, unknown>,
    );
  }

  async getAdSetInsights(adsetId: string, params?: FBInsightsParams) {
    return this.request<Array<Record<string, unknown>>>(
      `/${adsetId}/insights`,
      "GET",
      params as Record<string, unknown>,
    );
  }

  async getAccountInfo(accountId: string) {
    return this.request<{
      id: string;
      name: string;
      account_id: string;
      daily_budget_limit?: number;
    }>(`/act_${accountId}`, "GET");
  }

  async getCampaigns(accountId: string) {
    return this.request<{
      data: Array<{ id: string; name: string; status: string }>;
    }>(`/act_${accountId}/campaigns`, "GET", { limit: 100 });
  }
}

export function getFBClient(accessToken: string): FBAdClient {
  return new FBAdClient(accessToken);
}

export function buildTargetingForFB(
  targeting: AdTargeting,
): FBAdSetCreateParams["targeting"] {
  return {
    age_min: targeting.age_min || 18,
    age_max: targeting.age_max || 65,
    genders: targeting.genders || [0],
    geo_locations: targeting.geo_locations
      ? { countries: targeting.geo_locations }
      : { countries: ["VN"] },
  };
}

export function campaignObjectiveToFB(obj: CampaignObjective): string {
  const mapping: Record<CampaignObjective, string> = {
    LEAD_GENERATION: "LEAD_GENERATION",
    CONVERSIONS: "CONVERSIONS",
    TRAFFIC: "TRAFFIC",
    MESSAGES: "MESSAGES",
    REACH: "REACH",
    BRAND_AWARENESS: "BRAND_AWARENESS",
    POST_ENGAGEMENT: "POST_ENGAGEMENT",
    VIDEO_VIEWS: "VIDEO_VIEWS",
  };
  return mapping[obj];
}
