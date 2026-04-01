import { Metadata } from 'next'
import { getQuotePortalById } from '@/lib/supabase/services/quote-portal-service'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@repo/ui'
import { ExternalLink, Calendar, Copy } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/format'

export const metadata: Metadata = {
    title: 'Chi tiết Portal | Tulie CRM',
}

export default async function PortalDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const portal = await getQuotePortalById(id)

    if (!portal) {
        notFound()
    }

    const publicUrl = `/quote/${portal.public_token}`

    return (
        <div className="container py-8 max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant={portal.is_active ? "default" : "secondary"}>
                            {portal.is_active ? 'Hoạt động' : 'Đã đóng'}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">ID: {portal.id.split('-')[0]}</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">{portal.title}</h1>
                    <p className="text-muted-foreground mt-1">
                        {portal.customer?.company_name || 'Khách lẻ'} • Tạo bởi {portal.creator?.full_name}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" asChild>
                        <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Xem giao diện Khách
                        </a>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-lg">
                        <CardTitle className="text-lg">Danh sách các Phương án Báo giá</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {portal.items?.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                Chưa có báo giá nào trong portal này.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {portal.items?.map((item: any) => (
                                    <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="font-mono text-[10px] w-6 h-6 p-0 flex justify-center items-center rounded-full bg-slate-100 text-slate-500 border-none">
                                                    {item.sort_order + 1}
                                                </Badge>
                                                <Link href={`/quotations/${item.quotation?.id}`} className="font-semibold text-slate-900 hover:text-blue-600">
                                                    #{item.quotation?.quotation_number} — {item.quotation?.title}
                                                </Link>
                                                <Badge variant="secondary" className="text-[10px] text-muted-foreground">
                                                    {item.quotation?.status}
                                                </Badge>
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-4 pl-8">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </span>
                                                <span className="font-bold text-slate-800 tabular-nums">
                                                    {formatCurrency(item.quotation?.total_amount || 0)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Liên kết chia sẻ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                <p className="text-sm font-mono break-all text-slate-700">
                                    https://crm.tulie.app{publicUrl}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
