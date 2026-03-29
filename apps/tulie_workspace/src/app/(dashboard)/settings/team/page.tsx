'use client'

import Link from 'next/link'
import { MOCK_USERS } from '@/lib/mock/data'
import { useLocaleStore } from '@/lib/stores/locale-store'

export default function TeamSettingsPage() {
    const { t } = useLocaleStore()

    return (
        <div>
            <Link href="/settings" className="inline-flex items-center gap-1 no-underline mb-4" style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>{t('settings.backToSettings')}</Link>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-fg)' }}>{t('settings.team')}</h1>
                <button className="px-4 py-2 font-medium cursor-pointer" style={{ backgroundColor: 'var(--color-info)', color: 'white', borderRadius: 'var(--radius-md)', border: 'none', fontSize: 'var(--text-sm)' }}>{t('settings.inviteMember')}</button>
            </div>
            <div className="overflow-hidden rounded-md" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <table className="w-full" style={{ fontSize: 'var(--text-sm)' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                            {[t('team.member'), t('team.email'), t('team.role'), t('team.wipLimit'), t('team.status')].map(h => (
                                <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-fg-secondary)' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_USERS.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-info)', color: 'white', fontSize: '11px', fontWeight: 600 }}>{user.full_name.charAt(0)}</div>
                                        <span className="font-medium" style={{ color: 'var(--color-fg)' }}>{user.full_name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3" style={{ color: 'var(--color-fg-secondary)' }}>{user.email}</td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-0.5 rounded-full font-semibold" style={{ fontSize: 'var(--text-xs)', backgroundColor: user.role_type === 'admin' ? 'var(--color-danger-bg)' : user.role_type === 'manager' ? 'var(--color-info-bg)' : user.role_type === 'maker' ? 'var(--color-success-bg)' : 'var(--color-surface)', color: user.role_type === 'admin' ? 'var(--color-danger)' : user.role_type === 'manager' ? 'var(--color-info)' : user.role_type === 'maker' ? 'var(--color-success)' : 'var(--color-fg-secondary)' }}>{user.role_type}</span>
                                </td>
                                <td className="px-4 py-3" style={{ color: 'var(--color-fg)' }}>{user.personal_wip_limit}</td>
                                <td className="px-4 py-3">
                                    <span className="w-2 h-2 rounded-full inline-block mr-1" style={{ backgroundColor: user.is_active ? 'var(--color-success)' : 'var(--color-fg-tertiary)' }}></span>
                                    <span style={{ color: user.is_active ? 'var(--color-success)' : 'var(--color-fg-tertiary)', fontSize: 'var(--text-xs)' }}>{user.is_active ? t('team.active') : t('team.inactive')}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
