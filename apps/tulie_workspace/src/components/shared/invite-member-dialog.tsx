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
  const [successLink, setSuccessLink] = useState<string | null>(null)

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

      setSuccessLink(data.inviteLink)
      onSuccess()
      // Don't close immediately if we have a link to show
      if (!data.inviteLink) {
        handleResetAndClose()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleResetAndClose = () => {
    setEmail('')
    setFullName('')
    setRole('maker')
    setSuccessLink(null)
    setError(null)
    onClose()
  }

  const copyLink = () => {
    if (successLink) {
      navigator.clipboard.writeText(successLink)
      alert('Đã sao chép link mời!')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleResetAndClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{successLink ? 'Đã tạo lời mời!' : 'Mời thành viên mới'}</DialogTitle>
        </DialogHeader>

        {successLink ? (
          <div className="space-y-4 py-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
              <p className="text-emerald-800 text-sm font-medium mb-1">Lời mời đã được tạo thành công!</p>
              <p className="text-emerald-600 text-xs">Email đã được gửi (nếu chưa quá hạn mức). Bạn có thể gửi link thủ công dưới đây:</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Link mời trực tiếp:</label>
              <div className="flex gap-2">
                <input 
                  readOnly 
                  value={successLink}
                  className="flex-1 p-2 text-xs rounded-md border bg-muted font-mono truncate"
                />
                <Button size="sm" onClick={copyLink}>Copy</Button>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground italic">Lưu ý: Link này có hiệu lực trong vòng 24 giờ.</p>
          </div>
        ) : (
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
        )}

        <DialogFooter>
          {successLink ? (
            <Button type="button" className="w-full" onClick={handleResetAndClose}>Hoàn tất</Button>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Huỷ</Button>
              <Button type="submit" form="invite-form" disabled={saving}>
                {saving ? 'Đang gửi...' : 'Gửi lời mời'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
