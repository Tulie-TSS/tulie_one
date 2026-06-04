'use client'

import React, { useState } from 'react'
import { useDailyPlan } from '@/hooks/useDailyPlan'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { Moon, Dumbbell, Heart, Battery, BatteryCharging, BatteryLow, BatteryWarning, Zap, Activity, Bike, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'

function EnergyIcon({ level }: { level: string }) {
  switch (level) {
    case 'high': return <BatteryCharging className="size-4 text-emerald-500" />
    case 'medium': return <Battery className="size-4 text-amber-500" />
    case 'low': return <BatteryLow className="size-4 text-orange-500" />
    case 'exhausted': return <BatteryWarning className="size-4 text-red-500" />
    default: return <Battery className="size-4 text-muted-foreground" />
  }
}

function SleepColor(hours: number | null) {
  if (!hours) return 'text-muted-foreground'
  if (hours >= 7) return 'text-emerald-500'
  if (hours >= 5) return 'text-amber-500'
  return 'text-red-500'
}

const EXERCISE_OPTIONS = [
  { type: 'Chạy', icon: <Activity className="size-3.5" /> },
  { type: 'Gym', icon: <Dumbbell className="size-3.5" /> },
  { type: 'Yoga', icon: <Sparkles className="size-3.5" /> },
  { type: 'Đạp xe', icon: <Bike className="size-3.5" /> },
]

interface TodaysPulseProps {
  tasksDone: number
  tasksTotal: number
}

export function TodaysPulse({ tasksDone, tasksTotal }: TodaysPulseProps) {
  const { plan, logSleep, logExercise, logMood } = useDailyPlan()
  const [editingSleep, setEditingSleep] = useState(false)
  const [sleepInput, setSleepInput] = useState('')
  const [editingExercise, setEditingExercise] = useState(false)

  const completionPercent = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0
  const circumference = 2 * Math.PI * 36
  const strokeOffset = circumference - (completionPercent / 100) * circumference

  const handleSleepSubmit = async () => {
    const hours = parseFloat(sleepInput)
    if (!isNaN(hours) && hours > 0 && hours <= 24) {
      await logSleep(hours, hours >= 7 ? 4 : hours >= 5 ? 3 : 2)
      setEditingSleep(false)
      setSleepInput('')
    }
  }

  const handleExerciseSubmit = async (type: string, minutes: number) => {
    await logExercise(type, minutes)
    setEditingExercise(false)
  }

  return (
    <Card className="shadow-sm border-muted/60 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Zap className="size-4 text-amber-500" />
          Today&apos;s Pulse
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Circular Progress */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg className="size-24 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/40" />
              <circle
                cx="40" cy="40" r="36" fill="none"
                stroke={completionPercent >= 80 ? '#10B981' : completionPercent >= 50 ? '#F59E0B' : '#EF4444'}
                strokeWidth="4" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold">{tasksDone}/{tasksTotal}</span>
              <span className="text-[10px] text-muted-foreground font-medium">tasks</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="space-y-3">
          {/* Energy */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <EnergyIcon level={plan?.morning_energy || 'medium'} />
              <span>Năng lượng</span>
            </div>
            <span className="font-semibold text-foreground capitalize">{plan?.morning_energy || '—'}</span>
          </div>

          {/* Sleep */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Moon className="size-4" />
              <span>Giấc ngủ</span>
            </div>
            {editingSleep ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={sleepInput}
                  onChange={(e) => setSleepInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSleepSubmit()}
                  className="w-12 h-6 px-1.5 text-[11px] rounded border bg-background text-right focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                  placeholder="h"
                />
                <button onClick={handleSleepSubmit} className="text-xs font-semibold text-primary hover:underline cursor-pointer">Lưu</button>
                <button onClick={() => setEditingSleep(false)} className="text-xs text-muted-foreground hover:underline cursor-pointer">Hủy</button>
              </div>
            ) : (
              <button
                onClick={() => { setEditingSleep(true); setSleepInput(plan?.sleep_hours?.toString() || '') }}
                className={cn('font-semibold hover:underline flex items-center gap-1.5 cursor-pointer', SleepColor(plan?.sleep_hours ?? null))}
              >
                <span>{plan?.sleep_hours ? `${plan.sleep_hours}h` : 'Nhập'}</span>
                {plan?.sleep_hours && plan.sleep_hours >= 7 && <span className="size-1.5 rounded-full bg-emerald-500" />}
                {plan?.sleep_hours && plan.sleep_hours < 5 && <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />}
              </button>
            )}
          </div>

          {/* Exercise */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Dumbbell className="size-4" />
              <span>Tập luyện</span>
            </div>
            {editingExercise ? (
              <div className="flex items-center gap-1.5">
                {EXERCISE_OPTIONS.map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => handleExerciseSubmit(opt.type, 30)}
                    className="p-1 rounded bg-muted hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer flex items-center justify-center text-muted-foreground"
                    title={`${opt.type} 30 phút`}
                  >
                    {opt.icon}
                  </button>
                ))}
                <button onClick={() => setEditingExercise(false)} className="p-1 text-muted-foreground hover:text-foreground cursor-pointer">
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingExercise(true)}
                className={cn('font-semibold hover:underline flex items-center gap-1.5 cursor-pointer', plan?.exercise_done ? 'text-emerald-500' : 'text-muted-foreground')}
              >
                {plan?.exercise_done ? (
                  <>
                    <span>{plan.exercise_type || 'Đã tập'} {plan.exercise_minutes}p</span>
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                  </>
                ) : (
                  <span>Chưa tập</span>
                )}
              </button>
            )}
          </div>

          {/* Mood */}
          <div className="space-y-1.5 pt-1 border-t border-muted/30">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Heart className="size-4" />
              <span>Tâm trạng hôm nay</span>
              {plan?.mood_score && (
                <span className="font-bold text-foreground ml-auto">{plan.mood_score}/10</span>
              )}
            </div>
            <div className="flex items-center justify-between gap-1 w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  onClick={() => logMood(score)}
                  className={cn(
                    'size-5 rounded-full text-[9px] font-bold flex items-center justify-center border transition-all cursor-pointer flex-1',
                    plan?.mood_score === score
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-transparent text-muted-foreground hover:bg-muted border-muted'
                  )}
                  title={`${score}/10`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
