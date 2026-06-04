'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { AlertTriangle, Moon, Flame, TrendingDown, TrendingUp, Info, Building2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SmartAlert } from '@/types/command-center.types'
import type { DailyPlan } from '@/types/command-center.types'
import type { TaskRow } from '@/hooks/useTasks'
import Link from 'next/link'

const ALERT_STYLES: Record<SmartAlert['severity'], { bg: string; border: string; icon: string }> = {
  critical: { bg: 'bg-red-50 dark:bg-red-950/20', border: 'border-red-200 dark:border-red-800', icon: 'text-red-500' },
  warning: { bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-800', icon: 'text-amber-500' },
  info: { bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-800', icon: 'text-blue-500' },
  success: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-800', icon: 'text-emerald-500' },
}

function AlertIcon({ type, severity }: { type: SmartAlert['type']; severity: SmartAlert['severity'] }) {
  const color = ALERT_STYLES[severity].icon
  switch (type) {
    case 'overdue': return <AlertTriangle className={cn('size-4', color)} />
    case 'sleep_warning': return <Moon className={cn('size-4', color)} />
    case 'streak': return <Flame className={cn('size-4', color)} />
    case 'burnout': return <TrendingDown className={cn('size-4', color)} />
    case 'kpi': return <TrendingUp className={cn('size-4', color)} />
    case 'fpt': return <Building2 className={cn('size-4', color)} />
    case 'wellness': return <Sparkles className={cn('size-4', color)} />
    default: return <Info className={cn('size-4', color)} />
  }
}

export function generateAlerts(plan: DailyPlan | null, tasks: TaskRow[]): SmartAlert[] {
  const alerts: SmartAlert[] = []
  const now = new Date()

  // 1. Overdue tasks
  const overdueTasks = tasks.filter(t => {
    if (!t.requested_deadline || t.status === 'done') return false
    return new Date(t.requested_deadline) < now
  })
  if (overdueTasks.length > 0) {
    alerts.push({
      id: 'overdue',
      type: 'overdue',
      severity: 'critical',
      title: `${overdueTasks.length} task quá hạn`,
      message: `Cần xử lý: ${overdueTasks.slice(0, 2).map(t => t.title).join(', ')}${overdueTasks.length > 2 ? '...' : ''}`,
      icon: '⚠️',
      action: { label: 'Xem tasks', href: '/tasks' },
    })
  }

  // 2. Sleep warning
  if (plan?.sleep_hours && plan.sleep_hours < 6) {
    alerts.push({
      id: 'sleep',
      type: 'sleep_warning',
      severity: 'warning',
      title: `Ngủ ${plan.sleep_hours}h — thiếu ngủ`,
      message: 'Hãy giảm 2 tasks hôm nay và cố gắng ngủ sớm tối nay. Hiệu suất giảm ~30% khi ngủ < 6h.',
      icon: '😴',
    })
  }

  // 3. No exercise reminder (after 16:00)
  if (!plan?.exercise_done && now.getHours() >= 16) {
    alerts.push({
      id: 'exercise',
      type: 'wellness',
      severity: 'info',
      title: 'Chưa tập luyện hôm nay',
      message: 'Dù chỉ 15 phút đi bộ cũng giúp tăng năng lượng cho buổi tối.',
      icon: '🏃',
    })
  }

  // 4. High workload warning
  const activeTasks = tasks.filter(t => t.status === 'doing').length
  if (activeTasks > 3) {
    alerts.push({
      id: 'workload',
      type: 'burnout',
      severity: 'warning',
      title: `${activeTasks} tasks đang làm đồng thời`,
      message: 'Vượt giới hạn WIP! Hãy hoàn thành hoặc tạm dừng bớt task để tập trung.',
      icon: '🔥',
    })
  }

  // 5. Good mood motivation
  if (plan?.mood_score && plan.mood_score >= 8) {
    alerts.push({
      id: 'mood',
      type: 'wellness',
      severity: 'success',
      title: 'Tâm trạng tuyệt vời! 🎉',
      message: 'Hãy tận dụng năng lượng này để xử lý tasks khó nhất.',
      icon: '✨',
    })
  }

  return alerts
}

interface SmartAlertsProps {
  alerts: SmartAlert[]
}

export function SmartAlerts({ alerts }: SmartAlertsProps) {
  if (alerts.length === 0) return null

  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const style = ALERT_STYLES[alert.severity]
        return (
          <div
            key={alert.id}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg border transition-all duration-200',
              style.bg, style.border,
              'hover:shadow-sm'
            )}
          >
            <AlertIcon type={alert.type} severity={alert.severity} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{alert.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
            </div>
            {alert.action && (
              <Link
                href={alert.action.href}
                className="text-xs font-medium text-primary hover:underline shrink-0 mt-0.5"
              >
                {alert.action.label}
              </Link>
            )}
          </div>
        )
      })}
    </div>
  )
}
