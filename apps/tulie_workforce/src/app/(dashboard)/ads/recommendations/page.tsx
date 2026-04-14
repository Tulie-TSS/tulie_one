"use client";

import { useEffect, useState } from "react";
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Pause,
  Lightbulb,
  Loader2,
  Sparkles,
  Zap,
  Brain,
} from "lucide-react";
import {
  Button,
  Card,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  PageHeader,
  StatCard,
  StatGrid,
  EmptyState,
} from "@repo/ui";
import { toast } from "sonner";
import type { Recommendation, RecommendationStatus } from "@/types/fb-ads";

const typeConfig: Record<
  string,
  { icon: typeof TrendingUp; color: string; label: string }
> = {
  increase_budget: {
    icon: TrendingUp,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    label: "Tăng Budget",
  },
  decrease_budget: {
    icon: TrendingDown,
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    label: "Giảm Budget",
  },
  pause_campaign: {
    icon: Pause,
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    label: "Tạm dừng",
  },
  resume_campaign: {
    icon: Play,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    label: "Khôi phục",
  },
  adjust_audience: {
    icon: Lightbulb,
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    label: "Điều chỉnh Audience",
  },
  optimize_bid: {
    icon: Zap,
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    label: "Tối ưu Bid",
  },
  create_new_creative: {
    icon: Sparkles,
    color: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    label: "Tạo Creative mới",
  },
  test_different_copy: {
    icon: Sparkles,
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    label: "Test Copy mới",
  },
  lower_cpr_target: {
    icon: TrendingDown,
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    label: "Giảm CPR Target",
  },
  raise_cpr_target: {
    icon: TrendingUp,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    label: "Tăng CPR Target",
  },
};

const statusConfig: Record<
  RecommendationStatus,
  { color: string; icon: typeof Clock }
