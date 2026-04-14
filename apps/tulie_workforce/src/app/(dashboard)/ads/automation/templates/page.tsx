"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  MoreHorizontal,
  Trash2,
  Edit,
  Copy,
  MessageSquare,
  Sparkles,
  FileText,
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
import type { ResponseTemplate } from "@/types/fb-ads";

const categoryColors: Record<string, string> = {
  greeting: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  support: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  sales: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  followup: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  goodbye: "bg-red-500/10 text-red-600 border-red-500/20",
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editTemplate, setEditTemplate] = useState<ResponseTemplate | null>(
    null,
  );
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    content: "",
    ai_prompt: "",
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      const res = await fetch("/api/templates");
      const { data } = await res.json();
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveTemplate() {
    try {
      const url = editTemplate
        ? `/api/templates/${editTemplate.id}`
        : "/api/templates";
      const method = editTemplate ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const { data } = await res.json();
        if (editTemplate) {
          setTemplates((prev) =>
            prev.map((t) => (t.id === editTemplate.id ? data : t)),
          );
        } else {
          setTemplates((prev) => [data, ...prev]);
        }
        setShowEditDialog(false);
        setEditTemplate(null);
        resetForm();
        toast.success(editTemplate ? "Template updated" : "Template created");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    }
  }

  async function handleDeleteTemplate(templateId: string) {
    try {
      await fetch(`/api/templates/${templateId}`, { method: "DELETE" });
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      toast.success("Template deleted");
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    } finally {
      setDeleteId(null);
    }
  }

  function copyToClipboard(content: string) {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  }

  function resetForm() {
    setFormData({ name: "", category: "", content: "", ai_prompt: "" });
  }

  function openEditDialog(template?: ResponseTemplate) {
    if (template) {
      setEditTemplate(template);
      setFormData({
        name: template.name,
        category: template.category || "",
        content: template.content,
        ai_prompt: template.ai_prompt || "",
      });
    } else {
      resetForm();
    }
    setShowEditDialog(true);
  }

  const totalUsage = templates.reduce(
    (sum, t) => sum + (t.usage_count || 0),
    0,
  );
  const aiEnhanced = templates.filter((t) => t.ai_prompt).length;
  const categories = [
    ...new Set(templates.map((t) => t.category).filter(Boolean)),
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader
          title="Response Templates"
          description="Quản lý mẫu trả lời nhanh cho auto-reply và quick replies"
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
        title="Response Templates"
        description="Quản lý mẫu trả lời nhanh cho auto-reply và quick replies"
      >
        <Button onClick={() => openEditDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </PageHeader>

      <StatGrid>
        <StatCard
          title="Total Templates"
          value={templates.length}
          footer={`${categories.length} categories`}
        />
        <StatCard
          title="Total Uses"
          value={totalUsage}
          footer="Across all templates"
        />
        <StatCard
          title="Categories"
          value={categories.length}
          footer="Different types"
        />
        <StatCard
          title="AI Enhanced"
          value={aiEnhanced}
          footer="With AI prompts"
        />
      </StatGrid>

      {templates.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No templates yet"
          description="Create your first response template for quick replies"
        >
          <Button onClick={() => openEditDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="hover:border-primary/20 transition-colors"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{template.name}</p>
                      {template.category && (
                        <Badge
                          className={`mt-1 ${categoryColors[template.category.toLowerCase()] || "bg-muted text-muted-foreground"}`}
                          variant="outline"
                        >
                          {template.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => copyToClipboard(template.content)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openEditDialog(template)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteId(template.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {template.content}
                </p>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Used {template.usage_count || 0} times</span>
                    {template.ai_prompt && (
                      <Badge variant="outline" className="text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(template.content)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editTemplate ? "Edit Template" : "Create Template"}
            </DialogTitle>
            <DialogDescription>
              {editTemplate
                ? "Update the response template"
                : "Create a new response template for quick replies"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Welcome Message"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="greeting">Greeting</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="followup">Follow Up</SelectItem>
                  <SelectItem value="goodbye">Goodbye</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="Enter template content..."
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                Use {"{{customer_name}}"} for dynamic variables
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai_prompt">
                <Sparkles className="h-4 w-4 inline mr-1" />
                AI Enhancement (Optional)
              </Label>
              <Textarea
                id="ai_prompt"
                value={formData.ai_prompt}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ai_prompt: e.target.value,
                  }))
                }
                placeholder="Add AI instructions for contextual responses..."
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={!formData.name || !formData.content}
            >
              {editTemplate ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDeleteTemplate(deleteId)}
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
