"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  RefreshCw,
  MoreHorizontal,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  CreditCard,
} from "lucide-react";
import {
  Button,
  Card,
  Badge,
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
  DataTable,
  type ColumnDef,
} from "@repo/ui";
import { toast } from "sonner";
import type { FbAdAccount } from "@/types/fb-ads";

const statusConfig = {
  active: {
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: CheckCircle2,
  },
  disconnected: {
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: XCircle,
  },
  error: {
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    icon: AlertCircle,
  },
};

export default function AdAccountsPage() {
  const [accounts, setAccounts] = useState<FbAdAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const res = await fetch("/api/fb/accounts");
      const { data } = await res.json();
      setAccounts(data || []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect() {
    setConnectLoading(true);
    try {
      const res = await fetch("/api/fb/auth/connect", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (error) {
      console.error("Error connecting:", error);
      toast.error("Failed to start OAuth flow");
      setConnectLoading(false);
    }
  }

  async function handleSync(accountId: string) {
    setSyncing(accountId);
    try {
      const res = await fetch(`/api/fb/accounts/${accountId}/sync`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Account synced successfully");
        fetchAccounts();
      }
    } catch (error) {
      console.error("Error syncing:", error);
      toast.error("Failed to sync account");
    } finally {
      setSyncing(null);
    }
  }

  async function handleDelete(accountId: string) {
    try {
      const res = await fetch(`/api/fb/accounts/${accountId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAccounts((prev) => prev.filter((a) => a.id !== accountId));
        toast.success("Account deleted");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete account");
    } finally {
      setDeleteId(null);
    }
  }

  const columns: ColumnDef<FbAdAccount>[] = [
    {
      accessorKey: "fb_account_name",
      header: "Account",
      cell: ({ row }) => {
        const account = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#3B5998]/10 flex items-center justify-center shrink-0">
              <svg
                className="h-5 w-5 text-[#3B5998]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">
                {account.fb_account_name || `Account ${account.fb_account_id}`}
              </p>
              <p className="text-sm text-muted-foreground">
                ID: {account.fb_account_id}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = statusConfig[row.original.status] || statusConfig.error;
        const StatusIcon = status.icon;
        return (
          <Badge className={status.color} variant="outline">
            <StatusIcon className="h-3 w-3 mr-1" />
            {row.original.status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "daily_budget_limit",
      header: "Daily Budget",
      cell: ({ row }) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        }).format(row.original.daily_budget_limit || 0),
    },
    {
      accessorKey: "currency",
      header: "Currency",
    },
    {
      accessorKey: "token_expires_at",
      header: "Token Expires",
      cell: ({ row }) =>
        row.original.token_expires_at
          ? new Date(row.original.token_expires_at).toLocaleDateString("vi-VN")
          : "N/A",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => handleSync(row.original.id)}
              disabled={syncing === row.original.id}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeleteId(row.original.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const activeCount = accounts.filter((a) => a.status === "active").length;
  const totalBudget = accounts.reduce(
    (sum, a) => sum + (a.daily_budget_limit || 0),
    0,
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader
          title="Ad Accounts"
          description="Quản lý tài khoản quảng cáo Facebook"
        />
        <StatGrid>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 w-20 bg-muted rounded mb-2" />
                <div className="h-8 w-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </StatGrid>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Ad Accounts"
        description="Quản lý tài khoản quảng cáo Facebook"
      >
        <Button onClick={handleConnect} disabled={connectLoading}>
          {connectLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Connect Account
        </Button>
      </PageHeader>

      <StatGrid>
        <StatCard
          title="Total Accounts"
          value={accounts.length}
          footer={`${activeCount} active`}
        />
        <StatCard
          title="Active"
          value={activeCount}
          footer="Connected and syncing"
        />
        <StatCard
          title="Daily Budget Limit"
          value={new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
          }).format(totalBudget)}
          footer="Combined limit"
        />
        <StatCard
          title="Sync Status"
          value={activeCount > 0 ? "Ready" : "No Account"}
          footer={
            activeCount > 0 ? "All accounts synced" : "Connect an account"
          }
        />
      </StatGrid>

      {accounts.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No ad accounts connected"
          description="Connect your first Facebook ad account to get started with advertising"
        >
          <Button onClick={handleConnect}>
            <Plus className="h-4 w-4 mr-2" />
            Connect Account
          </Button>
        </EmptyState>
      ) : (
        <DataTable
          columns={columns}
          data={accounts}
          searchKey="fb_account_name"
          searchPlaceholder="Tìm kiếm tài khoản..."
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ad Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this ad account? This will also
              delete all associated campaigns, ad sets, and ads. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
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
