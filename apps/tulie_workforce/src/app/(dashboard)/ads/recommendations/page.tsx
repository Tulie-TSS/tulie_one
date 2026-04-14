"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/dialog";
import {
  RefreshCw,
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
} from "lucide-react";
import { toast } from "sonner";
import type { Recommendation, RecommendationStatus } from "@/types/fb-ads";

const typeConfig: Record<string, { icon: any; color: string; label: string }> =
  {
    increase_budget: {
      icon: TrendingUp,
      color: "bg-blue-100 text-blue-700",
      label: "Tăng Budget",
    },
    decrease_budget: {
      icon: TrendingDown,
      color: "bg-amber-100 text-amber-700",
      label: "Giảm Budget",
    },
    pause_campaign: {
      icon: Pause,
      color: "bg-red-100 text-red-700",
      label: "Tạm dừng",
    },
    resume_campaign: {
      icon: Play,
      color: "bg-emerald-100 text-emerald-700",
      label: "Khôi phục",
    },
    adjust_audience: {
      icon: Lightbulb,
      color: "bg-purple-100 text-purple-700",
      label: "Điều chỉnh Audience",
    },
    optimize_bid: {
      icon: Zap,
      color: "bg-cyan-100 text-cyan-700",
      label: "Tối ưu Bid",
    },
    create_new_creative: {
      icon: Sparkles,
      color: "bg-pink-100 text-pink-700",
      label: "Tạo Creative mới",
    },
    test_different_copy: {
      icon: Sparkles,
      color: "bg-orange-100 text-orange-700",
      label: "Test Copy mới",
    },
    lower_cpr_target: {
      icon: TrendingDown,
      color: "bg-amber-100 text-amber-700",
      label: "Giảm CPR Target",
    },
    raise_cpr_target: {
      icon: TrendingUp,
      color: "bg-blue-100 text-blue-700",
      label: "Tăng CPR Target",
    },
  };

const statusConfig: Record<RecommendationStatus, { color: string; icon: any }> =
  {
    pending: { color: "bg-amber-100 text-amber-700", icon: Clock },
    approved: { color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
    rejected: { color: "bg-red-100 text-red-700", icon: XCircle },
    executed: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
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
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
      });
      const result = await res.json();
      if (result.ai_insights) {
        setAiInsights(result.ai_insights);
      }
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
      const result = await res.json();
      if (res.ok) {
        setRecommendations((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status:
                    action === "approve"
                      ? "approved"
                      : action === "reject"
                        ? "rejected"
                        : "executed",
                }
              : r,
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

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">AI Recommendations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tự động phân tích và tối ưu chiến dịch quảng cáo
          </p>
        </div>
        <Button onClick={handleAnalyze} disabled={analyzing}>
          {analyzing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {analyzing ? "Analyzing..." : "Run AI Analysis"}
        </Button>
      </div>

      {aiInsights && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">AI Insights</p>
                <p className="text-sm mt-1 whitespace-pre-line">{aiInsights}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold">{pendingRecs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold">{approvedRecs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Executed</p>
            <p className="text-2xl font-bold">
              {recommendations.filter((r) => r.status === "executed").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Rejected</p>
            <p className="text-2xl font-bold">
              {recommendations.filter((r) => r.status === "rejected").length}
            </p>
          </CardContent>
        </Card>
      </div>

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

        <TabsContent value="pending" className="space-y-4">
          {pendingRecs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">
                  No pending recommendations
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Run AI analysis to generate recommendations
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingRecs.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onAction={handleAction}
                actionLoading={actionLoading === rec.id}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedRecs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">
                  No approved recommendations
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Approve pending recommendations to execute them
                </p>
              </CardContent>
            </Card>
          ) : (
            approvedRecs.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onAction={handleAction}
                actionLoading={actionLoading === rec.id}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {historyRecs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No history</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Executed and rejected recommendations will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            historyRecs.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onAction={handleAction}
                actionLoading={actionLoading === rec.id}
              />
            ))
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
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-lg flex items-center justify-center ${type.color}`}
            >
              <TypeIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{type.label}</CardTitle>
              <CardDescription className="mt-1">
                {recommendation.campaign?.name || "Unknown Campaign"}
              </CardDescription>
            </div>
          </div>
          <Badge className={status.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {recommendation.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
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
                variant="default"
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
              variant="default"
              size="sm"
              onClick={() => onAction(recommendation.id, "execute")}
              disabled={actionLoading}
            >
              <Play className="h-4 w-4 mr-1" />
              Execute Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
