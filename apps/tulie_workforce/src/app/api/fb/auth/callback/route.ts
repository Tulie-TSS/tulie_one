import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForToken,
  getLongLivedToken,
  getAdAccounts,
  getPages,
} from "@/lib/fb/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/ads?error=${encodeURIComponent(error)}`, request.url),
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL("/ads?error=no_code", request.url));
  }

  try {
    const tokens = await exchangeCodeForToken(code);
    const longLivedTokens = await getLongLivedToken(tokens.access_token);
    const adAccounts = await getAdAccounts(longLivedTokens.access_token);
    const pages = await getPages(longLivedTokens.access_token);

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { data: orgData } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    const organizationId = orgData?.organization_id;

    if (adAccounts?.data && organizationId) {
      for (const account of adAccounts.data) {
        await supabase.from("fb_ad_accounts").upsert(
          {
            organization_id: organizationId,
            fb_account_id: account.account_id || account.id,
            fb_account_name: account.name,
            access_token: longLivedTokens.access_token,
            refresh_token: longLivedTokens.refresh_token,
            token_expires_at: new Date(
              Date.now() + longLivedTokens.expires_in * 1000,
            ).toISOString(),
            status: "active",
            daily_budget_limit: account.daily_budget_limit || 0,
            currency: "VND",
          },
          {
            onConflict: "organization_id,fb_account_id",
          },
        );
      }
    }

    if (pages?.data && organizationId) {
      for (const page of pages.data) {
        const adAccount = adAccounts?.data?.[0];
        if (adAccount) {
          await supabase.from("fb_pages").upsert(
            {
              fb_ad_account_id: adAccount.id,
              fb_page_id: page.id,
              page_name: page.name,
              access_token: page.access_token,
              follower_count: page.followers_count || 0,
              status: "active",
            },
            {
              onConflict: "fb_ad_account_id,fb_page_id",
            },
          );
        }
      }
    }

    return NextResponse.redirect(
      new URL("/ads?success=connected", request.url),
    );
  } catch (error) {
    console.error("FB Auth callback error:", error);
    return NextResponse.redirect(
      new URL(
        `/ads?error=${encodeURIComponent("Failed to connect Facebook account")}`,
        request.url,
      ),
    );
  }
}
