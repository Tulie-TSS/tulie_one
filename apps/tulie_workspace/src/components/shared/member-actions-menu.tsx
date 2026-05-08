'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal, Pencil, Mail, Ban, Trash2, CheckCircle, Loader2, Shield } from 'lucide-react'

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

interface MenuPos { top: number; left: number }

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
  const [pos, setPos] = useState<MenuPos | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showLink, setShowLink] = useState<{ url: string; title: string } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  const isSelf = member.id === currentUserId
  const isTargetAdmin = member.role_type === 'admin'
  const canAct = canManage && !isSelf && !(isTargetAdmin && !isAdmin)

  const MENU_HEIGHT = isAdmin ? 260 : 144 // Increased height for new item
  const MENU_WIDTH = 260

  const calcPos = useCallback(() => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const top = spaceBelow < MENU_HEIGHT + 8
      ? rect.top - MENU_HEIGHT - 4
      : rect.bottom + 4
    const left = Math.max(8, rect.right - MENU_WIDTH)
    setPos({ top, left })
  }, [MENU_HEIGHT, MENU_WIDTH])

  const handleOpen = () => {
    calcPos()
    setOpen(o => !o)
    setConfirmDelete(false)
    setShowLink(null)
  }

  useEffect(() => {
    if (!open && !showLink) return
    const handleClose = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key !== 'Escape') return
      if (e instanceof MouseEvent && btnRef.current?.contains(e.target as Node)) return
      setOpen(false)
      setConfirmDelete(false)
    }
    const handleScroll = () => calcPos()
    document.addEventListener('mousedown', handleClose)
    document.addEventListener('keydown', handleClose)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleClose)
      document.removeEventListener('keydown', handleClose)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [open, showLink, calcPos])

  if (!canAct) return null

  const handleResendInvite = async () => {
    setLoading('resend'); setOpen(false)
    try {
      const res = await fetch(`/api/users/${member.id}/resend-invite`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      if (data.inviteLink) {
        setShowLink({ url: data.inviteLink, title: 'Link mời thành viên' })
        onToast(`Đã tạo link mời mới cho ${member.email}`)
      } else {
        onToast(`Đã gửi lại lời mời đến ${member.email}`)
      }
    } catch (e: any) {
      onToast(e.message || 'Gửi thất bại', 'error')
    } finally { setLoading(null) }
  }

  const handleResetPassword = async () => {
    setLoading('reset-pwd'); setOpen(false)
    try {
      const res = await fetch(`/api/users/${member.id}/reset-password`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      if (data.recoveryLink) {
        setShowLink({ url: data.recoveryLink, title: 'Link Reset mật khẩu' })
        onToast(`Đã tạo link reset mật khẩu cho ${member.email}`)
      } else {
        onToast(`Đã gửi email reset mật khẩu đến ${member.email}`)
      }
    } catch (e: any) {
      onToast(e.message || 'Thao tác thất bại', 'error')
    } finally { setLoading(null) }
  }

  const handleToggleBlock = async () => {
    setLoading('block'); setOpen(false)
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
    } finally { setLoading(null) }
  }

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setLoading('delete'); setOpen(false); setConfirmDelete(false)
    try {
      const res = await fetch(`/api/users/${member.id}/delete`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onToast(`Đã xoá ${member.full_name}`)
      onRefresh()
    } catch (e: any) {
      onToast(e.message || 'Xoá thất bại', 'error')
    } finally { setLoading(null) }
  }

  const dropdown = open && pos ? (
    <div
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999, width: MENU_WIDTH }}
      className="rounded-lg border bg-popover shadow-xl py-1 text-sm"
      onMouseDown={e => e.stopPropagation()}
    >
      <button
        onClick={() => { setOpen(false); onEdit() }}
        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted transition-colors text-foreground text-left"
      >
        <Pencil className="size-3.5 text-muted-foreground shrink-0" />
        Chỉnh sửa vai trò & WIP
      </button>

      {isAdmin && (
        <>
          <button
            onClick={handleResendInvite}
            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted transition-colors text-foreground text-left"
          >
            <Mail className="size-3.5 text-muted-foreground shrink-0" />
            Gửi lại lời mời (Lấy link)
          </button>
          <button
            onClick={handleResetPassword}
            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted transition-colors text-foreground text-left"
          >
            <Shield className="size-3.5 text-muted-foreground shrink-0" />
            Reset mật khẩu (Lấy link)
          </button>
        </>
      )}

      <div className="my-1 border-t" />

      <button
        onClick={handleToggleBlock}
        className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted transition-colors text-left ${member.is_active ? 'text-amber-600' : 'text-emerald-600'}`}
      >
        {member.is_active
          ? <Ban className="size-3.5 shrink-0" />
          : <CheckCircle className="size-3.5 shrink-0" />
        }
        {member.is_active ? 'Chặn đăng nhập' : 'Mở chặn'}
      </button>

      {isAdmin && (
        <button
          onClick={handleDelete}
          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-destructive/10 transition-colors text-destructive text-left"
        >
          <Trash2 className="size-3.5 shrink-0" />
          {confirmDelete ? '⚠️ Xác nhận xoá?' : 'Xoá thành viên'}
        </button>
      )}
    </div>
  ) : null

  const linkOverlay = showLink ? (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-popover border rounded-xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-semibold mb-2">{showLink.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">Bạn có thể gửi link này cho <b>{member.full_name}</b>:</p>
        
        <div className="flex gap-2 mb-4">
          <input 
            readOnly 
            value={showLink.url}
            className="flex-1 p-2 text-xs rounded-md border bg-muted font-mono truncate"
          />
          <button 
            onClick={() => {
              navigator.clipboard.writeText(showLink.url)
              onToast(showLink.title === 'Link Reset mật khẩu' ? 'Đã sao chép link reset!' : 'Đã sao chép link mời!')
            }}
            className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-md"
          >
            Copy
          </button>
        </div>
        
        <button 
          onClick={() => setShowLink(null)}
          className="w-full py-2 bg-muted hover:bg-muted/80 text-sm font-medium rounded-lg transition-colors"
        >
          Đóng
        </button>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Thao tác"
      >
        {loading
          ? <Loader2 className="size-4 animate-spin" />
          : <MoreHorizontal className="size-4" />
        }
      </button>

      {typeof document !== 'undefined' && dropdown
        ? createPortal(dropdown, document.body)
        : null
      }

      {typeof document !== 'undefined' && linkOverlay
        ? createPortal(linkOverlay, document.body)
        : null
      }
    </>
  )
}
