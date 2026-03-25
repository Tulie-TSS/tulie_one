'use client'

import Link from 'next/link'
import { MOCK_CYCLE, MOCK_MILESTONES } from '@/lib/mock/data'
import { useLocaleStore } from '@/lib/stores/locale-store'

export default function CyclesPage() {
    const { t } = useLocaleStore()

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-fg)' }}>{t('cycles.title')}</h1>
                    <p style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>{t('cycles.subtitle')}</p>
                </div>
                <button className="px-4 py-2 font-medium cursor-pointer" style={{ backgroundColor: 'var(--color-info)', color: 'white', borderRadius: 'var(--radius-md)', border: 'none', fontSize: 'var(--text-sm)' }}>{t('cycles.create')}</button>
            </div>
            <div className="space-y-4">
                <Link href={`/cycles/${MOCK_CYCLE.id}`} className="block p-6 no-underline transition-transform hover:-translate-y-0.5 rounded-xl" style={{ backgroundColor: 'var(--color-bg)', border: '2px solid var(--color-info)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-fg)' }}>{MOCK_CYCLE.name}</h3>
                        <span className="px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info)', fontSize: 'var(--text-xs)' }}>{t('cycles.active')}</span>
                    </div>
                    <div className="flex gap-4 mb-4" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-fg-secondary)' }}>
                        <span>{t('cycles.start')}: {new Date(MOCK_CYCLE.start_date).toLocaleDateString('vi-VN')}</span>
                        <span>{t('cycles.end')}: {new Date(MOCK_CYCLE.end_date).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="space-y-2">
                        <div className="font-medium mb-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-fg)' }}>{t('cycles.goals')}</div>
                        {MOCK_CYCLE.goals.map((g, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-surface)' }}>
                                    <div className="h-full rounded-full" style={{ width: `${g.progress}%`, backgroundColor: g.progress >= 80 ? 'var(--color-success)' : 'var(--color-info)' }} />
                                </div>
                                <span style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-xs)', minWidth: '32px' }}>{g.progress}%</span>
                                <span className="flex-shrink-0" style={{ color: 'var(--color-fg)', fontSize: 'var(--text-xs)' }}>{g.title}</span>
                            </div>
                        ))}
                    </div>
                </Link>
                <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                    <h3 className="font-semibold mb-4" style={{ color: 'var(--color-fg)' }}>{t('cycles.milestones')}</h3>
                    <div className="space-y-3">
                        {MOCK_MILESTONES.map(ms => (
                            <div key={ms.id} className="flex items-center gap-4 py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{
                                    backgroundColor: ms.completion_rate === 100 ? 'var(--color-success)' : 'var(--color-surface)',
                                    color: ms.completion_rate === 100 ? 'white' : 'var(--color-fg-secondary)',
                                    fontSize: 'var(--text-xs)', fontWeight: 600,
                                }}>
                                    {ms.completion_rate === 100 ? '✓' : `${ms.completion_rate}%`}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium" style={{ color: 'var(--color-fg)', fontSize: 'var(--text-sm)' }}>{ms.name}</div>
                                    <div style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-xs)' }}>{ms.description}</div>
                                </div>
                                <span style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-xs)' }}>
                                    {new Date(ms.target_date).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
