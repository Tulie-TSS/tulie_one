"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex items-center gap-3 w-full p-4 rounded-lg border bg-background shadow-lg",
          title: "text-sm font-semibold text-foreground",
          description: "text-sm text-muted-foreground",
          actionButton:
            "bg-primary text-primary-foreground hover:bg-primary/90",
          cancelButton: "bg-muted text-muted-foreground hover:bg-muted/80",
          success: "border-emerald-500/20 bg-emerald-50/50 text-emerald-700",
          error: "border-destructive/20 bg-destructive/50/50 text-destructive",
          warning: "border-amber-500/20 bg-amber-50/50 text-amber-700",
          info: "border-primary/20 bg-primary/5 text-primary",
        },
      }}
    />
  );
}
