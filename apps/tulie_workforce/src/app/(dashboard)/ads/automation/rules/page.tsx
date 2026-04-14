"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  RefreshCw,
  MoreHorizontal,
  Trash2,
  Edit,
  Zap,
  MessageSquare,
  Clock,
  Tag,
  User,
  AlertCircle,
  CheckCircle2,
  Workflow,
} from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Input,
  Label,
  Switch,
  Textarea,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  PageHeader,
  StatCard,
  StatGrid,
  EmptyState,
} from "@repo/ui";
import { toast } from "sonner";
import type { AutoReplyRule, RuleTrigger, RuleAction } from "@/types/fb-ads";

const triggerConfig: Record<
  RuleTrigger,
  { icon: typeof Tag; color: string; label: string }
> = {
  keyword: {
    icon: Tag,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    label: "Keyword",
  },
  intent: {
    icon: Zap,
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    label: "Intent",
  },
  first_message: {
    icon: MessageSquare,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    label: "First Message",
  },
  no_response: {
    icon: Clock,
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    label: "No Response",
  },
  time_based: {
    icon: Clock,
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    label: "Time Based",
  },
};

const actionConfig: Record<
  string,
  { icon: typeof MessageSquare; label: string }
> = {
  reply: { icon: MessageSquare, label: "Send Reply" },
  tag: { icon: Tag, label: "Add Tag" },
  assign: { icon: User, label: "Assign Agent" },
  escalate: { icon: AlertCircle, label: "Escalate" },
  auto_resolve: { icon: CheckCircle2, label: "Auto Resolve" },
};

