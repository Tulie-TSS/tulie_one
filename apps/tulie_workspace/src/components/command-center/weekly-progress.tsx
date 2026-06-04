'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LifeRole, LifeRoleType } from '@/types/command-center.types'

interface WeeklyProgressProps {
  tasksByRole: Record<string, { total: number; completed: number }>
  roles: LifeRole[]
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-medium text-muted-foreground w-10 text-right">{percent}%</span>
    </div>
  )
}

export function WeeklyProgress({ tasksByRole, roles }: WeeklyProgressProps) {
  const totalTasks = Object.values(tasksByRole).reduce((sum, r) => sum + r.total, 0)
  const totalCompleted = Object.values(tasksByRole).reduce((sum, r) => sum + r.completed, 0)
  const overallPercent = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0

  return (
    <Card className="shadow-sm border-muted/60 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <BarChart3 className="size-4 text-primary" />
          Tiến độ Tuần
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Overall */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Tổng</span>
            <span className="font-medium">{totalCompleted}/{totalTasks}</span>
          </div>
          <ProgressBar value={totalCompleted} max={totalTasks} color="#6B7280" />
        </div>

        <div className="border-t border-muted/40 pt-2 space-y-2.5">
          {roles.map(role => {
            const data = tasksByRole[role.id] || { total: 0, completed: 0 }
            return (
              <div key={role.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <span>{role.icon}</span>
                    <span className="text-muted-foreground">{role.display_name}</span>
                  </span>
                  <span className="font-medium">{data.completed}/{data.total}</span>
                </div>
                <ProgressBar value={data.completed} max={data.total} color={role.color} />
              </div>
            )
          })}
        </div>

        {/* Motivational message */}
        <div className="pt-2 border-t border-muted/40">
          <p className="text-[11px] text-muted-foreground text-center">
            {overallPercent >= 80 ? '🔥 Xuất sắc! Giữ vững nhịp độ!' :
             overallPercent >= 50 ? '💪 Tốt lắm! Cố thêm chút nữa!' :
             overallPercent >= 20 ? '📈 Tiếp tục phát huy!' :
             '🚀 Bắt đầu thôi!'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
