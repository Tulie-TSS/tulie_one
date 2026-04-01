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
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/reports">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Báo cáo khách hàng</h1>
                    <p className="text-muted-foreground">Phân tích tăng trưởng và phân loại khách hàng</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Tổng khách hàng</p>
                                <p className="text-3xl font-bold mt-1">{data.totalCustomers}</p>
                            </div>
                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Mới (30 ngày)</p>
                                <p className="text-3xl font-bold mt-1 text-emerald-600">+{data.newCustomers30d}</p>
                            </div>
                            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <UserPlus className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Đang hoạt động</p>
                                <p className="text-3xl font-bold mt-1">{data.statusBreakdown.active}</p>
                            </div>
                            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <UserCheck className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Tiềm năng</p>
                                <p className="text-3xl font-bold mt-1">{data.statusBreakdown.prospect + data.statusBreakdown.lead}</p>
                            </div>
                            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                <Star className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Growth Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Khách hàng mới theo tháng</CardTitle>
                </CardHeader>
                <CardContent>
                    <CustomerCharts data={data.monthlyGrowth} />
                </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
                {/* Status Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Phân loại theo trạng thái</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { name: 'Đang hoạt động', count: data.statusBreakdown.active, color: 'bg-emerald-500' },
                                { name: 'Tiềm năng', count: data.statusBreakdown.prospect, color: 'bg-blue-500' },
                                { name: 'Lead', count: data.statusBreakdown.lead, color: 'bg-amber-500' },
                                { name: 'Không hoạt động', count: data.statusBreakdown.inactive, color: 'bg-zinc-400' },
                            ].map(status => {
                                const pct = data.totalCustomers > 0 ? (status.count / data.totalCustomers) * 100 : 0
                                return (
                                    <div key={status.name} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">{status.name}</span>
                                            <span className="text-muted-foreground">{status.count} ({pct.toFixed(0)}%)</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
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
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Nguồn khách hàng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(data.sourceBreakdown)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 8)
                                .map(([source, count]) => {
                                    const pct = data.totalCustomers > 0 ? (count / data.totalCustomers) * 100 : 0
                                    return (
                                        <div key={source} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-primary" />
                                                <span className="font-medium">{source}</span>
                                            </div>
                                            <span className="text-muted-foreground">{count} ({pct.toFixed(0)}%)</span>
                                        </div>
                                    )
                                })}
                            {Object.keys(data.sourceBreakdown).length === 0 && (
                                <p className="text-sm text-muted-foreground">Chưa có dữ liệu nguồn khách hàng.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                {/* Top Customers by Revenue */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Top khách hàng theo doanh thu</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.topCustomers.length > 0 ? (
                            <div className="space-y-3">
                                {data.topCustomers.map((cust, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                                                {i + 1}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{cust.name}</p>
                                                <p className="text-xs text-muted-foreground">{cust.contracts} hợp đồng</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-emerald-600 shrink-0 ml-2">{formatCurrency(cust.revenue)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Chưa có dữ liệu doanh thu khách hàng.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Customers */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Khách hàng mới nhất</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.recentCustomers.length > 0 ? (
                            <div className="space-y-3">
                                {data.recentCustomers.map((cust: any) => (
                                    <div key={cust.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                                <Building2 className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{cust.company_name}</p>
                                                <p className="text-xs text-muted-foreground">{formatDate(cust.created_at)}</p>
                                            </div>
                                        </div>
                                        <Badge variant={cust.status === 'active' ? 'default' : 'secondary'} className="text-[10px] shrink-0">
                                            {cust.status === 'active' ? 'Active' : cust.status === 'prospect' ? 'Prospect' : cust.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Chưa có khách hàng.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
