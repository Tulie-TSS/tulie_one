'use client'

import React, { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, Pencil, Mail, Ban, Trash2, CheckCircle, Loader2 } from 'lucide-react'

type Role = 'admin' | 'manager' | 'maker' | 'observer'

interface MemberActionsMenuProps {
  member: {
    id: string
    full_name: string
    email: string
    role_type: Role
    is_active: boolean
  }
  currentUserId: string
  isAdmin: boolean
  canManage: boolean
  onEdit: () => void
  onRefresh: () => void
  onToast: (msg: string, type?: 'success' | 'error') => void
}

export function MemberActionsMenu({
  member,
  currentUserId,
  isAdmin,
  canManage,
  onEdit,
  onRefresh,
  onToast,
}: MemberActionsMenuProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
        setConfirmDelete(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isSelf = member.id === currentUserId
  const isTargetAdmin = member.role_type === 'admin'
  const canAct = canManage && !isSelf && !(isTargetAdmin && !isAdmin)

  if (!canAct) return null

  const handleResendInvite = async () => {
    setLoading('resend')
    setOpen(false)
    try {
      const res = await fetch(`/api/users/${member.id}/resend-invite`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onToast(`Đã gửi lại lời mời đến ${member.email}`)
    } catch (e: any) {
      onToast(e.message || 'Gửi thất bại', 'error')
    } finally {
      setLoading(null)
    }
  }

  const handleToggleBlock = async () => {
    setLoading('block')
    setOpen(false)
    try {
      const res = await fetch(`/api/users/${member.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !member.is_active }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onToast(member.is_active ? `Đã chặn ${member.full_name}` : `Đã mở chặn ${member.full_name}`)
      onRefresh()
    } catch (e: any) {
      onToast(e.message || 'Thao tác thất bại', 'error')
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setLoading('delete')
    setOpen(false)
    setConfirmDelete(false)
    try {
      const res = await fetch(`/api/users/${member.id}/delete`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onToast(`Đã xoá ${member.full_name}`)
      onRefresh()
    } catch (e: any) {
      onToast(e.message || 'Xoá thất bại', 'error')
    } finally {
      setLoading(null)
    }
  }

  if (loading) {
    return <Loader2 className="size-4 animate-spin text-muted-foreground mx-auto" />
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => { setOpen(o => !o); setConfirmDelete(false) }}
        className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Thao tác"
      >
        <MoreHorizontal className="size-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-52 rounded-lg border bg-popover shadow-lg py-1 text-sm">
          {/* Edit */}
          <button
            onClick={() => { setOpen(false); onEdit() }}
            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted transition-colors text-foreground"
          >
            <Pencil className="size-3.5 text-muted-foreground" />
            Chỉnh sửa vai trò & WIP
          </button>

          {/* Resend invite */}
          {isAdmin && (
            <button
              onClick={handleResendInvite}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted transition-colors text-foreground"
            >
              <Mail className="size-3.5 text-muted-foreground" />
              Gửi lại lời mời
            </button>
          )}

          <div className="my-1 border-t" />

          {/* Block / Unblock */}
          <button
            onClick={handleToggleBlock}
            className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted transition-colors ${member.is_active ? 'text-amber-600' : 'text-emerald-600'}`}
          >
            {member.is_active
              ? <Ban className="size-3.5" />
              : <CheckCircle className="size-3.5" />
            }
            {member.is_active ? 'Chặn đăng nhập' : 'Mở chặn'}
          </button>

          {/* Delete */}
          {isAdmin && (
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-destructive/10 transition-colors text-destructive"
            >
              <Trash2 className="size-3.5" />
              {confirmDelete ? '⚠️ Xác nhận xoá?' : 'Xoá thành viên'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
