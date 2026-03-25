"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layouts/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Key,
    TrendingUp,
    Trash2,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    Save,
    Bot,
    DollarSign,
    Zap,
    Plus,
    Loader2,
    TestTube,
    Star,
    Power,
    PowerOff,
    RefreshCw,
    Brain,
    Image as ImageIcon,
    Wrench,
    Sparkles,
} from "lucide-react";

// Types
interface ProviderModel {
    modelId: string;
    displayName: string;
    description: string;
    inputPrice: number;
    outputPrice: number;
    maxContext: number;
    supportsVision: boolean;
    supportsJson: boolean;
    supportsTools: boolean;
    tier: string;
    isEnabled: boolean;
    isDefault?: boolean;
    providerActive?: boolean;
}

interface Provider {
    provider: string;
    label: string;
    isConfigured: boolean;
    isActive: boolean;
    keyMasked: string;
    baseUrl: string | null;
    lastTestedAt: string | null;
    testStatus: string;
    testError: string | null;
    models: ProviderModel[];
}

const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "ai-models", label: "AI Models", icon: Brain },
    { id: "usage", label: "Usage", icon: TrendingUp },
] as const;

type Tab = (typeof tabs)[number]["id"];

const providerColors: Record<string, string> = {
    openai: "bg-emerald-50 text-emerald-700 border-emerald-200",
    anthropic: "bg-orange-50 text-orange-700 border-orange-200",
    google: "bg-primary/10 text-primary border-primary/20",
    deepseek: "bg-violet-50 text-violet-700 border-violet-200",
};

const tierBadge: Record<string, { label: string; className: string }> = {
    budget: { label: "Budget", className: "bg-green-100 text-green-700" },
    standard: { label: "Standard", className: "bg-primary/10 text-primary" },
    premium: { label: "Premium", className: "bg-amber-100 text-amber-700" },
};

