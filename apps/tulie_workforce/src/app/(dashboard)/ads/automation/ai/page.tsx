"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Label,
  Switch,
  Slider,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import { toast } from "sonner";
import { Save, RefreshCw, Sparkles, Zap, Bell, Globe, Key } from "lucide-react";

interface AISettings {
  id: string;
  auto_execution_enabled: boolean;
  max_budget_increase_percent: number;
  max_budget_decrease_percent: number;
  cpr_threshold_multiplier: number;
  daily_analysis_enabled: boolean;
  notification_email: string | null;
  fb_app_id: string | null;
  fb_app_secret: string | null;
  fb_redirect_uri: string | null;
  ai_provider: string;
  ai_api_key: string | null;
  ai_model: string;
}

const AI_PROVIDERS = [
  {
    value: "openai",
    label: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  },
  {
    value: "anthropic",
    label: "Anthropic (Claude)",
    models: ["claude-3-5-sonnet", "claude-3-opus", "claude-3-haiku"],
  },
  {
    value: "google",
    label: "Google (Gemini)",
    models: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"],
  },
];

export default function AISettingsPage() {
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    auto_execution_enabled: false,
    max_budget_increase_percent: 20,
    max_budget_decrease_percent: 50,
    cpr_threshold_multiplier: 1.5,
    daily_analysis_enabled: true,
    notification_email: "",
    fb_app_id: "",
    fb_app_secret: "",
    fb_redirect_uri: "",
    ai_provider: "openai",
    ai_api_key: "",
    ai_model: "gpt-4o-mini",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/ai/settings");
      const { data } = await res.json();
      if (data) {
        setSettings(data);
        setFormData({
          auto_execution_enabled: data.auto_execution_enabled || false,
          max_budget_increase_percent: data.max_budget_increase_percent || 20,
          max_budget_decrease_percent: data.max_budget_decrease_percent || 50,
          cpr_threshold_multiplier: data.cpr_threshold_multiplier || 1.5,
          daily_analysis_enabled: data.daily_analysis_enabled !== false,
          notification_email: data.notification_email || "",
          fb_app_id: data.fb_app_id || "",
          fb_app_secret: data.fb_app_secret || "",
          fb_redirect_uri: data.fb_redirect_uri || "",
          ai_provider: data.ai_provider || "openai",
          ai_api_key: data.ai_api_key || "",
          ai_model: data.ai_model || "gpt-4o-mini",
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to fetch AI settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/ai/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          notification_email: formData.notification_email || null,
          fb_app_id: formData.fb_app_id || null,
          fb_app_secret: formData.fb_app_secret || null,
          fb_redirect_uri: formData.fb_redirect_uri || null,
          ai_api_key: formData.ai_api_key || null,
        }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setSettings(data);
        toast.success("Settings saved successfully");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader
          title="AI Settings"
          description="Cấu hình tự động tối ưu hóa quảng cáo bằng AI"
        />
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-40 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <PageHeader
        title="AI Settings"
        description="Cấu hình tự động tối ưu hóa quảng cáo bằng AI"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle>AI Configuration</CardTitle>
          </div>
          <CardDescription>
            Cấu hình AI provider để phân tích và tối ưu hóa ads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ai_provider">AI Provider</Label>
              <Select
                value={formData.ai_provider}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    ai_provider: value,
                    ai_model:
                      AI_PROVIDERS.find((p) => p.value === value)?.models[0] ||
                      "gpt-4o-mini",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_PROVIDERS.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai_model">Model</Label>
              <Select
                value={formData.ai_model}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, ai_model: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_PROVIDERS.find(
                    (p) => p.value === formData.ai_provider,
                  )?.models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  )) || null}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai_api_key">API Key</Label>
            <Input
              id="ai_api_key"
              type="password"
              value={formData.ai_api_key}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, ai_api_key: e.target.value }))
              }
              placeholder="Enter your API key"
            />
            <p className="text-xs text-muted-foreground">
              API key sẽ được mã hóa trước khi lưu
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Auto Execution</CardTitle>
          </div>
          <CardDescription>
            Cho phép AI tự động thực hiện các thay đổi mà không cần phê duyệt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Auto Execution</p>
              <p className="text-sm text-muted-foreground">
                Tự động thực hiện các thay đổi nhỏ mà không cần approval
              </p>
            </div>
            <Switch
              checked={formData.auto_execution_enabled}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  auto_execution_enabled: checked,
                }))
              }
            />
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Max Budget Increase</Label>
                <span className="text-sm font-medium">
                  {formData.max_budget_increase_percent}%
                </span>
              </div>
              <Slider
                value={[formData.max_budget_increase_percent]}
                onValueChange={([value]) =>
                  setFormData((prev) => ({
                    ...prev,
                    max_budget_increase_percent: value,
                  }))
                }
                min={1}
                max={100}
                step={5}
                className="py-2"
              />
              <p className="text-xs text-muted-foreground">
                AI sẽ không tăng budget quá{" "}
                {formData.max_budget_increase_percent}% trong một lần
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Max Budget Decrease</Label>
                <span className="text-sm font-medium">
                  {formData.max_budget_decrease_percent}%
                </span>
              </div>
              <Slider
                value={[formData.max_budget_decrease_percent]}
                onValueChange={([value]) =>
                  setFormData((prev) => ({
                    ...prev,
                    max_budget_decrease_percent: value,
                  }))
                }
                min={1}
                max={100}
                step={5}
                className="py-2"
              />
              <p className="text-xs text-muted-foreground">
                AI sẽ không giảm budget quá{" "}
                {formData.max_budget_decrease_percent}% trong một lần
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle>CPR Thresholds</CardTitle>
          </div>
          <CardDescription>
            Cấu hình ngưỡng CPR để AI đưa ra recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>CPR Threshold Multiplier</Label>
              <span className="text-sm font-medium">
                {formData.cpr_threshold_multiplier}x
              </span>
            </div>
            <Slider
              value={[formData.cpr_threshold_multiplier * 10]}
              onValueChange={([value]) =>
                setFormData((prev) => ({
                  ...prev,
                  cpr_threshold_multiplier: value / 10,
                }))
              }
              min={5}
              max={50}
              step={5}
              className="py-2"
            />
            <p className="text-xs text-muted-foreground">
              AI sẽ cảnh báo khi CPR vượt quá{" "}
              {formData.cpr_threshold_multiplier}x CPR target
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Cấu hình thông báo từ AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Daily Analysis</p>
              <p className="text-sm text-muted-foreground">
                Chạy phân tích AI hàng ngày và gửi báo cáo
              </p>
            </div>
            <Switch
              checked={formData.daily_analysis_enabled}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  daily_analysis_enabled: checked,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification_email">Notification Email</Label>
            <Input
              id="notification_email"
              type="email"
              value={formData.notification_email}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  notification_email: e.target.value,
                }))
              }
              placeholder="email@example.com"
            />
            <p className="text-xs text-muted-foreground">
              Nhận thông báo khi có recommendations mới hoặc actions được
              executed
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>Facebook App Configuration</CardTitle>
          </div>
          <CardDescription>
            Cấu hình Facebook App để kết nối với Ads API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fb_app_id">Facebook App ID</Label>
            <Input
              id="fb_app_id"
              type="text"
              value={formData.fb_app_id}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  fb_app_id: e.target.value,
                }))
              }
              placeholder="Enter your Facebook App ID"
            />
            <p className="text-xs text-muted-foreground">
              Lấy App ID từ Facebook Developer Console
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fb_app_secret">Facebook App Secret</Label>
            <Input
              id="fb_app_secret"
              type="password"
              value={formData.fb_app_secret}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  fb_app_secret: e.target.value,
                }))
              }
              placeholder="Enter your Facebook App Secret"
            />
            <p className="text-xs text-muted-foreground">
              App Secret từ Facebook Developer Console
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fb_redirect_uri">Redirect URI</Label>
            <Input
              id="fb_redirect_uri"
              type="url"
              value={formData.fb_redirect_uri}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  fb_redirect_uri: e.target.value,
                }))
              }
              placeholder="https://your-app.vercel.app/api/auth/facebook"
            />
            <p className="text-xs text-muted-foreground">
              OAuth Redirect URI đã cấu hình trong Facebook App
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
