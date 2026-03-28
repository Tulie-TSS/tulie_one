"use client"

import * as React from "react"
import { cn } from "../lib/utils"
import { ScrollArea } from "../components/scroll-area"
import { Separator } from "../components/separator"

/**
 * SettingsTemplate — Standard settings page layout
 *
 * Used in: ALL 4 apps for settings/preferences pages
 * Standardizes: Navigation tabs + Form sections
 *
 * Usage:
 * ```tsx
 * <SettingsTemplate
 *   title="Settings"
 *   sections={[
 *     { id: "general", label: "General", icon: <Settings />, content: <GeneralForm /> },
 *     { id: "team", label: "Team", icon: <Users />, content: <TeamForm /> },
 *     { id: "billing", label: "Billing", icon: <CreditCard />, content: <BillingForm /> },
 *   ]}
 * />
 * ```
 */

// ─── Types ───────────────────────────────────────────────

export interface SettingsSection {
  id: string
  label: string
  icon?: React.ReactNode
  description?: string
  content: React.ReactNode
  badge?: string
}

interface SettingsTemplateProps {
  title?: string
  description?: string
  sections: SettingsSection[]
  defaultSection?: string
  className?: string
}

// ─── Component ───────────────────────────────────────────

export function SettingsTemplate({
  title = "Settings",
  description,
  sections,
  defaultSection,
  className,
}: SettingsTemplateProps) {
  const [activeSection, setActiveSection] = React.useState(
    defaultSection || sections[0]?.id
  )

  const currentSection = sections.find((s) => s.id === activeSection)

  return (
    <div className={cn("flex h-full", className)}>
      {/* Sidebar navigation */}
      <nav className="w-[220px] shrink-0 border-r border-border pr-4 hidden md:block">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>

        <Separator className="mb-3" />

        <div className="space-y-0.5" role="tablist" aria-label="Settings sections">
          {sections.map((section) => (
            <button
              key={section.id}
              className={cn(
                "flex items-center gap-2.5 w-full rounded-md px-2.5 py-2 text-sm font-medium transition-colors text-left",
                "hover:bg-muted",
                activeSection === section.id
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground"
              )}
              onClick={() => setActiveSection(section.id)}
              role="tab"
              aria-selected={activeSection === section.id}
              type="button"
            >
              {section.icon && (
                <span className="shrink-0 [&_svg]:size-4 text-muted-foreground">
                  {section.icon}
                </span>
              )}
              <span className="flex-1 truncate">{section.label}</span>
              {section.badge && (
                <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
                  {section.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile select */}
      <div className="md:hidden w-full mb-4">
        <select
          value={activeSection}
          onChange={(e) => setActiveSection(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          aria-label="Settings section"
        >
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 md:pl-6">
        {currentSection && (
          <div
            className="max-w-2xl animate-[fade-in_200ms]"
            role="tabpanel"
            aria-labelledby={currentSection.id}
          >
            <div className="mb-6">
              <h3 className="text-lg font-semibold">{currentSection.label}</h3>
              {currentSection.description && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {currentSection.description}
                </p>
              )}
            </div>
            {currentSection.content}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
