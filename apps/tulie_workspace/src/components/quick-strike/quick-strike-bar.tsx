'use client'

import { useQuickStrikeStore } from '@/lib/stores/quick-strike-store'
import { useLocaleStore } from '@/lib/stores/locale-store'

export function QuickStrikeBar() {
    const { value, setValue, addStrike } = useQuickStrikeStore()
    const { t } = useLocaleStore()

    const handleSubmit = () => {
        if (value.trim()) {
            addStrike({ id: Date.now().toString(), description: value.trim(), completed_at: new Date().toISOString() })
            setValue('')
        }
    }

    return (
        <div className="fixed bottom-4 right-4 z-50" style={{ maxWidth: '320px' }}>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full" style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-md)',
            }}>
                <span style={{ fontSize: '14px' }}>⚡</span>
                <input
                    type="text"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder={t('quickStrike.placeholder')}
                    style={{
                        flex: 1,
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-fg)',
                        minWidth: 0,
                    }}
                />
            </div>
        </div>
    )
}
