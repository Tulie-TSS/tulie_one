"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui";
import { StatCard, StatGrid } from "@repo/ui";
import { Badge } from "@repo/ui";
import { Button } from "@repo/ui";
import { Progress } from "@repo/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui";
import { cn } from "@/lib/utils";
import {
  formatVND,
  formatNumber,
  getPlatformColor,
  getPlatformName,
  getStatusColor,
  getSeverityColor,
  mockCampaigns,
  mockAlerts,
  mockAgentActions,
  mockAccounts,
  getPlatformStats,
} from "@/lib/ads-data";
import type {
  AdPlatform,
  UnifiedCampaign,
  AdAlert,
  AgentAction,
} from "@/lib/ads-data";
import {
  Facebook,
  Search,
  Music,
  Plus,
  RefreshCw,
  MoreHorizontal,
  Pause,
  Play,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Bot,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  MousePointerClick,
  DollarSign,
  Target,
  BarChart3,
  Settings,
  ExternalLink,
} from "lucide-react";

const platforms: AdPlatform[] = ["facebook", "google", "tiktok"];

const PlatformIcon = ({
  platform,
  className,
  style,
}: {
  platform: AdPlatform;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const iconClass = cn("h-4 w-4", className);
  switch (platform) {
    case "facebook":
      return <Facebook className={iconClass} style={style} />;
    case "google":
      return <Search className={iconClass} style={style} />;
    case "tiktok":
      return <Music className={iconClass} style={style} />;
  }
};

export default function AdsPage() {
  const [selectedPlatform, setSelectedPlatform] =
    useState<AdPlatform>("facebook");
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "campaigns" | "alerts" | "actions"
  >("overview");

  const currentStats = getPlatformStats(selectedPlatform);

  function toggleCampaign(id: string) {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "active" ? "paused" : "active" }
          : c,
      ),
    );
  }

  const unreadAlerts = mockAlerts.filter((a) => !a.is_read).length;
  const pendingActions = mockAgentActions.filter(
    (a) => a.status === "pending_approval",
  ).length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Ads Manager
            </h1>
            <p className="text-sm text-muted-foreground">
              Quản lý chiến dịch quảng cáo đa nền tảng
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Cài đặt
            </Button>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Tạo chiến dịch
            </Button>
          </div>
        </div>
      </div>

      {/* Platform Selector */}
      <div className="flex gap-2">
        {platforms.map((platform) => {
          const stats = getPlatformStats(platform);
          const isConnected = mockAccounts.some((a) => a.platform === platform);
          return (
            <Card
              key={platform}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50",
                selectedPlatform === platform && "border-primary bg-primary/5",
              )}
              onClick={() => setSelectedPlatform(platform)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: getPlatformColor(platform) + "20",
                    }}
                  >
                    <PlatformIcon
                      platform={platform}
                      className="h-5 w-5"
                      style={{ color: getPlatformColor(platform) }}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {getPlatformName(platform)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stats.active_campaigns}/{stats.total_campaigns} chiến
                      dịch
                    </p>
                  </div>
                  {!isConnected && (
                    <Badge variant="destructive" className="ml-2">
                      Chưa kết nối
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Chiến dịch Active"
          value={currentStats.active_campaigns}
          footer={`/ ${currentStats.total_campaigns} tổng cộng`}
        />
        <StatCard
          title="Tổng chi tiêu"
          value={formatVND(currentStats.total_spent)}
        />
        <StatCard
          title="Kết quả"
          value={formatNumber(currentStats.total_results)}
          footer={`CPR TB: ${formatVND(Math.round(currentStats.avg_cpr))}`}
        />
        <StatCard
          title="Impressions"
          value={formatNumber(currentStats.impressions)}
        />
        <StatCard
          title="Cảnh báo"
          value={currentStats.alerts}
          className={currentStats.alerts > 0 ? "border-destructive/50" : ""}
        />
      </div>

      {/* Tabs */}
      <Tabs
        value={selectedTab}
        onValueChange={(v) => setSelectedTab(v as typeof selectedTab)}
      >
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="campaigns">Chiến dịch</TabsTrigger>
          <TabsTrigger value="alerts">
            Cảnh báo
            {unreadAlerts > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 h-5 w-5 rounded-full p-0 text-[10px]"
              >
                {unreadAlerts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="actions">
            AI Actions
            {pendingActions > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 w-5 rounded-full p-0 text-[10px]"
              >
                {pendingActions}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab
            platform={selectedPlatform}
            campaigns={campaigns.filter((c) => c.platform === selectedPlatform)}
          />
        </TabsContent>

        <TabsContent value="campaigns" className="mt-4">
          <CampaignsTab
            campaigns={campaigns.filter((c) => c.platform === selectedPlatform)}
            onToggle={toggleCampaign}
          />
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <AlertsTab
            alerts={mockAlerts.filter((a) => a.platform === selectedPlatform)}
          />
        </TabsContent>

        <TabsContent value="actions" className="mt-4">
          <ActionsTab
            actions={mockAgentActions.filter(
              (a) => a.platform === selectedPlatform,
            )}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================
// Overview Tab
// ============================================

function OverviewTab({
  platform,
  campaigns,
}: {
  platform: AdPlatform;
  campaigns: UnifiedCampaign[];
}) {
  const topCampaigns = [...campaigns]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalResults = campaigns.reduce((sum, c) => sum + c.results, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Top Campaigns by Spend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Chiến dịch hàng đầu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topCampaigns.map((campaign, index) => {
            const spendPct =
              totalSpent > 0 ? (campaign.spent / totalSpent) * 100 : 0;
            return (
              <div key={campaign.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-4">
                      {index + 1}
                    </span>
                    <span className="font-medium truncate max-w-[200px]">
                      {campaign.name}
                    </span>
                  </div>
                  <span className="font-medium">
                    {formatVND(campaign.spent)}
                  </span>
                </div>
                <Progress value={spendPct} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{campaign.results} results</span>
                  <span>{spendPct.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Hiệu suất tổng quan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">CTR trung bình</p>
              <p className="text-2xl font-semibold">
                {(
                  campaigns.reduce((sum, c) => sum + c.ctr, 0) /
                    campaigns.length || 0
                ).toFixed(2)}
                %
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">CPC trung bình</p>
              <p className="text-2xl font-semibold">
                {formatVND(
                  Math.round(
                    campaigns.reduce((sum, c) => sum + c.cpc, 0) /
                      campaigns.length || 0,
                  ),
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">CPR trung bình</p>
              <p className="text-2xl font-semibold">
                {formatVND(Math.round(totalSpent / totalResults || 0))}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Tỷ lệ chuyển đổi</p>
              <p className="text-2xl font-semibold">
                {(
                  (totalResults /
                    campaigns.reduce((sum, c) => sum + c.clicks, 0)) *
                    100 || 0
                ).toFixed(2)}
                %
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Campaigns Tab
// ============================================

function CampaignsTab({
  campaigns,
  onToggle,
}: {
  campaigns: UnifiedCampaign[];
  onToggle: (id: string) => void;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Chiến dịch</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Ngân sách</TableHead>
              <TableHead className="text-right">Chi tiêu</TableHead>
              <TableHead className="text-right">Results</TableHead>
              <TableHead className="text-right">CPR</TableHead>
              <TableHead className="text-right">CTR</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{campaign.name}</p>
                    <div className="flex gap-1">
                      {campaign.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[10px] h-5"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      campaign.status === "active" ? "default" : "secondary"
                    }
                    className={cn(
                      campaign.status === "active" && "bg-emerald-500",
                      campaign.status === "paused" && "bg-amber-500",
                    )}
                  >
                    {campaign.status === "active" ? "Active" : campaign.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatVND(campaign.daily_budget)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatVND(campaign.spent)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {campaign.results}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={cn(
                      "font-medium",
                      campaign.cpr > campaign.cpr_target &&
                        campaign.cpr_target > 0 &&
                        "text-red-500",
                    )}
                  >
                    {formatVND(Math.round(campaign.cpr))}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {campaign.ctr.toFixed(2)}%
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onToggle(campaign.id)}>
                        {campaign.status === "active" ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" /> Tạm dừng
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" /> Bật lại
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <BarChart3 className="mr-2 h-4 w-4" /> Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" /> Chỉnh sửa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ============================================
// Alerts Tab
// ============================================

function AlertsTab({ alerts }: { alerts: AdAlert[] }) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Không có cảnh báo nào</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Card
          key={alert.id}
          className={cn(!alert.is_read && "border-l-4 border-l-destructive")}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "mt-0.5 h-2 w-2 rounded-full shrink-0",
                  getSeverityColor(alert.severity),
                )}
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{alert.campaign_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(alert.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
                {alert.action_taken && (
                  <Badge
                    variant="outline"
                    className="mt-2 bg-emerald-50 text-emerald-700 border-emerald-200"
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    {alert.action_taken}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================
// Actions Tab
// ============================================

function ActionsTab({ actions }: { actions: AgentAction[] }) {
  if (actions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bot className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Không có AI action nào</p>
        </CardContent>
      </Card>
    );
  }

  const pending = actions.filter((a) => a.status === "pending_approval");
  const executed = actions.filter((a) => a.status === "executed");
  const rejected = actions.filter((a) => a.status === "rejected");

  const getActionIcon = (status: AgentAction["status"]) => {
    switch (status) {
      case "executed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "pending_approval":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getActionBadge = (status: AgentAction["status"]) => {
    switch (status) {
      case "executed":
        return (
          <Badge className="bg-emerald-100 text-emerald-700">
            Đã thực hiện
          </Badge>
        );
      case "pending_approval":
        return <Badge className="bg-amber-100 text-amber-700">Chờ duyệt</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700">Từ chối</Badge>;
    }
  };

  const getActionLabel = (action: AgentAction["action"]) => {
    const labels: Record<AgentAction["action"], string> = {
      pause_campaign: "Tạm dừng chiến dịch",
      increase_budget: "Tăng ngân sách",
      decrease_budget: "Giảm ngân sách",
      adjust_audience: "Điều chỉnh audience",
      create_alert: "Tạo cảnh báo",
      optimize_bid: "Tối ưu bid",
    };
    return labels[action];
  };

  return (
    <div className="space-y-6">
      {/* Pending Actions */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Chờ phê duyệt
          </h3>
          {pending.map((action) => (
            <Card key={action.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">
                        {getActionLabel(action.action)}
                      </p>
                      {getActionBadge(action.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {action.campaign_name}
                    </p>
                    <p className="text-sm text-foreground/80">
                      {action.reason}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Phê duyệt
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <XCircle className="h-4 w-4" />
                        Từ chối
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Executed Actions */}
      {executed.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Đã thực hiện
          </h3>
          {executed.map((action) => (
            <Card key={action.id} className="opacity-75">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    {getActionIcon(action.status)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">
                        {getActionLabel(action.action)}
                      </p>
                      {getActionBadge(action.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {action.campaign_name}
                    </p>
                    <p className="text-sm text-foreground/70">
                      {action.reason}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
