import { Metadata } from 'next'
import { getQuotePortalById } from '@/lib/supabase/services/quote-portal-service'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@repo/ui'
import { ExternalLink, Calendar, Globe, Link2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/format'
import { PortalAttachments } from './portal-attachments'
import { PortalTitleEditor } from './portal-title-editor'

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
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-[-12px]">
                <Link href="/quotations/portals" className="hover:text-foreground flex items-center gap-1 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Danh sách Portal
                </Link>
            </div>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center border border-border">
                        <Globe className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <Badge variant={portal.is_active ? "default" : "secondary"}>
                                {portal.is_active ? 'Hoạt động' : 'Đã đóng'}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono">ID: {portal.id.split('-')[0]}</span>
                        </div>
                        <PortalTitleEditor portalId={portal.id} initialTitle={portal.title || 'Portal báo giá'} />
                        <p className="text-sm font-medium text-muted-foreground mt-1">
                            {portal.customer?.company_name || 'Khách lẻ'} • Tạo bởi {portal.creator?.full_name}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                            Xem giao diện Khách
                        </a>
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Danh sách các Phương án Báo giá</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {portal.items?.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">
                                Chưa có báo giá nào trong portal này.
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {portal.items?.map((item: any) => (
                                    <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/50 transition-colors">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="font-mono text-[10px] w-6 h-6 p-0 flex justify-center items-center rounded-full bg-muted text-muted-foreground border-border">
                                                    {item.sort_order + 1}
                                                </Badge>
                                                <Link href={`/quotations/${item.quotation?.id}`} className="text-sm font-medium text-foreground hover:underline">
                                                    #{item.quotation?.quotation_number} — {item.quotation?.title}
                                                </Link>
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {item.quotation?.status}
                                                </Badge>
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-4 pl-8">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </span>
                                                <span className="font-bold text-foreground tabular-nums">
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
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Link2 className="h-4 w-4 text-muted-foreground" />
                                Liên kết chia sẻ
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-3 bg-muted rounded-md border border-border">
                                <p className="text-sm font-mono break-all text-foreground">
                                    https://crm.tulie.app{publicUrl}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <PortalAttachments
                        portalId={portal.id}
                        initialAttachments={portal.attachments || []}
                    />
                </div>
            </div>
        </div>
    )
}
