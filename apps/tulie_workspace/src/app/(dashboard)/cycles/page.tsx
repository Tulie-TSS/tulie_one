'use client'

import React from 'react'
import Link from 'next/link'
import { useCycles } from '@/hooks/useCycles'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { PageHeader, Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress } from '@repo/ui'
import { Loader2, Plus, RefreshCw, Calendar, CheckCircle2 } from 'lucide-react'
import { NewCycleDialog } from '@/components/cycles/new-cycle-dialog'

export default function CyclesPage() {
  const { t } = useLocaleStore()
  const { canManage } = useCurrentUser()
  const { cycles, loading, refetch } = useCycles()
  const [createOpen, setCreateOpen] = React.useState(false)

  const statusBadge: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    active: { label: 'Đang hoạt động', variant: 'default' },
    planning: { label: 'Đang lên kế hoạch', variant: 'secondary' },
    completed: { label: 'Đã hoàn thành', variant: 'outline' },
    archived: { label: 'Lưu trữ', variant: 'outline' },
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('cycles.title')} description={t('cycles.subtitle')}>
        {canManage && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            {t('cycles.create')}
          </Button>
        )}
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : cycles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <RefreshCw className="size-10 opacity-30" />
          <p className="text-sm">Chưa có chu kỳ nào</p>
          {canManage && <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="size-3" /> Tạo chu kỳ đầu tiên</Button>}
        </div>
      ) : (
        <div className="space-y-4">
          {cycles.map(cycle => {
            const sb = statusBadge[cycle.status] ?? { label: cycle.status, variant: 'outline' }
            const goals = Array.isArray(cycle.goals) ? cycle.goals : []
            const avgProgress = goals.length > 0
              ? Math.round(goals.reduce((acc: number, g: any) => acc + (g.progress || 0), 0) / goals.length)
              : 0

            return (
              <Link key={cycle.id} href={`/cycles/${cycle.id}`} className="block group">
                <Card className={`transition-colors ${cycle.status === 'active' ? 'border-primary/50 hover:border-primary' : 'hover:border-primary/30'}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${cycle.status === 'active' ? 'bg-primary/10' : 'bg-muted'}`}>
                          <RefreshCw className={`size-4 ${cycle.status === 'active' ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <CardTitle className="text-base group-hover:text-primary transition-colors">
                          {cycle.name}
                        </CardTitle>
                      </div>
                      <Badge variant={sb.variant}>{sb.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Dates */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(cycle.start_date).toLocaleDateString('vi-VN')}
                      </span>
                      <span>→</span>
                      <span>{new Date(cycle.end_date).toLocaleDateString('vi-VN')}</span>
                    </div>

                    {/* Goals */}
                    {goals.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground">{t('cycles.goals')}</span>
                          <span className={`font-semibold ${avgProgress >= 80 ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {avgProgress}% avg
                          </span>
                        </div>
                        {goals.map((g: any, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            {g.progress >= 100
                              ? <CheckCircle2 className="size-3 text-foreground flex-shrink-0" />
                              : <div className="size-3 rounded-full border border-border flex-shrink-0" />
                            }
                            <span className="text-xs text-muted-foreground flex-1 truncate">{g.title}</span>
                            <Progress
                              value={g.progress}
                              className={`w-24 h-1.5 ${g.progress >= 80 ? '[&>div]:bg-primary' : ''}`}
                            />
                            <span className="text-xs text-muted-foreground w-8 text-right">{g.progress}%</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Milestones */}
                    {cycle.milestones && cycle.milestones.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {cycle.milestones.map(ms => (
                          <div key={ms.id} className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className={`w-1.5 h-1.5 rounded-full ${ms.completion_rate >= 100 ? 'bg-primary' : ms.completion_rate > 0 ? 'bg-foreground/50' : 'bg-border'}`} />
                            <span>{ms.name}</span>
                            <span className="text-foreground font-medium">{ms.completion_rate}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
      <NewCycleDialog 
        open={createOpen} 
        onOpenChange={setCreateOpen} 
        onSuccess={refetch} 
      />
    </div>
  )
}
