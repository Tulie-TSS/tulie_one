import { Metadata } from 'next'
import { getQuotePortalById } from '@/lib/supabase/services/quote-portal-service'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@repo/ui'
import { ExternalLink, Link2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { PortalAttachments } from './portal-attachments'
import { PortalTitleEditor } from './portal-title-editor'
import { PortalItemsList } from './portal-items-list'
import { PortalViewAnalytics } from './portal-view-analytics'

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
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="h-12 w-12 shrink-0 rounded-md bg-transparent" asChild>
                        <Link href="/quotations/portals">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
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
                        <PortalItemsList
                            portalId={portal.id}
                            initialItems={portal.items || []}
                        />
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

                    <PortalViewAnalytics portalToken={portal.public_token} />

                    <PortalAttachments
                        portalId={portal.id}
                        initialAttachments={portal.attachments || []}
                    />
                </div>
            </div>
        </div>
    )
}