export default function AutomationRulesPage() {
  const [rules, setRules] = useState<AutoReplyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editRule, setEditRule] = useState<AutoReplyRule | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    trigger_type: "keyword" as RuleTrigger,
    trigger_config: { keywords: [] as string[] },
    actions: [] as Array<{ type: RuleAction; value: unknown }>,
    is_active: true,
    priority: 0,
  });
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    fetchRules();
  }, []);

  async function fetchRules() {
    try {
      const res = await fetch("/api/auto-reply-rules");
      const { data } = await res.json();
      setRules(data || []);
    } catch (error) {
      console.error("Error fetching rules:", error);
      toast.error("Failed to fetch rules");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveRule() {
    try {
      const url = editRule
        ? `/api/auto-reply-rules/${editRule.id}`
        : "/api/auto-reply-rules";
      const method = editRule ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const { data } = await res.json();
        if (editRule) {
          setRules((prev) =>
            prev.map((r) => (r.id === editRule.id ? data : r)),
          );
        } else {
          setRules((prev) => [data, ...prev]);
        }
        setShowEditDialog(false);
        setEditRule(null);
        resetForm();
        toast.success(editRule ? "Rule updated" : "Rule created");
      }
    } catch (error) {
      console.error("Error saving rule:", error);
      toast.error("Failed to save rule");
    }
  }

  async function handleToggleRule(rule: AutoReplyRule) {
    try {
      await fetch(`/api/auto-reply-rules/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !rule.is_active }),
      });
      setRules((prev) =>
        prev.map((r) =>
          r.id === rule.id ? { ...r, is_active: !r.is_active } : r,
        ),
      );
      toast.success(`Rule ${rule.is_active ? "disabled" : "enabled"}`);
    } catch (error) {
      console.error("Error toggling rule:", error);
      toast.error("Failed to update rule");
    }
  }

  async function handleDeleteRule(ruleId: string) {
    try {
      await fetch(`/api/auto-reply-rules/${ruleId}`, { method: "DELETE" });
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      toast.success("Rule deleted");
    } catch (error) {
      console.error("Error deleting rule:", error);
      toast.error("Failed to delete rule");
    } finally {
      setDeleteId(null);
    }
  }

  function resetForm() {
    setFormData({
      name: "",
      trigger_type: "keyword",
      trigger_config: { keywords: [] },
      actions: [],
      is_active: true,
      priority: 0,
    });
    setKeywordInput("");
  }

  function openEditDialog(rule?: AutoReplyRule) {
    if (rule) {
      setEditRule(rule);
      setFormData({
        name: rule.name,
        trigger_type: rule.trigger_type,
        trigger_config: {
          keywords:
            (rule.trigger_config as { keywords?: string[] })?.keywords || [],
        },
        actions: rule.actions as Array<{ type: RuleAction; value: unknown }>,
        is_active: rule.is_active,
        priority: rule.priority,
      });
    } else {
      resetForm();
    }
    setShowEditDialog(true);
  }

  function addKeyword() {
    if (keywordInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        trigger_config: {
          ...prev.trigger_config,
          keywords: [
            ...(prev.trigger_config.keywords || []),
            keywordInput.trim(),
          ],
        },
      }));
      setKeywordInput("");
    }
  }

  function removeKeyword(keyword: string) {
    setFormData((prev) => ({
      ...prev,
      trigger_config: {
        ...prev.trigger_config,
        keywords: (prev.trigger_config.keywords || []).filter(
          (k) => k !== keyword,
        ),
      },
    }));
  }

  const activeRules = rules.filter((r) => r.is_active).length;
  const keywordRules = rules.filter((r) => r.trigger_type === "keyword").length;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader
          title="Automation Rules"
          description="Quản lý quy tắc tự động trả lời và xử lý tin nhắn"
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
        title="Automation Rules"
        description="Quản lý quy tắc tự động trả lời và xử lý tin nhắn"
      >
        <Button onClick={() => openEditDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </PageHeader>

      <StatGrid>
        <StatCard
          title="Total Rules"
          value={rules.length}
          footer={`${activeRules} active`}
        />
        <StatCard title="Active" value={activeRules} footer="Rules enabled" />
        <StatCard
          title="Keyword Rules"
          value={keywordRules}
          footer="Trigger by keywords"
        />
        <StatCard
          title="Auto-exec"
          value={activeRules}
          footer="Auto execute enabled"
        />
      </StatGrid>

      {rules.length === 0 ? (
        <EmptyState
          icon={Workflow}
          title="No automation rules yet"
          description="Create your first rule to automate responses"
        >
          <Button onClick={() => openEditDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Create Rule
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule) => {
            const trigger =
              triggerConfig[rule.trigger_type] || triggerConfig.keyword;
            const TriggerIcon = trigger.icon;
            return (
              <Card
                key={rule.id}
                className="hover:border-primary/20 transition-colors"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center border ${trigger.color}`}
                      >
                        <TriggerIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{rule.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {trigger.label} • Priority: {rule.priority}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={() => handleToggleRule(rule)}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEditDialog(rule)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteId(rule.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {rule.trigger_type === "keyword" &&
                    (rule.trigger_config as { keywords?: string[] })
                      .keywords && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(
                          rule.trigger_config as { keywords?: string[] }
                        ).keywords?.map((kw) => (
                          <Badge key={kw} variant="secondary">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    )}
                  <div className="flex flex-wrap gap-2">
                    {(
                      rule.actions as Array<{
                        type: RuleAction;
                        value: unknown;
                      }>
                    ).map((action, idx) => {
                      const actionInfo = actionConfig[action.type] || {
                        icon: Zap,
                        label: action.type,
                      };
                      const ActionIcon = actionInfo.icon;
                      return (
                        <Badge key={idx} variant="outline">
                          <ActionIcon className="h-3 w-3 mr-1" />
                          {actionInfo.label}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editRule ? "Edit Rule" : "Create Automation Rule"}
            </DialogTitle>
            <DialogDescription>
              {editRule
                ? "Update the automation rule settings"
                : "Create a new automation rule"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Rule Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Welcome New Customers"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <Select
                  value={formData.trigger_type}
                  onValueChange={(value: RuleTrigger) =>
                    setFormData((prev) => ({ ...prev, trigger_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(triggerConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
            {formData.trigger_type === "keyword" && (
              <div className="space-y-2">
                <Label>Keywords</Label>
                <div className="flex gap-2">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="Enter keyword"
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addKeyword())
                    }
                  />
                  <Button type="button" variant="outline" onClick={addKeyword}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.trigger_config.keywords?.map((kw) => (
                    <Badge
                      key={kw}
                      variant="secondary"
                      className="cursor-pointer"
                    >
                      {kw}
                      <button
                        className="ml-1 hover:text-destructive"
                        onClick={() => removeKeyword(kw)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="space-y-2">
                {(formData.actions || []).map((action, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Badge variant="outline" className="flex-1">
                      {actionConfig[action.type]?.label || action.type}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          actions: prev.actions.filter((_, i) => i !== idx),
                        }))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Select
                  onValueChange={(value: RuleAction) =>
                    setFormData((prev) => ({
                      ...prev,
                      actions: [...prev.actions, { type: value, value: "" }],
                    }))
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Add action" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(actionConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveRule}
              disabled={!formData.name || formData.actions.length === 0}
            >
              {editRule ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this automation rule? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDeleteRule(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
