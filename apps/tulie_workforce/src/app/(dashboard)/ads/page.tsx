"use client";

import { useState } from "react";
import { Header } from "@/components/layouts/header";
import {
    mockCampaigns,
    mockAlerts,
    mockAgentActions,
    mockAdAccount,
    formatVND,
    getCampaignStatusColor,
} from "@/lib/fb-ads-data";
import type { FbCampaign, FbAlert, FbAgentAction } from "@/lib/fb-ads-data";
import {
    Megaphone,
    DollarSign,
    Target,
    Eye,
    Bell,
    Bot,
    CheckCircle2,
    XCircle,
    Clock,
    BarChart3,
    FileText,
    ImagePlus,
    Send,
    Sparkles,
    PenLine,
    Play,
    Pause,
    RefreshCw,
    AlertTriangle,
} from "lucide-react";

export default function AdsPage() {
    const [campaigns, setCampaigns] = useState(mockCampaigns);
    const [selectedTab, setSelectedTab] = useState<"content" | "overview" | "alerts" | "actions">("content");

    // Stats
    const activeCampaigns = campaigns.filter((c) => c.status === "active");
    const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
    const totalResults = campaigns.reduce((sum, c) => sum + c.results, 0);
    const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
    const avgCPR = totalResults > 0 ? totalSpent / totalResults : 0;
    const unreadAlerts = mockAlerts.filter((a) => !a.is_read).length;
    const pendingActions = mockAgentActions.filter((a) => a.status === "pending_approval").length;

    function toggleCampaign(id: string) {
        setCampaigns((prev) =>
            prev.map((c) =>
                c.id === id
                    ? { ...c, status: c.status === "active" ? "paused" : "active" }
                    : c
            )
        );
    }

    return (
        <>
            <Header title="Ads Manager" />
            
            <main className="mx-auto max-w-[1600px] space-y-6">
                {/* ── Page Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-md shadow-primary/20">
                                <Megaphone className="h-5 w-5" />
                            </div>
                            Facebook Ads Manager
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            AI Agent tự động theo dõi & tối ưu chiến dịch quảng cáo
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[13px] font-bold text-foreground">{mockAdAccount.name}</p>
                            <p className="text-[11px] font-medium text-muted-foreground">{mockAdAccount.account_id}</p>
                        </div>
                        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/95 transition-all">
                            <RefreshCw className="h-4 w-4" />
                            Sync Data
                        </button>
                    </div>
                </div>

                {/* ── Stats Cards ── */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <StatCard
                        label="Chiến dịch active"
                        value={String(activeCampaigns.length)}
                        sub={`/ ${campaigns.length} tổng`}
                        icon={<Megaphone className="h-5 w-5" />}
                        color="primary"
                    />
                    <StatCard
                        label="Tổng chi tiêu"
                        value={formatVND(totalSpent)}
                        sub={`Hạn mức: ${formatVND(mockAdAccount.daily_budget_limit)}/ngày`}
                        icon={<DollarSign className="h-5 w-5" />}
                        color="success"
                    />
                    <StatCard
                        label="Kết quả (Leads)"
                        value={String(totalResults)}
                        sub={`CPR TB: ${formatVND(Math.round(avgCPR))}`}
                        icon={<Target className="h-5 w-5" />}
                        color="info"
                    />
                    <StatCard
                        label="Impressions"
                        value={`${(totalImpressions / 1000).toFixed(0)}K`}
                        sub={`Reach: ${(campaigns.reduce((s, c) => s + c.reach, 0) / 1000).toFixed(0)}K`}
                        icon={<Eye className="h-5 w-5" />}
                        color="warning"
                    />
                    <StatCard
                        label="AI Alerts"
                        value={String(unreadAlerts)}
                        sub={`${pendingActions} đề xuất chờ duyệt`}
                        icon={<Bell className="h-5 w-5" />}
                        color={unreadAlerts > 0 ? "destructive" : "zinc"}
                    />
                </div>

                {/* ── Modern Tabs ── */}
                <div className="flex gap-1 bg-muted/80 p-1.5 rounded-md border border-border w-fit">
                    {[
                        { key: "content", label: "Nội dung", icon: FileText },
                        { key: "overview", label: "Chiến dịch", icon: BarChart3 },
                        { key: "alerts", label: `Cảnh báo`, badge: unreadAlerts, icon: AlertTriangle },
                        { key: "actions", label: `AI Actions`, badge: pendingActions, icon: Bot },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setSelectedTab(tab.key as typeof selectedTab)}
                            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all ${ selectedTab === tab.key ? "bg-white text-primary shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:bg-white/50 hover:text-foreground" }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                            {tab.badge ? (
                                <span className={`flex h-5 items-center justify-center rounded-full px-1.5 text-[10px] ml-1 bg-primary/10 text-primary`}>
                                    {tab.badge}
                                </span>
                            ) : null}
                        </button>
                    ))}
                </div>

                {/* ── Tab Content ── */}
                <div className="pt-2">
                    {selectedTab === "content" && <ContentList />}
                    {selectedTab === "overview" && (
                        <CampaignList campaigns={campaigns} onToggle={toggleCampaign} />
                    )}
                    {selectedTab === "alerts" && <AlertsList alerts={mockAlerts} />}
                    {selectedTab === "actions" && <ActionsList actions={mockAgentActions} />}
                </div>
            </main>
        </>
    );
}

