import * as React from "react"
import { cn } from "../lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "../components/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/tooltip"

/**
 * WipHeatmap — Grid-based WIP workload visualization
 *
 * Used in: Workspace (Manager View — WIP monitoring)
 * Shows team workload distribution as a colored heatmap grid.
 *
 * Usage:
 * ```tsx
 * <WipHeatmap
 *   title="Team WIP Load"
 *   rows={[
 *     { label: "Tung", cells: [3, 1, 2, 0, 4, 1, 0] },
 *     { label: "Linh", cells: [1, 2, 1, 3, 2, 0, 1] },
 *   ]}
 *   columns={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
 *   maxValue={5}
 * />
 * ```
 */

// ─── Types ───────────────────────────────────────────────

interface HeatmapRow {
  label: string
  cells: number[]
}

interface WipHeatmapProps {
  title?: string
  rows: HeatmapRow[]
  columns: string[]
  /** Maximum value for color scale */
  maxValue?: number
  /** WIP limit — cells above this show warning */
  wipLimit?: number
  /** Click cell handler */
  onCellClick?: (row: number, col: number, value: number) => void
  className?: string
}

// ─── Color Scale ─────────────────────────────────────────

function getCellColor(value: number, max: number, wipLimit?: number): string {
  if (value === 0) return "bg-muted/30"
  if (wipLimit && value > wipLimit) return "bg-destructive/70 text-white"

  const intensity = Math.min(value / max, 1)

  if (intensity <= 0.25) return "bg-success/20"
  if (intensity <= 0.5) return "bg-success/40"
  if (intensity <= 0.75) return "bg-warning/40"
  return "bg-warning/70"
}

// ─── Component ───────────────────────────────────────────

export function WipHeatmap({
  title = "WIP Heatmap",
  rows,
  columns,
  maxValue,
  wipLimit,
  onCellClick,
  className,
}: WipHeatmapProps) {
  const max = maxValue || Math.max(...rows.flatMap((r) => r.cells), 1)

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          {/* Legend */}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-0.5">
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
                <div
                  key={v}
                  className={cn(
                    "h-3 w-3 rounded-sm",
                    getCellColor(v * max, max, wipLimit)
                  )}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <TooltipProvider delayDuration={0}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* Column headers */}
              <thead>
                <tr>
                  <th className="pb-2 pr-3 text-left text-[10px] font-medium text-muted-foreground w-[100px]" />
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="pb-2 px-0.5 text-center text-[10px] font-medium text-muted-foreground"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri}>
                    {/* Row label */}
                    <td className="pr-3 py-0.5 text-xs font-medium truncate max-w-[100px]">
                      {row.label}
                    </td>
                    {/* Cells */}
                    {row.cells.map((value, ci) => (
                      <td key={ci} className="px-0.5 py-0.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className={cn(
                                "h-7 w-full min-w-[28px] rounded-sm transition-all text-[10px] font-medium",
                                getCellColor(value, max, wipLimit),
                                "hover:ring-2 hover:ring-primary/30",
                                onCellClick && "cursor-pointer"
                              )}
                              onClick={() => onCellClick?.(ri, ci, value)}
                              type="button"
                              aria-label={`${row.label}, ${columns[ci]}: ${value} tasks`}
                            >
                              {value > 0 ? value : ""}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              <span className="font-medium">{row.label}</span>
                              {" · "}
                              {columns[ci]}
                              {" · "}
                              <span className="font-semibold">{value}</span> tasks
                              {wipLimit && value > wipLimit && (
                                <span className="text-destructive ml-1">(exceeds WIP limit)</span>
                              )}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