function formatPrice(price: number): string {
    if (price < 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(2)}`;
}

function formatContext(tokens: number): string {
    if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
    return `${(tokens / 1_000).toFixed(0)}K`;
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("ai-models");
    const [providers, setProviders] = useState<Provider[]>([]);
    const [allModels, setAllModels] = useState<ProviderModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
    const [newKeys, setNewKeys] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState<Record<string, boolean>>({});
    const [testing, setTesting] = useState<Record<string, boolean>>({});
    const [defaultModel, setDefaultModel] = useState<string>("gpt-4o");

    // Fetch providers
    const fetchProviders = useCallback(async () => {
        try {
            const res = await fetch("/api/settings/providers");
            if (res.ok) {
                const data = await res.json();
                setProviders(data.providers);
            }
        } catch (e) {
            console.error("Failed to fetch providers:", e);
        }
    }, []);

    // Fetch models
    const fetchModels = useCallback(async () => {
        try {
            const res = await fetch("/api/settings/models");
            if (res.ok) {
                const data = await res.json();
                setAllModels(data.models);
                const def = data.models.find((m: ProviderModel) => m.isDefault);
                if (def) setDefaultModel(def.modelId);
            }
        } catch (e) {
            console.error("Failed to fetch models:", e);
        }
    }, []);

    useEffect(() => {
        Promise.all([fetchProviders(), fetchModels()]).finally(() => setLoading(false));
    }, [fetchProviders, fetchModels]);

    // Save API key
    const handleSaveKey = async (provider: string) => {
        const apiKey = newKeys[provider];
        if (!apiKey) return;

        setSaving(prev => ({ ...prev, [provider]: true }));
        try {
            const res = await fetch("/api/settings/providers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider, apiKey }),
            });

            if (res.ok) {
                setNewKeys(prev => ({ ...prev, [provider]: "" }));
                await fetchProviders();
            }
        } finally {
            setSaving(prev => ({ ...prev, [provider]: false }));
        }
    };

    // Test connection
    const handleTestConnection = async (provider: string) => {
        setTesting(prev => ({ ...prev, [provider]: true }));
        try {
            await fetch("/api/settings/providers", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider, action: "test" }),
            });
            await fetchProviders();
        } finally {
            setTesting(prev => ({ ...prev, [provider]: false }));
        }
    };

    // Toggle provider active
    const handleToggleActive = async (provider: string, isActive: boolean) => {
        await fetch("/api/settings/providers", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provider, isActive }),
        });
        await fetchProviders();
    };

    // Delete provider
    const handleDeleteProvider = async (provider: string) => {
        await fetch("/api/settings/providers", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provider }),
        });
        await fetchProviders();
    };

    // Set default model
    const handleSetDefault = async (modelId: string) => {
        setDefaultModel(modelId);
        await fetch("/api/settings/models", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ modelId, isDefault: true }),
        });
        await fetchModels();
    };

    return (
        <>
            <Header title="Settings" />
            <div className="max-w-[1600px] mx-auto">
                {/* Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 p-1.5 mb-8 bg-zinc-100/80 rounded-2xl w-fit border border-border/40 shadow-inner">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 text-[13px] transition-all duration-200 rounded-xl ${
                                activeTab === tab.id
                                    ? "bg-white text-foreground shadow-sm font-bold ring-1 ring-border/50"
                                    : "text-muted-foreground hover:bg-zinc-200/50 hover:text-foreground font-semibold"
                            }`}
                        >
                            <tab.icon className={`h-4.5 w-4.5 ${activeTab === tab.id ? "text-primary" : "text-muted-foreground"}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Profile Tab */}
                {activeTab === "profile" && (
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-6">
                            <Card className="card-elevated border-transparent">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl font-bold text-foreground">
                                        Profile information
                                    </CardTitle>
                                    <CardDescription className="text-[13px] font-medium text-muted-foreground mt-1.5">
                                        Update your account details and public appearance.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5 pt-2">
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Full name</Label>
                                            <Input id="name" defaultValue="Tung Nguyen" className="h-11 rounded-xl border-border/60 bg-zinc-50/50 text-[14px] font-medium focus:bg-white transition-colors" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="company" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Company</Label>
                                            <Input id="company" defaultValue="Tulie Agency" className="h-11 rounded-xl border-border/60 bg-zinc-50/50 text-[14px] font-medium focus:bg-white transition-colors" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Email address</Label>
                                        <Input id="email" defaultValue="tung@tulie.agency" disabled className="h-11 rounded-xl text-[14px] font-medium bg-zinc-100/50 border-border/40 text-muted-foreground" />
                                        <p className="text-[11px] font-semibold text-muted-foreground mt-1.5 flex items-center gap-1.5">
                                            <AlertCircle className="h-3 w-3" />
                                            Email address cannot be changed.
                                        </p>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <Button className="h-10 px-5 text-[13px] font-bold shadow-md shadow-primary/20 bg-primary hover:bg-primary/95 text-white transition-transform active:scale-95 gap-2">
                                            <Save className="h-4 w-4" />
                                            Save changes
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        
                        <div className="space-y-6">
                            <Card className="card-elevated border-rose-100/50 shadow-sm shadow-rose-500/5">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl font-bold text-rose-600 flex items-center gap-2">
                                        <Trash2 className="h-5 w-5" />
                                        Danger zone
                                    </CardTitle>
                                    <CardDescription className="text-[13px] font-medium text-muted-foreground mt-1.5">
                                        Irreversible actions for your account. Proceed with caution.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-2">
                                    <p className="text-[13px] font-medium text-foreground mb-4 leading-relaxed">
                                        Once you delete your account, there is no going back. Please be certain. All data will be permanently erased.
                                    </p>
                                    <Button variant="destructive" className="h-10 px-5 text-[13px] font-bold shadow-sm">
                                        Delete account
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* AI Models Tab */}
                {activeTab === "ai-models" && (
                    <div className="space-y-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <>
                                {/* API Keys Card */}
                                <Card className="card-elevated border-transparent">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
                                                <Key className="h-4.5 w-4.5" />
                                            </div>
                                            API Configuration
                                        </CardTitle>
                                        <CardDescription className="text-[13px] font-medium text-muted-foreground mt-1.5 px-10">
                                            Securely connect to AI providers. Your keys are AES-256 encrypted before storage.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6 pt-2">
                                        {providers.map((prov) => (
                                            <div key={prov.provider} className="space-y-4 p-5 rounded-2xl border border-border/60 bg-zinc-50/30 transition-all hover:bg-white hover:shadow-sm hover:border-border/80">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex flex-wrap items-center gap-2.5">
                                                        <Badge variant="outline" className={`text-[11px] font-bold px-2.5 py-0.5 tracking-wide ${providerColors[prov.provider] ?? ""}`}>
                                                            {prov.label}
                                                        </Badge>
                                                        {prov.isConfigured ? (
                                                            <Badge variant="default" className="text-[10px] font-bold tracking-wider uppercase gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100/80 px-2 py-0.5">
                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                                Connected
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[10px] font-bold tracking-wider uppercase gap-1.5 bg-zinc-100 text-muted-foreground border-border/60 px-2 py-0.5">
                                                                <AlertCircle className="h-3.5 w-3.5" />
                                                                Not config'd
                                                            </Badge>
                                                        )}
                                                        {prov.testStatus === "success" && (
                                                            <Badge variant="outline" className="text-xs gap-1 text-emerald-600 border-emerald-200">
                                                                <TestTube className="h-3 w-3" />
                                                                Tested ✓
                                                            </Badge>
                                                        )}
                                                        {prov.testStatus === "failed" && (
                                                            <Badge variant="outline" className="text-xs gap-1 text-red-600 border-red-200">
                                                                <AlertCircle className="h-3 w-3" />
                                                                Test failed
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {prov.isConfigured && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleToggleActive(prov.provider, !prov.isActive)}
                                                                    className={`p-1 rounded ${prov.isActive ? "text-emerald-600 hover:text-emerald-700" : "text-muted-foreground hover:text-muted-foreground"}`}
                                                                    title={prov.isActive ? "Tắt provider" : "Bật provider"}
                                                                >
                                                                    {prov.isActive ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleTestConnection(prov.provider)}
                                                                    disabled={testing[prov.provider]}
                                                                    className="p-1 rounded text-muted-foreground hover:text-muted-foreground"
                                                                    title="Test kết nối"
                                                                >
                                                                    {testing[prov.provider] ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <TestTube className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteProvider(prov.provider)}
                                                                    className="p-1 rounded text-muted-foreground hover:text-red-600"
                                                                    title="Xóa API key"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() =>
                                                                setShowKeys((prev) => ({
                                                                    ...prev,
                                                                    [prov.provider]: !prev[prov.provider],
                                                                }))
                                                            }
                                                            className="text-muted-foreground hover:text-muted-foreground"
                                                        >
                                                            {showKeys[prov.provider] ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type={showKeys[prov.provider] ? "text" : "password"}
                                                        placeholder={`Enter ${prov.label} API key`}
                                                        value={newKeys[prov.provider] ?? ""}
                                                        onChange={(e) => setNewKeys(prev => ({ ...prev, [prov.provider]: e.target.value }))}
                                                        className="font-mono text-[13px] h-11 rounded-xl border-border/60 bg-white shadow-sm focus:bg-white transition-colors"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleSaveKey(prov.provider)}
                                                        disabled={!newKeys[prov.provider] || saving[prov.provider]}
                                                        className="h-11 px-5 text-[13px] font-bold shadow-sm"
                                                    >
                                                        {saving[prov.provider] ? (
                                                            <Loader2 className="h-4.5 w-4.5 animate-spin mr-2" />
                                                        ) : (
                                                            <Save className="h-4.5 w-4.5 mr-2" />
                                                        )}
                                                        Save Key
                                                    </Button>
                                                </div>
                                                {prov.isConfigured && prov.keyMasked && (
                                                    <p className="text-[12px] text-muted-foreground font-mono bg-white inline-block px-3 py-1.5 rounded-lg border border-border/40 shadow-sm">
                                                        Current: {prov.keyMasked}
                                                    </p>
                                                )}
                                                {prov.testError && (
                                                    <p className="text-[12px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg shadow-sm">
                                                        Error: {prov.testError}
                                                    </p>
                                                )}
                                                <p className="text-[12px] font-medium text-muted-foreground pt-1">
                                                    Available models: <span className="text-foreground">{prov.models.map(m => m.displayName).join(", ")}</span>
                                                </p>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Model Registry */}
                                <Card className="card-elevated border-transparent">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2.5">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 border border-amber-100 text-amber-600">
                                                        <Sparkles className="h-4.5 w-4.5" />
                                                    </div>
                                                    Model Registry
                                                </CardTitle>
                                                <CardDescription className="text-[13px] font-medium text-muted-foreground mt-1.5 px-10">
                                                    All available models and their context limits. Click ⭐ to set your default.
                                                </CardDescription>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => { fetchProviders(); fetchModels(); }} className="h-9 px-4 text-[12px] font-bold shadow-sm rounded-lg hover:bg-zinc-100 border-border/80">
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Refresh Data
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-border">
                                                        <th className="text-left py-2 font-medium text-muted-foreground">Model</th>
                                                        <th className="text-left py-2 font-medium text-muted-foreground">Provider</th>
                                                        <th className="text-right py-2 font-medium text-muted-foreground">Input $/1M</th>
                                                        <th className="text-right py-2 font-medium text-muted-foreground">Output $/1M</th>
                                                        <th className="text-right py-2 font-medium text-muted-foreground">Context</th>
                                                        <th className="text-center py-2 font-medium text-muted-foreground">Tính năng</th>
                                                        <th className="text-center py-2 font-medium text-muted-foreground">Tier</th>
                                                        <th className="text-center py-2 font-medium text-muted-foreground">Default</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(allModels.length > 0 ? allModels : providers.flatMap(p => p.models)).map((model) => {
                                                        const provActive = "providerActive" in model ? model.providerActive : true;
                                                        const isDefault = defaultModel === model.modelId;

                                                        return (
                                                            <tr
                                                                key={model.modelId}
                                                                className={`border-b border-border/50 transition-colors ${!provActive ? "opacity-40" : "hover:bg-accent/50"}`}
                                                            >
                                                                <td className="py-2.5">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-medium text-foreground">{model.displayName}</span>
                                                                        {model.description && (
                                                                            <span className="text-xs text-muted-foreground hidden lg:inline">{model.description}</span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="py-2.5">
                                                                    <Badge variant="outline" className={`text-xs ${providerColors[("provider" in model ? model.provider : "") as string] ?? ""}`}>
                                                                        {(() => { const p = ("provider" in model ? String(model.provider) : ""); return p.charAt(0).toUpperCase() + p.slice(1); })()}
                                                                    </Badge>
                                                                </td>
                                                                <td className="text-right py-2.5 font-mono text-muted-foreground">
                                                                    {formatPrice(model.inputPrice)}
                                                                </td>
                                                                <td className="text-right py-2.5 font-mono text-muted-foreground">
                                                                    {formatPrice(model.outputPrice)}
                                                                </td>
                                                                <td className="text-right py-2.5 text-muted-foreground">
                                                                    {formatContext(model.maxContext)}
                                                                </td>
                                                                <td className="py-2.5">
                                                                    <div className="flex gap-1 justify-center">
                                                                        {model.supportsVision && (
                                                                            <span title="Vision" className="text-muted-foreground"><ImageIcon className="h-3.5 w-3.5" /></span>
                                                                        )}
                                                                        {model.supportsTools && (
                                                                            <span title="Tools/Functions" className="text-muted-foreground"><Wrench className="h-3.5 w-3.5" /></span>
                                                                        )}
                                                                        {model.supportsJson && (
                                                                            <span title="JSON mode" className="text-muted-foreground text-xs font-mono">{"{}"}</span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="py-2.5 text-center">
                                                                    <Badge className={`text-xs ${tierBadge[model.tier]?.className ?? ""}`}>
                                                                        {tierBadge[model.tier]?.label ?? model.tier}
                                                                    </Badge>
                                                                </td>
                                                                <td className="py-2.5 text-center">
                                                                    <button
                                                                        onClick={() => handleSetDefault(model.modelId)}
                                                                        className={`p-1 rounded transition-colors ${isDefault
                                                                            ? "text-amber-500"
                                                                            : "text-muted-foreground/60 hover:text-amber-400"
                                                                        }`}
                                                                        title={isDefault ? "Model mặc định" : "Đặt làm mặc định"}
                                                                        disabled={!provActive}
                                                                    >
                                                                        <Star className={`h-4 w-4 ${isDefault ? "fill-amber-500" : ""}`} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Cost Comparison */}
                                <Card className="card-elevated border-transparent">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
                                                <DollarSign className="h-4.5 w-4.5" />
                                            </div>
                                            Estimated Cost (per 1000 messages)
                                        </CardTitle>
                                        <CardDescription className="text-[13px] font-medium text-muted-foreground mt-1.5 px-10">
                                            Based on an average of 500 input + 300 output tokens per interaction.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <div className="space-y-3.5">
                                            {(allModels.length > 0 ? allModels : providers.flatMap(p => p.models))
                                                .sort((a, b) => {
                                                    const costA = (a.inputPrice * 500 + a.outputPrice * 300) / 1_000_000;
                                                    const costB = (b.inputPrice * 500 + b.outputPrice * 300) / 1_000_000;
                                                    return costA - costB;
                                                })
                                                .map((model, idx) => {
                                                    const cost1k = ((model.inputPrice * 500 + model.outputPrice * 300) / 1_000_000) * 1000;
                                                    const maxCost = ((allModels.length > 0 ? allModels : providers.flatMap(p => p.models))
                                                        .reduce((max, m) => {
                                                            const c = ((m.inputPrice * 500 + m.outputPrice * 300) / 1_000_000) * 1000;
                                                            return c > max ? c : max;
                                                        }, 0));
                                                    const pct = maxCost > 0 ? (cost1k / maxCost) * 100 : 0;

                                                    return (
                                                        <div key={model.modelId} className="flex items-center gap-4 group">
                                                            <span className="text-[13px] font-semibold text-muted-foreground w-40 shrink-0 truncate group-hover:text-foreground transition-colors">
                                                                {model.displayName}
                                                            </span>
                                                            <div className="flex-1 h-6 bg-zinc-100/80 rounded-lg overflow-hidden border border-border/40 shadow-inner block">
                                                                <div
                                                                    className={`h-full rounded-md transition-all duration-500 ease-out ${idx === 0 ? "bg-emerald-500 shadow-sm" : idx <= 2 ? "bg-emerald-400 opacity-90" : "bg-muted-foreground/30"}`}
                                                                    style={{ width: `${Math.max(pct, 2)}%` }}
                                                                />
                                                            </div>
                                                            <span className={`text-[13px] font-bold font-mono w-20 text-right shrink-0 ${idx === 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                                                                ${cost1k.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>
                )}

                {/* Usage Tab */}
                {activeTab === "usage" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="card-elevated border-transparent">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                                        <div className="p-2 bg-zinc-100 rounded-lg shadow-sm border border-border/40">
                                            <Zap className="h-4.5 w-4.5 text-zinc-600" />
                                        </div>
                                        <span className="text-[12px] font-bold uppercase tracking-wider">Total tokens</span>
                                    </div>
                                    <p className="text-3xl font-bold text-foreground">—</p>
                                    <p className="text-[13px] font-medium text-muted-foreground mt-2">Will appear when processing requests</p>
                                </CardContent>
                            </Card>
                            <Card className="card-elevated border-transparent">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                                        <div className="p-2 bg-emerald-50 rounded-lg shadow-sm border border-emerald-100">
                                            <DollarSign className="h-4.5 w-4.5 text-emerald-600" />
                                        </div>
                                        <span className="text-[12px] font-bold uppercase tracking-wider">Total cost</span>
                                    </div>
                                    <p className="text-3xl font-bold text-foreground">—</p>
                                    <p className="text-[13px] font-medium text-muted-foreground mt-2">Computed from token burn rates</p>
                                </CardContent>
                            </Card>
                            <Card className="card-elevated border-transparent">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                                        <div className="p-2 bg-indigo-50 rounded-lg shadow-sm border border-indigo-100">
                                            <Bot className="h-4.5 w-4.5 text-indigo-600" />
                                        </div>
                                        <span className="text-[12px] font-bold uppercase tracking-wider">Active connections</span>
                                    </div>
                                    <p className="text-3xl font-bold text-foreground">
                                        {providers.filter(p => p.isConfigured && p.isActive).length}
                                    </p>
                                    <p className="text-[13px] font-medium text-muted-foreground mt-2">Configured and enabled AI APIs</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="card-elevated border-transparent">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl font-bold text-foreground">
                                    Usage tracking
                                </CardTitle>
                                <CardDescription className="text-[13px] font-medium text-muted-foreground mt-1.5">
                                    Every AI request will be logged with full token and cost telemetry.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="flex items-center justify-center py-16 text-muted-foreground rounded-2xl border-2 border-dashed border-border/40 bg-zinc-50/50">
                                    <div className="text-center space-y-4">
                                        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-white shadow-sm border border-border/60">
                                            <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-bold text-foreground">No telemetry available</p>
                                            <p className="text-[13px] font-medium text-muted-foreground mt-1 max-w-sm">
                                                Start chatting or trigger an automation to begin seeing usage statistics here.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </>
    );
}
