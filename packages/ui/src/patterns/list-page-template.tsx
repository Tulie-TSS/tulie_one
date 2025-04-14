import * as React from "react"
import { cn } from "../lib/utils"

/**
 * ListPageTemplate — Standard list page layout
 *
 * Used in: ALL 4 apps for entity list pages
 * Standardizes: PageHeader + Filters + DataTable + Pagination
 *
 * Usage:
 * ```tsx
 * <ListPageTemplate
 *   header={<PageHeader title="Customers" />}
 *   filters={<FilterBar />}
 *   table={<DataTable columns={columns} data={data} />}
 *   pagination={<Pagination />}
 * />
 * ```
 */

interface ListPageTemplateProps {
  /** Page header (PageHeader component) */
  header: React.ReactNode
  /** Filter bar / toolbar */
  filters?: React.ReactNode
  /** Main content (usually DataTable) */
  table: React.ReactNode
  /** Pagination controls */
  pagination?: React.ReactNode
  /** Side panel (optional — detail view) */
  sidePanel?: React.ReactNode
  /** Side panel is open */
  sidePanelOpen?: boolean
  className?: string
}

export function ListPageTemplate({
  header,
  filters,
  table,
  pagination,
  sidePanel,
  sidePanelOpen = false,
  className,
}: ListPageTemplateProps) {
  return (
    <div className={cn("flex h-full gap-0", className)}>
      {/* Main list */}
      <div className={cn(
        "flex-1 min-w-0 space-y-4",
        sidePanelOpen && "max-w-[calc(100%-400px)]"
      )}>
        {/* Header */}
        <div>{header}</div>

        {/* Filters */}
        {filters && (
          <div className="flex items-center gap-2 flex-wrap">{filters}</div>
        )}

        {/* Table */}
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          {table}
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between">{pagination}</div>
        )}
      </div>

      {/* Side panel */}
      {sidePanel && sidePanelOpen && (
        <div className="w-[400px] shrink-0 border-l border-border bg-card overflow-y-auto animate-[slide-in-up_200ms_ease-out]">
          {sidePanel}
        </div>
      )}
    </div>
  )
}
