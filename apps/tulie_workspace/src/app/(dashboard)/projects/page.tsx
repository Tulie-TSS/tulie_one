'use client'

import React from 'react'
import Link from 'next/link'
import { useProjects } from '@/hooks/useProjects'
import { useCycles } from '@/hooks/useCycles'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { PageHeader, Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress } from '@repo/ui'
import { Loader2, Plus, FolderKanban } from 'lucide-react'

export default function ProjectsPage() {
  const { t } = useLocaleStore()
  const { canManage } = useCurrentUser()
  const { activeCycle } = useCycles()
  const { projects, loading } = useProjects(activeCycle?.id)

  const priorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive' as const
      case 'high': return 'default' as const
      case 'medium': return 'secondary' as const
      default: return 'outline' as const
    }
  }

  const priorityLabel: Record<string, string> = {
    critical: 'Khẩn cấp',
    high: 'Cao',
    medium: 'Trung bình',
    low: 'Thấp',
  }

  const statusColor: Record<string, string> = {
    active: 'bg-emerald-500',
    paused: 'bg-amber-500',
    completed: 'bg-muted-foreground',
    cancelled: 'bg-destructive',
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('projects.title')} description={t('projects.subtitle')}>
        {canManage && (
          <Button>
            <Plus className="size-4" />
            {t('projects.create')}
          </Button>
        )}
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <FolderKanban className="size-10 opacity-30" />
          <p className="text-sm">Chưa có dự án nào trong chu kỳ hiện tại</p>
          {canManage && <Button size="sm"><Plus className="size-3" /> Tạo dự án đầu tiên</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(p => {
            const pct = Math.round(((p.done_count || 0) / (p.task_count || 1)) * 100)
            return (
              <Link key={p.id} href={`/projects/${p.id}`} className="block group">
                <Card className="hover:border-primary/50 transition-colors h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${statusColor[p.status] || 'bg-muted-foreground'}`} />
                        <CardTitle className="text-base group-hover:text-primary transition-colors leading-snug">
                          {p.name}
                        </CardTitle>
                      </div>
                      <Badge variant={priorityVariant(p.priority)} className="text-[10px] shrink-0">
                        {priorityLabel[p.priority] || p.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {p.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{p.description}</p>
                    )}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{p.done_count}/{p.task_count} công việc hoàn thành</span>
                        <span className={`font-semibold ${pct >= 80 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-foreground'}`}>
                          {pct}%
                        </span>
                      </div>
                      <Progress
                        value={pct}
                        className={`h-1.5 ${pct >= 80 ? '[&>div]:bg-emerald-500' : pct >= 40 ? '[&>div]:bg-amber-500' : ''}`}
                      />
                    </div>
                    {p.owner && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        PM: <span className="text-foreground font-medium">{p.owner.full_name}</span>
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
