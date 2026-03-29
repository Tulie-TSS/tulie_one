'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { Badge } from '@repo/ui'
import { ScrollArea } from '@repo/ui'
import { 
    AlertCircle, 
    FileText, 
    Receipt, 
    UserPlus, 
    AlertTriangle,
    Target
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
import { CRMAlert } from '@/lib/supabase/services/dashboard-service'

interface CRMAlertsProps {
    alerts: CRMAlert[]
}

export function CRMAlerts({ alerts }: CRMAlertsProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'idle_lead': return <UserPlus className="h-4 w-4" />
            case 'idle_deal': return <Target className="h-4 w-4" />
            case 'pending_quotation': return <FileText className="h-4 w-4" />
            case 'overdue_invoice': return <Receipt className="h-4 w-4" />
            default: return <AlertCircle className="h-4 w-4" />
        }
    }

    const getColorClass = (severity: string) => {
        if (severity === 'danger') return 'text-destructive'
        return 'text-amber-500'
    }

    return (
        <Card className="h-full shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Cần Hành Động
                </CardTitle>
                {alerts.length > 0 && (
                    <Badge variant="destructive" className="h-5 px-1.5 min-w-[20px] rounded-full text-[10px] flex justify-center">
                        {alerts.length}
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="px-0">
                {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground opacity-70 min-h-[300px]">
                        <div className="h-12 w-12 rounded-full border flex items-center justify-center mb-3">
                            <span className="text-2xl">🎉</span>
                        </div>
                        <p className="text-sm font-medium">Bạn đã hoàn thành mọi mục tiêu!</p>
                        <p className="text-[13px] mt-1 text-muted-foreground">Mọi cơ hội và hóa đơn đều đang đi đúng hướng.</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[300px]">
                        <div className="space-y-4 px-6 pb-4">
                            {alerts.map((alert) => (
                                <Link 
                                    href={alert.link} 
                                    key={alert.id}
                                    className="flex items-start gap-4 transition-colors group cursor-pointer"
                                    prefetch={false}
                                >
                                    <div className={`mt-0.5 shrink-0 flex items-center justify-center h-8 w-8 rounded-full border ${getColorClass(alert.severity)}`}>
                                        {getIcon(alert.type)}
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="font-medium text-sm text-foreground truncate">
                                            {alert.title}
                                        </span>
                                        <p className="text-xs mt-1 text-muted-foreground line-clamp-1">
                                            {alert.description}
                                        </p>
                                        <span className={`text-[11px] font-medium mt-1 inline-block ${getColorClass(alert.severity)}`}>
                                            {formatDistanceToNow(new Date(alert.date), {
                                                addSuffix: true,
                                                locale: vi
                                            })}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    )
}
