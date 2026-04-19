'use client'

import { useLocaleStore } from '@/lib/stores/locale-store'
import { PageHeader, Card, CardContent, Button, Badge } from '@repo/ui'

export default function TemplatesPage() {
    const { t } = useLocaleStore()
    const templates = [
        { name: 'Bug Report', category: 'Engineering', effort: '2h', labels: ['bug', 'backend'] },
        { name: 'Feature Request', category: 'Product', effort: '8h', labels: ['feature'] },
        { name: 'Design Task', category: 'Design', effort: '4h', labels: ['design'] },
        { name: 'Code Review', category: 'Engineering', effort: '1h', labels: ['review'] },
    ]
    return (
        <div className="space-y-6">
            <PageHeader title={t('templates.title')} description={t('templates.subtitle')}>
                <Button>{t('templates.create')}</Button>
            </PageHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(tpl => (
                    <Card key={tpl.name} className="cursor-pointer hover:border-primary/50 transition-colors">
                        <CardContent>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-foreground">{tpl.name}</h3>
                                <Badge variant="secondary">{tpl.category}</Badge>
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-xs text-muted-foreground">{t('templates.defaultEffort')}: {tpl.effort}</span>
                            </div>
                            <div className="flex gap-1.5">
                                {tpl.labels.map(l => (
                                    <Badge key={l} variant="outline" className="text-xs">{l}</Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
