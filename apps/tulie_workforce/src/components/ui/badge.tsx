import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ── Metronic-style Badge ──
 * Light/subtle color variants matching Metronic's badge-light pattern
 * Smaller, more refined look with proper color semantics
 */

const badgeVariants = cva(
    "inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold leading-4 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "bg-primary/15 text-primary border border-primary/25",
                secondary:
                    "bg-secondary text-secondary-foreground border border-border/60",
                destructive:
                    "bg-destructive/15 text-destructive border border-destructive/25",
                outline:
                    "border border-border/80 text-foreground bg-background",
                success:
                    "bg-emerald-500/15 text-emerald-700 border border-emerald-500/25",
                warning:
                    "bg-amber-500/15 text-amber-700 border border-amber-500/25",
                info:
                    "bg-blue-500/15 text-blue-700 border border-blue-500/25",
                /* Metronic-specific: light primary */
                "primary-light":
                    "bg-primary/15 text-primary border border-primary/25",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
