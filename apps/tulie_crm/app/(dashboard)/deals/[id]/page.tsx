import { getDealById } from '@/lib/supabase/services/deal-service'
import { notFound } from 'next/navigation'
import { Button } from '@repo/ui'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui'
import { Badge } from '@repo/ui'
import { Separator } from '@repo/ui'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { StatusBadge } from '@/components/shared/status-badge'
import { ArrowLeft, Edit, ExternalLink, Plus, FileText, TrendingUp, Users, Wallet, Calendar, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

export default async function DealDetailPage({ params }: any) {
    const { id } = await params
    const deal = await getDealById(id)

    if (!deal) notFound()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80">
                        <Link href="/deals">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl">{deal.title}</h1>
                            <StatusBadge status={deal.status} entityType="deal" />
                        </div>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Khách hàng: <Link href={`/customers/${deal.customer?.id}`} className="hover:underline font-medium">{deal.customer?.company_name}</Link>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/deals/${deal.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            Chỉnh sửa
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/quotations/new?deal_id=${deal.id}&customer_id=${deal.customer_id}`}>
                            <Plus className="h-4 w-4" />
                            Tạo báo giá
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {/* Deal Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Chi tiết cơ hội</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="p-4 bg-muted/20 rounded-md border flex flex-col items-center justify-center text-center">
                                    <Wallet className="h-5 w-5 mb-2 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">Ngân sách dự kiến</p>
                                    <p className="text-lg">{formatCurrency(deal.budget || 0)}</p>
                                </div>
                                <div className="p-4 bg-muted/20 rounded-md border flex flex-col items-center justify-center text-center">
                                    <TrendingUp className="h-5 w-5 mb-2 text-blue-600" />
                                    <p className="text-xs text-muted-foreground">Mức độ ưu tiên</p>
                                    <p className="text-lg">{deal.priority}</p>
                                </div>
                                <div className="p-4 bg-muted/20 rounded-md border flex flex-col items-center justify-center text-center">
                                    <Calendar className="h-5 w-5 mb-2 text-orange-600" />
                                    <p className="text-xs text-muted-foreground">Ngày tạo</p>
                                    <p className="text-lg">{formatDate(deal.created_at)}</p>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-sm mb-2">Mô tả / Yêu cầu khách hàng</h4>
                                <div className="text-sm p-4 bg-muted/30 rounded-lg whitespace-pre-line border border-dashed">
                                    {deal.description || "Chưa có mô tả chi tiết."}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Associated Quotations */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>Danh sách báo giá</CardTitle>
                                <CardDescription>Các báo giá đã gửi cho cơ hội này.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/quotations/new?deal_id=${deal.id}`}>
                                    <Plus className="h-4 w-4" /> Thêm báo giá
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {deal.quotations && deal.quotations.length > 0 ? (
                                <div className="space-y-3">
                                    {deal.quotations.map((quote: any) => (
                                        <div key={quote.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <FileText className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <Link href={`/quotations/${quote.id}?from=/deals/${id}`} className="font-bold hover:underline">
                                                        {quote.quotation_number}
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground">{quote.title}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="text-sm font-semibold">{formatCurrency(quote.total_amount)}</p>
                                                <Badge variant="outline">{quote.status}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 border-2 border-dashed rounded-md">
                                    <FileText className="w-10 mx-auto mb-3 opacity-20" />
                                    <p className="text-muted-foreground text-sm">Chưa có báo giá nào cho cơ hội này.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quản lý cơ hội</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Phụ trách (Sales)</p>
                                <p className="text-sm font-medium">{deal.assigned_user?.full_name || "Chưa gán"}</p>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">Chuyển trạng thái</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" className="justify-start">
                                        <TrendingUp className="h-4 w-4" /> Briefing
                                    </Button>
                                    <Button variant="outline" size="sm" className="justify-start">
                                        <FileText className="h-4 w-4" /> Lên báo giá
                                    </Button>
                                    <Button variant="default" size="sm" className="justify-start">
                                        <CheckCircle2 className="h-4 w-4" /> Chốt thành công
                                    </Button>
                                    <Button variant="destructive" size="sm" className="justify-start">
                                        <XCircle className="h-4 w-4" /> Thất bại
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="bg-primary text-primary-foreground">
                        <CardHeader>
                            <CardTitle className="text-lg opacity-90">Tiềm năng dự án</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl">{formatCurrency(deal.budget || 0)}</p>
                            <p className="text-xs opacity-70 mt-1">Dựa trên ngân sách dự kiến của khách hàng.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
