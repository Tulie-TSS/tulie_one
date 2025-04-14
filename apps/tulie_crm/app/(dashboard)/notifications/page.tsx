import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { Badge } from '@repo/ui'
import {
    Bell, AlertTriangle, CheckCircle, Clock, UserMinus, TrendingDown, ChevronRight,
    UserPlus, FileText, CheckCircle2, CreditCard, Trophy, XCircle, ClipboardList,
    Eye, LayoutGrid, BellRing, ShoppingCart, Milestone, RefreshCw, Receipt, Banknote
} from 'lucide-react'
import Link from 'next/link'
import { getSystemAlerts } from '@/lib/supabase/services/alerts-service'
import { AlertItem, NotificationType } from '@/types'
import { createClient } from '@/lib/supabase/server'
import { getMergedNotifications } from '@/lib/supabase/services/notification-service'
import { MarkAllReadButton } from './mark-all-read-button'
import { NotificationFilters } from './notification-filters'

const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
        case 'inactive_customer':
            return <UserMinus className="h-5 w-5" />
        case 'overdue_invoice':
            return <Clock className="h-5 w-5" />
        case 'contract_expiry':
            return <AlertTriangle className="h-5 w-5" />
        case 'low_margin':
            return <TrendingDown className="h-5 w-5" />
    }
}

const getSeverityColors = (severity: AlertItem['severity']) => {
    switch (severity) {
        case 'danger':
            return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700'
        case 'warning':
            return 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
        case 'info':
            return 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
    }
}

const getSeverityBadge = (severity: AlertItem['severity']) => {
    switch (severity) {
        case 'danger':
            return <Badge variant="outline" className="border-zinc-400 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 font-semibold">Khẩn cấp</Badge>
        case 'warning':
            return <Badge variant="outline" className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">Cảnh báo</Badge>
        case 'info':
            return <Badge variant="secondary">Thông tin</Badge>
    }
}

const getNotificationIcon = (type: NotificationType | string) => {
    switch (type) {
        case 'new_customer': return <UserPlus className="h-5 w-5" />
        case 'quotation_created': return <FileText className="h-5 w-5" />
        case 'quotation_accepted': return <CheckCircle2 className="h-5 w-5" />
        case 'quotation_viewed': return <Eye className="h-5 w-5" />
        case 'quotation_rejected': return <XCircle className="h-5 w-5" />
        case 'quotation_sent': return <FileText className="h-5 w-5" />
        case 'contract_created': return <FileText className="h-5 w-5" />
        case 'contract_signed': return <FileText className="h-5 w-5" />
        case 'contract_status_changed': return <RefreshCw className="h-5 w-5" />
        case 'invoice_created': return <Receipt className="h-5 w-5" />
        case 'invoice_overdue': return <AlertTriangle className="h-5 w-5" />
        case 'invoice_payment': return <Banknote className="h-5 w-5" />
        case 'payment_received': return <CreditCard className="h-5 w-5" />
        case 'retail_order_created': return <ShoppingCart className="h-5 w-5" />
        case 'retail_payment': return <CreditCard className="h-5 w-5" />
        case 'milestone_payment': return <Milestone className="h-5 w-5" />
        case 'deal_won': return <Trophy className="h-5 w-5" />
        case 'deal_lost': return <XCircle className="h-5 w-5" />
        case 'task_assigned': return <ClipboardList className="h-5 w-5" />
        case 'task_overdue': return <BellRing className="h-5 w-5" />
        case 'task_completed': return <CheckCircle className="h-5 w-5" />
        case 'workspace': return <LayoutGrid className="h-5 w-5" />
        default: return <Bell className="h-5 w-5" />
    }
}

const getNotifSeverityColor = (severity?: string, read?: boolean) => {
    if (read) return 'bg-muted dark:bg-zinc-900/50 text-muted-foreground border-border dark:border-zinc-800'
    return 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700'
}

// Notification category mapping
const NOTIFICATION_CATEGORIES: Record<string, { label: string; types: string[] }> = {
    all: { label: 'Tất cả', types: [] },
    sales: {
        label: 'Bán hàng',
        types: ['new_customer', 'quotation_created', 'quotation_sent', 'quotation_accepted', 'quotation_viewed', 'quotation_rejected', 'deal_won', 'deal_lost']
    },
    contracts: {
        label: 'Hợp đồng',
        types: ['contract_created', 'contract_signed', 'contract_status_changed', 'milestone_payment']
    },
    finance: {
        label: 'Tài chính',
        types: ['invoice_created', 'invoice_overdue', 'invoice_payment', 'payment_received', 'retail_payment', 'retail_order_created', 'low_margin', 'cash_flow_alert']
    },
    tasks: {
        label: 'Công việc',
        types: ['task_assigned', 'task_overdue', 'task_completed', 'workspace']
    },
    system: {
        label: 'Hệ thống',
        types: ['system']
    },
}

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays < 7) return `${diffDays} ngày trước`
    return date.toLocaleDateString('vi-VN')
}

