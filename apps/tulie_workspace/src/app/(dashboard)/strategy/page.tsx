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
import {
  PageHeader, Card, CardContent, CardHeader, CardTitle,
  StatGrid, StatCard, Badge, Progress,
} from "@repo/ui";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrencyCompact(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
}

function SectionIcon({ icon: Icon, className }: { icon: React.ComponentType<{ className?: string }>; className?: string }) {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
      <Icon className={`size-4 ${className || 'text-muted-foreground'}`} />
    </div>
  );
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

  const currentMrrTarget = growthTargets[0]?.mrr_target ?? 0;
  const currentMrrActual = growthTargets[0]?.mrr_actual ?? 0;

  const pillarColors: Record<string, string> = {
    showcase: "bg-foreground",
    educate: "bg-foreground/80",
    trust: "bg-foreground/60",
    convert: "bg-foreground/40",
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("strategy.title")} description={t("strategy.subtitle")} />

      {/* KPI Stats */}
      <StatGrid>
        <StatCard
          title="MRR Target"
          value={formatCurrencyCompact(currentMrrTarget)}
          description={currentMrrActual > 0 ? `Actual: ${formatCurrencyCompact(currentMrrActual)}` : undefined}
        />
        <StatCard
          title={t("strategy.netProfit")}
          value={formatCurrency(currentMonthFinance.net_profit)}
          footer={t("strategy.thisMonth")}
        />
        <StatCard
          title="Hiring"
          value={planningHiring.length}
          footer="positions open"
        />
        <StatCard
          title="Pipeline"
          value={formatCurrencyCompact(totalPipeline)}
          footer={`Weighted: ${formatCurrencyCompact(weightedValue)}`}
        />
      </StatGrid>

      {/* Growth Targets & Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SectionIcon icon={Flag} className="text-foreground" />
              <CardTitle className="text-base">Growth Targets (MRR)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {growthTargets.slice(0, 9).map((target) => {
              const progress = target.mrr_actual ? (target.mrr_actual / target.mrr_target) * 100 : 0;
              return (
                <div key={target.id} className="flex items-center gap-3">
                  <div className="w-12 text-xs text-muted-foreground">
                    {new Date(target.month).toLocaleDateString("vi-VN", { month: "short" })}
                  </div>
                  <Progress
                    value={Math.min(progress, 100)}
                    className={`flex-1 h-2 ${progress >= 100 ? '[&>div]:bg-emerald-500' : progress >= 50 ? '[&>div]:bg-amber-500' : ''}`}
                  />
                  <div className="w-20 text-right text-xs font-medium">
                    {formatCurrencyCompact(target.mrr_target)}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SectionIcon icon={Package} className="text-foreground" />
              <CardTitle className="text-base">Products & Pricing</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {products.map((product) => (
              <div key={product.id} className="p-3 rounded-md bg-muted/50 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{product.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {PRODUCT_TYPE_LABELS[product.service_type]?.[locale] || product.service_type}
                    {product.features && Array.isArray(product.features) && (
                      <span> · {product.features.length} features</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm text-foreground font-semibold">
                    {product.price_min && product.price_max
                      ? `${formatCurrencyCompact(product.price_min)} - ${formatCurrencyCompact(product.price_max)}`
                      : product.price_min
                        ? `from ${formatCurrencyCompact(product.price_min)}`
                        : "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    /{product.price_unit === "monthly" ? "th" : product.price_unit === "yearly" ? "yr" : "one-time"}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Strategy Milestones */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SectionIcon icon={Zap} className="text-foreground/80" />
            <CardTitle className="text-base">Strategy Milestones</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {milestones.slice(0, 16).map((milestone) => (
              <div
                key={milestone.id}
                className={`p-2 rounded-md text-center ${
                  milestone.status === 'completed' ? 'bg-muted' :
                  milestone.status === 'in_progress' ? 'bg-muted/80' :
                  milestone.status === 'delayed' ? 'bg-destructive/10' : 'bg-muted/50'
                }`}
                title={`${milestone.name} - ${MILESTONE_STATUS_LABELS[milestone.status][locale]} (${MILESTONE_PHASE_LABELS[milestone.phase][locale]})`}
              >
                <div className="text-xs font-medium truncate">{milestone.name}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(milestone.target_date).toLocaleDateString("vi-VN", { month: "short", day: "numeric" })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Pillars & SEO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SectionIcon icon={BarChart3} className="text-foreground" />
              <CardTitle className="text-base">Content Pillars</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {contentPillars.map((pillar) => (
              <div key={pillar.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${pillarColors[pillar.pillar_type] || 'bg-primary'}`} />
                    <span className="text-sm font-medium">
                      {CONTENT_PILLAR_LABELS[pillar.pillar_type]?.[locale] || pillar.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">{pillar.percentage}%</span>
                </div>
                <Progress value={pillar.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SectionIcon icon={Search} className="text-foreground" />
              <CardTitle className="text-base">SEO Keywords</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {seoTargets.slice(0, 8).map((seo) => (
              <div key={seo.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <div className="flex-1">
                  <div className="text-sm font-medium">{seo.keyword}</div>
                  <div className="text-xs text-muted-foreground">
                    {seo.monthly_searches?.toLocaleString()} searches
                    {seo.difficulty && ` · ${seo.difficulty}`}
                  </div>
                </div>
                <div className="text-right">
                  {seo.current_rank ? (
                    <Badge variant={seo.current_rank <= 10 ? 'default' : seo.current_rank <= 20 ? 'secondary' : 'outline'} className="text-xs">
                      #{seo.current_rank}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not ranked</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Marketing Channels */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SectionIcon icon={TrendingUp} className="text-foreground" />
            <CardTitle className="text-base">Marketing Channels (CAC & LTV)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {marketingChannels.map((channel) => (
              <div key={channel.id} className="p-3 rounded-lg bg-muted/50">
                <div className="font-medium text-sm mb-2">
                  {CHANNEL_TYPE_LABELS[channel.channel_type]?.[locale] || channel.channel_name}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Target CAC:</span>
                    <span className="font-medium">{channel.cac_target ? formatCurrencyCompact(channel.cac_target) : "-"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Target LTV:</span>
                    <span className="font-medium">{channel.ltv_target ? formatCurrencyCompact(channel.ltv_target) : "-"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">LTV:CAC:</span>
                    <span className={`font-medium ${(channel.ltv_cac_ratio_target ?? 0) >= 3 ? 'text-foreground font-semibold' : 'text-amber-600 dark:text-amber-400'}`}>
                      {channel.ltv_cac_ratio_target ? `${channel.ltv_cac_ratio_target}:1` : "-"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deals Pipeline & Sales Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SectionIcon icon={Briefcase} className="text-foreground" />
              <CardTitle className="text-base">{t("strategy.dealsPipeline")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(dealsByStage)
              .filter(([_, deals]) => deals.length > 0)
              .map(([stage, stageDeals]) => (
                <div key={stage}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {DEAL_STAGE_LABELS[stage as keyof typeof DEAL_STAGE_LABELS]?.[locale] || stage}
                    </span>
                    <Badge variant="secondary" className="text-xs">{stageDeals.length} deals</Badge>
                  </div>
                  <div className="space-y-2">
                    {stageDeals.slice(0, 3).map((deal) => (
                      <div key={deal.id} className="p-3 rounded-md bg-muted/50">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{deal.name}</span>
                          <span className="text-sm font-semibold text-foreground font-semibold">
                            {formatCurrency(deal.value)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">{deal.company}</span>
                          <span className="text-xs text-muted-foreground">{deal.probability}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SectionIcon icon={Target} className="text-foreground" />
              <CardTitle className="text-base">{t("strategy.salesTargets")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {salesTargets.slice(0, 6).map((target) => (
              <div key={target.id} className="flex items-center gap-4">
                <div className="w-16 text-sm text-muted-foreground">
                  {new Date(target.month).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { month: "short", year: "2-digit" })}
                </div>
                <Progress
                  value={Math.min(((target.actual_revenue ?? 0) / target.target_revenue) * 100, 100)}
                  className="flex-1 h-2 [&>div]:bg-emerald-500"
                />
                <div className="w-24 text-right text-sm font-medium">
                  {formatCurrencyCompact(target.actual_revenue ?? 0)}/{formatCurrencyCompact(target.target_revenue)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Hiring & Content Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SectionIcon icon={Users} className="text-foreground/80" />
              <CardTitle className="text-base">{t("strategy.hiringPlans")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {hiringPlans.map((plan) => (
              <div key={plan.id} className="p-3 rounded-md bg-muted/50 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{plan.position}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(plan.target_start_month).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { month: "long", year: "numeric" })}
                    {plan.salary_range_min !== null && plan.salary_range_max !== null && plan.salary_range_min > 0 && (
                      <> · {formatCurrency(plan.salary_range_min)} - {formatCurrency(plan.salary_range_max)}</>
                    )}
                  </div>
                </div>
                <Badge variant={plan.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                  {HIRING_STATUS_LABELS[plan.status][locale]}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SectionIcon icon={Calendar} className="text-foreground" />
              <CardTitle className="text-base">{t("strategy.contentCalendar")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {contentCalendar.slice(0, 5).map((item) => (
              <div key={item.id} className="p-3 rounded-md bg-muted/50 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.topic}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(item.planned_date).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { month: "short", day: "numeric" })}
                    {" · "}
                    {CONTENT_TYPE_LABELS[item.content_type]?.[locale] || item.content_type}
                    {" · "}
                    {PLATFORM_LABELS[item.platform]?.[locale] || item.platform}
                  </div>
                </div>
                <Badge variant={item.status === "planned" ? "default" : "secondary"} className="text-xs">
                  {CONTENT_STATUS_LABELS[item.status][locale]}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Finance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SectionIcon icon={TrendingUp} className="text-foreground" />
            <CardTitle className="text-base">{t("strategy.monthlyFinance")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-3">
            {finance.map((item) => (
              <div key={item.id} className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  {new Date(item.month).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { month: "short" })}
                </div>
                <div className={`font-semibold text-sm ${item.net_profit >= 0 ? 'text-foreground font-semibold' : 'text-destructive'}`}>
                  {formatCurrency(item.net_profit)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t("strategy.revenue")}: {formatCurrency(item.revenue)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
