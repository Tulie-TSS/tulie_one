import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui'
import { Progress, Badge } from '@repo/ui'
import { Trophy, ArrowRight, Target, DollarSign, Briefcase } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PartnerDashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/system-login')

    // Fetch deals for this partner
    const { data: deals } = await supabase
        .from('deals')
        .select('*')
        .eq('partner_id', user.id)

    // Compute basic stats
    const totalDeals = deals?.length || 0
    const wonDeals = deals?.filter(d => d.status === 'closed_won') || []
    
    // Revenue is calculated from closed_won deals (Wait, should be from contracts? For MVP, we use budget of won deals)
    const totalRevenue = wonDeals.reduce((sum, d) => sum + (d.budget || 0), 0)
    
    // Base Commission (assuming MVP calculates it locally or gets it from partner_commission)
    const baseCommission = wonDeals.reduce((sum, d) => sum + (d.partner_commission || ((d.budget || 0) * 0.15)), 0)

    // Gamification Logic (Bonus Tiers)
    const tiers = [
        { revenue: 50000000, bonus: 2000000, label: 'Khởi động' },
        { revenue: 100000000, bonus: 5000000, label: 'Đồng' },
        { revenue: 200000000, bonus: 10000000, label: 'Bạc' },
        { revenue: 300000000, bonus: 20000000, label: 'Vàng' },
    ]

    let currentTierIndex = -1
    let nextTier = tiers[0]
    
    for (let i = 0; i < tiers.length; i++) {
        if (totalRevenue >= tiers[i].revenue) {
            currentTierIndex = i
        } else {
            nextTier = tiers[i]
            break
        }
    }
    
    // Cap at the highest tier
    if (currentTierIndex === tiers.length - 1) {
        nextTier = tiers[tiers.length - 1]
    }

    const progressPercentage = Math.min((totalRevenue / nextTier.revenue) * 100, 100)
    const currentBonusFromTiers = currentTierIndex >= 0 ? tiers[currentTierIndex].bonus : 0
    const totalEarnings = baseCommission + currentBonusFromTiers

    return (
        <div className="space-y-6 max-w-5xl mx-auto w-full pb-10">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold tracking-tight">Partner Portal</h1>
                <p className="text-sm text-muted-foreground">
                    Theo dõi khách hàng và tiến độ hoa hồng của bạn
                </p>
            </div>

            {/* Main Stats */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <Card className="bg-gradient-to-br from-primary/10 to-transparent">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <DollarSign className="h-4 w-4" /> Tổng thu nhập dự kiến
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary">{formatCurrency(totalEarnings)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Gồm {formatCurrency(baseCommission)} cơ bản + {formatCurrency(currentBonusFromTiers)} thưởng
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Target className="h-4 w-4" /> Doanh số tích luỹ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{formatCurrency(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Từ {wonDeals.length} hợp đồng thành công
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Briefcase className="h-4 w-4" /> Tổng Cơ hội (Deals)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalDeals}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tỉ lệ chốt: {totalDeals > 0 ? Math.round((wonDeals.length / totalDeals) * 100) : 0}%
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Gamification Tracker */}
            <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl font-bold">
                                <Trophy className="h-5 w-5 text-amber-500" /> Hành trình nhận thưởng
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Tích lũy doanh số để nhận ngay tiền thưởng nóng!
                            </CardDescription>
                        </div>
                        {currentTierIndex >= 0 && (
                            <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white border-transparent">
                                Hạng {tiers[currentTierIndex].label}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-muted-foreground">Hiện tại: {formatCurrency(totalRevenue)}</span>
                            {currentTierIndex < tiers.length - 1 ? (
                                <span className="text-primary font-bold">Mục tiêu: {formatCurrency(nextTier.revenue)}</span>
                            ) : (
                                <span className="text-emerald-500 font-bold">Đã đạt mức tối đa!</span>
                            )}
                        </div>
                        <Progress value={progressPercentage} className="h-3" />
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-4">
                        {tiers.map((tier, idx) => {
                            const isAchieved = totalRevenue >= tier.revenue
                            return (
                                <div key={idx} className={`p-3 rounded-lg border text-center relative ${isAchieved ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-dashed border-border'}`}>
                                    {isAchieved && (
                                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">✓</div>
                                    )}
                                    <h4 className={`text-xs font-semibold mb-1 ${isAchieved ? 'text-primary' : 'text-muted-foreground'}`}>{tier.label}</h4>
                                    <div className="text-[11px] text-muted-foreground mb-1">Mốc {tier.revenue / 1000000}Tr</div>
                                    <Badge variant={isAchieved ? 'default' : 'secondary'} className={`text-[10px] uppercase font-bold ${isAchieved ? 'bg-amber-500 text-white hover:bg-amber-600' : ''}`}>
                                        +{tier.bonus / 1000000}Tr VNĐ
                                    </Badge>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Deals Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Danh sách Cơ hội (Deals)</CardTitle>
                    <CardDescription>Các hợp đồng mà bạn đã mang về cho hệ thống</CardDescription>
                </CardHeader>
                <CardContent>
                    {deals && deals.length > 0 ? (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm border-collapse">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-10 px-4 align-middle font-medium text-muted-foreground text-left w-[300px]">Tên dự án</th>
                                        <th className="h-10 px-4 align-middle font-medium text-muted-foreground text-left">Trạng thái</th>
                                        <th className="h-10 px-4 align-middle font-medium text-muted-foreground text-left">Giá trị</th>
                                        <th className="h-10 px-4 align-middle font-medium text-muted-foreground text-left">Vai trò CTV</th>
                                        <th className="h-10 px-4 align-middle font-medium text-muted-foreground text-right">Hoa hồng dự kiến</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {deals.map(deal => (
                                        <tr key={deal.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <td className="p-4 align-middle font-medium">{deal.title}</td>
                                            <td className="p-4 align-middle">
                                                <Badge variant={deal.status === 'closed_won' ? 'default' : deal.status === 'closed_lost' ? 'destructive' : 'secondary'}>
                                                    {deal.status === 'closed_won' ? 'Thành công' : deal.status === 'closed_lost' ? 'Thất bại' : 'Đang tư vấn'}
                                                </Badge>
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">{deal.budget ? formatCurrency(deal.budget) : 'Chưa chốt'}</td>
                                            <td className="p-4 align-middle uppercase text-[10px] tracking-wider font-semibold text-muted-foreground">
                                                {deal.partner_role === 'lead_only' ? 'Giới thiệu' : deal.partner_role === 'consult_close' ? 'Tư vấn chốt' : 'Tự chốt deal'}
                                            </td>
                                            <td className="p-4 align-middle text-right font-medium text-primary">
                                                {deal.partner_commission ? formatCurrency(deal.partner_commission) : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                            <Briefcase className="w-8 h-8 mb-4 opacity-50" />
                            <p>Chưa có hợp đồng nào.</p>
                            <p className="text-sm mt-1">Giới thiệu khách hàng để nhận hoa hồng ngay!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
