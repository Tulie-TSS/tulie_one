"use client"

import { Toaster as SonnerToaster, type ToasterProps } from "sonner"

function Sonner({ ...props }: ToasterProps) {
  return (
    <SonnerToaster
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group font-sans rounded-xl shadow-lg border backdrop-blur-sm !bg-background !text-foreground",
          title: "text-foreground font-semibold",
          description: "text-muted-foreground",
          actionButton: "!bg-primary !text-primary-foreground",
          cancelButton: "!bg-muted !text-muted-foreground",
          closeButton: "!bg-background",
        },
      }}
      {...props}
    />
  )
}

export { Sonner }