// ============================================
// Stat Card
// ============================================

function StatCard({
    label,
    value,
    sub,
    icon,
    color,
}: {
    label: string;
    value: string;
    sub: string;
    icon: React.ReactNode;
    color: string;
}) {
    // Premium map tones (aligned with globals.css tokens)
    const colors: Record<string, string> = {
        primary: "bg-indigo-50/50 text-indigo-600 border border-indigo-100/50",
        success: "bg-emerald-50/50 text-emerald-600 border border-emerald-100/50",
        info: "bg-blue-50/50 text-blue-600 border border-blue-100/50",
        warning: "bg-amber-50/50 text-amber-600 border border-amber-100/50",
        destructive: "bg-red-50/50 text-red-600 border border-red-100/50",
        zinc: "bg-muted/50 text-muted-foreground border border-border",
    };

    return (
        <div className="card-elevated p-5 relative overflow-hidden group">
            {/* Ambient background glow matching the premium design */}
            <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-[0.04] blur-2xl group-hover:opacity-[0.08] transition-opacity ${colors[color].split(' ')[1]}`} />
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase">
                        {label}
                    </span>
                    <div className={`rounded-md p-2 ${colors[color]}`}>
                        {icon}
                    </div>
                </div>
                <div>
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                    <p className="text-[11px] font-medium text-muted-foreground mt-1.5">{sub}</p>
                </div>
            </div>
        </div>
    );
}

// ============================================
// Campaign List
// ============================================

function CampaignList({
    campaigns,
    onToggle,
}: {
    campaigns: FbCampaign[];
    onToggle: (id: string) => void;
}) {
    return (
        <div className="space-y-4">
            {campaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c} onToggle={() => onToggle(c.id)} />
            ))}
        </div>
    );
}

function CampaignCard({
    campaign: c,
    onToggle,
}: {
    campaign: FbCampaign;
    onToggle: () => void;
}) {
    const cprRatio = c.cpr_target > 0 ? c.cpr / c.cpr_target : 0;
    const cprColor =
        cprRatio > 1.3 ? "text-destructive" : cprRatio > 1.0 ? "text-amber-500" : "text-emerald-500";
    const budgetPct = c.lifetime_budget
        ? Math.round((c.spent / c.lifetime_budget) * 100)
        : null;

    return (
        <div className="card-elevated p-6 hover:border-primary/20 transition-colors">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Left: Name & Status */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                            <span
                                className={`inline-block h-2.5 w-2.5 rounded-full ${c.status === 'active' ? 'animate-pulse-dot shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''}`}
                                style={{ backgroundColor: getCampaignStatusColor(c.status) }}
                            />
                            <h3 className="text-[16px] font-bold text-foreground">{c.name}</h3>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-bold text-muted-foreground uppercase tracking-widest">
                            {c.objective.replace("_", " ")}
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-[12px] font-medium text-muted-foreground ml-[18px]">
                        <span>ID: <code className="text-[11px] bg-muted px-1 py-0.5 rounded font-mono">{c.fb_campaign_id}</code></span>
                        <div className="h-3 w-px bg-border hidden sm:block" />
                        <span>Từ: {c.start_date}</span>
                        <div className="h-3 w-px bg-border hidden lg:block" />
                        <div className="flex flex-wrap gap-1.5">
                            {c.tags.map((t) => (
                                <span
                                    key={t}
                                    className="px-2 py-0.5 rounded-md bg-indigo-50/50 border border-indigo-100 text-indigo-600 text-[10px] font-bold tracking-wide"
                                >
                                    #{t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Toggle */}
                <button
                    onClick={onToggle}
                    className={`flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2 text-[12px] font-bold transition-all shadow-sm ${ c.status === "active" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : c.status === "paused" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-muted text-muted-foreground cursor-not-allowed" }`}
                    disabled={c.status !== "active" && c.status !== "paused"}
                >
                    {c.status === "active" ? (
                        <>
                            <Pause className="h-3.5 w-3.5" /> Tạm dừng
                        </>
                    ) : (
                        <>
                            <Play className="h-3.5 w-3.5" /> Bật lại
                        </>
                    )}
                </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 mt-6 pt-6 border-t border-border/60">
                <MetricCell label="Chi tiêu" value={formatVND(c.spent)} />
                <MetricCell
                    label="CPR"
                    value={c.cpr > 0 ? formatVND(Math.round(c.cpr)) : "—"}
                    className={cprColor}
                />
                <MetricCell
                    label="Target CPR"
                    value={c.cpr_target > 0 ? formatVND(c.cpr_target) : "—"}
                />
                <MetricCell label="Results" value={String(c.results)} className="font-bold text-primary" />
                <MetricCell label="CTR" value={`${c.ctr.toFixed(2)}%`} />
                <MetricCell label="CPC" value={formatVND(Math.round(c.cpc))} />
                <MetricCell label="Frequency" value={c.frequency.toFixed(1)} className={c.frequency > 2.5 ? "text-amber-500 font-bold" : ""} />
            </div>

            {/* Budget progress bar */}
            {budgetPct !== null && (
                <div className="mt-5 bg-muted/50 p-3 rounded-lg border border-border">
                    <div className="flex justify-between items-center text-[11px] font-bold text-muted-foreground mb-2">
                        <span className="uppercase tracking-widest">Ngân sách trọn đời</span>
                        <span>{formatVND(c.spent)} / {formatVND(c.lifetime_budget!)} ({budgetPct}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted/80 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${budgetPct > 90 ? 'bg-destructive' : 'bg-primary'}`}
                            style={{ width: `${Math.min(budgetPct, 100)}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function MetricCell({
    label,
    value,
    className = "",
}: {
    label: string;
    value: string;
    className?: string;
}) {
    return (
        <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-1.5">{label}</p>
            <p className={`text-[15px] font-bold text-foreground ${className}`}>{value}</p>
        </div>
    );
}

// ============================================
// Alerts List
// ============================================

function AlertsList({ alerts }: { alerts: FbAlert[] }) {
    return (
        <div className="space-y-4">
            {alerts.length === 0 ? (
                <div className="card-elevated p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Bell className="h-8 w-8 text-zinc-300" />
                    </div>
                    <p className="font-medium">Không có cảnh báo nào</p>
                </div>
            ) : (
                alerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
            )}
        </div>
    );
}

function AlertCard({ alert }: { alert: FbAlert }) {
    const severityStyles = {
        critical: "border-destructive/20 bg-destructive/[0.02]",
        warning: "border-amber-500/20 bg-amber-500/[0.02]",
        info: "border-primary/20 bg-primary/[0.02]",
    };
    const severityDot = {
        critical: "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]",
        warning: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
        info: "bg-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]",
    };

    return (
        <div className={`card-elevated p-5 transition-opacity ${severityStyles[alert.severity]} ${!alert.is_read ? "" : "opacity-70 grayscale-[30%]"}`}>
            <div className="flex items-start gap-4">
                <div className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${severityDot[alert.severity]}`} />
                <div className="flex-1">
                    <div className="flex sm:items-center flex-col sm:flex-row justify-between mb-2">
                        <h4 className="text-[14px] font-bold text-foreground">
                            {alert.campaign_name}
                        </h4>
                        <span className="text-[11px] font-medium text-muted-foreground mt-1 sm:mt-0">
                            {new Date(alert.created_at).toLocaleString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                            })}
                        </span>
                    </div>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{alert.message}</p>
                    {alert.action_taken && (
                        <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-emerald-50/80 border border-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-600 tracking-wide uppercase">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {alert.action_taken}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================
// Agent Actions List
// ============================================

function ActionsList({ actions }: { actions: FbAgentAction[] }) {
    return (
        <div className="space-y-4">
            {actions.length === 0 ? (
                <div className="card-elevated p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Bot className="h-8 w-8 text-zinc-300" />
                    </div>
                    <p className="font-medium">Chưa có AI action nào</p>
                </div>
            ) : (
                actions.map((action) => <ActionCard key={action.id} action={action} />)
            )}
        </div>
    );
}

function ActionCard({ action }: { action: FbAgentAction }) {
    const statusStyles: Record<FbAgentAction["status"], { bg: string; text: string; icon: React.ReactNode }> = {
        executed: {
            bg: "bg-emerald-50/80 border border-emerald-100",
            text: "text-emerald-600",
            icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        },
        pending_approval: {
            bg: "bg-amber-50/80 border border-amber-100",
            text: "text-amber-600",
            icon: <Clock className="h-3.5 w-3.5" />,
        },
        rejected: {
            bg: "bg-red-50/80 border border-red-100",
            text: "text-red-600",
            icon: <XCircle className="h-3.5 w-3.5" />,
        },
    };

    const style = statusStyles[action.status];
    const actionLabels: Record<FbAgentAction["action"], string> = {
        pause_campaign: "Tạm dừng chiến dịch",
        increase_budget: "Tăng ngân sách",
        decrease_budget: "Giảm ngân sách",
        adjust_audience: "Điều chỉnh audience",
        create_alert: "Tạo cảnh báo",
        optimize_bid: "Tối ưu bid",
    };

    return (
        <div className="card-elevated p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="rounded-md bg-primary p-2.5 shadow-md shadow-primary/20">
                        <Bot className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h4 className="text-[14px] font-bold text-foreground">
                            {actionLabels[action.action]}
                        </h4>
                        <p className="text-[12px] font-medium text-muted-foreground mt-1">{action.campaign_name}</p>
                    </div>
                </div>
                <div
                    className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest ${style.bg} ${style.text}`}
                >
                    {style.icon}
                    {action.status === "pending_approval"
                        ? "Chờ duyệt"
                        : action.status === "executed"
                          ? "Đã thực hiện"
                          : "Từ chối"}
                </div>
            </div>
            
            <div className="mt-4 sm:ml-14 rounded-lg bg-muted/80 border border-border p-4">
                <p className="text-[13px] text-foreground font-medium leading-relaxed">{action.reason}</p>
            </div>

            {/* Approve/Reject buttons for pending */}
            {action.status === "pending_approval" && (
                <div className="flex flex-wrap gap-2 mt-4 sm:ml-14">
                    <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[12px] font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/95 transition-all">
                        <CheckCircle2 className="h-4 w-4" />
                        Phê duyệt
                    </button>
                    <button className="flex items-center gap-2 rounded-lg bg-white border border-border px-4 py-2 text-[12px] font-bold text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground transition-colors">
                        <XCircle className="h-4 w-4" />
                        Từ chối
                    </button>
                </div>
            )}

            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mt-4 sm:ml-14">
                {new Date(action.created_at).toLocaleString("vi-VN")}
            </p>
        </div>
    );
}

// ============================================
// Content Management
// ============================================

interface ContentPost {
    id: string;
    title: string;
    body: string;
    hashtags: string[];
    image_url: string | null;
    status: "draft" | "pending" | "approved" | "scheduled" | "published" | "failed";
    category: string;
    tone: string;
    likes: number;
    comments: number;
    shares: number;
    scheduled_at: string | null;
    published_at: string | null;
    created_at: string;
}

const mockContentPosts: ContentPost[] = [
    {
        id: "1",
        title: "5 Xu hướng Marketing 2026 không thể bỏ lỡ",
        body: "Năm 2026 đánh dấu sự bùng nổ của AI trong marketing. Từ chatbot thông minh đến tạo content tự động, các doanh nghiệp đang thay đổi cách tiếp cận khách hàng...",
        hashtags: ["#Marketing2026", "#AIMarketing", "#TulieLab"],
        image_url: null,
        status: "draft",
        category: "education",
        tone: "professional",
        likes: 0, comments: 0, shares: 0,
        scheduled_at: null,
        published_at: null,
        created_at: "2026-03-23T06:00:00Z",
    },
    {
        id: "2",
        title: "Cách tối ưu CPR Facebook Ads dưới 20K",
        body: "Bí quyết chạy quảng cáo Facebook hiệu quả: Targeting chính xác, creative hấp dẫn, và A/B testing liên tục. Đội ngũ Tulie đã giảm CPR từ 45K xuống 18K trong 2 tuần...",
        hashtags: ["#FacebookAds", "#CPR", "#DigitalMarketing"],
        image_url: "https://via.placeholder.com/800x400/3b82f6/ffffff?text=FB+Ads+Tips",
        status: "pending",
        category: "education",
        tone: "professional",
        likes: 0, comments: 0, shares: 0,
        scheduled_at: null,
        published_at: null,
        created_at: "2026-03-22T14:30:00Z",
    },
    {
        id: "3",
        title: "Behind the scenes: Team Tulie brainstorm sáng thứ 2",
        body: "Mỗi sáng thứ 2, team Tulie cùng nhau brainstorm ý tưởng cho tuần mới. Không gian sáng tạo, cà phê nóng, và những ý tưởng điên rồ nhất...",
        hashtags: ["#HauTruong", "#TeamTulie", "#Culture"],
        image_url: "https://via.placeholder.com/800x400/8b5cf6/ffffff?text=Behind+The+Scenes",
        status: "approved",
        category: "casual",
        tone: "casual",
        likes: 0, comments: 0, shares: 0,
        scheduled_at: "2026-03-24T09:00:00Z",
        published_at: null,
        created_at: "2026-03-21T10:00:00Z",
    },
    {
        id: "4",
        title: "Workshop: Xây dựng Brand trên Social Media",
        body: "Tham gia workshop miễn phí cùng chuyên gia Tulie Lab! Học cách xây dựng thương hiệu trên mạng xã hội từ A-Z...",
        hashtags: ["#Workshop", "#Branding", "#SocialMedia"],
        image_url: "https://via.placeholder.com/800x400/10b981/ffffff?text=Workshop",
        status: "published",
        category: "event",
        tone: "professional",
        likes: 234, comments: 45, shares: 18,
        scheduled_at: null,
        published_at: "2026-03-20T08:00:00Z",
        created_at: "2026-03-19T15:00:00Z",
    },
];

function ContentList() {
    const statusConfig: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
        draft: { label: "Nháp", bg: "bg-muted", text: "text-muted-foreground", icon: <PenLine className="h-3.5 w-3.5" /> },
        pending: { label: "Chờ duyệt", bg: "bg-amber-100", text: "text-amber-700", icon: <Clock className="h-3.5 w-3.5" /> },
        approved: { label: "Đã duyệt", bg: "bg-primary/10", text: "text-primary", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
        scheduled: { label: "Đã lên lịch", bg: "bg-purple-100", text: "text-purple-700", icon: <Clock className="h-3.5 w-3.5" /> },
        published: { label: "Đã đăng", bg: "bg-emerald-100", text: "text-emerald-700", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
        failed: { label: "Lỗi", bg: "bg-destructive/10", text: "text-destructive", icon: <XCircle className="h-3.5 w-3.5" /> },
    };

    return (
        <div className="space-y-6 mt-4">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-2.5 rounded-md border border-border shadow-sm">
                <div className="flex items-center gap-2 px-3">
                    <span className="text-[13px] font-bold text-muted-foreground">{mockContentPosts.length} bài viết tổng cộng</span>
                </div>
                <button className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[13px] font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 w-fit">
                    <Sparkles className="h-4 w-4" />
                    AI Tạo bài mới
                </button>
            </div>

            {/* Pipeline Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(statusConfig).filter(([k]) => k !== 'failed').map(([key, config]) => {
                    const count = mockContentPosts.filter(p => p.status === key).length;
                    return (
                        <div key={key} className="card-elevated p-4 group">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`flex h-6 w-6 items-center justify-center rounded-md ${config.bg} ${config.text}`}>
                                    {config.icon}
                                </span>
                                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{config.label}</span>
                            </div>
                            <p className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{count}</p>
                        </div>
                    );
                })}
            </div>

            {/* Content Posts */}
            <div className="space-y-4">
                {mockContentPosts.map((post) => {
                    const st = statusConfig[post.status];
                    return (
                        <div key={post.id} className="card-elevated p-5 sm:p-6 hover:border-primary/20 transition-all group">
                            <div className="flex flex-col sm:flex-row items-start gap-6">
                                {/* Thumbnail */}
                                {post.image_url ? (
                                    <div className="w-full sm:w-32 h-32 rounded-md overflow-hidden bg-muted flex-shrink-0 border border-border shadow-sm relative">
                                        <div className="absolute inset-0 bg-black/10 z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-full sm:w-32 h-32 rounded-md bg-muted border border-border shadow-sm flex items-center justify-center flex-shrink-0">
                                        <ImagePlus className="h-8 w-8 text-muted-foreground/40" />
                                    </div>
                                )}

                                {/* Content */}
                                <div className="flex-1 min-w-0 w-full relative">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                                        <h4 className="text-[16px] font-bold text-foreground group-hover:text-primary transition-colors flex-1">{post.title}</h4>
                                        <span className={`inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase ${st.bg} ${st.text}`}>
                                            {st.icon} {st.label}
                                        </span>
                                    </div>
                                    <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2 mb-4 pr-0 sm:pr-8">{post.body}</p>
                                    
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground bg-muted px-2 py-1 rounded-md">{post.category}</span>
                                        <div className="flex gap-1.5">
                                            {post.hashtags.slice(0, 3).map(h => (
                                                <span key={h} className="text-[11px] font-medium text-primary/80">{h}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-4 sm:pt-0 w-full sm:w-auto border-t sm:border-t-0 border-border ml-0 sm:ml-4">
                                    {post.status === "draft" && (
                                        <>
                                            <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5 text-[12px] font-bold text-primary hover:bg-primary/20 transition-colors">
                                                <Sparkles className="h-3.5 w-3.5" /> Tạo ảnh
                                            </button>
                                            <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-white border border-border px-4 py-2.5 text-[12px] font-bold text-foreground shadow-sm hover:bg-muted transition-colors">
                                                <Send className="h-3.5 w-3.5 text-muted-foreground" /> Gửi duyệt
                                            </button>
                                        </>
                                    )}
                                    {post.status === "pending" && (
                                        <>
                                            <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[12px] font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/95 transition-all">
                                                <CheckCircle2 className="h-3.5 w-3.5" /> Duyệt bài
                                            </button>
                                            <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-white border border-border px-4 py-2.5 text-[12px] font-bold text-foreground shadow-sm hover:bg-muted transition-colors">
                                                <XCircle className="h-3.5 w-3.5 text-muted-foreground" /> Từ chối
                                            </button>
                                        </>
                                    )}
                                    {post.status === "approved" && (
                                        <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-[12px] font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/95 transition-all">
                                            <Send className="h-3.5 w-3.5" /> Đăng ngay
                                        </button>
                                    )}
                                    {post.status === "published" && (
                                        <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5 text-[12px] font-bold text-primary hover:bg-primary/20 transition-colors">
                                            <Megaphone className="h-3.5 w-3.5" /> Boost
                                        </button>
                                    )}
                                    
                                    {post.published_at && (
                                        <div className="text-[11px] font-medium text-muted-foreground bg-muted px-3 py-2 rounded-lg border border-border flex gap-3 sm:mt-2 w-full sm:w-auto justify-center">
                                            <span className="flex items-center gap-1.5"><span className="text-red-500">❤️</span> {post.likes}</span>
                                            <span className="flex items-center gap-1.5"><span className="text-blue-500">💬</span> {post.comments}</span>
                                            <span className="flex items-center gap-1.5"><span className="text-emerald-500">🔄</span> {post.shares}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
