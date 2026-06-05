'use client'

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { useLifeRoleStore } from '@/lib/stores/life-role-store'
import { useLifeRoles } from '@/hooks/useLifeRoles'
import { useTasks } from '@/hooks/useTasks'
import { useDailyPlan } from '@/hooks/useDailyPlan'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useHabits } from '@/hooks/useHabits'
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  Sun, 
  Briefcase, 
  Utensils, 
  Home, 
  Rocket, 
  BookOpen, 
  Moon,
  Calendar,
  Target,
  Clock,
  Sparkles,
  ClipboardList,
  Building2,
  Heart,
  Dumbbell,
  Edit2,
  Loader2,
  Coffee,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import { RoleSwitcher } from '@/components/command-center/role-switcher'
import { TodaysPulse } from '@/components/command-center/todays-pulse'
import { TaskStream } from '@/components/command-center/task-stream'
import { SmartAlerts, generateAlerts } from '@/components/command-center/smart-alerts'
import { WeeklyProgress } from '@/components/command-center/weekly-progress'
import { Button, Popover, PopoverContent, PopoverTrigger, Calendar as CalendarPicker } from '@repo/ui'
import { useTimeBlocks } from '@/hooks/useTimeBlocks'
import { EditScheduleDialog } from '@/components/command-center/edit-schedule-dialog'
import { RoleIcon } from '@/components/command-center/role-icon'

/** Convert a Date to a local YYYY-MM-DD string (no UTC shift) */
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getHabitIcon(habitIcon: string) {
  const cn = "size-4 text-primary shrink-0"
  switch (habitIcon) {
    case '🇬🇧': return <BookOpen className={cn} />
    case '🏋️': return <Dumbbell className={cn} />
    case '👶': return <Heart className={cn} />
    case '😴': return <Moon className={cn} />
    case '📝': return <ClipboardList className={cn} />
    case '🏢': return <Building2 className={cn} />
    default: return <Sparkles className={cn} />
  }
}

function getBlockIcon(type: string, role?: any) {
  if (role && role.icon) {
    return <RoleIcon name={role.icon} className="size-3.5" />
  }
  switch (type) {
    case 'deep_work': return <Briefcase className="size-3.5" />
    case 'meeting': return <Users className="size-3.5" />
    case 'admin': return <Settings className="size-3.5" />
    case 'learning': return <BookOpen className="size-3.5" />
    case 'exercise': return <Dumbbell className="size-3.5" />
    case 'family': return <Home className="size-3.5" />
    case 'rest': return <Coffee className="size-3.5" />
    default: return <Clock className="size-3.5" />
  }
}

