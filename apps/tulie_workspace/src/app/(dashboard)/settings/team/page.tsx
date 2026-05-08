'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Button, Badge } from '@repo/ui'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@repo/ui'
import { EditMemberDialog } from '@/components/shared/edit-member-dialog'
import { InviteMemberDialog } from '@/components/shared/invite-member-dialog'
import { MemberActionsMenu } from '@/components/shared/member-actions-menu'
import { Loader2, UserPlus, Shield } from 'lucide-react'

type Role = 'admin' | 'manager' | 'maker' | 'observer'

interface Member {
  id: string
  full_name: string
  email: string
  role_type: Role
  personal_wip_limit: number
  is_active: boolean
}

export default function TeamSettingsPage() {
  const { t } = useLocaleStore()
  const { user: currentUser, isAdmin, canManage } = useCurrentUser()
  const [users, setUsers] = React.useState<Member[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editTarget, setEditTarget] = useState<Member | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchUsers = React.useCallback(async () => {
    setLoading(true)
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    const { data } = await supabase
      .from('user_profiles')
      .select('id, full_name, email, role_type, personal_wip_limit, is_active')
      .order('full_name')
    if (data) setUsers(data as Member[])
    setLoading(false)
  }, [])

  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSave = async (data: { role_type: Role; personal_wip_limit: number; is_active: boolean }) => {
    if (!editTarget) return
    const res = await fetch(`/api/users/${editTarget.id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Lưu thất bại')
    }
    // Update local state
    setUsers(prev => prev.map(u =>
      u.id === editTarget.id ? { ...u, ...data } : u
    ))
    showToast(`Đã cập nhật thành viên: ${editTarget.full_name}`)
  }

  const roleColors: Record<Role, 'destructive' | 'default' | 'secondary' | 'outline'> = {
    admin: 'destructive',
    manager: 'default',
    maker: 'secondary',
    observer: 'outline',
  }

  return (
    <div>
      <Link href="/settings" className="inline-flex items-center gap-1 no-underline mb-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
        {t('settings.backToSettings')}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t('settings.team')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Quản lý thành viên và phân quyền hệ thống</p>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="size-4" />
            {t('settings.inviteMember')}
          </Button>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 p-3 rounded-lg bg-muted/40 border">
        {[
          { role: 'admin', desc: 'Toàn quyền hệ thống' },
          { role: 'manager', desc: 'Triage & Chiến lược' },
          { role: 'maker', desc: 'Thực thi công việc' },
          { role: 'observer', desc: 'Read-only' },
        ].map(({ role, desc }) => (
          <div key={role} className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant={roleColors[role as Role]}>{t(`role.${role}` as any)}</Badge>
            <span>{desc}</span>
          </div>
        ))}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('team.member')}</TableHead>
              <TableHead>{t('team.email')}</TableHead>
              <TableHead>{t('team.role')}</TableHead>
              <TableHead>WIP Limit</TableHead>
              <TableHead>{t('team.status')}</TableHead>
              {canManage && <TableHead className="text-right">Thao tác</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <Loader2 className="size-5 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">
                  Chưa có thành viên nào.
                </TableCell>
              </TableRow>
            ) : (
              users.map(member => (
                <TableRow key={member.id} className={!member.is_active ? 'opacity-50' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground text-[11px] font-semibold shrink-0">
                        {member.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <span className="font-medium text-foreground text-sm">{member.full_name}</span>
                        {member.id === currentUser?.id && (
                          <span className="ml-1 text-[10px] text-primary">(bạn)</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{member.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {member.role_type === 'admin' && <Shield className="size-3 text-destructive" />}
                      <Badge variant={roleColors[member.role_type]}>
                        {t(`role.${member.role_type}` as any)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-foreground">{member.personal_wip_limit}</span>
                      <span className="text-xs text-muted-foreground">task</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full inline-block ${member.is_active ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
                      <span className={`text-xs ${member.is_active ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {member.is_active ? t('team.active') : t('team.inactive')}
                      </span>
                    </div>
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <MemberActionsMenu
                        member={member}
                        currentUserId={currentUser?.id ?? ''}
                        isAdmin={isAdmin}
                        canManage={canManage}
                        onEdit={() => setEditTarget(member)}
                        onRefresh={fetchUsers}
                        onToast={showToast}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EditMemberDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        member={editTarget}
        currentUserRole={currentUser?.role_type ?? 'observer'}
        onSave={handleSave}
      />

      <InviteMemberDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSuccess={() => {
          showToast('Đã gửi lời mời thành công.')
          fetchUsers()
        }}
      />

      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg text-sm font-medium shadow-lg z-[100] animate-in slide-in-from-bottom-2 ${
          toast.type === 'error' ? 'bg-destructive text-destructive-foreground' : 'bg-foreground text-background'
        }`}>
          {toast.type === 'error' ? '✗' : '✓'} {toast.msg}
        </div>
      )}
    </div>
  )
}
