'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
    AlertCircle, 
    ArrowRight, 
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

    const getColor = (severity: string) => {
        if (severity === 'danger') return 'text-red-600 bg-red-100 dark:bg-red-500/10'
        return 'text-amber-600 bg-amber-100 dark:bg-amber-500/10'
    }

    return (
        <Card className="h-full border border-dashed flex flex-col">
            <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Cần Hành Động
                    </CardTitle>
                    {alerts.length > 0 && (
                        <Badge variant="destructive" className="h-5 px-1.5 min-w-[20px] rounded-full text-[10px] flex justify-center">
                            {alerts.length}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative min-h-[300px]">
                {alerts.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-muted-foreground opacity-70">
                        <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                            <span className="text-2xl">🎉</span>
                        </div>
                        <p className="text-sm font-medium">Bạn đã hoàn thành mọi mục tiêu!</p>
                        <p className="text-[13px] mt-1 text-zinc-500">Mọi cơ hội và hóa đơn đều đang đi đúng hướng.</p>
                    </div>
                ) : (
                    <ScrollArea className="h-full max-h-[400px]">
                        <div className="divide-y p-1">
                            {alerts.map((alert) => (
                                <Link 
                                    href={alert.link} 
                                    key={alert.id}
                                    className="flex items-start gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer"
                                    prefetch={false}
                                >
                                    <div className={`mt-0.5 shrink-0 flex items-center justify-center h-8 w-8 rounded-full ${getColor(alert.severity)}`}>
                                        {getIcon(alert.type)}
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                                {alert.title}
                                            </span>
                                        </div>
                                        <p className="text-[13px] mt-0.5 text-zinc-600 dark:text-zinc-400 line-clamp-1">
                                            {alert.description}
                                        </p>
                                        <span className="text-[11px] font-medium mt-1.5 text-red-500 dark:text-red-400">
                                            {formatDistanceToNow(new Date(alert.date), {
                                                addSuffix: true,
                                                locale: vi
                                            })}
                                        </span>
                                    </div>
                                    <div className="shrink-0 pt-2 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
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
