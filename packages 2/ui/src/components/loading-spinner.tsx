import * as React from "react"
import { Loader2 } from "lucide-react"

import { cn } from "../lib/utils"

export interface LoadingSpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
}

const LoadingSpinner = React.forwardRef<SVGSVGElement, LoadingSpinnerProps>(
  ({ className, size = 24, ...props }, ref) => {
    return (
      <Loader2
        ref={ref}
        size={size}
        className={cn("animate-spin text-muted-foreground", className)}
        {...props}
      />
    )
  }
)

LoadingSpinner.displayName = "LoadingSpinner"

export { LoadingSpinner }
