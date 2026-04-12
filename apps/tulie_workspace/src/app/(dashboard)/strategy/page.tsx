"use client";

import { useLocaleStore } from "@/lib/stores/locale-store";
import {
  MOCK_DEALS,
  MOCK_MONTHLY_FINANCE,
  MOCK_HIRING_PLANS,
  MOCK_SALES_TARGETS,
  MOCK_CONTENT_CALENDAR,
  MOCK_MARKETING_METRICS,
  formatCurrency,
  getDealsByStage,
  getWeightedValue,
} from "@/lib/mock/strategy-data";
import {
  DEAL_STAGE_LABELS,
  HIRING_STATUS_LABELS,
  CONTENT_TYPE_LABELS,
  PLATFORM_LABELS,
  CONTENT_STATUS_LABELS,
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
} from "lucide-react";

export default function StrategyPage() {
  const { t, locale } = useLocaleStore();

  const dealsByStage = getDealsByStage(MOCK_DEALS);
  const weightedValue = getWeightedValue(MOCK_DEALS);
  const totalPipeline = MOCK_DEALS.reduce((sum, d) => sum + d.value, 0);
  const currentMonthFinance = MOCK_MONTHLY_FINANCE[0];
  const planningHiring = MOCK_HIRING_PLANS.filter(
    (h) => h.status === "planning",
  );

  const marketingSpend = MOCK_MARKETING_METRICS.filter(
    (m) => m.metric_name === "spend",
  ).reduce((sum, m) => sum + m.value, 0);
  const marketingLeads = MOCK_MARKETING_METRICS.filter(
    (m) => m.metric_name === "leads",
  ).reduce((sum, m) => sum + m.value, 0);

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
              {t("strategy.pipelineValue")}
            </span>
          </div>
          <div
            className="text-2xl font-semibold"
            style={{ color: "var(--color-fg)" }}
          >
            {formatCurrency(totalPipeline)}
          </div>
          <div
            className="text-sm mt-1"
            style={{ color: "var(--color-success)" }}
          >
            {t("strategy.weighted")}: {formatCurrency(weightedValue)}
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
              {t("strategy.hiring")}
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
            {t("strategy.positionsOpen")}
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
              {t("strategy.marketing")}
            </span>
          </div>
          <div
            className="text-2xl font-semibold"
            style={{ color: "var(--color-fg)" }}
          >
            {marketingLeads} {t("strategy.leads")}
          </div>
          <div
            className="text-sm mt-1"
            style={{ color: "var(--color-fg-tertiary)" }}
          >
            {formatCurrency(marketingSpend)} {t("strategy.spent")}
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
            <Briefcase
              className="size-5"
              style={{ color: "var(--color-info)" }}
            />
            <h2 className="font-semibold" style={{ color: "var(--color-fg)" }}>
              {t("strategy.dealsPipeline")}
            </h2>
          </div>
          <div className="space-y-3">
            {Object.entries(dealsByStage).map(([stage, deals]) => (
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
                    {deals.length} deals
                  </span>
                </div>
                <div className="space-y-2">
                  {deals.map((deal) => (
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
            {MOCK_SALES_TARGETS.slice(0, 6).map((target) => (
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
                        width: `${Math.min((target.actual_revenue / target.target_revenue) * 100, 100)}%`,
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
                    {formatCurrency(target.actual_revenue)}/
                    {formatCurrency(target.target_revenue)}
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
            {MOCK_HIRING_PLANS.map((plan) => (
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
            {MOCK_CONTENT_CALENDAR.slice(0, 5).map((item) => (
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
          {MOCK_MONTHLY_FINANCE.map((finance) => (
            <div
              key={finance.id}
              className="p-3 rounded-lg text-center"
              style={{ backgroundColor: "var(--color-surface)" }}
            >
              <div
                className="text-xs mb-1"
                style={{ color: "var(--color-fg-tertiary)" }}
              >
                {new Date(finance.month).toLocaleDateString(
                  locale === "vi" ? "vi-VN" : "en-US",
                  { month: "short" },
                )}
              </div>
              <div
                className="font-semibold text-sm"
                style={{
                  color:
                    finance.net_profit >= 0
                      ? "var(--color-success)"
                      : "var(--color-danger)",
                }}
              >
                {formatCurrency(finance.net_profit)}
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: "var(--color-fg-tertiary)" }}
              >
                {t("strategy.revenue")}: {formatCurrency(finance.revenue)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
