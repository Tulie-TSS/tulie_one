'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { ScrollArea } from '@repo/ui'
import { formatRelativeTime } from '@/lib/utils/format'
import {
    UserPlus,
    FileText,
    FileCheck,
    CreditCard,
    Eye,
    CheckCircle,
    XCircle
} from 'lucide-react'

import { ActivityLog } from '@/types'

interface RecentActivitiesProps {
    data: ActivityLog[]
    hideCard?: boolean
}

const getActivityIcon = (type: ActivityLog['action']) => {
    switch (type) {
        case 'create':
            return <UserPlus className="h-4 w-4 text-muted-foreground" />
        case 'update':
            return <FileCheck className="h-4 w-4 text-muted-foreground" />
        case 'delete':
            return <XCircle className="h-4 w-4 text-muted-foreground" />
        case 'status_change':
            return <CheckCircle className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
        default:
            return <FileText className="h-4 w-4 text-muted-foreground" />
    }
}

export function RecentActivities({ data, hideCard = false }: RecentActivitiesProps) {
    const scrollContent = (
        <ScrollArea className="h-[320px]">
            <div className="flex flex-col gap-3 px-4 pb-4 pt-3">
                {data.length > 0 ? (
                    data.map((activity) => (
                        <div
                            key={activity.id}
                            className="flex items-start gap-3 border-b border-border/40 pb-2 last:border-0 last:pb-0"
                        >
                            <div className="mt-0.5 h-7 w-7 rounded-md bg-secondary flex items-center justify-center shrink-0 border border-border">
                                {getActivityIcon(activity.action)}
                            </div>
                            <div className="flex-1 min-w-0 space-y-0.5">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-semibold text-foreground">
                                        {activity.user?.full_name || 'Hệ thống'}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {formatRelativeTime(activity.created_at)}
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground font-normal line-clamp-1 leading-snug">
                                    {activity.details?.title || (
                                        <><span className="capitalize">{activity.action}</span> {activity.entity_type?.replace(/_/g, ' ')}</>
                                    )} <span className="font-mono text-[9px] bg-muted px-1 py-0.25 rounded">#{activity.entity_id?.split('-')[0]}</span>
                                </p>
                                {activity.details?.description && (
                                    <p className="text-[11px] text-muted-foreground/80 line-clamp-1">
                                        {activity.details.description}
                                    </p>
                                )}
                                <p className="text-[10px] text-muted-foreground/60 font-medium group-hover:hidden">
                                    {formatRelativeTime(activity.created_at)}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                        <p className="text-xs font-medium">Chưa có hoạt động nào</p>
                        <p className="text-[11px]">Bắt đầu tương tác với khách hàng để thấy lịch sử</p>
                    </div>
                )}
            </div>
        </ScrollArea>
    )

    if (hideCard) {
        return scrollContent
    }

    return (
        <Card className="h-full shadow-sm flex flex-col">
            <CardHeader className="pb-2.5 pt-3 px-4">
                <CardTitle className="text-sm font-semibold">Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0 flex-1">
                {scrollContent}
            </CardContent>
        </Card>
    )
}

