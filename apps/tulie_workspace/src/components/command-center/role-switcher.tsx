'use client'

import React from 'react'
import { useLifeRoleStore } from '@/lib/stores/life-role-store'
import { useLifeRoles } from '@/hooks/useLifeRoles'
import type { LifeRoleType } from '@/types/command-center.types'
import { cn } from '@/lib/utils'

const ROLE_ALL = { role: 'all' as const, display_name: 'Tổng quan', icon: '📊', color: '#6B7280' }

export function RoleSwitcher() {
  const { activeRole, setActiveRole } = useLifeRoleStore()
  const { roles } = useLifeRoles()

  const allItems = [
    ROLE_ALL,
    ...roles.map(r => ({ role: r.role, display_name: r.display_name, icon: r.icon, color: r.color })),
  ]

  // If roles haven't loaded yet, show defaults
  const displayItems = allItems.length > 1
    ? allItems
    : [
        ROLE_ALL,
        { role: 'fpt_is' as const, display_name: 'FPT IS', icon: '🏢', color: '#E53935' },
        { role: 'tulie' as const, display_name: 'Tulie', icon: '🚀', color: '#1E88E5' },
        { role: 'personal' as const, display_name: 'Cá nhân', icon: '🏠', color: '#43A047' },
      ]

  return (
    <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-xl" role="tablist" aria-label="Chọn vai trò">
      {displayItems.map((item) => {
        const isActive = activeRole === item.role
        return (
          <button
            key={item.role}
            role="tab"
            aria-selected={isActive}
            onClick={() => setActiveRole(item.role as LifeRoleType | 'all')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
              'hover:bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground'
            )}
            style={isActive ? { borderBottom: `2px solid ${item.color}` } : undefined}
          >
            <span className="text-base" aria-hidden="true">{item.icon}</span>
            <span className="hidden sm:inline">{item.display_name}</span>
          </button>
        )
      })}
    </div>
  )
}