const formatDateGroup = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 86400000)
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    if (dateOnly.getTime() === today.getTime()) return 'Hôm nay'
    if (dateOnly.getTime() === yesterday.getTime()) return 'Hôm qua'
    if (now.getTime() - dateOnly.getTime() < 7 * 86400000) {
        const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
        return days[date.getDay()]
    }
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function NotificationsPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string }>
}) {
    const params = await searchParams
    const activeCategory = params.category || 'all'

    const [alerts, supabase] = await Promise.all([
        getSystemAlerts(),
        createClient(),
    ])

    const { data: { user } } = await supabase.auth.getUser()
    const allNotifications = user ? await getMergedNotifications(user.id, 100) : []

    // Filter notifications by category
    const categoryConfig = NOTIFICATION_CATEGORIES[activeCategory]
    const notifications = activeCategory === 'all'
        ? allNotifications
        : allNotifications.filter(n => categoryConfig?.types.includes(n.type))

    const unreadNotifs = notifications.filter(n => !n.read)
    const totalUnread = allNotifications.filter(n => !n.read).length

    // Group notifications by date
    const groupedNotifications = notifications.reduce((groups, notification) => {
        const group = formatDateGroup(notification.created_at)
        if (!groups[group]) groups[group] = []
        groups[group].push(notification)
        return groups
    }, {} as Record<string, typeof notifications>)

    // Category counts for badges
    const categoryCounts = Object.entries(NOTIFICATION_CATEGORIES).reduce((acc, [key, config]) => {
        if (key === 'all') {
            acc[key] = allNotifications.filter(n => !n.read).length
        } else {
            acc[key] = allNotifications.filter(n => !n.read && config.types.includes(n.type)).length
        }
        return acc
    }, {} as Record<string, number>)

    return (
        <div className="space-y-6 p-4 md:p-8 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <Bell className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Thông báo</h1>
                        <p className="text-muted-foreground">Theo dõi hoạt động hệ thống và các sự kiện quan trọng</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {(alerts.length > 0 || totalUnread > 0) && (
                        <Badge variant="outline" className="font-medium">
                            {totalUnread + alerts.length} cần xử lý
                        </Badge>
                    )}
                    {user && totalUnread > 0 && (
                        <MarkAllReadButton userId={user.id} />
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Khẩn cấp</p>
                                <p className="text-2xl font-semibold">{alerts.filter(a => a.severity === 'danger').length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Cảnh báo</p>
                                <p className="text-2xl font-semibold">{alerts.filter(a => a.severity === 'warning').length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                                <Bell className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Chưa đọc</p>
                                <p className="text-2xl font-semibold">{totalUnread}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Tổng cộng</p>
                                <p className="text-2xl font-semibold">{allNotifications.length + alerts.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* System Alerts */}
            {alerts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-zinc-500" />
                            Cảnh báo hệ thống
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {alerts.map((alert) => (
                                <Link
                                    key={alert.id}
                                    href={alert.link}
                                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-sm ${getSeverityColors(alert.severity)}`}
                                >
                                    <div className="shrink-0">
                                        {getAlertIcon(alert.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold">{alert.title}</p>
                                            {getSeverityBadge(alert.severity)}
                                        </div>
                                        <p className="text-sm opacity-80">{alert.message}</p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 shrink-0 opacity-50" />
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Activity Notifications with Category Tabs */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-zinc-500" />
                            Hoạt động gần đây
                        </CardTitle>
                    </div>
                    {/* Category Filter Tabs */}
                    <NotificationFilters
                        categories={NOTIFICATION_CATEGORIES}
                        categoryCounts={categoryCounts}
                        activeCategory={activeCategory}
                    />
                </CardHeader>
                <CardContent>
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <CheckCircle className="h-16 w-16 text-zinc-300 dark:text-zinc-600 mb-4" />
                            <h3 className="text-lg font-semibold">Không có thông báo{activeCategory !== 'all' ? ` trong mục "${categoryConfig?.label}"` : ''}!</h3>
                            <p className="text-muted-foreground">Tất cả hoạt động đã được xem qua.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedNotifications).map(([dateGroup, groupNotifs]) => (
                                <div key={dateGroup}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{dateGroup}</h3>
                                        <div className="flex-1 h-px bg-border" />
                                        <span className="text-xs text-muted-foreground">{groupNotifs.length} thông báo</span>
                                    </div>
                                    <div className="space-y-2">
                                        {groupNotifs.map((notification) => (
                                            <Link
                                                key={notification.id}
                                                href={notification.link || '#'}
                                                className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-sm ${getNotifSeverityColor(notification.severity, notification.read)}`}
                                            >
                                                <div className="shrink-0">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <p className={`font-semibold text-sm ${notification.read ? 'text-muted-foreground' : ''}`}>
                                                            {notification.title}
                                                        </p>
                                                        {!notification.read && (
                                                            <span className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-zinc-100 shrink-0" />
                                                        )}
                                                        {notification.source === 'workspace' && (
                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">Workspace</Badge>
                                                        )}
                                                    </div>
                                                    <p className={`text-sm ${notification.read ? 'text-muted-foreground/60' : 'opacity-80'}`}>
                                                        {notification.message}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                        {formatTimeAgo(notification.created_at)}
                                                    </span>
                                                </div>
                                                <ChevronRight className="h-5 w-5 shrink-0 opacity-50" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
