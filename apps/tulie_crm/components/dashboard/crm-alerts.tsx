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
import { cn } from '@/lib/utils'
import { CRMAlert } from '@/lib/supabase/services/dashboard-service'

interface CRMAlertsProps {
    alerts: CRMAlert[]
    hideCard?: boolean
}

export function CRMAlerts({ alerts, hideCard = false }: CRMAlertsProps) {
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
        if (severity === 'danger') return 'text-foreground border-foreground'
        return 'text-muted-foreground border-border'
    }

    const scrollContent = alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground opacity-70 min-h-[200px]">
            <div className="h-10 w-10 rounded-full border flex items-center justify-center mb-2">
                <span className="text-lg">🎉</span>
            </div>
            <p className="text-xs font-semibold">Bạn đã hoàn thành mọi mục tiêu!</p>
            <p className="text-[11px] mt-0.5 text-muted-foreground">Mọi cơ hội và hóa đơn đều đang đi đúng hướng.</p>
        </div>
    ) : (
        <ScrollArea className="h-[320px]">
            <div className="flex flex-col gap-3 px-4 pb-4 pt-3">
                {alerts.map((alert) => (
                    <Link 
                        href={alert.link} 
                        key={alert.id}
                        className="flex items-start gap-3 border-b border-border/40 pb-2 last:border-0 last:pb-0 transition-colors group cursor-pointer"
                        prefetch={false}
                    >
                        <div className={`mt-0.5 shrink-0 flex items-center justify-center h-7 w-7 rounded-full border ${getColorClass(alert.severity)}`}>
                            {getIcon(alert.type)}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-semibold text-xs text-foreground truncate group-hover:underline">
                                {alert.title}
                            </span>
                            <p className="text-[11px] mt-0.5 text-muted-foreground line-clamp-1">
                                {alert.description}
                            </p>
                            <span className={cn(
                                "text-[9px] font-semibold mt-0.5 inline-block",
                                alert.severity === 'danger' ? 'text-destructive font-semibold' : 'text-muted-foreground'
                            )}>
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
    )

    if (hideCard) {
        return scrollContent
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2.5 pt-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-foreground" />
                    Cần hành động
                </CardTitle>
                {alerts.length > 0 && (
                    <Badge variant="default" className="h-4.5 px-1.5 min-w-[18px] rounded-full text-[9px] flex justify-center bg-primary text-primary-foreground">
                        {alerts.length}
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="px-0 pb-0 flex-1">
                {scrollContent}
            </CardContent>
        </Card>
    )
}