export default function CommandCenterPage() {
  const { t } = useLocaleStore()
  const { activeRole } = useLifeRoleStore()
  const { roles, initializeRoles } = useLifeRoles()
  const { tasks, loading: tasksLoading, updateTaskStatus } = useTasks()
  const { user } = useCurrentUser()
  const { habits, loading: habitsLoading, toggleHabit } = useHabits()

  // ──────────────────────────────────────────────
  // Selected date (for schedule navigation)
  // ──────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const todayDate = new Date()
  const todayStr = toLocalDateStr(todayDate)
  const selectedDateStr = toLocalDateStr(selectedDate)
  const isToday = selectedDateStr === todayStr

  const shiftDay = (delta: number) => {
    setSelectedDate(prev => {
      const d = new Date(prev)
      d.setDate(d.getDate() + delta)
      return d
    })
  }

  // ──────────────────────────────────────────────
  // Data hooks wired to selectedDate
  // ──────────────────────────────────────────────
  const { plan } = useDailyPlan(selectedDateStr)
  const { timeBlocks, loading: blocksLoading, saveTimeBlocks } = useTimeBlocks(selectedDateStr)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)

  // Initialize life roles on first visit
  useEffect(() => {
    initializeRoles()
  }, [initializeRoles])

  // ──────────────────────────────────────────────
  // Live clock — updates every 30 seconds
  // ──────────────────────────────────────────────
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const tick = () => setNow(new Date())
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])
  const hour = now.getHours()
  const minute = now.getMinutes()
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  // Active block is only relevant when viewing today
  const isBlockActive = useCallback((startTime: string, endTime: string) => {
    if (!isToday) return false
    const [sH, sM] = startTime.split(':').map(Number)
    const [eH, eM] = endTime.split(':').map(Number)
    const currentVal = hour * 60 + minute
    const startVal = sH * 60 + sM
    const endVal = eH * 60 + eM

    if (endVal < startVal) {
      return currentVal >= startVal || currentVal < endVal
    }
    return currentVal >= startVal && currentVal < endVal
  }, [hour, minute, isToday])

  const activeBlock = useMemo(() => {
    return timeBlocks.find(b => isBlockActive(b.start_time, b.end_time))
  }, [timeBlocks, isBlockActive])

  const timeContext = activeBlock ? activeBlock.title : 'Morning Routine'

  // Filter today's tasks (due today or doing/ready)
  const todayTasks = useMemo(() => {
    return tasks.filter(t => {
      if (t.status === 'doing' || t.status === 'ready') return true
      if (t.requested_deadline && t.requested_deadline.split('T')[0] === todayStr) return true
      if (t.status === 'done' && t.actual_end && t.actual_end.split('T')[0] === todayStr) return true
      return false
    })
  }, [tasks, todayStr])

  const doneTasks = todayTasks.filter(t => t.status === 'done')

  // Weekly tasks (this week)
  const weeklyTasksByRole = useMemo(() => {
    const result: Record<string, { total: number; completed: number }> = {}
    roles.forEach(r => { result[r.id] = { total: 0, completed: 0 } })

    const nowD = new Date()
    const dayOfWeek = nowD.getDay()
    const startOfWeek = new Date(nowD)
    startOfWeek.setDate(nowD.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    startOfWeek.setHours(0, 0, 0, 0)

    tasks.forEach(t => {
      const roleId = t.life_role_id || t.project?.life_role_id
      if (!roleId || !result[roleId]) return

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
      await updateTaskStatus(taskId, 'doing')
    } else {
      await updateTaskStatus(taskId, 'done')
    }
  }

  // Human-readable label for the selected date
  const scheduleDateLabel = isToday
    ? 'Hôm nay'
    : selectedDate.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })

  return (
    <div className="space-y-6">
      {/* Header with greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            {hour < 18 ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {greeting}, {user?.full_name?.split(' ')[0] || 'bạn'}!
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {' · '}
              <span className="font-semibold text-foreground/80">{timeContext}</span>
            </p>
          </div>
        </div>
        <RoleSwitcher />
      </div>

      {/* Smart Alerts */}
      {alerts.length > 0 && <SmartAlerts alerts={alerts} />}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Pulse + Weekly */}
        <div className="lg:col-span-3 space-y-6">
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
        <div className="lg:col-span-3 space-y-6">
          {/* Time Block Schedule */}
          <div className="rounded-xl border border-muted bg-card/60 backdrop-blur-sm p-4 space-y-3">
            {/* Schedule Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Clock className="size-4 text-primary" />
                Lịch trình
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => setScheduleDialogOpen(true)}
              >
                <Edit2 className="size-3.5" />
              </Button>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                onClick={() => shiftDay(-1)}
              >
                <ChevronLeft className="size-3.5" />
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex-1 text-center text-xs font-semibold text-foreground hover:text-primary transition-colors cursor-pointer px-1 py-0.5 rounded hover:bg-muted/50">
                    {scheduleDateLabel}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center" side="bottom">
                  <CalendarPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => d && setSelectedDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                onClick={() => shiftDay(1)}
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>

            {/* Jump to today */}
            {!isToday && (
              <button
                onClick={() => setSelectedDate(new Date())}
                className="w-full text-[10px] text-primary hover:underline text-center cursor-pointer"
              >
                ← Quay lại hôm nay
              </button>
            )}

            {/* Blocks list */}
            {blocksLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : timeBlocks.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Chưa có lịch trình</p>
            ) : (
              <div className="space-y-1.5">
                {timeBlocks.map((block) => {
                  const isActive = isBlockActive(block.start_time, block.end_time)
                  const role = roles.find(r => r.id === block.life_role_id)
                  
                  return (
                    <div
                      key={block.id}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all duration-200 ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold shadow-sm'
                          : 'text-muted-foreground hover:bg-muted/30'
                      }`}
                    >
                      <span className="w-10 font-mono text-[11px] font-medium opacity-80">{block.start_time}</span>
                      <div 
                        className={isActive ? 'text-primary' : 'text-muted-foreground/60'}
                        style={role?.color && !isActive ? { color: role.color } : undefined}
                      >
                        {getBlockIcon(block.block_type, role)}
                      </div>
                      <span className="flex-1 truncate">{block.title}</span>
                      {isActive && <span className="size-1.5 rounded-full bg-primary animate-ping" />}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Habit Quick View */}
          <div className="rounded-xl border border-muted bg-card/60 backdrop-blur-sm p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Target className="size-4 text-primary" />
                Thói quen hôm nay
              </h3>
              <a href="/habits" className="text-[11px] font-medium text-primary hover:underline">Tất cả</a>
            </div>

            {habitsLoading ? (
              <div className="space-y-2 py-2">
                {[1, 2].map(i => (
                  <div key={i} className="h-8 rounded-lg bg-muted/50 animate-pulse" />
                ))}
              </div>
            ) : habits.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Chưa có thói quen nào. <a href="/habits" className="text-primary underline">Tạo ngay</a>
              </p>
            ) : (
              <div className="space-y-2">
                {habits
                  .filter(h => {
                    if (activeRole === 'all') return true
                    const activeRoleObj = roles.find(r => r.role === activeRole)
                    return h.life_role_id === activeRoleObj?.id
                  })
                  .slice(0, 5)
                  .map(habit => {
                    const isCompleted = habit.today_log?.completed
                    return (
                      <div
                        key={habit.id}
                        onClick={() => toggleHabit(habit.id)}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-all duration-200 ${
                          isCompleted
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-muted-foreground'
                            : 'bg-background/40 hover:bg-muted/40 border-muted text-foreground hover:border-muted-foreground/30'
                        }`}
                      >
                        <div className={isCompleted ? 'text-emerald-500' : 'text-muted-foreground/40'}>
                          {isCompleted ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
                        </div>
                        <div className="shrink-0">
                          {getHabitIcon(habit.icon)}
                        </div>
                        <span className={`flex-1 truncate ${isCompleted ? 'line-through opacity-60' : ''}`}>
                          {habit.name}
                        </span>
                        {habit.streak_current > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500 shrink-0">
                            <Flame className="size-3.5 fill-amber-500/10" />
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

      <EditScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        initialBlocks={timeBlocks}
        onSave={saveTimeBlocks}
      />
    </div>
  )
}
