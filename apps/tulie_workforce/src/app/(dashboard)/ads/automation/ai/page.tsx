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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Save, RefreshCw, Sparkles, Zap, Bell } from "lucide-react";

interface AISettings {
  id: string;
  auto_execution_enabled: boolean;
  max_budget_increase_percent: number;
  max_budget_decrease_percent: number;
  cpr_threshold_multiplier: number;
  daily_analysis_enabled: boolean;
  notification_email: string | null;
}

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
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[800px] space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">AI Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Cấu hình tự động tối ưu hóa quảng cáo bằng AI
        </p>
      </div>

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
