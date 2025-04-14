'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MOCK_TASKS } from '@/lib/mock/data'
import { TASK_STATUS_COLORS } from '@/lib/constants/task-status'
import { useLocaleStore } from '@/lib/stores/locale-store'

export default function SearchPage() {
    const [query, setQuery] = useState('')
    const { t } = useLocaleStore()
    const results = query.length >= 2
        ? MOCK_TASKS.filter(t => t.title.toLowerCase().includes(query.toLowerCase()) || t.description?.toLowerCase().includes(query.toLowerCase()))
        : []

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-fg)' }}>{t('search.title')}</h1>
            </div>
            <div className="mb-6">
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('search.placeholder')} autoFocus
                    className="w-full px-5 py-3 text-lg" style={{
                        border: '2px solid var(--color-info)', borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'var(--color-bg)', color: 'var(--color-fg)', outline: 'none',
                    }} />
            </div>
            {query.length >= 2 && (
                <div>
                    <div className="mb-3" style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>{results.length} {t('search.results')} &ldquo;{query}&rdquo;</div>
                    <div className="space-y-2">
                        {results.map(task => (
                            <Link key={task.id} href={`/tasks/${task.id}`} className="flex items-center gap-4 p-4 no-underline transition-colors rounded-md" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                                <span className="px-2 py-0.5 rounded-full flex-shrink-0 font-semibold" style={{ backgroundColor: `color-mix(in srgb, ${TASK_STATUS_COLORS[task.status]} 15%, transparent)`, color: TASK_STATUS_COLORS[task.status], fontSize: 'var(--text-xs)' }}>{t(`status.${task.status}` as const)}</span>
                                <span className="flex-1 truncate font-medium" style={{ color: 'var(--color-fg)', fontSize: 'var(--text-sm)' }}>{task.title}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
            {query.length > 0 && query.length < 2 && (
                <p style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-sm)' }}>{t('search.minChars')}</p>
            )}
        </div>
    )
}
