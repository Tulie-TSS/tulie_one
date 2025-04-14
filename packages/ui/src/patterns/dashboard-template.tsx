import * as React from "react"
import { cn } from "../lib/utils"

/**
 * DashboardTemplate — Standard dashboard page layout
 *
 * Used in: ALL 4 apps for dashboard/overview pages
 * Standardizes: Stats Grid + Charts + Activity Feed
 *
 * Usage:
 * ```tsx
 * <DashboardTemplate
 *   header={<PageHeader title="Dashboard" />}
 *   stats={<StatGrid>...</StatGrid>}
 *   charts={[<RevenueChart />, <UserChart />]}
 *   activity={<ActivityTimeline>...</ActivityTimeline>}
 *   sidebar={<QuickActions />}
 * />
 * ```
 */

interface DashboardTemplateProps {
  /** Page header */
  header: React.ReactNode
  /** Stats grid (top) */
  stats?: React.ReactNode
  /** Main content area — charts, tables, etc. */
  charts?: React.ReactNode[]
  /** Activity feed / timeline */
  activity?: React.ReactNode
  /** Sidebar content — quick actions, recent items */
  sidebar?: React.ReactNode
  /** Full-width content below charts */
  bottom?: React.ReactNode
  className?: string
}

export function DashboardTemplate({
  header,
  stats,
  charts,
  activity,
  sidebar,
  bottom,
  className,
}: DashboardTemplateProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div>{header}</div>

      {/* Stats */}
      {stats && <div>{stats}</div>}

      {/* Main content area */}
      <div className="flex gap-6">
        {/* Charts + Activity (left) */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Charts grid */}
          {charts && charts.length > 0 && (
            <div
              className={cn(
                "grid gap-4",
                charts.length === 1
                  ? "grid-cols-1"
                  : "grid-cols-1 lg:grid-cols-2"
              )}
            >
              {charts.map((chart, i) => (
                <div key={i}>{chart}</div>
              ))}
            </div>
          )}

          {/* Activity */}
          {activity && (
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
              {activity}
            </div>
          )}
        </div>

        {/* Sidebar (right) */}
        {sidebar && (
          <div className="w-[300px] shrink-0 space-y-4 hidden xl:block">
            {sidebar}
          </div>
        )}
      </div>

      {/* Bottom full-width */}
      {bottom && <div>{bottom}</div>}
    </div>
  )
}
