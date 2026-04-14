"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  MessageSquare,
  Brain,
  Share2,
  Globe,
  Mail,
  Database,
  Clock,
  Webhook,
  FileText,
  Image,
  Filter,
  GitBranch,
  X,
  Plus,
  GripVertical,
  Trash2,
  Settings,
  Play,
  Save,
  ChevronDown,
  Zap,
  Check,
} from "lucide-react";

// ─── TYPES ───────────────────────────────────────────────

export interface NodePort {
  id: string;
  type: "input" | "output";
}

export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  category: string;
  icon: React.ElementType;
  color: string;
  x: number;
  y: number;
  config: Record<string, string>;
  inputs: NodePort[];
  outputs: NodePort[];
}

export interface Connection {
  id: string;
  fromNodeId: string;
  fromPortId: string;
  toNodeId: string;
  toPortId: string;
}

// ─── NODE CATALOG ────────────────────────────────────────

interface NodeTemplate {
  type: string;
  label: string;
  category: string;
  icon: React.ElementType;
  color: string;
  description: string;
  inputs: number;
  outputs: number;
  defaultConfig: Record<string, string>;
}

const NODE_CATALOG: NodeTemplate[] = [
  // Triggers
  {
    type: "telegram_trigger",
    label: "Telegram Trigger",
    category: "Triggers",
    icon: MessageSquare,
    color: "#0088cc",
    description: "Listen for Telegram messages or commands",
    inputs: 0,
    outputs: 1,
    defaultConfig: { command: "/task", botToken: "" },
  },
  {
    type: "schedule_trigger",
    label: "Schedule",
    category: "Triggers",
    icon: Clock,
    color: "#6B7280",
    description: "Run on a cron schedule",
    inputs: 0,
    outputs: 1,
    defaultConfig: { cron: "0 9 * * *", timezone: "Asia/Ho_Chi_Minh" },
  },
  {
    type: "webhook_trigger",
    label: "Webhook",
    category: "Triggers",
    icon: Webhook,
    color: "#8B5CF6",
    description: "Trigger via HTTP webhook",
    inputs: 0,
    outputs: 1,
    defaultConfig: { method: "POST", path: "/webhook" },
  },

  // AI
  {
    type: "openai",
    label: "OpenAI GPT-4o",
    category: "AI",
    icon: Brain,
    color: "#10A37F",
    description: "Generate text with GPT-4o",
    inputs: 1,
    outputs: 1,
    defaultConfig: { model: "gpt-4o", temperature: "0.7", prompt: "" },
  },
  {
    type: "openai_mini",
    label: "GPT-4o Mini",
    category: "AI",
    icon: Brain,
    color: "#10A37F",
    description: "Lightweight AI for simple tasks",
    inputs: 1,
    outputs: 1,
    defaultConfig: { model: "gpt-4o-mini", temperature: "0.5", prompt: "" },
  },

  // Actions
  {
    type: "facebook_post",
    label: "Facebook Post",
    category: "Actions",
    icon: Share2,
    color: "#1877F2",
    description: "Post to a Facebook Page",
    inputs: 1,
    outputs: 1,
    defaultConfig: { pageId: "", accessToken: "" },
  },
  {
    type: "telegram_send",
    label: "Telegram Send",
    category: "Actions",
    icon: MessageSquare,
    color: "#0088cc",
    description: "Send message back to Telegram",
    inputs: 1,
    outputs: 1,
    defaultConfig: { chatId: "", message: "" },
  },
  {
    type: "send_email",
    label: "Send Email",
    category: "Actions",
    icon: Mail,
    color: "#EA4335",
    description: "Send email via SMTP or SendGrid",
    inputs: 1,
    outputs: 1,
    defaultConfig: { to: "", subject: "", body: "" },
  },
  {
    type: "http_request",
    label: "HTTP Request",
    category: "Actions",
    icon: Globe,
    color: "#F59E0B",
    description: "Make an HTTP API call",
    inputs: 1,
    outputs: 1,
    defaultConfig: { url: "", method: "GET" },
  },

  // Data
  {
    type: "supabase",
    label: "Supabase",
    category: "Data",
    icon: Database,
    color: "#3ECF8E",
    description: "Read/write to Supabase database",
    inputs: 1,
    outputs: 1,
    defaultConfig: { table: "", operation: "select" },
  },
  {
    type: "google_sheets",
    label: "Google Sheets",
    category: "Data",
    icon: FileText,
    color: "#34A853",
    description: "Read/write Google Sheets",
    inputs: 1,
    outputs: 1,
    defaultConfig: { spreadsheetId: "", range: "A1:Z" },
  },

  // Logic
  {
    type: "if_condition",
    label: "IF",
    category: "Logic",
    icon: GitBranch,
    color: "#F97316",
    description: "Branch based on condition",
    inputs: 1,
    outputs: 2,
    defaultConfig: { condition: "", trueLabel: "True", falseLabel: "False" },
  },
  {
    type: "filter",
    label: "Filter",
    category: "Logic",
    icon: Filter,
    color: "#6366F1",
    description: "Filter data by condition",
    inputs: 1,
    outputs: 1,
    defaultConfig: { field: "", operator: "equals", value: "" },
  },
];

