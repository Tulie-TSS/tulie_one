"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layouts/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatVND } from "@/lib/fb-ads-data";
import { Campaign, FbAdAccount } from "@/types/fb-ads";
import {
  Plus,
  RefreshCw,
  Play,
  Pause,
  MoreHorizontal,
  Trash2,
  Copy,
  BarChart3,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [accounts, setAccounts] = useState<FbAdAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccountId) {
      fetchCampaigns(selectedAccountId);
    }
  }, [selectedAccountId]);

  async function fetchAccounts() {
    try {
      const res = await fetch("/api/fb/accounts");
      const { data } = await res.json();
      setAccounts(data || []);
      if (data?.length > 0) {
        setSelectedAccountId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCampaigns(accountId: string) {
    try {
      const res = await fetch(`/api/campaigns?account_id=${accountId}`);
      const { data } = await res.json();
      setCampaigns(data || []);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  }

  async function handleStatusChange(
    campaignId: string,
    newStatus: "active" | "paused",
  ) {
    try {
      await fetch(`/api/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaignId ? { ...c, status: newStatus } : c,
        ),
      );
    } catch (error) {
      console.error("Error updating campaign:", error);
    }
  }

  async function handleDelete(campaignId: string) {
    try {
      await fetch(`/api/campaigns/${campaignId}`, {
        method: "DELETE",
      });
      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting campaign:", error);
    }
  }

  async function handleDuplicate(campaignId: string) {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fb_ad_account_id: campaign.fb_ad_account_id,
          name: `${campaign.name} (Copy)`,
          objective: campaign.objective,
          daily_budget: campaign.daily_budget,
          lifetime_budget: campaign.lifetime_budget,
          cpr_target: campaign.cpr_target,
          start_date: campaign.start_date,
          end_date: campaign.end_date,
          tags: campaign.tags,
        }),
      });
      const { data } = await res.json();
      if (data) {
        setCampaigns((prev) => [data, ...prev]);
      }
    } catch (error) {
      console.error("Error duplicating campaign:", error);
    }
  }

  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const totalSpent = 0;
  const totalLeads = 0;

  return (
    <>
      <Header title="Campaigns" />

      <main className="mx-auto max-w-[1600px] space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Campaigns</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Quản lý chiến dịch quảng cáo Facebook
            </p>
          </div>
          <Button onClick={() => router.push("/ads/campaigns/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>

        {accounts.length > 0 && (
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Ad Account:</span>
            <select
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={selectedAccountId || ""}
              onChange={(e) => setSelectedAccountId(e.target.value)}
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.fb_account_name || account.fb_account_id}
                </option>
              ))}
            </select>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{activeCampaigns.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{campaigns.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Spend</p>
              <p className="text-2xl font-bold">{formatVND(totalSpent)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Leads</p>
              <p className="text-2xl font-bold">{totalLeads}</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : campaigns.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No campaigns yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first campaign to get started
              </p>
              <Button
                className="mt-4"
                onClick={() => router.push("/ads/campaigns/new")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onStatusChange={handleStatusChange}
                onDelete={() => setDeleteId(campaign.id)}
                onDuplicate={() => handleDuplicate(campaign.id)}
                onEdit={() => router.push(`/ads/campaigns/${campaign.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this campaign? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function CampaignCard({
  campaign,
  onStatusChange,
  onDelete,
  onDuplicate,
  onEdit,
}: {
  campaign: Campaign;
  onStatusChange: (id: string, status: "active" | "paused") => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
}) {
  const statusColors = {
    active: "bg-emerald-100 text-emerald-700",
    paused: "bg-amber-100 text-amber-700",
    draft: "bg-muted text-muted-foreground",
    completed: "bg-blue-100 text-blue-700",
    error: "bg-red-100 text-red-700",
  };

  return (
    <Card className="hover:border-primary/20 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                campaign.status === "active"
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-muted"
              }`}
            />
            <CardTitle className="text-lg">{campaign.name}</CardTitle>
          </div>
          <Badge className={statusColors[campaign.status]}>
            {campaign.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span>{campaign.objective.replace("_", " ")}</span>
          {campaign.fb_campaign_id && (
            <>
              <span className="text-muted-foreground/50">|</span>
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                {campaign.fb_campaign_id}
              </code>
            </>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {campaign.status === "active" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusChange(campaign.id, "paused")}
              >
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusChange(campaign.id, "active")}
              >
                <Play className="h-4 w-4 mr-1" />
                Activate
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onEdit}>
              Edit
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
