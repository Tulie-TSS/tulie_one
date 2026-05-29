'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui'
import { Badge } from '@repo/ui'
import { Eye, Clock, ArrowDown, Monitor, Smartphone, Tablet, Globe } from 'lucide-react'
import { getPortalViews } from '@/lib/supabase/services/quote-tracking-service'
import { LoadingSpinner } from '@repo/ui'

function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    if (min < 60) return sec > 0 ? `${min}m ${sec}s` : `${min}m`
    const hr = Math.floor(min / 60)
    const remainMin = min % 60
    return `${hr}h ${remainMin}m`
}

function formatTime(dateStr: string): string {
    const d = new Date(dateStr)
    return d.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

function getDeviceIcon(type: string) {
    switch (type) {
        case 'mobile': return <Smartphone className="h-3.5 w-3.5" />
        case 'tablet': return <Tablet className="h-3.5 w-3.5" />
        default: return <Monitor className="h-3.5 w-3.5" />
    }
}

interface PortalViewAnalyticsProps {
    portalToken: string
}

export function PortalViewAnalytics({ portalToken }: PortalViewAnalyticsProps) {
    const [views, setViews] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const viewsData = await getPortalViews({ portalToken })
                setViews(viewsData)
            } catch (error) {
                console.error('Error fetching portal view analytics:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [portalToken])

    if (loading) {
        return (
            <Card>
                <CardContent className="py-8 flex justify-center">
                    <LoadingSpinner size="sm" />
                </CardContent>
            </Card>
        )
    }

    // Aggregate stats
    const totalViews = views.length
    const uniqueIps = new Set(views.map(v => v.ip_address).filter(Boolean)).size
    const durations = views.map(v => v.duration_seconds || 0)
    const avgDuration = totalViews > 0 ? Math.round(durations.reduce((a: number, b: number) => a + b, 0) / totalViews) : 0
    const scrolls = views.map(v => v.max_scroll_percent || 0)
    const avgScroll = totalViews > 0 ? Math.round(scrolls.reduce((a: number, b: number) => a + b, 0) / totalViews) : 0

    const deviceBreakdown = { desktop: 0, mobile: 0, tablet: 0 }
    views.forEach(v => {
        const dt = (v.device_type || 'desktop') as keyof typeof deviceBreakdown
        if (dt in deviceBreakdown) deviceBreakdown[dt]++
    })

    if (totalViews === 0) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center gap-2 pb-3">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">Lịch sử xem</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Chưa có ai xem portal này.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <CardTitle className="text-base">Lịch sử xem</CardTitle>
                        <CardDescription className="text-xs">Theo dõi hành vi khách hàng khi xem portal</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-5">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 p-4 rounded-md border border-border text-center space-y-1">
                        <p className="text-3xl tabular-nums leading-none">{totalViews}</p>
                        <p className="text-[10px] font-medium text-muted-foreground border-t border-border pt-2 mt-2">Lượt xem</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-md border border-border text-center space-y-1">
                        <p className="text-3xl tabular-nums leading-none">{uniqueIps}</p>
                        <p className="text-[10px] font-medium text-muted-foreground border-t border-border pt-2 mt-2">Unique IP</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-md border border-border text-center space-y-1">
                        <p className="text-lg tabular-nums leading-none">{formatDuration(avgDuration)}</p>
                        <p className="text-[10px] font-medium text-muted-foreground border-t border-border pt-2 mt-2">TB thời gian</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-md border border-border text-center space-y-1">
                        <p className="text-lg tabular-nums leading-none">{avgScroll}%</p>
                        <p className="text-[10px] font-medium text-muted-foreground border-t border-border pt-2 mt-2">TB scroll</p>
                    </div>
                </div>

                {/* Device Breakdown */}
                {(deviceBreakdown.desktop > 0 || deviceBreakdown.mobile > 0 || deviceBreakdown.tablet > 0) && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {deviceBreakdown.desktop > 0 && (
                            <Badge variant="outline" className="gap-1.5 text-[10px] font-medium h-6 px-2">
                                <Monitor className="h-3 w-3" />
                                Desktop: {deviceBreakdown.desktop}
                            </Badge>
                        )}
                        {deviceBreakdown.mobile > 0 && (
                            <Badge variant="outline" className="gap-1.5 text-[10px] font-medium h-6 px-2">
                                <Smartphone className="h-3 w-3" />
                                Mobile: {deviceBreakdown.mobile}
                            </Badge>
                        )}
                        {deviceBreakdown.tablet > 0 && (
                            <Badge variant="outline" className="gap-1.5 text-[10px] font-medium h-6 px-2">
                                <Tablet className="h-3 w-3" />
                                Tablet: {deviceBreakdown.tablet}
                            </Badge>
                        )}
                    </div>
                )}

                {/* View Timeline */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Chi tiết lượt xem</p>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                        {views.map((view, idx) => (
                            <div
                                key={view.id}
                                className="bg-muted/50 border border-border rounded-md p-3 hover:bg-muted transition-colors"
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="shrink-0 w-6 h-6 rounded-lg bg-zinc-900 text-white text-[10px] flex items-center justify-center">
                                            {views.length - idx}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold truncate">{formatTime(view.started_at)}</p>
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                {getDeviceIcon(view.device_type)}
                                                <span className="capitalize">{view.device_type || 'desktop'}</span>
                                                {view.ip_address && view.ip_address !== 'unknown' && (
                                                    <>
                                                        <span className="opacity-30">·</span>
                                                        <span className="font-mono text-[9px]">{view.ip_address}</span>
                                                    </>
                                                )}
                                                {view.country && (
                                                    <>
                                                        <span className="opacity-30">·</span>
                                                        <Globe className="h-3 w-3 opacity-50" />
                                                        <span>{view.country}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics Row */}
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span className="font-semibold text-foreground">{formatDuration(view.duration_seconds || 0)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <ArrowDown className="h-3 w-3" />
                                        <span className="font-semibold text-foreground">{view.max_scroll_percent || 0}%</span>
                                        <span>scroll</span>
                                    </div>

                                    {/* Scroll progress bar */}
                                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-zinc-900 rounded-full transition-all"
                                            style={{ width: `${view.max_scroll_percent || 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