// ─── DEFAULT WORKFLOW ────────────────────────────────────

const defaultNodes: WorkflowNode[] = [
  {
    id: "node-1",
    type: "telegram_trigger",
    label: "Telegram Trigger",
    category: "Triggers",
    icon: MessageSquare,
    color: "#0088cc",
    x: 80,
    y: 200,
    config: { command: "/post", botToken: "BOT_TOKEN" },
    inputs: [],
    outputs: [{ id: "node-1-out-0", type: "output" }],
  },
  {
    id: "node-2",
    type: "openai",
    label: "OpenAI GPT-4o",
    category: "AI",
    icon: Brain,
    color: "#10A37F",
    x: 370,
    y: 200,
    config: {
      model: "gpt-4o",
      temperature: "0.7",
      prompt: "Write a Facebook post about: {{$json.message}}",
    },
    inputs: [{ id: "node-2-in-0", type: "input" }],
    outputs: [{ id: "node-2-out-0", type: "output" }],
  },
  {
    id: "node-3",
    type: "facebook_post",
    label: "Facebook Post",
    category: "Actions",
    icon: Share2,
    color: "#1877F2",
    x: 660,
    y: 140,
    config: { pageId: "PAGE_ID", accessToken: "ACCESS_TOKEN" },
    inputs: [{ id: "node-3-in-0", type: "input" }],
    outputs: [{ id: "node-3-out-0", type: "output" }],
  },
  {
    id: "node-4",
    type: "telegram_send",
    label: "Telegram Response",
    category: "Actions",
    icon: MessageSquare,
    color: "#0088cc",
    x: 660,
    y: 290,
    config: { chatId: "{{$json.chat.id}}", message: "✅ Posted to Facebook!" },
    inputs: [{ id: "node-4-in-0", type: "input" }],
    outputs: [{ id: "node-4-out-0", type: "output" }],
  },
];

const defaultConnections: Connection[] = [
  {
    id: "conn-1",
    fromNodeId: "node-1",
    fromPortId: "node-1-out-0",
    toNodeId: "node-2",
    toPortId: "node-2-in-0",
  },
  {
    id: "conn-2",
    fromNodeId: "node-2",
    fromPortId: "node-2-out-0",
    toNodeId: "node-3",
    toPortId: "node-3-in-0",
  },
  {
    id: "conn-3",
    fromNodeId: "node-2",
    fromPortId: "node-2-out-0",
    toNodeId: "node-4",
    toPortId: "node-4-in-0",
  },
];

// ─── COMPONENT ───────────────────────────────────────────

interface WorkflowEditorProps {
  workflowName?: string;
}

