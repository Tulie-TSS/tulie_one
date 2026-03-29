'use client'

import Link from 'next/link'
import { MOCK_PROJECTS } from '@/lib/mock/data'
import { useLocaleStore } from '@/lib/stores/locale-store'

export default function ProjectsPage() {
    const { t } = useLocaleStore()

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-fg)' }}>{t('projects.title')}</h1>
                    <p style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>{t('projects.subtitle')}</p>
                </div>
                <button className="px-4 py-2 font-medium cursor-pointer" style={{ backgroundColor: 'var(--color-info)', color: 'white', borderRadius: 'var(--radius-md)', border: 'none', fontSize: 'var(--text-sm)' }}>{t('projects.create')}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_PROJECTS.map(p => (
                    <Link key={p.id} href={`/projects/${p.id}`} className="block p-5 no-underline transition-transform rounded-md" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold" style={{ color: 'var(--color-fg)' }}>{p.name}</h3>
                            <span className="px-2 py-0.5 rounded-full font-semibold" style={{
                                fontSize: 'var(--text-xs)',
                                backgroundColor: p.priority === 'critical' ? 'var(--color-danger-bg)' : p.priority === 'high' ? 'var(--color-warning-bg)' : 'var(--color-info-bg)',
                                color: p.priority === 'critical' ? 'var(--color-danger)' : p.priority === 'high' ? 'var(--color-warning)' : 'var(--color-info)',
                            }}>{p.priority}</span>
                        </div>
                        {p.description && <p className="mb-3" style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>{p.description}</p>}
                        <div className="flex items-center gap-4" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-fg-tertiary)' }}>
                            <span>{p.done_count}/{p.task_count} {t('projects.tasks').toLowerCase()}</span>
                            <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-surface)' }}>
                                <div className="h-full rounded-full" style={{ width: `${((p.done_count || 0) / (p.task_count || 1)) * 100}%`, backgroundColor: 'var(--color-success)' }} />
                            </div>
                            <span>{Math.round(((p.done_count || 0) / (p.task_count || 1)) * 100)}%</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
