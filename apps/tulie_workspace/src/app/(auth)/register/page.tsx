'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocaleStore } from '@/lib/stores/locale-store'

type Role = 'maker' | 'manager' | 'observer'

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  maker: 'Thực thi công việc, sử dụng Focus Mode',
  manager: 'Quản lý triage, chiến lược, duyệt task',
  observer: 'Theo dõi tiến độ, xem báo cáo read-only',
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { t } = useLocaleStore()

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const fullName = form.get('fullName') as string
    const email = form.get('email') as string
    const password = form.get('password') as string
    const roleType = form.get('role') as Role

    if (!fullName || !email || !password) {
      setError('Vui lòng điền đầy đủ thông tin')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, roleType }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Đăng ký thất bại')
        return
      }

      // Auto login after registration
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })

      if (loginError) {
        setSuccess(true) // Registration OK, need manual login
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="p-8 rounded-md" style={{ backgroundColor: 'var(--color-bg)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', maxWidth: '400px', margin: '0 auto' }}>
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-fg)' }}>Đăng ký thành công!</h2>
          <p className="mb-4 text-sm" style={{ color: 'var(--color-fg-secondary)' }}>
            Kiểm tra email để xác nhận tài khoản, sau đó đăng nhập để bắt đầu.
          </p>
          <Link href="/login" style={{ color: 'var(--color-info)' }} className="font-medium">
            Đến trang đăng nhập →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-3 mb-2">
        <div className="w-10 h-9 rounded-md flex items-center justify-center" style={{ backgroundColor: 'var(--color-info)', color: 'white' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <span className="text-2xl" style={{ color: 'var(--color-fg)' }}>Tulie Workspace</span>
      </div>
      <p className="mb-8" style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>{t('app.tagline')}</p>

      <div className="p-8 rounded-md" style={{ backgroundColor: 'var(--color-bg)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', maxWidth: '420px', margin: '0 auto' }}>
        <h2 className="text-xl font-semibold mb-6 text-left" style={{ color: 'var(--color-fg)' }}>{t('auth.createAccount')}</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="text-left">
            <label className="block mb-1.5 font-medium" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-fg)' }}>
              {t('auth.fullName')}
            </label>
            <input
              type="text"
              name="fullName"
              placeholder="Nguyễn Văn A"
              required
              className="w-full px-3 py-2.5"
              style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface)', color: 'var(--color-fg)', fontSize: 'var(--text-sm)', outline: 'none' }}
            />
          </div>
          <div className="text-left">
            <label className="block mb-1.5 font-medium" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-fg)' }}>
              {t('auth.email')}
            </label>
            <input
              type="email"
              name="email"
              placeholder="email@company.com"
              required
              className="w-full px-3 py-2.5"
              style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface)', color: 'var(--color-fg)', fontSize: 'var(--text-sm)', outline: 'none' }}
            />
          </div>
          <div className="text-left">
            <label className="block mb-1.5 font-medium" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-fg)' }}>
              {t('auth.password')} <span style={{ color: 'var(--color-fg-secondary)', fontWeight: 400 }}>(tối thiểu 8 ký tự)</span>
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              className="w-full px-3 py-2.5"
              style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface)', color: 'var(--color-fg)', fontSize: 'var(--text-sm)', outline: 'none' }}
            />
          </div>
          <div className="text-left">
            <label className="block mb-1.5 font-medium" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-fg)' }}>
              {t('auth.role')}
            </label>
            <select
              name="role"
              defaultValue="maker"
              className="w-full px-3 py-2.5"
              style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface)', color: 'var(--color-fg)', fontSize: 'var(--text-sm)', outline: 'none' }}
            >
              <option value="maker">{t('role.maker')} — {ROLE_DESCRIPTIONS.maker}</option>
              <option value="manager">{t('role.manager')} — {ROLE_DESCRIPTIONS.manager}</option>
              <option value="observer">{t('role.observer')} — {ROLE_DESCRIPTIONS.observer}</option>
            </select>
            <p className="mt-1 text-xs" style={{ color: 'var(--color-fg-secondary)' }}>
              Vai trò có thể được Admin thay đổi sau khi đăng nhập
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-md text-sm text-red-600 bg-red-50 border border-red-200 text-left">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 font-medium cursor-pointer"
            style={{ backgroundColor: 'var(--color-info)', color: 'white', borderRadius: 'var(--radius-md)', border: 'none', fontSize: 'var(--text-sm)', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? t('auth.registering') : t('auth.register')}
          </button>
        </form>
        <p className="mt-4" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-fg-secondary)' }}>
          {t('auth.hasAccount')} <Link href="/login" style={{ color: 'var(--color-info)' }}>{t('auth.login')}</Link>
        </p>
      </div>
    </div>
  )
}
