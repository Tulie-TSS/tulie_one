'use client'

import React from 'react'
import * as LucideIcons from 'lucide-react'

interface RoleIconProps {
  name: string
  className?: string
}

// Fallback map for legacy emojis to modern Lucide icons
const emojiMap: Record<string, keyof typeof LucideIcons> = {
  '🏢': 'Briefcase',
  '🚀': 'Rocket',
  '🏠': 'Home',
  '🇬🇧': 'Languages',
  '🏋️': 'Dumbbell',
  '👶': 'Baby',
  '😴': 'Moon',
  '📝': 'FileText',
  '📌': 'Pin',
  '🎓': 'GraduationCap',
  '🏫': 'School',
}

export function RoleIcon({ name, className = 'size-4' }: RoleIconProps) {
  if (!name) {
    return <LucideIcons.Layers className={className} />
  }

  // 1. Try to check legacy emoji map
  const mappedIconName = emojiMap[name]
  if (mappedIconName) {
    const IconComponent = LucideIcons[mappedIconName] as React.ComponentType<{ className?: string }>
    return <IconComponent className={className} />
  }

  // 2. Try to search Lucide icon by exact match or normalized casing
  let IconComponent = (LucideIcons as any)[name]
  if (!IconComponent) {
    // Try PascalCase formatting (e.g. briefcase -> Briefcase)
    const pascalName = name
      .split(/[-_]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')
    IconComponent = (LucideIcons as any)[pascalName]
  }

  if (IconComponent) {
    return <IconComponent className={className} />
  }

  // 3. Fallback: If it's a single emoji/character, render it as text, otherwise render a default layers icon
  const isSingleChar = name.length <= 2
  if (isSingleChar) {
    return <span className={className}>{name}</span>
  }

  return <LucideIcons.Layers className={className} />
}