> = {
  pending: {
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: Clock,
  },
  approved: {
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: CheckCircle2,
  },
  rejected: {
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    icon: XCircle,
  },
  executed: {
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: CheckCircle2,
  },
};

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  async function fetchRecommendations() {
    try {
      const res = await fetch("/api/recommendations");
      const { data } = await res.json();
      setRecommendations(data || []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast.error("Failed to fetch recommendations");
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/ai/analyze", { method: "POST" });
      const result = await res.json();
      if (result.ai_insights) setAiInsights(result.ai_insights);
      if (result.recommendations) {
        setRecommendations((prev) => [...result.recommendations, ...prev]);
      }
      toast.success(
        `Generated ${result.recommendations?.length || 0} recommendations`,
      );
    } catch (error) {
      console.error("Error analyzing:", error);
      toast.error("Failed to analyze campaigns");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleAction(
    id: string,
    action: "approve" | "reject" | "execute",
  ) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/recommendations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const statusMap = {
          approve: "approved",
          reject: "rejected",
          execute: "executed",
        } as const;
        setRecommendations((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, status: statusMap[action] } : r,
          ),
        );
        toast.success(
          action === "approve"
            ? "Recommendation approved"
            : action === "reject"
              ? "Recommendation rejected"
              : "Recommendation executed",
        );
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Failed to ${action} recommendation`);
    } finally {
      setActionLoading(null);
    }
  }

  const pendingRecs = recommendations.filter((r) => r.status === "pending");
  const approvedRecs = recommendations.filter((r) => r.status === "approved");
  const historyRecs = recommendations.filter(
    (r) => r.status === "executed" || r.status === "rejected",
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader
          title="AI Recommendations"
          description="Tự động phân tích và tối ưu chiến dịch quảng cáo"
        />
        <StatGrid>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse" />
          ))}
        </StatGrid>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="AI Recommendations"
        description="Tự động phân tích và tối ưu chiến dịch quảng cáo"
      >
        <Button onClick={handleAnalyze} disabled={analyzing}>
          {analyzing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {analyzing ? "Analyzing..." : "Run AI Analysis"}
        </Button>
      </PageHeader>

      {aiInsights && (
        <Card className="border-primary/20 bg-primary/5">
          <Card.Content className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">AI Insights</p>
                <p className="text-sm mt-1 whitespace-pre-line">{aiInsights}</p>
              </div>
            </div>
          </Card.Content>
        </Card>
      )}

      <StatGrid>
        <StatCard
          title="Pending"
          value={pendingRecs.length}
          footer="Awaiting approval"
        />
        <StatCard
          title="Approved"
          value={approvedRecs.length}
          footer="Ready to execute"
        />
        <StatCard
          title="Executed"
          value={recommendations.filter((r) => r.status === "executed").length}
          footer="Successfully run"
        />
        <StatCard
          title="Rejected"
          value={recommendations.filter((r) => r.status === "rejected").length}
          footer="Dismissed"
        />
      </StatGrid>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingRecs.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedRecs.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            History ({historyRecs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingRecs.length === 0 ? (
            <EmptyState
              icon={Brain}
              title="No pending recommendations"
              description="Run AI analysis to generate recommendations for your campaigns"
            >
              <Button onClick={handleAnalyze}>
                <Sparkles className="h-4 w-4 mr-2" />
                Run AI Analysis
              </Button>
            </EmptyState>
          ) : (
            <div className="grid gap-4">
              {pendingRecs.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onAction={handleAction}
                  actionLoading={actionLoading === rec.id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved">
          {approvedRecs.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No approved recommendations"
              description="Approve pending recommendations to execute them"
            />
          ) : (
            <div className="grid gap-4">
              {approvedRecs.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onAction={handleAction}
                  actionLoading={actionLoading === rec.id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {historyRecs.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No history"
              description="Executed and rejected recommendations will appear here"
            />
          ) : (
            <div className="grid gap-4">
              {historyRecs.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onAction={handleAction}
                  actionLoading={actionLoading === rec.id}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RecommendationCard({
  recommendation,
  onAction,
  actionLoading,
}: {
  recommendation: Recommendation;
  onAction: (id: string, action: "approve" | "reject" | "execute") => void;
  actionLoading: boolean;
}) {
  const type = typeConfig[recommendation.type] || typeConfig.adjust_audience;
  const status = statusConfig[recommendation.status];
  const TypeIcon = type.icon;
  const StatusIcon = status.icon;

  return (
    <Card className="hover:border-primary/20 transition-colors">
      <Card.Header className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`h-10 w-10 rounded-lg flex items-center justify-center border ${type.color}`}
            >
              <TypeIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{type.label}</p>
              <p className="text-sm text-muted-foreground">
                {recommendation.campaign?.name || "Unknown Campaign"}
              </p>
            </div>
          </div>
          <Badge className={status.color} variant="outline">
            <StatusIcon className="h-3 w-3 mr-1" />
            {recommendation.status}
          </Badge>
        </div>
      </Card.Header>
      <Card.Content>
        <p className="text-sm text-muted-foreground mb-4">
          {recommendation.reason}
        </p>

        {recommendation.details &&
          Object.keys(recommendation.details).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(recommendation.details).map(([key, value]) => (
                <Badge key={key} variant="outline" className="text-xs">
                  {key}:{" "}
                  {typeof value === "number"
                    ? value.toLocaleString("vi-VN")
                    : String(value)}
                </Badge>
              ))}
            </div>
          )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {new Date(recommendation.created_at).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {recommendation.is_auto_exec && (
              <Badge variant="outline" className="text-xs ml-2">
                Auto-exec
              </Badge>
            )}
          </div>

          {recommendation.status === "pending" && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction(recommendation.id, "reject")}
                disabled={actionLoading}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => onAction(recommendation.id, "approve")}
                disabled={actionLoading}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </div>
          )}

          {recommendation.status === "approved" && (
            <Button
              size="sm"
              onClick={() => onAction(recommendation.id, "execute")}
              disabled={actionLoading}
            >
              <Play className="h-4 w-4 mr-1" />
              Execute Now
            </Button>
          )}
        </div>
      </Card.Content>
    </Card>
  );
}
