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

export function RecentActivities({ data }: RecentActivitiesProps) {
    return (
        <Card className="h-full shadow-sm flex flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0 flex-1">
                <ScrollArea className="h-[500px]">
                    <div className="flex flex-col gap-4 px-6 pb-6">
                        {data.length > 0 ? (
                            data.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-start gap-4"
                                >
                                    <div className="mt-1 h-8 w-8 rounded-md bg-secondary flex items-center justify-center shrink-0 border border-border">
                                        {getActivityIcon(activity.action)}
                                    </div>
                                    <div className="flex-1 space-y-0.5 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-sm font-medium text-foreground">
                                                {activity.user?.full_name || 'Hệ thống'}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                {formatRelativeTime(activity.created_at)}
                                            </p>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-normal line-clamp-2">
                                            {activity.details?.title || (
                                                <><span className="capitalize">{activity.action}</span> {activity.entity_type?.replace(/_/g, ' ')}</>
                                            )} <span className="font-mono text-[10px] bg-muted px-1 rounded">#{activity.entity_id?.split('-')[0]}</span>
                                        </p>
                                        {activity.details?.description && (
                                            <p className="text-xs text-muted-foreground/80 line-clamp-1 mt-0.5">
                                                {activity.details.description}
                                            </p>
                                        )}
                                        <p className="text-[10px] text-muted-foreground/60 font-medium group-hover:hidden mt-1">
                                            {formatRelativeTime(activity.created_at)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                                <p className="text-sm font-medium">Chưa có hoạt động nào</p>
                                <p className="text-xs">Bắt đầu tương tác với khách hàng để thấy lịch sử</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

