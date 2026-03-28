import * as React from "react"
import { cn } from "../lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "../components/card"
import { Avatar, AvatarFallback, AvatarImage } from "../components/avatar"

/**
 * Leaderboard — Ranked list with avatars and metrics
 *
 * Used in: CRM (team performance rankings)
 *
 * Usage:
 * ```tsx
 * <Leaderboard
 *   title="Top Performers"
 *   entries={[
 *     { rank: 1, name: "Tung", avatar: "/avatar.jpg", value: "1.2B", metric: "Revenue" },
 *     { rank: 2, name: "Linh", value: "980M", metric: "Revenue", trend: "+15%" },
 *   ]}
 * />
 * ```
 */

// ─── Types ───────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number
  name: string
  avatar?: string
  value: string
  metric?: string
  trend?: string
  trendUp?: boolean
  subtitle?: string
}

interface LeaderboardProps {
  title?: string
  entries: LeaderboardEntry[]
  maxVisible?: number
  className?: string
}

// ─── Helpers ─────────────────────────────────────────────

function getRankStyle(rank: number): string {
  switch (rank) {
    case 1:
      return "bg-primary text-primary-foreground font-bold"
    case 2:
      return "bg-muted text-foreground font-semibold"
    case 3:
      return "bg-muted text-foreground font-semibold"
    default:
      return "bg-transparent text-muted-foreground"
  }
}

function getRankIcon(rank: number): string | null {
  switch (rank) {
    case 1: return "🥇"
    case 2: return "🥈"
    case 3: return "🥉"
    default: return null
  }
}

// ─── Component ───────────────────────────────────────────

export function Leaderboard({
  title = "Leaderboard",
  entries,
  maxVisible = 10,
  className,
}: LeaderboardProps) {
  const visible = entries.slice(0, maxVisible)

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div
          className="space-y-1"
          role="list"
          aria-label={title}
        >
          {visible.map((entry) => {
            const medal = getRankIcon(entry.rank)

            return (
              <div
                key={entry.rank}
                className={cn(
                  "flex items-center gap-3 px-2 py-2 rounded-md transition-colors",
                  entry.rank <= 3 && "bg-muted/40"
                )}
                role="listitem"
              >
                {/* Rank */}
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs shrink-0",
                    getRankStyle(entry.rank)
                  )}
                >
                  {medal || entry.rank}
                </div>

                {/* Avatar + Name */}
                <Avatar className="h-7 w-7 shrink-0">
                  {entry.avatar && (
                    <AvatarImage src={entry.avatar} alt={entry.name} />
                  )}
                  <AvatarFallback className="text-[10px]">
                    {entry.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{entry.name}</p>
                  {entry.subtitle && (
                    <p className="text-[10px] text-muted-foreground truncate">
                      {entry.subtitle}
                    </p>
                  )}
                </div>

                {/* Value + Trend */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">{entry.value}</p>
                  {entry.trend && (
                    <p
                      className={cn(
                        "text-[10px] font-medium",
                        entry.trendUp !== false
                          ? "text-success-foreground"
                          : "text-destructive"
                      )}
                    >
                      {entry.trend}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
