"use client";

import { useState } from "react";
import { Header } from "@/components/layouts/header";
import { Button } from "@repo/ui";
import {
    Card,
    CardContent,
} from "@repo/ui";
import { Badge } from "@repo/ui";
import { Input } from "@repo/ui";
import { Label } from "@repo/ui";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@repo/ui";
import {
    Users,
    UserPlus,
    Shield,
    Crown,
    Eye,
    Briefcase,
    Mail,
    MoreVertical,
    Trash2,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@repo/ui";

// ─── Mock Data ───

const mockOrg = {
    id: "org-001",
    name: "Tulie Agency",
    plan: "enterprise",
    memberCount: 5,
    createdAt: "2026-01-01T00:00:00Z",
};

type OrgRole = "owner" | "manager" | "specialist" | "viewer";

interface Member {
    id: string;
    userId: string;
    name: string;
    email: string;
    role: OrgRole;
    joinedAt: string;
    avatarUrl?: string;
}

const mockMembers: Member[] = [
    { id: "mem-1", userId: "u1", name: "Tung Nguyen", email: "tung@tulie.app", role: "owner", joinedAt: "2026-01-01T00:00:00Z" },
    { id: "mem-2", userId: "u2", name: "Minh Tran", email: "minh@tulie.app", role: "manager", joinedAt: "2026-01-10T00:00:00Z" },
    { id: "mem-3", userId: "u3", name: "Linh Pham", email: "linh@tulie.app", role: "specialist", joinedAt: "2026-01-15T00:00:00Z" },
    { id: "mem-4", userId: "u4", name: "Hoa Le", email: "hoa@tulie.app", role: "specialist", joinedAt: "2026-02-01T00:00:00Z" },
    { id: "mem-5", userId: "u5", name: "An Vo", email: "an@tulie.app", role: "viewer", joinedAt: "2026-02-05T00:00:00Z" },
];

const roleConfig: Record<OrgRole, { label: string; icon: typeof Crown; color: string; description: string }> = {
    owner: { label: "Owner", icon: Crown, color: "bg-primary/10 text-primary", description: "Full access, billing, system prompts" },
    manager: { label: "Manager", icon: Shield, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", description: "View & approve tasks, manage knowledge" },
    specialist: { label: "Specialist", icon: Briefcase, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", description: "Create tasks, view own history only" },
    viewer: { label: "Viewer", icon: Eye, color: "bg-secondary text-foreground", description: "Read-only access" },
};

export default function TeamPage() {
    const [members, setMembers] = useState<Member[]>(mockMembers);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<OrgRole>("specialist");
    const [showInvite, setShowInvite] = useState(false);

    const handleInvite = () => {
        if (!inviteEmail) return;
        const newMember: Member = {
            id: `mem-${Date.now()}`,
            userId: `u-${Date.now()}`,
            name: inviteEmail.split("@")[0],
            email: inviteEmail,
            role: inviteRole,
            joinedAt: new Date().toISOString(),
        };
        setMembers([...members, newMember]);
        setInviteEmail("");
        setShowInvite(false);
    };

    const handleRoleChange = (memberId: string, newRole: OrgRole) => {
        setMembers(members.map((m) =>
            m.id === memberId ? { ...m, role: newRole } : m
        ));
    };

    const handleRemove = (memberId: string) => {
        setMembers(members.filter((m) => m.id !== memberId));
    };

    return (
        <>
            <Header title="Team management" />
            <div className="max-w-4xl">
                {/* Org Info */}
                <Card className="card-elevated mb-6 border-transparent">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center text-primary text-lg">
                                    TA
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">{mockOrg.name}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-0 font-medium">
                                            {mockOrg.plan.charAt(0).toUpperCase() + mockOrg.plan.slice(1)} Plan
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">· {members.length} members</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Role Legend */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {(Object.entries(roleConfig) as [OrgRole, typeof roleConfig.owner][]).map(([role, config]) => {
                        const Icon = config.icon;
                        const count = members.filter((m) => m.role === role).length;
                        return (
                            <div key={role} className="flex items-start gap-3 p-3 rounded-md bg-accent/30 border border-border/40 transition-colors hover:bg-accent/50">
                                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.color}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                        {config.label} <span className="text-muted-foreground text-xs font-normal">({count})</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{config.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Invite Section */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Users className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-foreground">Team Members</h3>
                            <p className="text-xs text-muted-foreground">Manage your team and their roles</p>
                        </div>
                    </div>
                    <Button 
                        size="sm" 
                        onClick={() => setShowInvite(!showInvite)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Member
                    </Button>
                </div>

                {showInvite && (
                    <Card className="mb-6 shadow-none border-2 border-dashed border-primary/20 bg-primary/5 xl:rounded-md">
                        <CardContent className="p-5">
                            <div className="flex flex-col sm:flex-row items-end gap-4">
                                <div className="flex-1 w-full">
                                    <Label className="text-xs font-medium text-foreground mb-1.5 block">Email Address</Label>
                                    <Input
                                        type="email"
                                        placeholder="colleague@company.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="bg-background border-border/60 focus-visible:ring-primary/20 h-10"
                                    />
                                </div>
                                <div className="w-full sm:w-48">
                                    <Label className="text-xs font-medium text-foreground mb-1.5 block">Role</Label>
                                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as OrgRole)}>
                                        <SelectTrigger className="bg-background border-border/60 h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="specialist">Specialist</SelectItem>
                                            <SelectItem value="viewer">Viewer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button 
                                    onClick={handleInvite} 
                                    disabled={!inviteEmail}
                                    className="w-full sm:w-auto h-9 bg-primary text-primary-foreground hover:bg-primary/90 mt-2 sm:mt-0"
                                >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Invite
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Members Table */}
                <Card className="card-elevated border-transparent overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/30">
                                <tr className="border-b border-border/60">
                                    <th className="text-left py-3.5 px-5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Member</th>
                                    <th className="text-left py-3.5 px-5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Role</th>
                                    <th className="text-right py-3.5 px-5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Joined</th>
                                    <th className="w-12 px-5"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member) => {
                                    const config = roleConfig[member.role];
                                    const Icon = config.icon;
                                    return (
                                        <tr key={member.id} className="border-b border-border/40 last:border-0 hover:bg-muted/10 transition-colors">
                                            <td className="py-3 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm ring-1 ring-primary/20">
                                                        {member.name.split(" ").map((n) => n[0]).join("")}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-foreground">{member.name}</span>
                                                        <span className="text-xs text-muted-foreground">{member.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-5">
                                                <Select
                                                    value={member.role}
                                                    onValueChange={(v) => handleRoleChange(member.id, v as OrgRole)}
                                                    disabled={member.role === "owner"}
                                                >
                                                    <SelectTrigger className="w-[140px] h-9 bg-transparent border-0 hover:bg-accent/50 focus:ring-0 shadow-none transition-colors px-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`flex h-6 w-6 items-center justify-center rounded text-current`}>
                                                                <Icon className="h-3.5 w-3.5" />
                                                            </div>
                                                            <span className="font-medium text-xs"><SelectValue /></span>
                                                        </div>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="owner">Owner</SelectItem>
                                                        <SelectItem value="manager">Manager</SelectItem>
                                                        <SelectItem value="specialist">Specialist</SelectItem>
                                                        <SelectItem value="viewer">Viewer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="py-3 px-5 text-right text-muted-foreground text-xs font-medium">
                                                {new Date(member.joinedAt).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td className="py-3 px-5 text-right">
                                                {member.role !== "owner" && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent">
                                                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-40 border-border/60">
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                                                                onClick={() => handleRemove(member.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Remove member
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </>
    );
}
