'use client'

import React, { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  Button
} from '@repo/ui'
import { useLocaleStore } from '@/lib/stores/locale-store'

type Role = 'admin' | 'manager' | 'maker' | 'observer'

interface InviteMemberDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const ROLE_OPTIONS: { value: Role; label: string; desc: string }[] = [
  { value: 'admin', label: 'Quản trị viên', desc: 'Toàn quyền hệ thống' },
  { value: 'manager', label: 'CEO / Quản lý', desc: 'Triage, duyệt task, xem Strategy' },
  { value: 'maker', label: 'Nhân viên', desc: 'Thực thi task, Focus Mode' },
  { value: 'observer', label: 'Quan sát viên', desc: 'Xem read-only, export báo cáo' },
]

export function InviteMemberDialog({ open, onClose, onSuccess }: InviteMemberDialogProps) {
  const { t } = useLocaleStore()
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<Role>('maker')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !fullName) {
      setError('Vui lòng nhập đầy đủ thông tin.')
      return
    }

    setSaving(true)
    setError(null)
    
    try {
      const res = await fetch('/api/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          full_name: fullName,
          role_type: role
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi mời.')
      }

      onSuccess()
      onClose()
      setEmail('')
      setFullName('')
      setRole('maker')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mời thành viên mới</DialogTitle>
        </DialogHeader>

        <form id="invite-form" onSubmit={handleSave} className="space-y-4 py-2">
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 text-sm rounded-md border bg-background text-foreground"
              placeholder="ví dụ: nv.a@tulie.agency"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">Họ và tên</label>
            <input 
              type="text" 
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2 text-sm rounded-md border bg-background text-foreground"
              placeholder="ví dụ: Nguyễn Văn A"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Vai trò</label>
            <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
              {ROLE_OPTIONS.map(r => (
                <label
                  key={r.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${role === r.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={() => setRole(r.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
          )}
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Huỷ</Button>
          <Button type="submit" form="invite-form" disabled={saving}>
            {saving ? 'Đang gửi...' : 'Gửi lời mời'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
