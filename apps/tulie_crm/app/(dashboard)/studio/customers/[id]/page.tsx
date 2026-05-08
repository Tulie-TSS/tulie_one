import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@repo/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { Badge } from '@repo/ui'
import { Avatar, AvatarFallback } from '@repo/ui'
import { Separator } from '@repo/ui'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils/format'
import { StatusBadge } from '@/components/shared/status-badge'
import {
    ArrowLeft,
    Edit,
    Mail,
    Phone,
    MapPin,
    Package,
    Calendar,
    ShoppingBag,
    History,
    Plus
} from 'lucide-react'
import { getCustomerById } from '@/lib/supabase/services/customer-service'
import { getRetailOrdersByCustomerPhone } from '@/lib/supabase/services/retail-order-service'
import { notFound } from 'next/navigation'

interface StudioCustomerPageProps {
    params: { id: string }
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
    const { id } = await params
    const customer = await getCustomerById(id)
    return {
        title: customer ? `${customer.company_name} - Studio CRM` : 'Khách hàng Studio - Tulie CRM',
    }
}

export default async function StudioCustomerDetailPage({ params }: any) {
    const { id } = await params
    const customer = await getCustomerById(id)

    if (!customer) {
        notFound()
    }

    if (customer.customer_type === 'business') {
        const { redirect } = await import('next/navigation')
        redirect(`/customers/${id}`)
    }

    // For Studio/B2C, we fetch order history by phone (since customers are synced by phone)
    const orders = customer.phone ? await getRetailOrdersByCustomerPhone(customer.phone) : []
    const totalSpent = orders.reduce((sum, order) => sum + (order.paid_amount || 0), 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80 shrink-0 mt-1">
                        <Link href="/studio/customers">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold tracking-tight">{customer.company_name}</h1>
                            <StatusBadge status={customer.status} entityType="customer" />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mt-1.5">
                            <Badge variant="outline" className="text-xs bg-primary/5">
                                Khách hàng Studio (B2C)
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                Đã tham gia: {formatDate(customer.created_at)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-11 sm:ml-0">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/studio/orders/new?customer_phone=${customer.phone}`}>
                            <Plus className="mr-1.5 h-4 w-4" />
                            Tạo đơn mới
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/studio/customers/${customer.id}/edit`}>
                            <Edit className="mr-1.5 h-4 w-4" />
                            Chỉnh sửa
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
                {/* Contact Info */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Package className="h-5 w-5 text-muted-foreground" />
                            Thông tin cá nhân
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 sm:grid-cols-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Số điện thoại</p>
                                <a href={`tel:${customer.phone}`} className="font-medium hover:underline text-lg">
                                    {customer.phone || 'Chưa cập nhật'}
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Email</p>
                                <a href={`mailto:${customer.email}`} className="font-medium hover:underline">
                                    {customer.email || 'Chưa cập nhật'}
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 sm:col-span-2">
                            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Địa chỉ giao hàng</p>
                                <p className="font-medium">{customer.address || 'Chưa cập nhật'}</p>
                            </div>
                        </div>
                        <Separator className="sm:col-span-2" />
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Liên hệ lần cuối</p>
                                <p className="font-medium">{customer.last_contact_at ? formatRelativeTime(customer.last_contact_at) : 'Chưa có'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Tổng đơn hàng</p>
                                <p className="font-medium">{orders.length} đơn</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Lifetime Value */}
                <Card className="bg-zinc-900 text-white border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-zinc-400 text-sm font-medium uppercase tracking-widest">Giá trị vòng đời (LTV)</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-6">
                        <p className="text-4xl font-bold tracking-tighter">
                            {formatCurrency(totalSpent)}
                        </p>
                        <p className="text-zinc-500 text-xs mt-2 font-medium">Tổng chi tiêu đã ghi nhận</p>
                        
                        <div className="w-full mt-8 space-y-3">
                            <div className="flex justify-between text-xs border-b border-zinc-800 pb-2">
                                <span className="text-zinc-500">Hạng khách hàng</span>
                                <span className="font-bold text-amber-400 uppercase">{totalSpent > 10000000 ? 'VIP' : 'Thành viên'}</span>
                            </div>
                            <div className="flex justify-between text-xs border-b border-zinc-800 pb-2">
                                <span className="text-zinc-500">Phụ trách</span>
                                <span className="font-medium">{customer.assigned_user?.full_name || 'Hệ thống'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Order History Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <History className="h-5 w-5 text-muted-foreground" />
                        Lịch sử mua hàng
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b bg-muted/30">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Mã đơn</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Ngày đặt</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Trạng thái</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Thanh toán</th>
                                    <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Tổng tiền</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {orders.map((order) => (
                                    <tr key={order.id} className="border-b transition-colors hover:bg-muted/50 cursor-pointer" onClick={() => window.location.href = `/studio/orders/${order.id}`}>
                                        <td className="p-4 align-middle font-medium">{order.order_number}</td>
                                        <td className="p-4 align-middle text-muted-foreground">{formatDate(order.created_at)}</td>
                                        <td className="p-4 align-middle">
                                            <StatusBadge status={order.order_status} entityType="retail_order" />
                                        </td>
                                        <td className="p-4 align-middle">
                                            <StatusBadge status={order.payment_status} entityType="retail_payment" />
                                        </td>
                                        <td className="p-4 align-middle text-right font-semibold">
                                            {formatCurrency(order.total_amount)}
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                            Chưa có lịch sử đơn hàng cho khách hàng này.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
