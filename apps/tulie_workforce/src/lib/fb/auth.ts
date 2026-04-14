const FB_AUTH_BASE = "https://www.facebook.com/v21.0/dialog/oauth";
const FB_TOKEN_URL = "https://graph.facebook.com/v21.0/oauth/access_token";

export interface FBOAuthTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export interface FBUserInfo {
  id: string;
  name: string;
  email?: string;
}

const FB_APP_ID = process.env.FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;
const REDIRECT_URI =
  process.env.FB_REDIRECT_URI || "http://localhost:3001/api/fb/auth/callback";

export function getFBLoginUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: FB_APP_ID || "",
    redirect_uri: REDIRECT_URI,
    scope:
      "ads_read,ads_management,business_management,pages_read_engagement,pages_manage_metadata",
    response_type: "code",
    state: state || crypto.randomUUID(),
  });

  return `${FB_AUTH_BASE}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  code: string,
): Promise<FBOAuthTokens> {
  const response = await fetch(FB_TOKEN_URL, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    params: {
      client_id: FB_APP_ID,
      client_secret: FB_APP_SECRET,
      redirect_uri: REDIRECT_URI,
      code,
      grant_type: "authorization_code",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data as FBOAuthTokens;
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<FBOAuthTokens> {
  const response = await fetch(FB_TOKEN_URL, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    params: {
      client_id: FB_APP_ID,
      client_secret: FB_APP_SECRET,
      grant_type: "fb_exchange_token",
      fb_exchange_token: refreshToken,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data as FBOAuthTokens;
}

export async function getLongLivedToken(
  shortLivedToken: string,
): Promise<FBOAuthTokens> {
  const response = await fetch(FB_TOKEN_URL, {
    method: "GET",
    params: {
      grant_type: "fb_exchange_token",
      client_id: FB_APP_ID,
      client_secret: FB_APP_SECRET,
      fb_exchange_token: shortLivedToken,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data as FBOAuthTokens;
}

export async function getUserInfo(accessToken: string): Promise<FBUserInfo> {
  const response = await fetch(
    `${FB_AUTH_BASE.replace("/dialog/oauth", "")}/me?fields=id,name,email&access_token=${accessToken}`,
  );
  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data as FBUserInfo;
}

export async function getAdAccounts(accessToken: string) {
  const response = await fetch(
    `https://graph.facebook.com/v21.0/me/adaccounts?fields=id,name,account_id,daily_budget_limit,disable_reason&access_token=${accessToken}`,
  );
  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
}

export async function getPages(accessToken: string) {
  const response = await fetch(
    `https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}`,
  );
  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
}
