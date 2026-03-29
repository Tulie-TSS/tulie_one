'use client'

import { useLocaleStore } from '@/lib/stores/locale-store'

export default function TemplatesPage() {
    const { t } = useLocaleStore()
    const templates = [
        { name: 'Bug Report', category: 'Engineering', effort: '2h', labels: ['bug', 'backend'] },
        { name: 'Feature Request', category: 'Product', effort: '8h', labels: ['feature'] },
        { name: 'Design Task', category: 'Design', effort: '4h', labels: ['design'] },
        { name: 'Code Review', category: 'Engineering', effort: '1h', labels: ['review'] },
    ]
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-fg)' }}>{t('templates.title')}</h1>
                    <p style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>{t('templates.subtitle')}</p>
                </div>
                <button className="px-4 py-2 font-medium cursor-pointer" style={{ backgroundColor: 'var(--color-info)', color: 'white', borderRadius: 'var(--radius-md)', border: 'none', fontSize: 'var(--text-sm)' }}>{t('templates.create')}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(tpl => (
                    <div key={tpl.name} className="p-5 cursor-pointer transition-transform rounded-md" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold" style={{ color: 'var(--color-fg)' }}>{tpl.name}</h3>
                            <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-fg-secondary)', fontSize: 'var(--text-xs)' }}>{tpl.category}</span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <span style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-xs)' }}>{t('templates.defaultEffort')}: {tpl.effort}</span>
                        </div>
                        <div className="flex gap-1.5">
                            {tpl.labels.map(l => (
                                <span key={l} className="px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info)', fontSize: 'var(--text-xs)' }}>{l}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
