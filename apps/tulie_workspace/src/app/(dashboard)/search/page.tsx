'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MOCK_TASKS } from '@/lib/mock/data'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { Input, Card, CardContent, Badge } from '@repo/ui'
import { StatusBadge } from '@/components/shared/status-badge'
import { Search } from 'lucide-react'

export default function SearchPage() {
    const [query, setQuery] = useState('')
    const { t } = useLocaleStore()
    const results = query.length >= 2
        ? MOCK_TASKS.filter(t => t.title.toLowerCase().includes(query.toLowerCase()) || t.description?.toLowerCase().includes(query.toLowerCase()))
        : []

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-foreground">{t('search.title')}</h1>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('search.placeholder')}
                    autoFocus
                    className="pl-12 h-12 text-lg"
                />
            </div>

            {query.length >= 2 && (
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{results.length} {t('search.results')} &ldquo;{query}&rdquo;</p>
                    <div className="space-y-2">
                        {results.map(task => (
                            <Link key={task.id} href={`/tasks/${task.id}`} className="block group">
                                <Card className="hover:border-primary/50 transition-colors">
                                    <CardContent className="flex items-center gap-4 py-3">
                                        <StatusBadge status={task.status} label={t(`status.${task.status}` as const)} className="text-[10px] h-5" />
                                        <span className="flex-1 truncate font-medium text-sm text-foreground group-hover:text-primary transition-colors">{task.title}</span>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
            {query.length > 0 && query.length < 2 && (
                <p className="text-sm text-muted-foreground">{t('search.minChars')}</p>
            )}
        </div>
    )
}
