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

                    // Detect if the segment is a UUID
                    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(segment);
                    
                    let displayText = '';
                    if (isUuid) {
                        const parentSegment = index > 0 ? segments[index - 1] : '';
                        const detailTranslationKey = `nav.details.${parentSegment}`;
                        const translation = t(detailTranslationKey);
                        
                        displayText = translation !== detailTranslationKey
                            ? translation
                            : t('nav.details.default');
                    } else {
                        // Convert kebab-case (e.g. command-center) to camelCase (e.g. commandCenter)
                        const camelCased = segment.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                        const translationKey = `nav.${camelCased}`;
                        const translation = t(translationKey);
                        
                        // If translation is not found, display a capitalized formatted segment
                        displayText = translation !== translationKey
                            ? translation
                            : segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                    }

                    return (
                        <React.Fragment key={href}>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>
                                        {displayText}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild className="hidden md:block">
                                        <Link href={href}>
                                            {displayText}
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
