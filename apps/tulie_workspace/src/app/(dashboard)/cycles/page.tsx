'use client'

import Link from 'next/link'
import { MOCK_CYCLE, MOCK_MILESTONES } from '@/lib/mock/data'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { PageHeader, Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress, Avatar, AvatarFallback } from '@repo/ui'

export default function CyclesPage() {
    const { t } = useLocaleStore()

    return (
        <div className="space-y-6">
            <PageHeader title={t('cycles.title')} description={t('cycles.subtitle')}>
                <Button>{t('cycles.create')}</Button>
            </PageHeader>

            <div className="space-y-4">
                {/* Active Cycle */}
                <Link href={`/cycles/${MOCK_CYCLE.id}`} className="block group">
                    <Card className="border-primary/50 hover:border-primary transition-colors">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg group-hover:text-primary transition-colors">{MOCK_CYCLE.name}</CardTitle>
                                <Badge>{t('cycles.active')}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4 text-sm text-muted-foreground">
                                <span>{t('cycles.start')}: {new Date(MOCK_CYCLE.start_date).toLocaleDateString('vi-VN')}</span>
                                <span>{t('cycles.end')}: {new Date(MOCK_CYCLE.end_date).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className="space-y-2">
                                <div className="font-medium text-sm">{t('cycles.goals')}</div>
                                {MOCK_CYCLE.goals.map((g, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Progress value={g.progress} className={`flex-1 h-1.5 ${g.progress >= 80 ? '[&>div]:bg-emerald-500' : ''}`} />
                                        <span className="text-xs text-muted-foreground w-8 text-right">{g.progress}%</span>
                                        <span className="flex-shrink-0 text-xs text-foreground">{g.title}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Milestones */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{t('cycles.milestones')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {MOCK_MILESTONES.map(ms => (
                            <div key={ms.id} className="flex items-center gap-4 py-2 border-b last:border-0">
                                <Avatar className="size-8 flex-shrink-0">
                                    <AvatarFallback className={`text-xs font-semibold ${ms.completion_rate === 100 ? 'bg-emerald-500 text-white' : ''}`}>
                                        {ms.completion_rate === 100 ? '✓' : `${ms.completion_rate}%`}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="font-medium text-sm">{ms.name}</div>
                                    <div className="text-xs text-muted-foreground">{ms.description}</div>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(ms.target_date).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
