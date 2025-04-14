"use client";

import { useLocaleStore } from "@/lib/stores/locale-store";
import {
  useOKRs,
  useKPIs,
  useOKRPeriods,
  getOKRsByCategory,
  getKPIsByCategory,
  calculateKPIProgress,
  calculateKeyResultProgress,
} from "@/hooks/useOKR";
import {
  OKR_STATUS_LABELS,
  KPI_CATEGORY_LABELS,
  KPI_FREQUENCY_LABELS,
  METRIC_TYPE_LABELS,
} from "@/types/strategy.types";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { Badge } from "@repo/ui";
import { Progress } from "@repo/ui";
import {
  Target,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  Zap,
  Briefcase,
  GraduationCap,
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
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(0)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "sales":
      return <DollarSign className="h-4 w-4 text-emerald-600" />;
    case "marketing":
      return <TrendingUp className="h-4 w-4 text-blue-600" />;
    case "operations":
      return <CheckCircle2 className="h-4 w-4 text-amber-600" />;
    case "finance":
      return <BarChart3 className="h-4 w-4 text-purple-600" />;
    case "lab":
      return <GraduationCap className="h-4 w-4 text-pink-600" />;
    case "agency":
      return <Briefcase className="h-4 w-4 text-cyan-600" />;
    default:
      return <Target className="h-4 w-4 text-gray-600" />;
  }
}

