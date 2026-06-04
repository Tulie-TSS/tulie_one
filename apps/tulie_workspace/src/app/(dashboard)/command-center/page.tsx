'use client'

import React, { useEffect, useMemo } from 'react'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { useLifeRoleStore } from '@/lib/stores/life-role-store'
import { useLifeRoles } from '@/hooks/useLifeRoles'
import { useTasks } from '@/hooks/useTasks'
import { useDailyPlan } from '@/hooks/useDailyPlan'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useHabits } from '@/hooks/useHabits'
import { PageHeader } from '@repo/ui'
import { CheckCircle2, Circle, Flame } from 'lucide-react'

import { RoleSwitcher } from '@/components/command-center/role-switcher'
import { TodaysPulse } from '@/components/command-center/todays-pulse'
import { TaskStream } from '@/components/command-center/task-stream'
import { SmartAlerts, generateAlerts } from '@/components/command-center/smart-alerts'
import { WeeklyProgress } from '@/components/command-center/weekly-progress'

export default function CommandCenterPage() {
  const { t } = useLocaleStore()
  const { activeRole } = useLifeRoleStore()
  const { roles, initializeRoles } = useLifeRoles()
  const { tasks, loading: tasksLoading, updateTaskStatus } = useTasks()
  const { plan } = useDailyPlan()
  const { user } = useCurrentUser()
  const { habits, loading: habitsLoading, toggleHabit } = useHabits()

  // Initialize life roles on first visit
  useEffect(() => {
    initializeRoles()
  }, [initializeRoles])

  // Get current time context
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'
  const greetingEmoji = hour < 12 ? '🌅' : hour < 18 ? '🌞' : '🌙'

  // Current time block context
  const timeContext = hour >= 8 && hour < 12 ? 'FPT IS — Deep Work' :
                      hour >= 13 && hour < 17 ? 'FPT IS — Working' :
                      hour >= 18 && hour < 21 ? 'Tulie Business' :
                      hour >= 21 ? 'Personal / Rest' : 'Morning Routine'

  // Filter today's tasks (due today or doing/ready)
  const todayTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    return tasks.filter(t => {
      // Tasks that are currently doing or ready
      if (t.status === 'doing' || t.status === 'ready') return true
      // Tasks due today
      if (t.requested_deadline && t.requested_deadline.split('T')[0] === todayStr) return true
      // Tasks completed today
      if (t.status === 'done' && t.actual_end && t.actual_end.split('T')[0] === todayStr) return true
      return false
    })
  }, [tasks])

  const doneTasks = todayTasks.filter(t => t.status === 'done')

  // Weekly tasks (this week)
  const weeklyTasksByRole = useMemo(() => {
    const result: Record<string, { total: number; completed: number }> = {}
    roles.forEach(r => { result[r.id] = { total: 0, completed: 0 } })

    // Get start of week (Monday)
    const now = new Date()
    const dayOfWeek = now.getDay()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    startOfWeek.setHours(0, 0, 0, 0)

    tasks.forEach(t => {
      const roleId = t.life_role_id || t.project?.life_role_id
      if (!roleId || !result[roleId]) return

      // Check if task is relevant this week
      const created = new Date(t.created_at)
      const deadline = t.requested_deadline ? new Date(t.requested_deadline) : null

      if (created >= startOfWeek || (deadline && deadline >= startOfWeek) || t.status === 'doing' || t.status === 'ready') {
        result[roleId]!.total++
        if (t.status === 'done') result[roleId]!.completed++
      }
    })

    return result
  }, [tasks, roles])

  // Generate smart alerts
  const alerts = useMemo(() => generateAlerts(plan, todayTasks), [plan, todayTasks])

  const handleCompleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    if (task.status === 'done') {
      // Undo - move back to doing
      await updateTaskStatus(taskId, 'doing')
    } else {
      await updateTaskStatus(taskId, 'done')
    }
  }

  return (
    <div className="space-y-5">
      {/* Header with greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {greetingEmoji} {greeting}, {user?.full_name?.split(' ').pop() || 'bạn'}!
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {' · '}
            <span className="font-medium">{timeContext}</span>
          </p>
        </div>
        <RoleSwitcher />
      </div>

      {/* Smart Alerts */}
      {alerts.length > 0 && <SmartAlerts alerts={alerts} />}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column - Pulse + Weekly */}
        <div className="lg:col-span-3 space-y-5">
          <TodaysPulse tasksDone={doneTasks.length} tasksTotal={todayTasks.length} />
          <WeeklyProgress tasksByRole={weeklyTasksByRole} roles={roles} />
        </div>

        {/* Center Column - Task Stream */}
        <div className="lg:col-span-6">
          <TaskStream
            tasks={todayTasks}
            roles={roles}
            onComplete={handleCompleteTask}
            loading={tasksLoading}
          />
        </div>

        {/* Right Column - Schedule & Habits */}
        <div className="lg:col-span-3 space-y-5">
          {/* Time Block Schedule */}
          <div className="rounded-xl border border-muted/60 bg-card/50 backdrop-blur-sm p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              ⏰ Lịch hôm nay
            </h3>
            <div className="space-y-2">
              {[
                { time: '06:30', label: 'Thức dậy / Morning routine', icon: '🌅', active: hour >= 6 && hour < 8 },
                { time: '08:30', label: 'FPT IS — Bắt đầu làm việc', icon: '🏢', active: hour >= 8 && hour < 12 },
                { time: '12:00', label: 'Nghỉ trưa', icon: '🍜', active: hour >= 12 && hour < 13 },
                { time: '13:00', label: 'FPT IS — Buổi chiều', icon: '🏢', active: hour >= 13 && hour < 17 },
                { time: '17:30', label: 'Nghỉ / Gia đình', icon: '🏠', active: hour >= 17 && hour < 18 },
                { time: '18:00', label: 'Tulie Business', icon: '🚀', active: hour >= 18 && hour < 21 },
                { time: '21:00', label: 'Cá nhân / Thư giãn', icon: '📚', active: hour >= 21 && hour < 22 },
                { time: '22:00', label: 'Đi ngủ', icon: '😴', active: hour >= 22 },
              ].map((block, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
                    block.active
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  <span className="w-10 font-mono text-[11px]">{block.time}</span>
                  <span>{block.icon}</span>
                  <span className="flex-1">{block.label}</span>
                  {block.active && <span className="size-2 rounded-full bg-primary animate-pulse" />}
                </div>
              ))}
            </div>
          </div>

          {/* Habit Quick View */}
          <div className="rounded-xl border border-muted/60 bg-card/50 backdrop-blur-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                🎯 Habits hôm nay
              </h3>
              <a href="/habits" className="text-[11px] text-primary hover:underline">Tất cả →</a>
            </div>

            {habitsLoading ? (
              <div className="space-y-2 py-2">
                {[1, 2].map(i => (
                  <div key={i} className="h-8 rounded bg-muted/50 animate-pulse" />
                ))}
              </div>
            ) : habits.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Chưa có habits nào. <a href="/habits" className="text-primary underline">Tạo ngay →</a>
              </p>
            ) : (
              <div className="space-y-2">
                {habits
                  .filter(h => {
                    if (activeRole === 'all') return true
                    const activeRoleObj = roles.find(r => r.role === activeRole)
                    return h.life_role_id === activeRoleObj?.id
                  })
                  .slice(0, 5) // Show top 5
                  .map(habit => {
                    const isCompleted = habit.today_log?.completed
                    return (
                      <div
                        key={habit.id}
                        onClick={() => toggleHabit(habit.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all duration-200 ${
                          isCompleted
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-muted-foreground'
                            : 'bg-background/40 hover:bg-muted/40 border-muted/60 text-foreground'
                        }`}
                      >
                        <div className={isCompleted ? 'text-emerald-500' : 'text-muted-foreground/40'}>
                          {isCompleted ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
                        </div>
                        <span className="text-base leading-none shrink-0">{habit.icon}</span>
                        <span className={`flex-1 truncate ${isCompleted ? 'line-through opacity-60' : ''}`}>
                          {habit.name}
                        </span>
                        {habit.streak_current > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] font-medium text-amber-500 shrink-0">
                            <Flame className="size-3" />
                            {habit.streak_current}
                          </span>
                        )}
                      </div>
                    )
                  })}
                {habits.filter(h => {
                  if (activeRole === 'all') return true
                  const activeRoleObj = roles.find(r => r.role === activeRole)
                  return h.life_role_id === activeRoleObj?.id
                }).length > 5 && (
                  <p className="text-[10px] text-center text-muted-foreground pt-1">
                    và {habits.filter(h => {
                      if (activeRole === 'all') return true
                      const activeRoleObj = roles.find(r => r.role === activeRole)
                      return h.life_role_id === activeRoleObj?.id
                    }).length - 5} thói quen khác...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
