'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@repo/ui'
import { useLocaleStore } from '@/lib/stores/locale-store'

export function DynamicBreadcrumbs() {
    const pathname = usePathname()
    const { t } = useLocaleStore()

    const segments = pathname.split('/').filter(Boolean)
    
    if (segments.length === 0) return null

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink asChild>
                        <Link href="/dashboard">{t('nav.overview' as any)}</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                
                {segments.map((segment, index) => {
                    const isLast = index === segments.length - 1
                    const href = `/${segments.slice(0, index + 1).join('/')}`
                    
                    // Skip 'dashboard' if it's the first segment as we already added it
                    if (segment === 'dashboard' && index === 0) return null

                    return (
                        <React.Fragment key={href}>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage className="capitalize">
                                        {/* Try to translate or just capitalize */}
                                        {t(`nav.${segment}` as any) || segment.charAt(0).toUpperCase() + segment.slice(1)}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild className="hidden md:block">
                                        <Link href={href} className="capitalize">
                                            {t(`nav.${segment}` as any) || segment.charAt(0).toUpperCase() + segment.slice(1)}
                                        </Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
