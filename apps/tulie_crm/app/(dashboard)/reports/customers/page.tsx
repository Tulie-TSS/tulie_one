import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { Button } from '@repo/ui'
import { Badge } from '@repo/ui'
import { ArrowLeft, Users, UserPlus, UserCheck, Building2, TrendingUp, Star } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { CustomerCharts } from './customer-charts'

async function getCustomerAnalytics() {
    const supabase = await createClient()
    const now = new Date()

    // All customers
    const { data: customers } = await supabase
        .from('customers')
        .select('id, company_name, status, type, source, created_at, assigned_to')
        .order('created_at', { ascending: false })

    // Contracts by customer
    const { data: contracts } = await supabase
        .from('contracts')
        .select('id, customer_id, status, total_amount')

    // Invoices by customer (revenue)
    const { data: invoices } = await supabase
        .from('invoices')
        .select('id, customer_id, paid_amount, total_amount, status, type')
        .eq('type', 'output')

    const totalCustomers = customers?.length || 0

    // Status breakdown
    const statusBreakdown = {
        active: customers?.filter(c => c.status === 'active').length || 0,
        prospect: customers?.filter(c => c.status === 'prospect').length || 0,
        inactive: customers?.filter(c => c.status === 'inactive').length || 0,
        lead: customers?.filter(c => c.status === 'lead').length || 0,
    }

    // Type breakdown (B2B / B2C / etc)
    const typeBreakdown: Record<string, number> = {}
    customers?.forEach(c => {
        const type = c.type || 'Khác'
        typeBreakdown[type] = (typeBreakdown[type] || 0) + 1
    })

    // Source breakdown
    const sourceBreakdown: Record<string, number> = {}
    customers?.forEach(c => {
        const source = c.source || 'Không rõ'
        sourceBreakdown[source] = (sourceBreakdown[source] || 0) + 1
    })

    // Monthly growth (last 12 months)
    const monthlyGrowth = []
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
        const count = customers?.filter(c => {
            const created = new Date(c.created_at)
            return created >= d && created < nextMonth
        }).length || 0
        monthlyGrowth.push({
            name: `T${d.getMonth() + 1}`,
            value: count,
        })
    }

    // New customers in last 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const newCustomers30d = customers?.filter(c => new Date(c.created_at) >= thirtyDaysAgo).length || 0

    // Top customers by revenue
    const customerRevenue: Record<string, { name: string; revenue: number; contracts: number }> = {}
    contracts?.forEach(c => {
        if (c.customer_id) {
            if (!customerRevenue[c.customer_id]) {
                const customer = customers?.find(cust => cust.id === c.customer_id)
                customerRevenue[c.customer_id] = {
                    name: customer?.company_name || 'N/A',
                    revenue: 0,
                    contracts: 0,
                }
            }
            customerRevenue[c.customer_id].contracts++
        }
    })
    invoices?.forEach(inv => {
        if (inv.customer_id && customerRevenue[inv.customer_id]) {
            customerRevenue[inv.customer_id].revenue += (inv.paid_amount || 0)
        }
    })
    const topCustomers = Object.values(customerRevenue)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8)

    // Recent customers
    const recentCustomers = (customers || []).slice(0, 5)

    return {
        totalCustomers,
        newCustomers30d,
        statusBreakdown,
        typeBreakdown,
        sourceBreakdown,
        monthlyGrowth,
        topCustomers,
        recentCustomers,
    }
}

export default async function CustomersReportPage() {
    const data = await getCustomerAnalytics()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild className="h-9 w-9">
                    <Link href="/reports">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Báo cáo khách hàng</h1>
                    <p className="text-sm text-muted-foreground mt-1">Phân tích tăng trưởng và phân loại khách hàng</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Tổng khách hàng</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalCustomers}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Mới (30 ngày)</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">+{data.newCustomers30d}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.statusBreakdown.active}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Tiềm năng</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.statusBreakdown.prospect + data.statusBreakdown.lead}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Growth Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Khách hàng mới theo tháng</CardTitle>
                </CardHeader>
                <CardContent>
                    <CustomerCharts data={data.monthlyGrowth} />
                </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
                {/* Status Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Phân loại theo trạng thái</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { name: 'Đang hoạt động', count: data.statusBreakdown.active, color: 'bg-emerald-500' },
                                { name: 'Tiềm năng', count: data.statusBreakdown.prospect, color: 'bg-primary' },
                                { name: 'Lead', count: data.statusBreakdown.lead, color: 'bg-amber-500' },
                                { name: 'Không hoạt động', count: data.statusBreakdown.inactive, color: 'bg-muted-foreground' },
                            ].map(status => {
                                const pct = data.totalCustomers > 0 ? (status.count / data.totalCustomers) * 100 : 0
                                return (
                                    <div key={status.name} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-foreground">{status.name}</span>
                                            <span className="text-muted-foreground font-mono text-xs">{status.count} ({pct.toFixed(0)}%)</span>
                                        </div>
                                        <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${status.color} transition-all duration-700`}
                                                style={{ width: `${Math.max(pct, 2)}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Source Breakdown */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Nguồn khách hàng</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {Object.keys(data.sourceBreakdown).length > 0 ? (
                            <div className="space-y-4">
                                {Object.entries(data.sourceBreakdown)
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 8)
                                    .map(([source, count]) => {
                                        const pct = data.totalCustomers > 0 ? (count / data.totalCustomers) * 100 : 0
                                        return (
                                            <div key={source} className="flex items-center justify-between text-sm group">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                                    <span className="font-medium text-foreground">{source}</span>
                                                </div>
                                                <span className="text-muted-foreground font-mono text-xs">{count} ({pct.toFixed(0)}%)</span>
                                            </div>
                                        )
                                    })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center h-full">
                                <Users className="h-8 w-8 text-muted-foreground/50 mb-3" />
                                <p className="text-sm text-muted-foreground">Chưa có dữ liệu nguồn khách hàng.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                {/* Top Customers by Revenue */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Top doanh thu</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {data.topCustomers.length > 0 ? (
                            <div className="space-y-4">
                                {data.topCustomers.map((cust, i) => (
                                    <div key={i} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold shrink-0 text-muted-foreground">
                                                {i + 1}
                                            </div>
                                            <div className="min-w-0 flex flex-col">
                                                <p className="text-sm font-medium leading-none truncate">{cust.name}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{cust.contracts} hợp đồng</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">{formatCurrency(cust.revenue)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center h-full">
                                <Star className="h-8 w-8 text-muted-foreground/50 mb-3" />
                                <p className="text-sm text-muted-foreground">Chưa có dữ liệu doanh thu khách hàng.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Customers */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Khách hàng mới nhất</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {data.recentCustomers.length > 0 ? (
                            <div className="space-y-4">
                                {data.recentCustomers.map((cust: any) => (
                                    <div key={cust.id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0 flex flex-col">
                                                <span className="text-sm font-medium leading-none truncate">{cust.company_name}</span>
                                                <span className="text-xs text-muted-foreground mt-1">{formatDate(cust.created_at)}</span>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="font-normal text-[10px] px-1.5 py-0 h-4">
                                            {cust.status === 'active' ? 'Active' : cust.status === 'prospect' ? 'Prospect' : cust.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center h-full">
                                <Users className="h-8 w-8 text-muted-foreground/50 mb-3" />
                                <p className="text-sm text-muted-foreground">Chưa có khách hàng.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
