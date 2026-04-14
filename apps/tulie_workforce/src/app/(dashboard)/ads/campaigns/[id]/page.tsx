"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/layouts/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Campaign, AdSet, Ad, CampaignObjective } from "@/types/fb-ads";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Play,
  Pause,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

const adsetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  daily_budget: z.number().min(0),
  targeting_age_min: z.number().min(18).max(65),
  targeting_age_max: z.number().min(18).max(65),
  targeting_gender: z.string(),
  targeting_locations: z.string(),
});

type AdSetFormData = z.infer<typeof adsetSchema>;

const adSchema = z.object({
  name: z.string().min(1, "Name is required"),
  creative_type: z.string(),
  body: z.string().min(1, "Body text is required"),
  title: z.string().optional(),
  image_url: z.string().optional(),
  call_to_action_type: z.string().optional(),
});

type AdFormData = z.infer<typeof adSchema>;

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [adSets, setAdSets] = useState<AdSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCampaign, setEditingCampaign] = useState(false);
  const [creatingAdset, setCreatingAdset] = useState(false);
  const [creatingAd, setCreatingAd] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const campaignForm = useForm<{
    name: string;
    objective: CampaignObjective;
    daily_budget: number;
    cpr_target: number;
  }>({
    defaultValues: {
      daily_budget: 0,
      cpr_target: 0,
    },
  });

  const adsetForm = useForm<AdSetFormData>({
    resolver: zodResolver(adsetSchema),
    defaultValues: {
      daily_budget: 200000,
      targeting_age_min: 25,
      targeting_age_max: 55,
      targeting_gender: "all",
      targeting_locations: "VN",
    },
  });

  const adForm = useForm<AdFormData>({
    resolver: zodResolver(adSchema),
    defaultValues: {
      creative_type: "image",
      body: "",
      title: "",
      image_url: "",
      call_to_action_type: "LEAD_FORM",
    },
  });

  useEffect(() => {
    if (params.id) {
      fetchCampaign(params.id as string);
    }
  }, [params.id]);

  async function fetchCampaign(id: string) {
    try {
      const res = await fetch(`/api/campaigns/${id}`);
      const { data } = await res.json();
      setCampaign(data);
      setAdSets(data?.ad_sets || []);
      campaignForm.reset({
        name: data?.name || "",
        objective: data?.objective || "LEAD_GENERATION",
        daily_budget: data?.daily_budget || 0,
        cpr_target: data?.cpr_target || 0,
      });
    } catch (error) {
      console.error("Error fetching campaign:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCampaignUpdate(formData: {
    name: string;
    objective: CampaignObjective;
    daily_budget: number;
    cpr_target: number;
  }) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/campaigns/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Campaign updated");
      setEditingCampaign(false);
      fetchCampaign(params.id as string);
    } catch (error) {
      toast.error("Failed to update campaign");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAdsetSubmit(formData: AdSetFormData) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/adsets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: params.id,
          name: formData.name,
          daily_budget: formData.daily_budget,
          targeting: {
            age_min: formData.targeting_age_min,
            age_max: formData.targeting_age_max,
            genders:
              formData.targeting_gender === "all"
                ? [0]
                : formData.targeting_gender === "male"
                  ? [1]
                  : [2],
            geo_locations: formData.targeting_locations
              .split(",")
              .map((l) => l.trim()),
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to create ad set");
      toast.success("Ad set created");
      setCreatingAdset(false);
      adsetForm.reset();
      fetchCampaign(params.id as string);
    } catch (error) {
      toast.error("Failed to create ad set");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAdSubmit(formData: AdFormData) {
    if (!creatingAd) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adset_id: creatingAd,
          name: formData.name,
          creative_type: formData.creative_type,
          creative_data: {
            body: formData.body,
            title: formData.title,
            image_url: formData.image_url,
            call_to_action: formData.call_to_action_type
              ? {
                  type: formData.call_to_action_type,
                  value: {},
                }
              : undefined,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to create ad");
      toast.success("Ad created");
      setCreatingAd(null);
      adForm.reset();
      fetchCampaign(params.id as string);
    } catch (error) {
      toast.error("Failed to create ad");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(
    type: "campaign" | "adset" | "ad",
    id: string,
    status: "active" | "paused",
  ) {
    try {
      const endpoint =
        type === "campaign"
          ? `/api/campaigns/${id}`
          : type === "adset"
            ? `/api/adsets/${id}`
            : `/api/ads/${id}`;
      await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      toast.success(`${type} ${status === "active" ? "activated" : "paused"}`);
      fetchCampaign(params.id as string);
    } catch (error) {
      toast.error(`Failed to update ${type}`);
    }
  }

  async function handleDelete(type: "campaign" | "adset" | "ad", id: string) {
    try {
      const endpoint =
        type === "campaign"
          ? `/api/campaigns/${id}`
          : type === "adset"
            ? `/api/adsets/${id}`
            : `/api/ads/${id}`;
      await fetch(endpoint, { method: "DELETE" });
      toast.success(`${type} deleted`);
      if (type === "campaign") {
        router.push("/ads/campaigns");
      } else {
        fetchCampaign(params.id as string);
      }
    } catch (error) {
      toast.error(`Failed to delete ${type}`);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg font-medium">Campaign not found</p>
        <Button onClick={() => router.push("/ads/campaigns")} className="mt-4">
          Back to Campaigns
        </Button>
      </div>
    );
  }

  return (
    <>
      <Header title={campaign.name} />

      <main className="mx-auto max-w-[1600px] space-y-6 p-6">
        <Button variant="ghost" onClick={() => router.push("/ads/campaigns")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge
              className={
                campaign.status === "active"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-muted text-muted-foreground"
              }
            >
              {campaign.status}
            </Badge>
            <span className="text-muted-foreground">
              {campaign.objective.replace("_", " ")}
            </span>
            {campaign.fb_campaign_id && (
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                {campaign.fb_campaign_id}
              </code>
            )}
          </div>
          <div className="flex items-center gap-2">
            {campaign.status === "active" ? (
              <Button
                variant="outline"
                onClick={() =>
                  handleStatusChange("campaign", campaign.id, "paused")
                }
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() =>
                  handleStatusChange("campaign", campaign.id, "active")
                }
              >
                <Play className="h-4 w-4 mr-2" />
                Activate
              </Button>
            )}
            <Button variant="outline" onClick={() => setEditingCampaign(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete("campaign", campaign.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Daily Budget</p>
              <p className="text-xl font-bold">
                {campaign.daily_budget.toLocaleString()} VND
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Target CPR</p>
              <p className="text-xl font-bold">
                {campaign.cpr_target
                  ? `${campaign.cpr_target.toLocaleString()} VND`
                  : "—"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Ad Sets</p>
              <p className="text-xl font-bold">{adSets.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Ads</p>
              <p className="text-xl font-bold">
                {adSets.reduce((sum, as) => sum + (as.ads?.length || 0), 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ad Sets</CardTitle>
            <Dialog open={creatingAdset} onOpenChange={setCreatingAdset}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Ad Set
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Ad Set</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={adsetForm.handleSubmit(handleAdsetSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      {...adsetForm.register("name")}
                      placeholder="e.g., Targeting 25-35, Hanoi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Daily Budget:{" "}
                      {adsetForm.watch("daily_budget").toLocaleString()} VND
                    </Label>
                    <Slider
                      {...adsetForm.register("daily_budget", {
                        valueAsNumber: true,
                      })}
                      defaultValue={[200000]}
                      min={50000}
                      max={50000000}
                      step={10000}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Age Min</Label>
                      <Input
                        type="number"
                        {...adsetForm.register("targeting_age_min", {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Age Max</Label>
                      <Input
                        type="number"
                        {...adsetForm.register("targeting_age_max", {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select
                      defaultValue="all"
                      onValueChange={(v) =>
                        adsetForm.setValue("targeting_gender", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Locations (comma separated country codes)</Label>
                    <Input
                      {...adsetForm.register("targeting_locations")}
                      placeholder="VN, TH, MY"
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button type="submit" disabled={submitting}>
                      {submitting && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Create
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreatingAdset(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {adSets.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No ad sets yet. Create one to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {adSets.map((adset) => (
                  <AdSetCard
                    key={adset.id}
                    adset={adset}
                    onStatusChange={(status) =>
                      handleStatusChange("adset", adset.id, status)
                    }
                    onDelete={() => handleDelete("adset", adset.id)}
                    onAddAd={() => setCreatingAd(adset.id)}
                    creatingAd={creatingAd === adset.id}
                    onAdSubmit={handleAdSubmit}
                    onCloseAd={() => setCreatingAd(null)}
                    adForm={adForm}
                    submitting={submitting}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={editingCampaign} onOpenChange={setEditingCampaign}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={campaignForm.handleSubmit(handleCampaignUpdate)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...campaignForm.register("name")} />
            </div>
            <div className="space-y-2">
              <Label>Objective</Label>
              <Select
                defaultValue={campaign.objective}
                onValueChange={(v) =>
                  campaignForm.setValue("objective", v as CampaignObjective)
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
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                Daily Budget:{" "}
                {campaignForm.watch("daily_budget").toLocaleString()} VND
              </Label>
              <Slider
                {...campaignForm.register("daily_budget", {
                  valueAsNumber: true,
                })}
                defaultValue={[campaign.daily_budget]}
                min={50000}
                max={100000000}
                step={50000}
              />
            </div>
            <div className="space-y-2">
              <Label>Target CPR</Label>
              <Input
                type="number"
                {...campaignForm.register("cpr_target", {
                  valueAsNumber: true,
                })}
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={submitting}>
                {submitting && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingCampaign(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AdSetCard({
  adset,
  onStatusChange,
  onDelete,
  onAddAd,
  creatingAd,
  onAdSubmit,
  onCloseAd,
  adForm,
  submitting,
}: {
  adset: AdSet;
  onStatusChange: (status: "active" | "paused") => void;
  onDelete: () => void;
  onAddAd: () => void;
  creatingAd: boolean;
  onAdSubmit: (data: z.infer<typeof adSchema>) => void;
  onCloseAd: () => void;
  adForm: ReturnType<typeof useForm<AdFormData>>;
  submitting: boolean;
}) {
  const [showAdForm, setShowAdForm] = useState(false);

  useEffect(() => {
    if (creatingAd) {
      setShowAdForm(true);
    }
  }, [creatingAd]);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-medium flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                adset.status === "active" ? "bg-emerald-500" : "bg-muted"
              }`}
            />
            {adset.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            Budget: {adset.daily_budget.toLocaleString()} VND/day
          </p>
          <p className="text-sm text-muted-foreground">
            Targeting: Age {adset.targeting?.age_min || 18}-
            {adset.targeting?.age_max || 65}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {adset.status === "active" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange("paused")}
            >
              <Pause className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange("active")}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">
            Ads ({adset.ads?.length || 0})
          </span>
          <Button variant="outline" size="sm" onClick={onAddAd}>
            <Plus className="h-4 w-4 mr-1" />
            New Ad
          </Button>
        </div>

        {showAdForm && (
          <form
            onSubmit={adForm.handleSubmit(onAdSubmit)}
            className="space-y-3 p-4 bg-muted/50 rounded-lg mb-3"
          >
            <div className="space-y-2">
              <Label>Ad Name</Label>
              <Input {...adForm.register("name")} placeholder="Ad name" />
            </div>
            <div className="space-y-2">
              <Label>Body Text</Label>
              <Textarea
                {...adForm.register("body")}
                placeholder="Write your ad copy..."
              />
            </div>
            <div className="space-y-2">
              <Label>Title (optional)</Label>
              <Input {...adForm.register("title")} placeholder="Headline" />
            </div>
            <div className="space-y-2">
              <Label>Image URL (optional)</Label>
              <Input
                {...adForm.register("image_url")}
                placeholder="https://..."
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting && (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                )}
                Create Ad
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAdForm(false);
                  onCloseAd();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {adset.ads && adset.ads.length > 0 && (
          <div className="space-y-2">
            {adset.ads.map((ad) => (
              <div
                key={ad.id}
                className="flex items-center justify-between p-3 bg-background rounded-lg border"
              >
                <div>
                  <p className="font-medium text-sm">{ad.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {ad.creative_type} - {ad.status}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
