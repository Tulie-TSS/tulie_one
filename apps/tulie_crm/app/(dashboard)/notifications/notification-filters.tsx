'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@repo/ui'

interface NotificationFiltersProps {
    categories: Record<string, { label: string; types: string[] }>
    categoryCounts: Record<string, number>
    activeCategory: string
}

export function NotificationFilters({ categories, categoryCounts, activeCategory }: NotificationFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleCategoryChange = (category: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (category === 'all') {
            params.delete('category')
        } else {
            params.set('category', category)
        }
        router.push(`/notifications?${params.toString()}`)
    }

    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(categories).map(([key, config]) => {
                const isActive = activeCategory === key
                const count = categoryCounts[key] || 0

                return (
                    <button
                        key={key}
                        onClick={() => handleCategoryChange(key)}
                        className={`
                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                            ${isActive
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                            }
                        `}
                    >
                        {config.label}
                        {count > 0 && (
                            <Badge
                                variant={isActive ? 'secondary' : 'outline'}
                                className={`h-4 min-w-4 px-1 text-[10px] leading-none rounded-full ${
                                    isActive ? 'bg-primary-foreground/20 text-primary-foreground border-0' : ''
                                }`}
                            >
                                {count}
                            </Badge>
                        )}
                    </button>
                )
            })}
        </div>
    )
}
