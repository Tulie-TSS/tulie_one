'use client'

import React from 'react'
import { useLifeRoleStore } from '@/lib/stores/life-role-store'
import { useLifeRoles } from '@/hooks/useLifeRoles'
import type { LifeRoleType } from '@/types/command-center.types'
import { cn } from '@/lib/utils'
import { RoleIcon } from '@/components/command-center/role-icon'

export function RoleSwitcher() {
  const { activeRole, setActiveRole } = useLifeRoleStore()
  const { roles } = useLifeRoles()

  const allItems = [
    { role: 'all' as const, display_name: 'Tổng quan', color: '#6B7280', icon: 'Layers' },
    ...roles.map(r => ({ role: r.role, display_name: r.display_name, color: r.color, icon: r.icon })),
  ]

  // If roles haven't loaded yet, show defaults
  const displayItems = allItems.length > 1
    ? allItems
    : [
        { role: 'all' as const, display_name: 'Tổng quan', color: '#6B7280', icon: 'Layers' },
        { role: 'fpt_is' as const, display_name: 'FPT IS', color: '#E53935', icon: 'Briefcase' },
        { role: 'tulie' as const, display_name: 'Tulie', color: '#1E88E5', icon: 'Rocket' },
        { role: 'personal' as const, display_name: 'Cá nhân', color: '#43A047', icon: 'Home' },
      ]

  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg" role="tablist" aria-label="Chọn vai trò">
      {displayItems.map((item) => {
        const isActive = activeRole === item.role
        return (
          <button
            key={item.role}
            role="tab"
            aria-selected={isActive}
            onClick={() => setActiveRole(item.role as LifeRoleType | 'all')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer',
              'hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              isActive
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground'
            )}
            style={isActive ? { borderBottom: `2px solid ${item.color}` } : undefined}
          >
            <div className={cn("shrink-0", isActive ? "text-primary" : "text-muted-foreground/75")}>
              <RoleIcon name={item.icon} className="size-3.5" />
            </div>
            <span className="hidden sm:inline">{item.display_name}</span>
          </button>
        )
      })}
    </div>
  )
}
