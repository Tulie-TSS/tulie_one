'use client'

import Link from 'next/link'
import { WIP_DEFAULTS, HOFSTADTER_DEFAULTS } from '@/lib/constants/wip-defaults'
import { useLocaleStore } from '@/lib/stores/locale-store'

export default function WipSettingsPage() {
    const { t } = useLocaleStore()

    return (
        <div>
            <Link href="/settings" className="inline-flex items-center gap-1 no-underline mb-4" style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>{t('settings.backToSettings')}</Link>
            <h1 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-fg)' }}>{t('settings.wip')}</h1>
            <div className="space-y-6 max-w-2xl">
                <div className="p-6 rounded-md" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                    <h2 className="font-semibold mb-4" style={{ color: 'var(--color-fg)' }}>{t('wip.personalLimit')}</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-1.5 font-medium" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-fg)' }}>{t('wip.maxDoing')}</label>
                            <input type="number" min={WIP_DEFAULTS.PERSONAL_MIN} max={WIP_DEFAULTS.PERSONAL_MAX} defaultValue={WIP_DEFAULTS.PERSONAL} className="w-32 px-3 py-2" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg)', color: 'var(--color-fg)', fontSize: 'var(--text-sm)', outline: 'none' }} />
                            <p className="mt-1" style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-xs)' }}>{t('wip.allowed')}: {WIP_DEFAULTS.PERSONAL_MIN} - {WIP_DEFAULTS.PERSONAL_MAX}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="can-override" defaultChecked className="w-4 h-4" />
                            <label htmlFor="can-override" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-fg)' }}>{t('wip.allowOverride')}</label>
                        </div>
                    </div>
                </div>
                <div className="p-6 rounded-md" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                    <h2 className="font-semibold mb-4" style={{ color: 'var(--color-fg)' }}>{t('wip.hofstadter')}</h2>
                    <div>
                        <label className="block mb-1.5 font-medium" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-fg)' }}>{t('wip.defaultCoeff')}</label>
                        <input type="number" step="0.05" min={HOFSTADTER_DEFAULTS.MIN_MULTIPLIER} max={HOFSTADTER_DEFAULTS.MAX_MULTIPLIER} defaultValue={HOFSTADTER_DEFAULTS.DEFAULT_MULTIPLIER} className="w-32 px-3 py-2" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg)', color: 'var(--color-fg)', fontSize: 'var(--text-sm)', outline: 'none' }} />
                        <p className="mt-1" style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-xs)' }}>
                            {t('wip.formula')}. {t('wip.range')}: {HOFSTADTER_DEFAULTS.MIN_MULTIPLIER} - {HOFSTADTER_DEFAULTS.MAX_MULTIPLIER}
                        </p>
                    </div>
                </div>
                <button className="px-5 py-2.5 font-medium cursor-pointer" style={{ backgroundColor: 'var(--color-info)', color: 'white', borderRadius: 'var(--radius-md)', border: 'none', fontSize: 'var(--text-sm)' }}>{t('settings.save')}</button>
            </div>
        </div>
    )
}
