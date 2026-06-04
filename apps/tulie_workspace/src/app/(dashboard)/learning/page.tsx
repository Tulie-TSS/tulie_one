'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { PageHeader, Card, CardContent, CardHeader, CardTitle, Badge, Progress } from '@repo/ui'
import { Plus, BookOpen, CheckCircle2, Clock, FileText, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FptLearningGoal, FptCategory, FPT_CATEGORY_LABELS } from '@/types/command-center.types'

const CATEGORIES: { value: FptCategory; label: string; icon: string; color: string }[] = [
  { value: 'nghi_dinh', label: 'Nghị định', icon: '📜', color: '#E53935' },
  { value: 'nghi_quyet', label: 'Nghị quyết', icon: '📋', color: '#FB8C00' },
  { value: 'san_pham', label: 'Sản phẩm', icon: '💻', color: '#1E88E5' },
  { value: 'quy_trinh', label: 'Quy trình', icon: '🔄', color: '#43A047' },
  { value: 'skill', label: 'Kỹ năng', icon: '🎯', color: '#7B1FA2' },
]

export default function LearningPage() {
  const [goals, setGoals] = useState<FptLearningGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<FptCategory>('nghi_dinh')
  const [newDescription, setNewDescription] = useState('')
  const [newSourceDoc, setNewSourceDoc] = useState('')

  const fetchGoals = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('fpt_learning_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('category')
      .order('sort_order')

    setGoals(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchGoals() }, [fetchGoals])

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('fpt_learning_goals').insert({
      user_id: user.id,
      title: newTitle.trim(),
      category: newCategory,
      description: newDescription.trim() || null,
      source_document: newSourceDoc.trim() || null,
    })

    setNewTitle('')
    setNewDescription('')
    setNewSourceDoc('')
    setShowCreate(false)
    fetchGoals()
  }

  const updateProgress = async (id: string, progress: number) => {
    const supabase = createClient()
    const completed_at = progress >= 100 ? new Date().toISOString() : null
    await supabase
      .from('fpt_learning_goals')
      .update({ progress_percent: progress, completed_at })
      .eq('id', id)
    fetchGoals()
  }

  const deleteGoal = async (id: string) => {
    const supabase = createClient()
    await supabase.from('fpt_learning_goals').delete().eq('id', id)
    fetchGoals()
  }

  // Stats
  const totalGoals = goals.length
  const completedGoals = goals.filter(g => g.progress_percent >= 100).length
  const avgProgress = totalGoals > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress_percent, 0) / totalGoals)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="🏢 FPT IS — Học tập & Thu hoạch"
          description={`${completedGoals}/${totalGoals} hoàn thành · Trung bình: ${avgProgress}%`}
        />
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-4" />
          Thêm mục tiêu
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card className="border-primary/30 shadow-sm">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as FptCategory)}
                className="h-9 px-2 rounded-md border bg-background text-sm"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Tên nội dung học (VD: Nghị định 73/2024/NĐ-CP)"
                className="flex-1 h-9 px-3 rounded-md border bg-background text-sm"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSourceDoc}
                onChange={(e) => setNewSourceDoc(e.target.value)}
                placeholder="Link tài liệu (tuỳ chọn)"
                className="flex-1 h-8 px-3 rounded-md border bg-background text-xs"
              />
              <button
                onClick={() => setShowCreate(false)}
                className="h-8 px-3 text-xs rounded-md text-muted-foreground hover:bg-muted transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim()}
                className="h-8 px-3 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                Tạo
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {CATEGORIES.map(cat => {
          const catGoals = goals.filter(g => g.category === cat.value)
          const catCompleted = catGoals.filter(g => g.progress_percent >= 100).length
          const catAvg = catGoals.length > 0
            ? Math.round(catGoals.reduce((s, g) => s + g.progress_percent, 0) / catGoals.length)
            : 0

          return (
            <Card key={cat.value} className="shadow-sm">
              <CardContent className="py-3 px-4 text-center">
                <p className="text-2xl mb-1">{cat.icon}</p>
                <p className="text-xs font-semibold">{cat.label}</p>
                <p className="text-[10px] text-muted-foreground">{catCompleted}/{catGoals.length}</p>
                <Progress value={catAvg} className="h-1 mt-2" />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Goals List by Category */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : goals.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center space-y-3">
            <p className="text-4xl">📚</p>
            <p className="text-sm text-muted-foreground">Chưa có mục tiêu học tập nào.</p>
            <p className="text-xs text-muted-foreground">
              Thêm các nghị định, nghị quyết, sản phẩm FPT IS mà quản lý giao để theo dõi tiến độ.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {CATEGORIES.map(cat => {
            const catGoals = goals.filter(g => g.category === cat.value)
            if (catGoals.length === 0) return null

            return (
              <div key={cat.value}>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <Badge variant="secondary" className="text-[10px]">{catGoals.length}</Badge>
                </h3>
                <div className="space-y-2">
                  {catGoals.map(goal => (
                    <Card
                      key={goal.id}
                      className={cn(
                        'group transition-all hover:shadow-sm',
                        goal.progress_percent >= 100 && 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800'
                      )}
                    >
                      <CardContent className="flex items-center gap-4 py-3 px-4">
                        {/* Status Icon */}
                        <div className={cn(
                          'shrink-0',
                          goal.progress_percent >= 100 ? 'text-emerald-500' : 'text-muted-foreground/30'
                        )}>
                          {goal.progress_percent >= 100 ? <CheckCircle2 className="size-5" /> : <BookOpen className="size-5" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-sm font-medium',
                            goal.progress_percent >= 100 && 'line-through text-muted-foreground'
                          )}>
                            {goal.title}
                          </p>
                          {goal.source_document && (
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <FileText className="size-3" />
                              {goal.source_document}
                            </p>
                          )}
                        </div>

                        {/* Progress Slider */}
                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="10"
                            value={goal.progress_percent}
                            onChange={(e) => updateProgress(goal.id, parseInt(e.target.value))}
                            className="w-20 h-1.5 accent-primary"
                          />
                          <span className="text-xs font-medium w-8 text-right"
                            style={{ color: goal.progress_percent >= 100 ? '#43A047' : goal.progress_percent >= 50 ? '#FB8C00' : '#E53935' }}
                          >
                            {goal.progress_percent}%
                          </span>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-red-500 transition-all shrink-0"
                        >
                          <X className="size-4" />
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