function getCategoryColor(category: string): string {
  switch (category) {
    case "sales":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "marketing":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "operations":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "finance":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "lab":
      return "bg-pink-100 text-pink-700 border-pink-200";
    case "agency":
      return "bg-cyan-100 text-cyan-700 border-cyan-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function OKRStatusBadge({ status }: { status: string }) {
  const labels = OKR_STATUS_LABELS[
    status as keyof typeof OKR_STATUS_LABELS
  ] || { vi: status, en: status };
  return (
    <Badge variant="outline" className="text-xs">
      {labels.vi}
    </Badge>
  );
}

function KeyResultItem({ kr }: { kr: any }) {
  const progress = calculateKeyResultProgress(kr);

  const formatValue = (value: number, type: string) => {
    if (type === "currency") return formatCurrencyCompact(value);
    if (type === "percentage") return `${value}%`;
    if (type === "boolean") return value === 1 ? "✓" : "○";
    return formatNumber(value);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground truncate flex-1">
          {kr.title}
        </span>
        <span className="font-medium ml-2">
          {formatValue(kr.current_value, kr.metric_type)} /{" "}
          {formatValue(kr.target_value, kr.metric_type)}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}

function OKRCard({ okr }: { okr: any }) {
  const { locale } = useLocaleStore();
  const categoryLabels = KPI_CATEGORY_LABELS[
    okr.category as keyof typeof KPI_CATEGORY_LABELS
  ] || { vi: okr.category, en: okr.category };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {getCategoryIcon(okr.category)}
            <Badge
              variant="outline"
              className={`text-xs ${getCategoryColor(okr.category)}`}
            >
              {categoryLabels.vi}
            </Badge>
          </div>
          <OKRStatusBadge status={okr.status} />
        </div>
        <CardTitle className="text-base font-semibold mt-2 line-clamp-2">
          {okr.title}
        </CardTitle>
        {okr.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {okr.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tiến độ</span>
            <span className="font-semibold">
              {Math.round(okr.progress || 0)}%
            </span>
          </div>
          <Progress value={okr.progress || 0} className="h-2" />
        </div>

        {okr.key_results && okr.key_results.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground">
              Key Results ({okr.key_results.length})
            </p>
            {okr.key_results.slice(0, 3).map((kr: any) => (
              <KeyResultItem key={kr.id} kr={kr} />
            ))}
            {okr.key_results.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{okr.key_results.length - 3} more
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function KPICard({ kpi }: { kpi: any }) {
  const progress = calculateKPIProgress(kpi);
  const categoryLabels = KPI_CATEGORY_LABELS[
    kpi.category as keyof typeof KPI_CATEGORY_LABELS
  ] || { vi: kpi.category, en: kpi.category };

  const formatValue = (value: number, type: string) => {
    if (type === "currency") return formatCurrencyCompact(value);
    if (type === "percentage") return `${value}%`;
    if (type === "boolean") return value === 1 ? "✓" : "○";
    return formatNumber(value);
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
      <div className="flex items-center gap-3">
        {getCategoryIcon(kpi.category)}
        <div>
          <p className="font-medium text-sm">{kpi.name}</p>
          <p className="text-xs text-muted-foreground">
            Target: {formatValue(kpi.target_value, kpi.metric_type)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold">
          {formatValue(kpi.current_value, kpi.metric_type)}
        </p>
        <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}

export default function OKRPage() {
  const { t } = useLocaleStore();
  const { okrs, loading: okrsLoading } = useOKRs();
  const { kpis, loading: kpisLoading } = useKPIs();
  const { periods } = useOKRPeriods();

  const activePeriod = periods.find((p) => p.is_active);
  const okrsByCategory = getOKRsByCategory(okrs);
  const kpisByCategory = getKPIsByCategory(kpis);

  const activeOKRs = okrs.filter((o) => o.status === "active");
  const totalProgress =
    activeOKRs.length > 0
      ? activeOKRs.reduce((sum, o) => sum + (o.progress || 0), 0) /
        activeOKRs.length
      : 0;

  if (okrsLoading || kpisLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          OKR & KPI Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          {activePeriod ? `${activePeriod.name} • ` : ""}Theo dõi tiến độ theo
          chiến lược Lab + Agency
        </p>
      </div>

      {/* Overall Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              Overall OKR Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {Math.round(totalProgress)}%
            </div>
            <Progress value={totalProgress} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {activeOKRs.length} OKRs active
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Agency Target (Q2)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {formatCurrencyCompact(
                okrsByCategory.agency?.reduce((sum, o) => {
                  const revenueKR =
                    o.key_results
                      ?.filter(
                        (kr: any) =>
                          kr.unit === "VND" && kr.metric_type === "currency",
                      )
                      .reduce((s, kr: any) => s + (kr.current_value || 0), 0) ||
                    0;
                  return sum + revenueKR;
                }, 0),
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              / {formatCurrencyCompact(95000000)} target
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-pink-600" />
              Lab Target (Q2)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-600">
              {formatCurrencyCompact(
                okrsByCategory.lab?.reduce((sum, o) => {
                  const revenueKR =
                    o.key_results?.filter(
                      (kr: any) =>
                        kr.unit === "students" || kr.metric_type === "boolean",
                    ).length || 0;
                  return sum;
                }, 0),
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              50 students target Q2
            </p>
          </CardContent>
        </Card>
      </div>

      {/* OKRs by Category */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">OKRs by Category</h2>

        {/* Agency OKRs */}
        {okrsByCategory.agency && okrsByCategory.agency.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-cyan-600" />
              <h3 className="font-medium">Agency</h3>
              <Badge variant="secondary">{okrsByCategory.agency.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {okrsByCategory.agency.map((okr) => (
                <OKRCard key={okr.id} okr={okr} />
              ))}
            </div>
          </div>
        )}

        {/* Lab OKRs */}
        {okrsByCategory.lab && okrsByCategory.lab.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-pink-600" />
              <h3 className="font-medium">Lab</h3>
              <Badge variant="secondary">{okrsByCategory.lab.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {okrsByCategory.lab.map((okr) => (
                <OKRCard key={okr.id} okr={okr} />
              ))}
            </div>
          </div>
        )}

        {/* Operations OKRs */}
        {okrsByCategory.operations && okrsByCategory.operations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-amber-600" />
              <h3 className="font-medium">Operations</h3>
              <Badge variant="secondary">
                {okrsByCategory.operations.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {okrsByCategory.operations.map((okr) => (
                <OKRCard key={okr.id} okr={okr} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* KPIs by Category */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">KPIs</h2>

        {/* Sales KPIs */}
        {kpisByCategory.sales && kpisByCategory.sales.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                Sales KPIs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {kpisByCategory.sales.map((kpi) => (
                <KPICard key={kpi.id} kpi={kpi} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Lab KPIs */}
        {kpisByCategory.lab && kpisByCategory.lab.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-pink-600" />
                Lab KPIs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {kpisByCategory.lab.map((kpi) => (
                <KPICard key={kpi.id} kpi={kpi} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Marketing KPIs */}
        {kpisByCategory.marketing && kpisByCategory.marketing.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Marketing KPIs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {kpisByCategory.marketing.map((kpi) => (
                <KPICard key={kpi.id} kpi={kpi} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Operations KPIs */}
        {kpisByCategory.operations && kpisByCategory.operations.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-600" />
                Operations KPIs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {kpisByCategory.operations.map((kpi) => (
                <KPICard key={kpi.id} kpi={kpi} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Finance KPIs */}
        {kpisByCategory.finance && kpisByCategory.finance.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                Finance KPIs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {kpisByCategory.finance.map((kpi) => (
                <KPICard key={kpi.id} kpi={kpi} />
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Strategy Alignment Note */}
      <Card className="shadow-sm border-dashed">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium">Chiến lược Lab + Agency 2026</p>
              <p className="text-sm text-muted-foreground mt-1">
                OKRs/KPIs này được thiết kế để tracking tiến độ đạt target
                140M/tháng vào T12/2026. Revenue breakdown: Agency 90M + Lab 50M
                = 140M. Chi phí cố định: 49M/tháng (sinh hoạt 30M + tools 5M +
                office 5M + lãi nợ 9M).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
