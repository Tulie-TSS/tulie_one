"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/layouts/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { FbAdAccount, CampaignObjective } from "@/types/fb-ads";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

const campaignSchema = z.object({
  fb_ad_account_id: z.string().min(1, "Ad account is required"),
  name: z.string().min(1, "Campaign name is required"),
  objective: z.string() as z.ZodType<CampaignObjective>,
  daily_budget: z.number().min(0, "Budget must be positive"),
  lifetime_budget: z.number().optional(),
  cpr_target: z.number().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  tags: z.string().optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

export default function NewCampaignPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<FbAdAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAccounts, setFetchingAccounts] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      objective: "LEAD_GENERATION",
      daily_budget: 500000,
    },
  });

  const budget = watch("daily_budget");

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const res = await fetch("/api/fb/accounts");
      const { data } = await res.json();
      setAccounts(data || []);
      if (data?.length > 0) {
        setValue("fb_ad_account_id", data[0].id);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setFetchingAccounts(false);
    }
  }

  async function onSubmit(formData: CampaignFormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags
            ? formData.tags.split(",").map((t) => t.trim())
            : [],
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create campaign");
      }

      const { data } = await res.json();
      toast.success("Campaign created successfully");
      router.push(`/ads/campaigns/${data.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create campaign",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header title="New Campaign" />

      <main className="mx-auto max-w-3xl space-y-6 p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fetchingAccounts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : accounts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No Facebook ad accounts connected.</p>
                  <Button
                    variant="link"
                    onClick={() => router.push("/ads")}
                    className="mt-2"
                  >
                    Connect an account
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fb_ad_account_id">Ad Account</Label>
                    <Select
                      defaultValue={accounts[0]?.id}
                      onValueChange={(value) =>
                        setValue("fb_ad_account_id", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ad account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.fb_account_name || account.fb_account_id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.fb_ad_account_id && (
                      <p className="text-sm text-destructive">
                        {errors.fb_ad_account_id.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Campaign Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Lead Gen - Spring Sale 2026"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="objective">Objective</Label>
                    <Select
                      defaultValue="LEAD_GENERATION"
                      onValueChange={(value) =>
                        setValue("objective", value as CampaignObjective)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LEAD_GENERATION">
                          Lead Generation
                        </SelectItem>
                        <SelectItem value="CONVERSIONS">Conversions</SelectItem>
                        <SelectItem value="TRAFFIC">Traffic</SelectItem>
                        <SelectItem value="MESSAGES">Messages</SelectItem>
                        <SelectItem value="REACH">Reach</SelectItem>
                        <SelectItem value="BRAND_AWARENESS">
                          Brand Awareness
                        </SelectItem>
                        <SelectItem value="POST_ENGAGEMENT">
                          Post Engagement
                        </SelectItem>
                        <SelectItem value="VIDEO_VIEWS">Video Views</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget & Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Daily Budget: {budget?.toLocaleString()} VND</Label>
                <Slider
                  value={[budget || 500000]}
                  onValueChange={([value]) => setValue("daily_budget", value)}
                  min={50000}
                  max={100000000}
                  step={50000}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>50K</span>
                  <span>100M</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpr_target">Target CPR (optional)</Label>
                <Input
                  id="cpr_target"
                  type="number"
                  placeholder="150000"
                  {...register("cpr_target", { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  AI will optimize towards this cost per result
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    {...register("start_date")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date (optional)</Label>
                  <Input id="end_date" type="date" {...register("end_date")} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="e.g., summer, promotion, vietnam"
                  {...register("tags")}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading || fetchingAccounts}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Campaign
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </>
  );
}
