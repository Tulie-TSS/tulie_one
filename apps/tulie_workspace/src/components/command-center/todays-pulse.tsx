'use client'

import React, { useState } from 'react'
import { useDailyPlan } from '@/hooks/useDailyPlan'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { Moon, Dumbbell, Heart, Battery, BatteryCharging, BatteryLow, BatteryWarning, Zap, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

const MOOD_EMOJIS = ['😫', '😞', '😐', '🙂', '😊', '😄', '🤩', '💪', '🔥', '⭐']

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
                stroke={completionPercent >= 80 ? '#43A047' : completionPercent >= 50 ? '#FB8C00' : '#E53935'}
                strokeWidth="4" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold">{tasksDone}/{tasksTotal}</span>
              <span className="text-[10px] text-muted-foreground">tasks</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="space-y-2.5">
          {/* Energy */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <EnergyIcon level={plan?.morning_energy || 'medium'} />
              <span>Năng lượng</span>
            </div>
            <span className="font-medium capitalize">{plan?.morning_energy || '—'}</span>
          </div>

          {/* Sleep */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Moon className="size-4" />
              <span>Giấc ngủ</span>
            </div>
            {editingSleep ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={sleepInput}
                  onChange={(e) => setSleepInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSleepSubmit()}
                  className="w-14 h-6 px-1.5 text-xs rounded border bg-background text-right"
                  autoFocus
                  placeholder="h"
                />
                <button onClick={handleSleepSubmit} className="text-xs text-primary hover:underline">✓</button>
                <button onClick={() => setEditingSleep(false)} className="text-xs text-muted-foreground hover:underline">✕</button>
              </div>
            ) : (
              <button
                onClick={() => { setEditingSleep(true); setSleepInput(plan?.sleep_hours?.toString() || '') }}
                className={cn('font-medium hover:underline', SleepColor(plan?.sleep_hours ?? null))}
              >
                {plan?.sleep_hours ? `${plan.sleep_hours}h` : 'Nhập'}
                {plan?.sleep_hours && plan.sleep_hours >= 7 && ' ✅'}
                {plan?.sleep_hours && plan.sleep_hours < 5 && ' ⚠️'}
              </button>
            )}
          </div>

          {/* Exercise */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Dumbbell className="size-4" />
              <span>Tập luyện</span>
            </div>
            {editingExercise ? (
              <div className="flex items-center gap-1">
                {['🏃 Chạy', '🏋️ Gym', '🧘 Yoga', '🚴 Đạp xe'].map((opt) => {
                  const [icon, label] = opt.split(' ')
                  return (
                    <button
                      key={label}
                      onClick={() => handleExerciseSubmit(label!, 30)}
                      className="text-xs px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 transition-colors"
                      title={`${label} 30 phút`}
                    >
                      {icon}
                    </button>
                  )
                })}
                <button onClick={() => setEditingExercise(false)} className="text-xs text-muted-foreground">✕</button>
              </div>
            ) : (
              <button
                onClick={() => setEditingExercise(true)}
                className={cn('font-medium hover:underline', plan?.exercise_done ? 'text-emerald-500' : 'text-muted-foreground')}
              >
                {plan?.exercise_done
                  ? `${plan.exercise_type || 'Đã tập'} ${plan.exercise_minutes}p ✅`
                  : '❌ Chưa tập'}
              </button>
            )}
          </div>

          {/* Mood */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Heart className="size-4" />
              <span>Tâm trạng</span>
            </div>
            <div className="flex items-center gap-0.5">
              {MOOD_EMOJIS.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => logMood(i + 1)}
                  className={cn(
                    'text-sm transition-all hover:scale-125',
                    plan?.mood_score === i + 1 ? 'scale-125 opacity-100' : 'opacity-30 hover:opacity-70'
                  )}
                  title={`${i + 1}/10`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
