"use client";

import { useLocaleStore } from "@/lib/stores/locale-store";
import {
  useDeals,
  useFinance,
  useHiringPlans,
  useSalesTargets,
  useContentCalendar,
  useMarketingMetrics,
  useGrowthTargets,
  useProducts,
  useStrategyMilestones,
  useContentPillars,
  useSeoTargets,
  useMarketingChannels,
  getDealsByStage,
  getWeightedValue,
} from "@/hooks/useStrategyData";
import {
  DEAL_STAGE_LABELS,
  HIRING_STATUS_LABELS,
  CONTENT_TYPE_LABELS,
  PLATFORM_LABELS,
  CONTENT_STATUS_LABELS,
  MILESTONE_STATUS_LABELS,
  MILESTONE_PHASE_LABELS,
  PRODUCT_TYPE_LABELS,
  CONTENT_PILLAR_LABELS,
  CHANNEL_TYPE_LABELS,
} from "@/types/strategy.types";
import {
  TrendingUp,
  DollarSign,
  Users,
  Megaphone,
  Calendar,
  Target,
  Briefcase,
  PiggyBank,
  Flag,
  Package,
  BarChart3,
  Search,
  Zap,
} from "lucide-react";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrencyCompact(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
}

export default function StrategyPage() {
  const { t, locale } = useLocaleStore();

  const { deals } = useDeals();
  const { finance } = useFinance();
  const { hiringPlans } = useHiringPlans();
  const { salesTargets } = useSalesTargets();
  const { contentCalendar } = useContentCalendar();
  const { marketingMetrics } = useMarketingMetrics();
  const { growthTargets } = useGrowthTargets();
  const { products } = useProducts();
  const { milestones } = useStrategyMilestones();
  const { contentPillars } = useContentPillars();
  const { seoTargets } = useSeoTargets();
  const { marketingChannels } = useMarketingChannels();

  const dealsByStage = getDealsByStage(deals);
  const weightedValue = getWeightedValue(deals);
  const totalPipeline = deals.reduce((sum, d) => sum + d.value, 0);
  const currentMonthFinance = finance[0] ?? { net_profit: 0, revenue: 0 };
  const planningHiring = hiringPlans.filter((h) => h.status === "planning");

  const marketingSpend = marketingMetrics
    .filter((m) => m.metric_name === "spend")
    .reduce((sum, m) => sum + m.value, 0);
  const marketingLeads = marketingMetrics
    .filter((m) => m.metric_name === "leads")
    .reduce((sum, m) => sum + m.value, 0);

  const currentMrrTarget = growthTargets[0]?.mrr_target ?? 0;
  const currentMrrActual = growthTargets[0]?.mrr_actual ?? 0;

  const stageColors: Record<string, string> = {
    lead: "var(--color-surface)",
    prospecting: "var(--color-info-bg)",
    qualified: "var(--color-warning-bg)",
    meeting: "var(--color-success-bg)",
    proposal: "#fef3c7",
    negotiation: "#fce7f3",
    won: "var(--color-success-bg)",
    lost: "var(--color-danger-bg)",
  };

  const milestoneStatusColors: Record<string, string> = {
    pending: "var(--color-surface)",
    in_progress: "var(--color-info-bg)",
    completed: "var(--color-success-bg)",
    delayed: "var(--color-danger-bg)",
    cancelled: "var(--color-surface)",
  };

  const pillarColors: Record<string, string> = {
    showcase: "#3b82f6",
    educate: "#10b981",
    trust: "#f59e0b",
    convert: "#ef4444",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--color-fg)" }}
          >
            {t("strategy.title")}
          </h1>
          <p
            style={{
              color: "var(--color-fg-secondary)",
              fontSize: "var(--text-sm)",
            }}
          >
            {t("strategy.subtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: "var(--color-info-bg)" }}
            >
              <DollarSign
                className="size-5"
                style={{ color: "var(--color-info)" }}
              />
            </div>
            <span
              style={{
                color: "var(--color-fg-secondary)",
                fontSize: "var(--text-sm)",
              }}
            >
              MRR Target
            </span>
          </div>
          <div
            className="text-2xl font-semibold"
            style={{ color: "var(--color-fg)" }}
          >
            {formatCurrencyCompact(currentMrrTarget)}
          </div>
          {currentMrrActual > 0 && (
            <div
              className="text-sm mt-1"
              style={{ color: "var(--color-success)" }}
            >
              Actual: {formatCurrencyCompact(currentMrrActual)}
            </div>
          )}
        </div>

        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: "var(--color-success-bg)" }}
            >
              <PiggyBank
                className="size-5"
                style={{ color: "var(--color-success)" }}
              />
            </div>
            <span
              style={{
                color: "var(--color-fg-secondary)",
                fontSize: "var(--text-sm)",
              }}
            >
              {t("strategy.netProfit")}
            </span>
          </div>
          <div
            className="text-2xl font-semibold"
            style={{ color: "var(--color-fg)" }}
          >
            {formatCurrency(currentMonthFinance.net_profit)}
          </div>
          <div
            className="text-sm mt-1"
            style={{ color: "var(--color-fg-tertiary)" }}
          >
            {t("strategy.thisMonth")}
          </div>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: "var(--color-warning-bg)" }}
            >
              <Users
                className="size-5"
                style={{ color: "var(--color-warning)" }}
              />
            </div>
            <span
              style={{
                color: "var(--color-fg-secondary)",
                fontSize: "var(--text-sm)",
              }}
            >
              Hiring
            </span>
          </div>
          <div
            className="text-2xl font-semibold"
            style={{ color: "var(--color-fg)" }}
          >
            {planningHiring.length}
          </div>
          <div
            className="text-sm mt-1"
            style={{ color: "var(--color-fg-tertiary)" }}
          >
            positions open
          </div>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: "#f3e8ff" }}
            >
              <Megaphone className="size-5" style={{ color: "#9333ea" }} />
            </div>
            <span
              style={{
                color: "var(--color-fg-secondary)",
                fontSize: "var(--text-sm)",
              }}
            >
              Pipeline
            </span>
          </div>
          <div
            className="text-2xl font-semibold"
            style={{ color: "var(--color-fg)" }}
          >
            {formatCurrencyCompact(totalPipeline)}
          </div>
          <div
            className="text-sm mt-1"
            style={{ color: "var(--color-fg-tertiary)" }}
          >
            Weighted: {formatCurrencyCompact(weightedValue)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="p-5 rounded-lg"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Flag
              className="size-5"
              style={{ color: "var(--color-success)" }}
            />
            <h2 className="font-semibold" style={{ color: "var(--color-fg)" }}>
              Growth Targets (MRR)
            </h2>
          </div>
          <div className="space-y-2">
            {growthTargets.slice(0, 9).map((target) => {
              const progress = target.mrr_actual
                ? (target.mrr_actual / target.mrr_target) * 100
                : 0;
              return (
                <div key={target.id} className="flex items-center gap-3">
                  <div
                    className="w-12 text-xs"
                    style={{ color: "var(--color-fg-secondary)" }}
                  >
                    {new Date(target.month).toLocaleDateString("vi-VN", {
                      month: "short",
                    })}
                  </div>
                  <div className="flex-1">
                    <div
                      className="h-2 rounded-full"
                      style={{ backgroundColor: "var(--color-surface)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(progress, 100)}%`,
                          backgroundColor:
                            progress >= 100
                              ? "var(--color-success)"
                              : progress >= 50
                                ? "var(--color-warning)"
                                : "var(--color-info)",
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className="w-20 text-right text-xs"
                    style={{ color: "var(--color-fg)" }}
                  >
                    {formatCurrencyCompact(target.mrr_target)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="p-5 rounded-lg"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Package
              className="size-5"
              style={{ color: "var(--color-info)" }}
            />
            <h2 className="font-semibold" style={{ color: "var(--color-fg)" }}>
              Products & Pricing
            </h2>
          </div>
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="p-3 rounded-md flex items-center justify-between"
                style={{ backgroundColor: "var(--color-surface)" }}
              >
                <div>
                  <div
                    className="font-medium text-sm"
                    style={{ color: "var(--color-fg)" }}
                  >
                    {product.name}
                  </div>
                  <div
                    className="text-xs mt-1"
                    style={{ color: "var(--color-fg-tertiary)" }}
                  >
                    {PRODUCT_TYPE_LABELS[product.service_type]?.[locale] ||
                      product.service_type}
                    {product.features && Array.isArray(product.features) && (
                      <span> · {product.features.length} features</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="font-semibold text-sm"
                    style={{ color: "var(--color-success)" }}
                  >
                    {product.price_min && product.price_max
                      ? `${formatCurrencyCompact(product.price_min)} - ${formatCurrencyCompact(product.price_max)}`
                      : product.price_min
                        ? `from ${formatCurrencyCompact(product.price_min)}`
                        : "-"}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--color-fg-tertiary)" }}
                  >
                    /
                    {product.price_unit === "monthly"
                      ? "th"
                      : product.price_unit === "yearly"
                        ? "yr"
                        : "one-time"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="p-5 rounded-lg"
        style={{
          backgroundColor: "var(--color-bg)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap className="size-5" style={{ color: "var(--color-warning)" }} />
          <h2 className="font-semibold" style={{ color: "var(--color-fg)" }}>
            Strategy Milestones
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {milestones.slice(0, 16).map((milestone) => (
            <div
              key={milestone.id}
              className="p-2 rounded-md text-center"
              style={{
                backgroundColor:
                  milestoneStatusColors[milestone.status] ||
                  "var(--color-surface)",
              }}
              title={`${milestone.name} - ${MILESTONE_STATUS_LABELS[milestone.status][locale]} (${MILESTONE_PHASE_LABELS[milestone.phase][locale]})`}
            >
              <div
                className="text-xs font-medium truncate"
                style={{ color: "var(--color-fg)" }}
              >
                {milestone.name}
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--color-fg-tertiary)" }}
              >
                {new Date(milestone.target_date).toLocaleDateString("vi-VN", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="p-5 rounded-lg"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3
              className="size-5"
              style={{ color: "var(--color-info)" }}
            />
            <h2 className="font-semibold" style={{ color: "var(--color-fg)" }}>
              Content Pillars
            </h2>
          </div>
          <div className="space-y-3">
            {contentPillars.map((pillar) => (
              <div key={pillar.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          pillarColors[pillar.pillar_type] ||
                          "var(--color-info)",
                      }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--color-fg)" }}
                    >
                      {CONTENT_PILLAR_LABELS[pillar.pillar_type]?.[locale] ||
                        pillar.name}
                    </span>
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-fg)" }}
                  >
                    {pillar.percentage}%
                  </span>
                </div>
                <div
                  className="h-2 rounded-full"
                  style={{ backgroundColor: "var(--color-surface)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pillar.percentage}%`,
                      backgroundColor:
                        pillarColors[pillar.pillar_type] || "var(--color-info)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="p-5 rounded-lg"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Search
              className="size-5"
              style={{ color: "var(--color-success)" }}
            />
            <h2 className="font-semibold" style={{ color: "var(--color-fg)" }}>
              SEO Keywords
            </h2>
          </div>
          <div className="space-y-2">
            {seoTargets.slice(0, 8).map((seo) => (
              <div
                key={seo.id}
                className="flex items-center justify-between p-2 rounded-md"
                style={{ backgroundColor: "var(--color-surface)" }}
              >
                <div className="flex-1">
                  <div
                    className="text-sm font-medium"
                    style={{ color: "var(--color-fg)" }}
                  >
                    {seo.keyword}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--color-fg-tertiary)" }}
                  >
                    {seo.monthly_searches?.toLocaleString()} searches
                    {seo.difficulty && ` · ${seo.difficulty}`}
                  </div>
                </div>
                <div className="text-right">
                  {seo.current_rank ? (
                    <span
                      className="text-sm font-semibold"
                      style={{
                        color:
                          seo.current_rank <= 10
                            ? "var(--color-success)"
                            : seo.current_rank <= 20
                              ? "var(--color-warning)"
                              : "var(--color-fg-tertiary)",
                      }}
                    >
                      #{seo.current_rank}
                    </span>
                  ) : (
                    <span
                      className="text-xs"
                      style={{ color: "var(--color-fg-tertiary)" }}
                    >
                      Not ranked
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="p-5 rounded-lg"
        style={{
          backgroundColor: "var(--color-bg)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp
            className="size-5"
            style={{ color: "var(--color-success)" }}
          />
          <h2 className="font-semibold" style={{ color: "var(--color-fg)" }}>
            Marketing Channels (CAC & LTV)
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {marketingChannels.map((channel) => (
            <div
              key={channel.id}
              className="p-3 rounded-lg"
              style={{ backgroundColor: "var(--color-surface)" }}
            >
              <div
                className="font-medium text-sm mb-2"
                style={{ color: "var(--color-fg)" }}
              >
                {CHANNEL_TYPE_LABELS[channel.channel_type]?.[locale] ||
                  channel.channel_name}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--color-fg-tertiary)" }}>
                    Target CAC:
                  </span>
                  <span
                    className="font-medium"
                    style={{ color: "var(--color-fg)" }}
                  >
                    {channel.cac_target
                      ? formatCurrencyCompact(channel.cac_target)
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--color-fg-tertiary)" }}>
                    Target LTV:
                  </span>
                  <span
                    className="font-medium"
                    style={{ color: "var(--color-fg)" }}
                  >
                    {channel.ltv_target
                      ? formatCurrencyCompact(channel.ltv_target)
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--color-fg-tertiary)" }}>
                    LTV:CAC:
                  </span>
                  <span
                    className="font-medium"
                    style={{
                      color:
                        (channel.ltv_cac_ratio_target ?? 0) >= 3
                          ? "var(--color-success)"
                          : "var(--color-warning)",
                    }}
                  >
                    {channel.ltv_cac_ratio_target
                      ? `${channel.ltv_cac_ratio_target}:1`
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="p-5 rounded-lg"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Briefcase
              className="size-5"
              style={{ color: "var(--color-info)" }}
            />
            <h2 className="font-semibold" style={{ color: "var(--color-fg)" }}>
              {t("strategy.dealsPipeline")}
            </h2>
          </div>
          <div className="space-y-3">
            {Object.entries(dealsByStage)
              .filter(([_, deals]) => deals.length > 0)
              .map(([stage, stageDeals]) => (
                <div key={stage}>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--color-fg-secondary)" }}
                    >
                      {DEAL_STAGE_LABELS[
                        stage as keyof typeof DEAL_STAGE_LABELS
                      ]?.[locale] || stage}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: "var(--color-fg-tertiary)" }}
                    >
                      {stageDeals.length} deals
                    </span>
                  </div>
                  <div className="space-y-2">
                    {stageDeals.slice(0, 3).map((deal) => (
                      <div
                        key={deal.id}
                        className="p-3 rounded-md"
                        style={{
                          backgroundColor:
                            stageColors[stage] || "var(--color-surface)",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="font-medium text-sm"
                            style={{ color: "var(--color-fg)" }}
                          >
                            {deal.name}
                          </span>
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "var(--color-success)" }}
                          >
                            {formatCurrency(deal.value)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span
                            className="text-xs"
                            style={{ color: "var(--color-fg-tertiary)" }}
                          >
                            {deal.company}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "var(--color-fg-tertiary)" }}
                          >
                            {deal.probability}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div
          className="p-5 rounded-lg"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Target
              className="size-5"
              style={{ color: "var(--color-success)" }}
            />
            <h2 className="font-semibold" style={{ color: "var(--color-fg)" }}>
              {t("strategy.salesTargets")}
            </h2>
          </div>
          <div className="space-y-3">
            {salesTargets.slice(0, 6).map((target) => (
              <div key={target.id} className="flex items-center gap-4">
                <div
                  className="w-16 text-sm"
                  style={{ color: "var(--color-fg-secondary)" }}
                >
                  {new Date(target.month).toLocaleDateString(
                    locale === "vi" ? "vi-VN" : "en-US",
                    { month: "short", year: "2-digit" },
                  )}
                </div>
                <div className="flex-1">
                  <div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: "var(--color-surface)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(((target.actual_revenue ?? 0) / target.target_revenue) * 100, 100)}%`,
                        backgroundColor: "var(--color-success)",
                      }}
                    />
                  </div>
                </div>
                <div className="w-24 text-right">
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-fg)" }}
                  >
                    {formatCurrencyCompact(target.actual_revenue ?? 0)}/
                    {formatCurrencyCompact(target.target_revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="p-5 rounded-lg"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Users
              className="size-5"
              style={{ color: "var(--color-warning)" }}
            />
            <h2 className="font-semibold" style={{ color: "var(--color-fg)" }}>
              {t("strategy.hiringPlans")}
            </h2>
          </div>
          <div className="space-y-3">
            {hiringPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-3 rounded-md flex items-center justify-between"
                style={{ backgroundColor: "var(--color-surface)" }}
              >
                <div>
                  <div
                    className="font-medium text-sm"
                    style={{ color: "var(--color-fg)" }}
                  >
                    {plan.position}
                  </div>
                  <div
                    className="text-xs mt-1"
                    style={{ color: "var(--color-fg-tertiary)" }}
                  >
                    {new Date(plan.target_start_month).toLocaleDateString(
                      locale === "vi" ? "vi-VN" : "en-US",
                      { month: "long", year: "numeric" },
                    )}
                    {plan.salary_range_min !== null &&
                      plan.salary_range_max !== null &&
                      plan.salary_range_min > 0 && (
                        <>
                          {" "}
                          · {formatCurrency(plan.salary_range_min)} -{" "}
                          {formatCurrency(plan.salary_range_max)}
                        </>
                      )}
                  </div>
                </div>
                <span
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor:
                      plan.priority === "high"
                        ? "var(--color-danger-bg)"
                        : "var(--color-info-bg)",
                    color:
                      plan.priority === "high"
                        ? "var(--color-danger)"
                        : "var(--color-info)",
                  }}
                >
                  {HIRING_STATUS_LABELS[plan.status][locale]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="p-5 rounded-lg"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar
              className="size-5"
              style={{ color: "var(--color-info)" }}
            />
            <h2 className="font-semibold" style={{ color: "var(--color-fg)" }}>
              {t("strategy.contentCalendar")}
            </h2>
          </div>
          <div className="space-y-3">
            {contentCalendar.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-md flex items-center justify-between"
                style={{ backgroundColor: "var(--color-surface)" }}
              >
                <div className="flex-1">
                  <div
                    className="font-medium text-sm"
                    style={{ color: "var(--color-fg)" }}
                  >
                    {item.topic}
                  </div>
                  <div
                    className="text-xs mt-1"
                    style={{ color: "var(--color-fg-tertiary)" }}
                  >
                    {new Date(item.planned_date).toLocaleDateString(
                      locale === "vi" ? "vi-VN" : "en-US",
                      { month: "short", day: "numeric" },
                    )}
                    {" · "}
                    {CONTENT_TYPE_LABELS[item.content_type]?.[locale] ||
                      item.content_type}
                    {" · "}
                    {PLATFORM_LABELS[item.platform]?.[locale] || item.platform}
                  </div>
                </div>
                <span
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor:
                      item.status === "planned"
                        ? "var(--color-info-bg)"
                        : "var(--color-warning-bg)",
                    color:
                      item.status === "planned"
                        ? "var(--color-info)"
                        : "var(--color-warning)",
                  }}
                >
                  {CONTENT_STATUS_LABELS[item.status][locale]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="p-5 rounded-lg"
        style={{
          backgroundColor: "var(--color-bg)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp
            className="size-5"
            style={{ color: "var(--color-success)" }}
          />
          <h2 className="font-semibold" style={{ color: "var(--color-fg)" }}>
            {t("strategy.monthlyFinance")}
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-3">
          {finance.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg text-center"
              style={{ backgroundColor: "var(--color-surface)" }}
            >
              <div
                className="text-xs mb-1"
                style={{ color: "var(--color-fg-tertiary)" }}
              >
                {new Date(item.month).toLocaleDateString(
                  locale === "vi" ? "vi-VN" : "en-US",
                  { month: "short" },
                )}
              </div>
              <div
                className="font-semibold text-sm"
                style={{
                  color:
                    item.net_profit >= 0
                      ? "var(--color-success)"
                      : "var(--color-danger)",
                }}
              >
                {formatCurrency(item.net_profit)}
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: "var(--color-fg-tertiary)" }}
              >
                {t("strategy.revenue")}: {formatCurrency(item.revenue)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
