'use client'

import Link from 'next/link'
import { useLocaleStore } from '@/lib/stores/locale-store'
import type { Locale } from '@/lib/i18n/translations'

export default function SettingsPage() {
    const { t, locale, setLocale } = useLocaleStore()

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-fg)' }}>{t('settings.title')}</h1>
                <p style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>{t('settings.subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[
                    { href: '/settings', label: t('settings.general'), desc: t('settings.generalDesc'), icon: '⚙️', active: true },
                    { href: '/settings/team', label: t('settings.team'), desc: t('settings.teamDesc'), icon: '👥' },
                    { href: '/settings/wip', label: t('settings.wip'), desc: t('settings.wipDesc'), icon: '🛡️' },
                ].map(item => (
                    <Link key={item.href} href={item.href} className="flex items-start gap-4 p-5 no-underline transition-transform rounded-md" style={{
                        backgroundColor: 'var(--color-bg)',
                        border: item.active ? '2px solid var(--color-info)' : '1px solid var(--color-border)',
                        boxShadow: 'var(--shadow-sm)',
                    }}>
                        <span style={{ fontSize: '24px' }}>{item.icon}</span>
                        <div>
                            <div className="font-semibold mb-1" style={{ color: 'var(--color-fg)' }}>{item.label}</div>
                            <div style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>{item.desc}</div>
                        </div>
                    </Link>
                ))}
            </div>
            <div className="p-6 rounded-md" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <h2 className="font-semibold mb-6" style={{ color: 'var(--color-fg)' }}>{t('settings.general')}</h2>
                <div className="space-y-5 max-w-xl">
                    <div>
                        <label className="block mb-1.5 font-medium" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-fg)' }}>{t('settings.theme')}</label>
                        <select className="w-full px-3 py-2" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg)', color: 'var(--color-fg)', fontSize: 'var(--text-sm)', outline: 'none' }}>
                            <option value="light">{t('settings.themeLight')}</option>
                            <option value="dark">{t('settings.themeDark')}</option>
                            <option value="auto">{t('settings.themeAuto')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1.5 font-medium" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-fg)' }}>{t('settings.language')}</label>
                        <select
                            value={locale}
                            onChange={(e) => setLocale(e.target.value as Locale)}
                            className="w-full px-3 py-2"
                            style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg)', color: 'var(--color-fg)', fontSize: 'var(--text-sm)', outline: 'none' }}>
                            <option value="vi">Tiếng Việt</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1.5 font-medium" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-fg)' }}>{t('settings.timezone')}</label>
                        <select className="w-full px-3 py-2" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg)', color: 'var(--color-fg)', fontSize: 'var(--text-sm)', outline: 'none' }}>
                            <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
                        </select>
                    </div>
                    <button className="px-5 py-2.5 font-medium cursor-pointer" style={{ backgroundColor: 'var(--color-info)', color: 'white', borderRadius: 'var(--radius-md)', border: 'none', fontSize: 'var(--text-sm)' }}>{t('settings.save')}</button>
                </div>
            </div>
        </div>
    )
}
