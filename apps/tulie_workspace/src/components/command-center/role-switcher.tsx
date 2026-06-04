'use client'

import React from 'react'
import { Tabs, TabsList, TabsTrigger } from '@repo/ui'
import { useLifeRoleStore } from '@/lib/stores/life-role-store'
import { useLifeRoles } from '@/hooks/useLifeRoles'
import type { LifeRoleType } from '@/types/command-center.types'
import { RoleIcon } from '@/components/command-center/role-icon'

export function RoleSwitcher() {
  const { activeRole, setActiveRole } = useLifeRoleStore()
  const { roles } = useLifeRoles()

  const allItems = [
    { role: 'all' as const, display_name: 'Tổng quan', icon: 'Layers' },
    ...roles.map(r => ({ role: r.role, display_name: r.display_name, icon: r.icon })),
  ]

  // If roles haven't loaded yet, show defaults
  const displayItems = allItems.length > 1
    ? allItems
    : [
        { role: 'all' as const, display_name: 'Tổng quan', icon: 'Layers' },
        { role: 'fpt_is' as const, display_name: 'FPT IS', icon: 'Briefcase' },
        { role: 'tulie' as const, display_name: 'Tulie', icon: 'Rocket' },
        { role: 'personal' as const, display_name: 'Cá nhân', icon: 'Home' },
      ]

  return (
    <Tabs 
      value={activeRole} 
      onValueChange={(val) => setActiveRole(val as LifeRoleType | 'all')}
      className="w-auto"
    >
      <TabsList className="h-9">
        {displayItems.map((item) => (
          <TabsTrigger 
            key={item.role} 
            value={item.role}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium cursor-pointer"
          >
            <RoleIcon name={item.icon} className="size-3.5" />
            <span>{item.display_name}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
