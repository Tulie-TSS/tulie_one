import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import type { RecommendationType } from "@/types/fb-ads";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface MetricData {
  campaign_id: string;
  campaign_name: string;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  results: number;
  cpr: number;
  frequency: number;
  daily_budget: number;
  cpr_target: number;
}

function calculateRecommendations(
  metrics: MetricData[],
  aiSettings: {
    max_budget_increase_percent: number;
    max_budget_decrease_percent: number;
    cpr_threshold_multiplier: number;
  },
): Array<{
  campaign_id: string;
  type: RecommendationType;
  reason: string;
  details: Record<string, unknown>;
  priority: number;
  is_auto_exec: boolean;
}> {
  const recommendations: Array<{
    campaign_id: string;
    type: RecommendationType;
    reason: string;
    details: Record<string, unknown>;
    priority: number;
    is_auto_exec: boolean;
  }> = [];

  for (const m of metrics) {
    const threshold = m.cpr_target * aiSettings.cpr_threshold_multiplier;

    if (m.cpr > threshold && m.cpr > 0) {
      const overBudgetBy = m.cpr / m.cpr_target;
      recommendations.push({
        campaign_id: m.campaign_id,
        type: "increase_budget",
        reason: `CPR hiện tại (${m.cpr.toLocaleString()}đ) cao hơn target (${m.cpr_target.toLocaleString()}đ) ${((overBudgetBy - 1) * 100).toFixed(0)}%. Cần tối ưu audience hoặc tăng budget để cải thiện hiệu suất.`,
        details: {
          current_cpr: m.cpr,
          target_cpr: m.cpr_target,
          current_budget: m.daily_budget,
          suggested_budget: Math.min(
            m.daily_budget * (1 + aiSettings.max_budget_increase_percent / 100),
            m.daily_budget * 1.5,
          ),
        },
        priority: Math.min(Math.floor((overBudgetBy - 1) * 10), 10),
        is_auto_exec: overBudgetBy < 1.3,
      });
    }

    if (m.cpr > 0 && m.cpr < m.cpr_target * 0.7) {
      recommendations.push({
        campaign_id: m.campaign_id,
        type: "decrease_budget",
        reason: `CPR rất tốt (${m.cpr.toLocaleString()}đ), thấp hơn target ${((1 - m.cpr / m.cpr_target) * 100).toFixed(0)}%. Có thể giảm budget để tối ưu chi phí.`,
        details: {
          current_cpr: m.cpr,
          target_cpr: m.cpr_target,
          current_budget: m.daily_budget,
          suggested_budget: Math.max(
            m.daily_budget * (1 - aiSettings.max_budget_decrease_percent / 100),
            m.daily_budget * 0.5,
          ),
        },
        priority: 3,
        is_auto_exec: true,
      });
    }

    if (m.frequency > 4) {
      recommendations.push({
        campaign_id: m.campaign_id,
        type: "adjust_audience",
        reason: `Frequency cao (${m.frequency.toFixed(1)}x) - khán giả đã quá mức. Cần mở rộng audience hoặc tạo creatives mới.`,
        details: {
          current_frequency: m.frequency,
          suggested_action: "expand_audience_or_new_creative",
        },
        priority: 7,
        is_auto_exec: false,
      });
    }

    if (m.ctr > 0 && m.ctr < 1) {
      recommendations.push({
        campaign_id: m.campaign_id,
        type: "create_new_creative",
        reason: `CTR thấp (${m.ctr.toFixed(2)}%) - creative hiện tại không hấp dẫn. Cần A/B test với creatives mới.`,
        details: {
          current_ctr: m.ctr,
          suggested_action: "test_new_creative",
        },
        priority: 6,
        is_auto_exec: false,
      });
    }

    if (m.impressions > 1000 && m.results === 0) {
      recommendations.push({
        campaign_id: m.campaign_id,
        type: "pause_campaign",
        reason: `Campaign chạy nhưng không có kết quả nào sau ${m.impressions.toLocaleString()} impressions. Cần pause và đánh giá lại.`,
        details: {
          impressions: m.impressions,
          results: m.results,
        },
        priority: 9,
        is_auto_exec: false,
      });
    }
  }

  return recommendations;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", userData.user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json(
        { error: "User has no organization" },
        { status: 400 },
      );
    }

    const { data: aiSettings } = await supabase
      .from("ai_settings")
      .select("*")
      .eq("organization_id", profile.organization_id)
      .single();

    const defaultSettings = {
      max_budget_increase_percent: 20,
      max_budget_decrease_percent: 50,
      cpr_threshold_multiplier: 1.5,
    };

    const settings = aiSettings || defaultSettings;

    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("id, name, daily_budget, cpr_target, status")
      .eq("status", "active");

    if (!campaigns || campaigns.length === 0) {
      return NextResponse.json({
        message: "No active campaigns to analyze",
        recommendations: [],
      });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: metrics } = await supabase
      .from("campaign_metrics")
      .select(
        "campaign_id, date, spent, impressions, clicks, ctr, cpc, results, cpr, frequency",
      )
      .in(
        "campaign_id",
        campaigns.map((c) => c.id),
      )
      .gte("date", thirtyDaysAgo.toISOString().split("T")[0]);

    const campaignMetricsMap = new Map<string, MetricData>();
    for (const c of campaigns) {
      campaignMetricsMap.set(c.id, {
        campaign_id: c.id,
        campaign_name: c.name,
        spent: 0,
        impressions: 0,
        clicks: 0,
        ctr: 0,
        cpc: 0,
        results: 0,
        cpr: 0,
        frequency: 0,
        daily_budget: c.daily_budget,
        cpr_target: c.cpr_target,
      });
    }

    if (metrics) {
      for (const m of metrics) {
        const existing = campaignMetricsMap.get(m.campaign_id);
        if (existing) {
          existing.spent += Number(m.spent) || 0;
          existing.impressions += Number(m.impressions) || 0;
          existing.clicks += Number(m.clicks) || 0;
          existing.results += Number(m.results) || 0;
          if (m.ctr) existing.ctr = (existing.ctr + Number(m.ctr)) / 2;
          if (m.cpr) existing.cpr = (existing.cpr + Number(m.cpr)) / 2;
          if (m.frequency)
            existing.frequency = Math.max(
              existing.frequency,
              Number(m.frequency),
            );
        }
      }
    }

    const metricsArray = Array.from(campaignMetricsMap.values());
    const recommendations = calculateRecommendations(metricsArray, settings);

    const insertedRecommendations = [];
    for (const rec of recommendations) {
      const { data, error } = await supabase
        .from("recommendations")
        .insert({
          campaign_id: rec.campaign_id,
          organization_id: profile.organization_id,
          type: rec.type,
          reason: rec.reason,
          details: rec.details,
          priority: rec.priority,
          is_auto_exec: settings.auto_execution_enabled
            ? rec.is_auto_exec
            : false,
          created_by: userData.user.id,
        })
        .select()
        .single();

      if (!error && data) {
        insertedRecommendations.push(data);
      }
    }

    if (openai.apiKey) {
      try {
        const summaryPrompt = `Phân tích data sau từ Facebook Ads campaigns và đưa ra insights ngắn gọn:

${metricsArray
  .map(
    (m) => `
Campaign: ${m.campaign_name}
- Spend: ${m.spent.toLocaleString()}đ
- Impressions: ${m.impressions.toLocaleString()}
- CTR: ${m.ctr.toFixed(2)}%
- CPR: ${m.cpr.toLocaleString()}đ
- Frequency: ${m.frequency.toFixed(1)}x
`,
  )
  .join("\n")}

Hãy đưa ra 3-5 insights ngắn gọn bằng tiếng Việt về hiệu suất các campaigns này.`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: summaryPrompt }],
          max_tokens: 500,
        });

        const aiInsights = completion.choices[0]?.message?.content || "";

        return NextResponse.json({
          recommendations: insertedRecommendations,
          ai_insights: aiInsights,
          analyzed_campaigns: metricsArray.length,
        });
      } catch (aiError) {
        console.error("OpenAI error:", aiError);
        return NextResponse.json({
          recommendations: insertedRecommendations,
          analyzed_campaigns: metricsArray.length,
        });
      }
    }

    return NextResponse.json({
      recommendations: insertedRecommendations,
      analyzed_campaigns: metricsArray.length,
    });
  } catch (error) {
    console.error("Error in AI analyze:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