export function WorkflowEditor({
  workflowName = "Telegram → AI → Facebook Post",
}: WorkflowEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<WorkflowNode[]>(defaultNodes);
  const [connections, setConnections] =
    useState<Connection[]>(defaultConnections);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showPalette, setShowPalette] = useState(false);
  const [paletteCategory, setPaletteCategory] = useState("Triggers");
  const [showConfig, setShowConfig] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const categories = [...new Set(NODE_CATALOG.map((n) => n.category))];

  // ─── DRAG HANDLERS ───

  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation();
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      setDraggingNodeId(nodeId);
      setDragOffset({ x: e.clientX - node.x, y: e.clientY - node.y });
      setSelectedNodeId(nodeId);
      setShowConfig(true);
    },
    [nodes],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingNodeId) return;
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggingNodeId
            ? {
                ...n,
                x: Math.max(0, e.clientX - dragOffset.x),
                y: Math.max(0, e.clientY - dragOffset.y),
              }
            : n,
        ),
      );
    },
    [draggingNodeId, dragOffset],
  );

  const handleMouseUp = useCallback(() => {
    setDraggingNodeId(null);
  }, []);

  // ─── ADD NODE ───

  const addNode = (template: NodeTemplate) => {
    const id = `node-${Date.now()}`;
    const newNode: WorkflowNode = {
      id,
      type: template.type,
      label: template.label,
      category: template.category,
      icon: template.icon,
      color: template.color,
      x: 200 + Math.random() * 300,
      y: 150 + Math.random() * 200,
      config: { ...template.defaultConfig },
      inputs: Array.from({ length: template.inputs }, (_, i) => ({
        id: `${id}-in-${i}`,
        type: "input" as const,
      })),
      outputs: Array.from({ length: template.outputs }, (_, i) => ({
        id: `${id}-out-${i}`,
        type: "output" as const,
      })),
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(id);
    setShowConfig(true);
    setShowPalette(false);
  };

  // ─── DELETE NODE ───

  const deleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setConnections((prev) =>
      prev.filter((c) => c.fromNodeId !== nodeId && c.toNodeId !== nodeId),
    );
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
      setShowConfig(false);
    }
  };

  // ─── CONNECTION PATHS ───

  const getConnectionPath = (conn: Connection): string => {
    const fromNode = nodes.find((n) => n.id === conn.fromNodeId);
    const toNode = nodes.find((n) => n.id === conn.toNodeId);
    if (!fromNode || !toNode) return "";

    const NODE_W = 200;
    const NODE_H = 72;
    const fromPortIndex = fromNode.outputs.findIndex(
      (p) => p.id === conn.fromPortId,
    );
    const toPortIndex = toNode.inputs.findIndex((p) => p.id === conn.toPortId);

    const x1 = fromNode.x + NODE_W;
    const y1 =
      fromNode.y +
      NODE_H / 2 +
      (fromPortIndex - (fromNode.outputs.length - 1) / 2) * 20;
    const x2 = toNode.x;
    const y2 =
      toNode.y +
      NODE_H / 2 +
      (toPortIndex - (toNode.inputs.length - 1) / 2) * 20;

    const dx = Math.abs(x2 - x1) * 0.5;
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  };

  // ─── SAVE ───

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-[70vh] flex flex-col border border-border rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="h-12 border-b border-border bg-white px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-foreground">
            {workflowName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPalette(!showPalette)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted hover:bg-muted text-xs font-medium text-zinc-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add node
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${saved ? "bg-emerald-100 text-emerald-700" : "bg-zinc-900 text-white hover:bg-zinc-800"}`}
          >
            {saved ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save
              </>
            )}
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors">
            <Play className="h-3.5 w-3.5" />
            Execute
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Node Palette */}
        {showPalette && (
          <div className="w-64 border-r border-border bg-white overflow-y-auto shrink-0">
            <div className="px-3 py-2 border-b border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Node palette
              </span>
              <button
                onClick={() => setShowPalette(false)}
                className="text-muted-foreground hover:text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {/* Category tabs */}
            <div className="flex gap-1 px-3 py-2 border-b border-border overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPaletteCategory(cat)}
                  className={`px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap transition-colors ${paletteCategory === cat ? "bg-zinc-900 text-white" : "bg-muted text-muted-foreground hover:bg-muted"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* Node list */}
            <div className="p-2 space-y-1">
              {NODE_CATALOG.filter((n) => n.category === paletteCategory).map(
                (template) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.type}
                      onClick={() => addNode(template)}
                      className="w-full flex items-start gap-2.5 p-2 rounded-md hover:bg-muted transition-colors text-left"
                    >
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                        style={{
                          backgroundColor: template.color + "20",
                          color: template.color,
                        }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          {template.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {template.description}
                        </p>
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          </div>
        )}

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-auto cursor-crosshair"
          style={{
            backgroundImage:
              "radial-gradient(circle, #e4e4e7 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={() => {
            setSelectedNodeId(null);
            setShowConfig(false);
          }}
        >
          {/* Connections SVG */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ minWidth: 1200, minHeight: 600 }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="8"
                refY="3"
                orient="auto"
              >
                <path d="M 0 0 L 8 3 L 0 6 Z" fill="#a1a1aa" />
              </marker>
            </defs>
            {connections.map((conn) => (
              <path
                key={conn.id}
                d={getConnectionPath(conn)}
                stroke="#a1a1aa"
                strokeWidth={2}
                fill="none"
                markerEnd="url(#arrowhead)"
              />
            ))}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const Icon = node.icon;
            const isSelected = selectedNodeId === node.id;
            return (
              <div
                key={node.id}
                className={`absolute select-none group transition-shadow ${draggingNodeId === node.id ? "z-50" : "z-10"}`}
                style={{ left: node.x, top: node.y, width: 200 }}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              >
                <div
                  className={`rounded-md border-2 bg-white overflow-hidden transition-all ${isSelected ? "border-zinc-900" : "border-border hover:border-input hover:shadow-md"}`}
                >
                  {/* Color strip */}
                  <div
                    className="h-1"
                    style={{ backgroundColor: node.color }}
                  />

                  {/* Node content */}
                  <div className="px-3 py-2.5 flex items-center gap-2.5">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: node.color + "15",
                        color: node.color,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {node.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {node.category}
                      </p>
                    </div>
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNode(node.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 hover:text-red-500 text-zinc-300 transition-all"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Input ports */}
                {node.inputs.map((port, i) => (
                  <div
                    key={port.id}
                    className="absolute w-3 h-3 rounded-full border-2 border-input bg-white -left-1.5"
                    style={{
                      top: 36 + (i - (node.inputs.length - 1) / 2) * 20,
                    }}
                  />
                ))}

                {/* Output ports */}
                {node.outputs.map((port, i) => (
                  <div
                    key={port.id}
                    className="absolute w-3 h-3 rounded-full border-2 bg-white -right-1.5"
                    style={{
                      top: 36 + (i - (node.outputs.length - 1) / 2) * 20,
                      borderColor: node.color,
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>

        {/* Config Panel */}
        {showConfig && selectedNode && (
          <div className="w-72 border-l border-border bg-white overflow-y-auto shrink-0">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-md"
                  style={{
                    backgroundColor: selectedNode.color + "15",
                    color: selectedNode.color,
                  }}
                >
                  <selectedNode.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {selectedNode.label}
                </span>
              </div>
              <button
                onClick={() => setShowConfig(false)}
                className="text-muted-foreground hover:text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Name
                </label>
                <input
                  value={selectedNode.label}
                  onChange={(e) =>
                    setNodes((prev) =>
                      prev.map((n) =>
                        n.id === selectedNode.id
                          ? { ...n, label: e.target.value }
                          : n,
                      ),
                    )
                  }
                  className="w-full px-3 py-1.5 rounded-md border border-border text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              <hr className="border-border" />

              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Configuration
              </p>

              {Object.entries(selectedNode.config).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-xs text-muted-foreground mb-1 capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </label>
                  {value.length > 40 ? (
                    <textarea
                      value={value}
                      onChange={(e) =>
                        setNodes((prev) =>
                          prev.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  config: {
                                    ...n.config,
                                    [key]: e.target.value,
                                  },
                                }
                              : n,
                          ),
                        )
                      }
                      rows={3}
                      className="w-full px-3 py-1.5 rounded-md border border-border text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none"
                    />
                  ) : (
                    <input
                      value={value}
                      onChange={(e) =>
                        setNodes((prev) =>
                          prev.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  config: {
                                    ...n.config,
                                    [key]: e.target.value,
                                  },
                                }
                              : n,
                          ),
                        )
                      }
                      className="w-full px-3 py-1.5 rounded-md border border-border text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    />
                  )}
                </div>
              ))}

              <hr className="border-border" />

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Type: {selectedNode.type}</span>
                <span>ID: {selectedNode.id.slice(0, 8)}</span>
              </div>

              <button
                onClick={() => deleteNode(selectedNode.id)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Delete node
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
