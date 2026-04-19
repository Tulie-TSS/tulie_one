'use client'

import Link from 'next/link'
import { MOCK_PROJECTS } from '@/lib/mock/data'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { PageHeader, Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress } from '@repo/ui'

export default function ProjectsPage() {
    const { t } = useLocaleStore()

    const priorityVariant = (priority: string) => {
        switch (priority) {
            case 'critical': return 'destructive' as const
            case 'high': return 'secondary' as const
            default: return 'outline' as const
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader title={t('projects.title')} description={t('projects.subtitle')}>
                <Button>{t('projects.create')}</Button>
            </PageHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_PROJECTS.map(p => (
                    <Link key={p.id} href={`/projects/${p.id}`} className="block group">
                        <Card className="hover:border-primary/50 transition-colors">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base group-hover:text-primary transition-colors">{p.name}</CardTitle>
                                    <Badge variant={priorityVariant(p.priority)}>{p.priority}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {p.description && <p className="text-sm text-muted-foreground mb-3">{p.description}</p>}
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>{p.done_count}/{p.task_count} {t('projects.tasks').toLowerCase()}</span>
                                    <Progress value={((p.done_count || 0) / (p.task_count || 1)) * 100} className="flex-1 h-1.5" />
                                    <span>{Math.round(((p.done_count || 0) / (p.task_count || 1)) * 100)}%</span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
