'use client'

import React, { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  Button, Badge,
} from '@repo/ui'
import { useLocaleStore } from '@/lib/stores/locale-store'

type Role = 'admin' | 'manager' | 'maker' | 'observer'

interface EditMemberDialogProps {
  open: boolean
  onClose: () => void
  member: {
    id: string
    full_name: string
    email: string
    role_type: Role
    personal_wip_limit: number
    is_active: boolean
  } | null
  currentUserRole: Role
  onSave: (data: { role_type: Role; personal_wip_limit: number; is_active: boolean }) => Promise<void>
}

const ROLE_OPTIONS: { value: Role; label: string; desc: string }[] = [
  { value: 'admin', label: 'Quản trị viên', desc: 'Toàn quyền hệ thống' },
  { value: 'manager', label: 'CEO / Quản lý', desc: 'Triage, duyệt task, xem Strategy' },
  { value: 'maker', label: 'Nhân viên', desc: 'Thực thi task, Focus Mode' },
  { value: 'observer', label: 'Quan sát viên', desc: 'Xem read-only, export báo cáo' },
]

export function EditMemberDialog({ open, onClose, member, currentUserRole, onSave }: EditMemberDialogProps) {
  const { t } = useLocaleStore()
  const [role, setRole] = useState<Role>(member?.role_type ?? 'maker')
  const [wipLimit, setWipLimit] = useState(member?.personal_wip_limit ?? 2)
  const [isActive, setIsActive] = useState(member?.is_active ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  React.useEffect(() => {
    if (member) {
      setRole(member.role_type)
      setWipLimit(member.personal_wip_limit)
      setIsActive(member.is_active)
      setError(null)
    }
  }, [member])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await onSave({ role_type: role, personal_wip_limit: wipLimit, is_active: isActive })
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  // Managers can't assign admin/manager roles
  const availableRoles = currentUserRole === 'admin'
    ? ROLE_OPTIONS
    : ROLE_OPTIONS.filter(r => !['admin', 'manager'].includes(r.value))

  if (!member) return null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thành viên</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Member info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
              {member.full_name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-foreground">{member.full_name}</p>
              <p className="text-xs text-muted-foreground">{member.email}</p>
            </div>
          </div>

          {/* Role selection */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Vai trò</label>
            <div className="grid gap-2">
              {availableRoles.map(r => (
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

          {/* WIP Limit */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">
              Giới hạn WIP cá nhân: <span className="text-primary">{wipLimit}</span> task
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={wipLimit}
              onChange={(e) => setWipLimit(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1 (nghiêm ngặt)</span>
              <span>5 (linh hoạt)</span>
            </div>
          </div>

          {/* Active status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Trạng thái tài khoản</p>
              <p className="text-xs text-muted-foreground">Vô hiệu hoá sẽ ngăn đăng nhập</p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform shadow ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Huỷ</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
