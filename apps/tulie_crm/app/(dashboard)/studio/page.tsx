import { Suspense } from 'react'
import { getRetailOrders } from '@/lib/supabase/services/retail-order-service'
import { RetailOrderList } from '@/components/studio/order-list'
import { Button } from '@repo/ui'
import Link from 'next/link'
import { Skeleton } from '@repo/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { formatCurrency } from '@/lib/utils/format'
import { Camera, Plus, Clock, CheckCircle, ShoppingCart } from 'lucide-react'

export default async function StudioPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center text-white shadow-sm shrink-0">
                        <Camera className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold">Đơn hàng Studio</h1>
                        <p className="text-sm font-medium text-muted-foreground mt-1">Quản lý đơn hàng chụp ảnh cá nhân & Studio.</p>
                    </div>
                </div>
                <Button asChild className="bg-gradient-to-tr from-rose-500 to-orange-500 text-white border-none hover:opacity-90 transition-all shadow-sm hover:shadow-md rounded-md">
                    <Link href="/studio/new">
                        <Plus className="h-4 w-4" /> Tạo đơn mới
                    </Link>
                </Button>
            </div>

            <Suspense fallback={<OrderListSkeleton />}>
                <OrderListWrapper />
            </Suspense>
        </div>
    )
}

async function OrderListWrapper() {
    const allOrders = await getRetailOrders()
    // Filter out draft orders from dashboard — they're only for customer auto-save
    const orders = allOrders.filter(o => o.order_status !== 'draft')
    const activeOrders = orders.filter((c) => c.order_status === 'editing' || c.order_status === 'edit_done' || c.order_status === 'waiting_ship' || c.order_status === 'shipping').length
    const completedOrders = orders.filter((c) => c.order_status === 'completed').length
    const totalValue = orders.reduce((sum, c) => sum + (c.total_amount || 0), 0)

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="rounded-md border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Đang thực hiện
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeOrders}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-md border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Đã hoàn thành
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedOrders}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-md border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Tổng giá trị
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
                    </CardContent>
                </Card>
            </div>

            <RetailOrderList initialData={orders} />
        </div>
    )
}

function OrderListSkeleton() {
    return (
        <div className="rounded-md border p-8 space-y-4">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="w-72" />
                <Skeleton className="w-48" />
            </div>
            {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
            ))}
        </div>
    )
}
