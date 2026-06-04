'use client'

import React, { useState } from 'react'
import { useHabits } from '@/hooks/useHabits'
import { useLifeRoles } from '@/hooks/useLifeRoles'
import { PageHeader, Card, CardContent, CardHeader, CardTitle, Badge } from '@repo/ui'
import { Plus, Flame, CheckCircle2, Circle, Trash2, X, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RoleIcon } from '@/components/command-center/role-icon'

export default function HabitsPage() {
  const { habits, loading, toggleHabit, createHabit, deleteHabit } = useHabits()
  const { roles } = useLifeRoles()
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('📌')
  const [newRoleId, setNewRoleId] = useState('')
  const [newFrequency, setNewFrequency] = useState('daily')

  const handleCreate = async () => {
    if (!newName.trim()) return
    await createHabit({
      name: newName.trim(),
      icon: newIcon,
      life_role_id: newRoleId || undefined,
      frequency: newFrequency,
    })
    setNewName('')
    setNewIcon('📌')
    setNewRoleId('')
    setNewFrequency('daily')
    setShowCreate(false)
  }

  const completedToday = habits.filter(h => h.today_log?.completed).length
  const totalActive = habits.length

  // Group by role
  const groupedHabits = [
    { role: null, label: 'Chung', habits: habits.filter(h => !h.life_role_id) },
    ...roles.map(r => ({
      role: r,
      label: r.display_name,
      habits: habits.filter(h => h.life_role_id === r.id),
    })),
  ].filter(g => g.habits.length > 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Target className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Habit Tracker</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{completedToday}/{totalActive} hoàn thành hôm nay</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Plus className="size-4" />
          Thêm habit
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card className="border-primary/30 shadow-sm">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <select
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="w-14 h-9 rounded-md border bg-background text-center text-lg"
              >
                {['📌', '📚', '🏋️', '🧘', '🏃', '💤', '💊', '🎵', '✍️', '🌍', '👶', '🧠', '💻'].map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Tên habit (VD: Học tiếng Anh 30p)"
                className="flex-1 h-9 px-3 rounded-md border bg-background text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={newRoleId}
                onChange={(e) => setNewRoleId(e.target.value)}
                className="h-8 px-2 rounded-md border bg-background text-xs"
              >
                <option value="">Vai trò (tuỳ chọn)</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.display_name}</option>
                ))}
              </select>
              <select
                value={newFrequency}
                onChange={(e) => setNewFrequency(e.target.value)}
                className="h-8 px-2 rounded-md border bg-background text-xs"
              >
                <option value="daily">Hàng ngày</option>
                <option value="weekdays">Thứ 2-6</option>
                <option value="MWF">T2-T4-T6</option>
                <option value="weekly">Hàng tuần</option>
              </select>
              <div className="flex-1" />
              <button
                onClick={() => setShowCreate(false)}
                className="h-8 px-3 text-xs rounded-md text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="h-8 px-3 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Tạo
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Habit List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : habits.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 bg-muted rounded-full">
                <Target className="size-8 text-muted-foreground" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Chưa có habit nào. Hãy tạo habit đầu tiên!</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Gợi ý:</p>
              <p>📚 Học tiếng Anh 30 phút · 🏋️ Tập gym · 🧘 Thiền 10 phút</p>
              <p>💤 Ngủ trước 22h · ✍️ Viết nhật ký · 👶 Chơi với con 30p</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {groupedHabits.map((group, gi) => (
            <div key={gi}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                {group.role ? (
                  <>
                    <RoleIcon name={group.role.icon} className="size-3.5" />
                    <span>{group.role.display_name}</span>
                  </>
                ) : (
                  <span>{group.label}</span>
                )}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.habits.map((habit) => {
                  const isDone = habit.today_log?.completed
                  return (
                    <Card
                      key={habit.id}
                      className={cn(
                        'group transition-all duration-200 hover:shadow-md cursor-pointer',
                        isDone && 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800'
                      )}
                      onClick={() => toggleHabit(habit.id)}
                    >
                      <CardContent className="flex items-center gap-3 py-3 px-4">
                        {/* Check */}
                        <div className={cn(
                          'shrink-0 transition-all duration-300',
                          isDone ? 'text-emerald-500 scale-110' : 'text-muted-foreground/30'
                        )}>
                          {isDone ? <CheckCircle2 className="size-6" /> : <Circle className="size-6" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{habit.icon}</span>
                            <span className={cn(
                              'text-sm font-medium truncate',
                              isDone && 'line-through text-muted-foreground'
                            )}>
                              {habit.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">{habit.frequency}</span>
                            {habit.streak_current > 0 && (
                              <span className="flex items-center gap-0.5 text-[10px] font-medium text-amber-500">
                                <Flame className="size-3" />
                                {habit.streak_current}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteHabit(habit.id) }}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-red-500 transition-all cursor-pointer"
                          title="Xóa habit"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
