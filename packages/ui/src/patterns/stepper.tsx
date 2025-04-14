"use client"

import * as React from "react"
import { cn } from "../lib/utils"

/**
 * Stepper — Multi-step workflow indicator
 *
 * Used in: CRM (contract flow), Workspace (task triage),
 * ERP (approval workflow)
 *
 * Follows Ant Design Steps / Material UI Stepper pattern.
 *
 * Usage:
 * ```tsx
 * <Stepper activeStep={1}>
 *   <StepperStep title="Draft" description="Create quotation" />
 *   <StepperStep title="Sent" description="Send to client" />
 *   <StepperStep title="Accepted" description="Client approved" />
 *   <StepperStep title="Signed" description="Contract signed" />
 * </Stepper>
 * ```
 */

// ─── Types ───────────────────────────────────────────────

type StepStatus = "complete" | "current" | "upcoming" | "error"

interface StepperContextValue {
  activeStep: number
  orientation: "horizontal" | "vertical"
  size: "sm" | "md"
}

const StepperContext = React.createContext<StepperContextValue>({
  activeStep: 0,
  orientation: "horizontal",
  size: "md",
})

// ─── Container ───────────────────────────────────────────

interface StepperProps {
  /** Current active step (0-indexed) */
  activeStep: number
  /** Layout direction */
  orientation?: "horizontal" | "vertical"
  /** Size variant */
  size?: "sm" | "md"
  children: React.ReactNode
  className?: string
}

export function Stepper({
  activeStep,
  orientation = "horizontal",
  size = "md",
  children,
  className,
}: StepperProps) {
  return (
    <StepperContext.Provider value={{ activeStep, orientation, size }}>
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "items-start" : "flex-col",
          className
        )}
        role="list"
        aria-label="Progress steps"
      >
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return null
          return React.cloneElement(child as React.ReactElement<StepperStepInternalProps>, {
            _index: index,
            _isLast: index === React.Children.count(children) - 1,
          })
        })}
      </div>
    </StepperContext.Provider>
  )
}

// ─── Step ────────────────────────────────────────────────

interface StepperStepProps {
  title: string
  description?: string
  icon?: React.ReactNode
  error?: boolean
  className?: string
}

interface StepperStepInternalProps extends StepperStepProps {
  _index?: number
  _isLast?: boolean
}

export function StepperStep({
  title,
  description,
  icon,
  error = false,
  className,
  _index = 0,
  _isLast = false,
}: StepperStepInternalProps) {
  const { activeStep, orientation, size } = React.useContext(StepperContext)

  let status: StepStatus
  if (error && _index === activeStep) {
    status = "error"
  } else if (_index < activeStep) {
    status = "complete"
  } else if (_index === activeStep) {
    status = "current"
  } else {
    status = "upcoming"
  }

  const isHorizontal = orientation === "horizontal"
  const stepSize = size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs"
  const connectorBase = isHorizontal ? "h-0.5 flex-1 mx-2" : "w-0.5 min-h-[24px] ml-[15px] my-1"

  return (
    <div
      className={cn(
        "flex",
        isHorizontal ? "flex-1 items-start" : "items-start",
        className
      )}
      role="listitem"
      aria-current={status === "current" ? "step" : undefined}
    >
      <div
        className={cn(
          "flex",
          isHorizontal ? "flex-col items-center gap-1.5 flex-1" : "items-start gap-3"
        )}
      >
        {/* Step indicator + connector */}
        <div
          className={cn(
            "flex items-center",
            isHorizontal ? "w-full" : "flex-col items-center"
          )}
        >
          {/* Step circle */}
          <div
            className={cn(
              "flex items-center justify-center rounded-full font-medium shrink-0 transition-all duration-200",
              stepSize,
              status === "complete" &&
                "bg-primary text-primary-foreground",
              status === "current" &&
                "bg-primary text-primary-foreground ring-[3px] ring-primary/20",
              status === "upcoming" &&
                "bg-muted text-muted-foreground",
              status === "error" &&
                "bg-destructive text-white ring-[3px] ring-destructive/20"
            )}
          >
            {status === "complete" ? (
              icon || (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={size === "sm" ? 12 : 14}
                  height={size === "sm" ? 12 : 14}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )
            ) : status === "error" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={size === "sm" ? 12 : 14}
                height={size === "sm" ? 12 : 14}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              icon || _index + 1
            )}
          </div>

          {/* Connector line */}
          {!_isLast && (
            <div
              className={cn(
                connectorBase,
                "transition-colors duration-200",
                _index < activeStep ? "bg-primary" : "bg-border"
              )}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Labels */}
        <div
          className={cn(
            isHorizontal ? "text-center" : "pt-0.5",
            "min-w-0"
          )}
        >
          <p
            className={cn(
              "font-medium leading-snug",
              size === "sm" ? "text-xs" : "text-sm",
              status === "complete" && "text-foreground",
              status === "current" && "text-foreground",
              status === "upcoming" && "text-muted-foreground",
              status === "error" && "text-destructive"
            )}
          >
            {title}
          </p>
          {description && (
            <p
              className={cn(
                "text-muted-foreground mt-0.5 leading-relaxed",
                size === "sm" ? "text-[10px]" : "text-xs"
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
