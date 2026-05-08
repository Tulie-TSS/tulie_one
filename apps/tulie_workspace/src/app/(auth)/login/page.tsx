'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocaleStore } from '@/lib/stores/locale-store'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { t } = useLocaleStore()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        
        const formData = new FormData(e.target as HTMLFormElement)
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const { createClient } = await import('@/lib/supabase')
        const supabase = createClient()
        
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            alert(error.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
            router.refresh()
        }
    }

    return (
        <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-10 h-9 rounded-md flex items-center justify-center" style={{ backgroundColor: 'var(--color-info)', color: 'white' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                </div>
                <span className="text-2xl" style={{ color: 'var(--color-fg)' }}>FlowGuard</span>
            </div>
            <p className="mb-8" style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>{t('app.tagline')}</p>

            <div className="p-8 rounded-md" style={{ backgroundColor: 'var(--color-bg)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', maxWidth: '400px', margin: '0 auto' }}>
                <h2 className="text-xl font-semibold mb-6 text-left" style={{ color: 'var(--color-fg)' }}>{t('auth.login')}</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="text-left">
                        <label className="block mb-1.5 font-medium" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-fg)' }}>{t('auth.email')}</label>
                        <input type="email" name="email" defaultValue="admin@curtis.com" className="w-full px-3 py-2.5"
                            style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface)', color: 'var(--color-fg)', fontSize: 'var(--text-sm)', outline: 'none' }} />
                    </div>
                    <div className="text-left">
                        <label className="block mb-1.5 font-medium" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-fg)' }}>{t('auth.password')}</label>
                        <input type="password" name="password" defaultValue="password123" className="w-full px-3 py-2.5"
                            style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface)', color: 'var(--color-fg)', fontSize: 'var(--text-sm)', outline: 'none' }} />
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-2.5 font-medium cursor-pointer"
                        style={{ backgroundColor: 'var(--color-info)', color: 'white', borderRadius: 'var(--radius-md)', border: 'none', fontSize: 'var(--text-sm)', opacity: loading ? 0.7 : 1 }}>
                        {loading ? t('auth.loggingIn') : t('auth.login')}
                    </button>
                </form>
                <p className="mt-4" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-fg-secondary)' }}>
                    {t('auth.noAccount')} <Link href="/register" style={{ color: 'var(--color-info)' }}>{t('auth.register')}</Link>
                </p>
            </div>
        </div>
    )
}
