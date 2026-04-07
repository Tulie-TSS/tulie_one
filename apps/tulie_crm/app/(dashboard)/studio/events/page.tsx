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
            <div className="grid gap-4 md:grid-cols-3">
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.map(event => (
                    <Card key={event.id} className="rounded-md border-border relative flex flex-col">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg font-bold">{event.name}</CardTitle>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Tag className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-xs font-semibold text-muted-foreground">{event.code}</span>
                                    </div>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${event.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Tên miền hoạt động:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {event.subdomains && event.subdomains.length > 0 ? event.subdomains.map(domain => (
                                        <span key={domain} className="px-2 py-0.5 bg-muted rounded text-[11px] font-medium border border-border">
                                            {domain}
                                        </span>
                                    )) : (
                                        <span className="text-xs text-muted-foreground italic">Chưa có tên miền</span>
                                    )}
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">Dịch vụ: <strong className="text-foreground">{event.services?.length || 0}</strong> gói</span>
                                    <Link href={`/studio/events/${event.id}`} className="font-semibold text-zinc-900 hover:underline">
                                        Cấu hình &rarr;
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {events.length === 0 && (
                    <div className="col-span-full py-12 text-center border border-dashed rounded-lg">
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
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full" />
                ))}
            </div>
        </div>
    )
}
