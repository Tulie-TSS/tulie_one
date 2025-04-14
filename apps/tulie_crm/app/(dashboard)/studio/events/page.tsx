import { Suspense } from 'react'
import { getEventSales } from '@/lib/supabase/services/event-sale-service'
import { Button } from '@repo/ui'
import Link from 'next/link'
import { Skeleton } from '@repo/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { Calendar, Plus, Globe, CheckCircle, Tag } from 'lucide-react'

export default async function EventSalesPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center border border-border">
                        <Calendar className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Cấu hình Sự kiện (Landing Pages)</h1>
                        <p className="text-sm font-medium text-muted-foreground mt-1">Quản lý các sự kiện bán hàng và cấu hình subdomain.</p>
                    </div>
                </div>
                <Button asChild className="rounded-md">
                    <Link href="/studio/events/new">
                        <Plus className="h-4 w-4 mr-2" /> Tạo sự kiện
                    </Link>
                </Button>
            </div>

            <Suspense fallback={<EventListSkeleton />}>
                <EventListWrapper />
            </Suspense>
        </div>
    )
}

async function EventListWrapper() {
    const events = await getEventSales()
    const activeEvents = events.filter((e) => e.is_active).length
    const totalSubdomains = events.reduce((sum, e) => sum + (e.subdomains?.length || 0), 0)

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="rounded-md border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sự kiện hoạt động</CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeEvents} / {events.length}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-md border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng số Subdomains</CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSubdomains}</div>
                    </CardContent>
                </Card>
            </div>

            {/* List */}
            <div className="space-y-4">
                {events.map(event => (
                    <Card key={event.id} className="rounded-md border-border flex flex-col sm:flex-row sm:items-center p-5 gap-6">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold truncate">{event.name}</h3>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-muted rounded text-xs font-semibold text-muted-foreground border border-border">
                                    <Tag className="w-3 h-3" />
                                    {event.code}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                                <p className="text-xs font-medium text-muted-foreground whitespace-nowrap">Tên miền hoạt động:</p>
                                {event.subdomains && event.subdomains.length > 0 ? event.subdomains.map(domain => (
                                    <span key={domain} className="px-2 py-0.5 bg-background rounded text-[11px] font-medium border border-border shadow-sm">
                                        {domain}
                                    </span>
                                )) : (
                                    <span className="text-xs text-muted-foreground italic">Chưa có tên miền</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-8 shrink-0">
                            <div className="flex flex-col sm:items-end">
                                <span className="text-xs text-muted-foreground mb-1">Dịch vụ</span>
                                <strong className="text-sm font-semibold">{event.services?.length || 0} gói</strong>
                            </div>
                            
                            <div className="h-8 w-px bg-border hidden sm:block"></div>
                            
                            <div className="flex flex-col sm:items-end">
                                <span className="text-xs text-muted-foreground mb-1">Trạng thái</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${event.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    <span className="text-xs font-medium">{event.is_active ? 'Đang bật' : 'Đã tắt'}</span>
                                </div>
                            </div>

                            <Button variant="outline" asChild className="rounded-md ml-auto sm:ml-0 mt-4 sm:mt-0">
                                <Link href={`/studio/events/${event.id}`}>Cấu hình &rarr;</Link>
                            </Button>
                        </div>
                    </Card>
                ))}
                {events.length === 0 && (
                    <div className="py-12 text-center border border-dashed rounded-lg flex flex-col items-center justify-center space-y-3">
                        <Globe className="h-8 w-8 text-muted-foreground/50" />
                        <p className="text-muted-foreground text-sm font-medium">Chưa có sự kiện nào. Bấm tạo sự kiện để bắt đầu.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function EventListSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full" />
                ))}
            </div>
        </div>
    )
}
