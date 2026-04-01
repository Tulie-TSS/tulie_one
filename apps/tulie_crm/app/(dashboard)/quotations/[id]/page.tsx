'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
    Plus, LayoutGrid, List, FileText, Share2, Copy, ExternalLink, Edit, Printer, Clock, FileDown,
    CheckCircle, XCircle, Layout, ArrowLeft, Target, ClipboardList, Lightbulb, Package, Users,
    Shield, Award, BookOpen, User, Phone, Mail, MapPin, Globe, CreditCard, Building2,
    Eye, Info, Receipt, FileSignature, Maximize2
} from 'lucide-react'
import { LoadingSpinner } from '@repo/ui'
import Link from 'next/link'
import { Button } from '@repo/ui'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@repo/ui'
import { Badge } from '@repo/ui'
import { Separator } from '@repo/ui'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@repo/ui'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@repo/ui"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@repo/ui"
import { formatCurrency, formatDate, readNumberToWords } from '@/lib/utils/format'
import { QUOTATION_STATUS_LABELS, QUOTATION_STATUS_COLORS } from '@/lib/constants/status'
import { QuotationPaper } from '@/components/quotations/quotation-paper'
import { QuotationDocumentPaper } from '@/components/quotations/quotation-document-paper'
import { QuotationModernPaper } from '@/components/quotations/QuotationModernPaper'
import { QuotationItem, Quotation, QuotationStatus } from '@/types'
import { QuotationEmailButton } from '@/components/quotations/quotation-email-button'
import { ConvertQuotationButton } from '@/components/quotations/convert-quotation-button'
import DocumentDownloadButton from '@/components/documents/DocumentDownloadButton'
import { QuotationViewAnalytics } from '@/components/quotations/quotation-view-analytics'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@repo/ui"
import { toast } from 'sonner'
import { getQuotationById } from '@/lib/supabase/services/quotation-service'
import { getBrandConfig } from '@/lib/supabase/services/settings-service'
import { getViewStats } from '@/lib/supabase/services/quote-tracking-service'
import { useParams, useSearchParams } from 'next/navigation'

import { StatusBadge } from '@/components/shared/status-badge'
import { QuotationVersionHistory } from '@/components/quotations/quotation-version-history'
import { EntityPipelineTracker } from '@/components/shared/entity-pipeline-tracker'

export default function QuotationDetailPage() {
    const params = useParams()
    const id = params.id as string
    const [quotation, setQuotation] = useState<Quotation | null>(null)
    const [brandConfig, setBrandConfig] = useState<any>(null)
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [baseUrl, setBaseUrl] = useState('')
    const [layout, setLayout] = useState<'modern' | 'basic'>('modern')
    const [activeTab, setActiveTab] = useState<'data' | 'preview'>('data')
    const [isDownloading, setIsDownloading] = useState(false)
    const searchParams = useSearchParams()
    const fromParam = searchParams.get('from')
    const backHref = fromParam && fromParam.startsWith('/') ? fromParam : '/quotations'
    const printRef = React.useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setBaseUrl(window.location.origin)
        }

        const fetchData = async () => {
            try {
                const [data, brand, statsData] = await Promise.all([
                    getQuotationById(id),
                    getBrandConfig(),
                    getViewStats(id)
                ])
                setQuotation(data)
                setBrandConfig(brand)
                setStats(statsData)
            } catch (error) {
                console.error('Error fetching quotation:', error)
                toast.error('Không thể tải dữ liệu báo giá')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (!quotation) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                <h3 className="text-xl">Không tìm thấy báo giá</h3>
                <Button asChild variant="outline">
                    <Link href="/quotations">Quay lại danh sách</Link>
                </Button>
            </div>
        )
    }

    // Proposal content helpers
    const pc = quotation.proposal_content || {}
    const hasProposal = pc && Object.values(pc).some(v => v && String(v).trim().length > 0)

    const sectionIcons: Record<string, React.ReactNode> = {
        'introduction': <Target className="h-4 w-4" />,
        'scope_of_work': <ClipboardList className="h-4 w-4" />,
        'methodology': <Lightbulb className="h-4 w-4" />,
        'deliverables': <Package className="h-4 w-4" />,
        'team': <Users className="h-4 w-4" />,
        'timeline': <Clock className="h-4 w-4" />,
        'warranty': <Shield className="h-4 w-4" />,
        'why_us': <Award className="h-4 w-4" />,
    };

    const proposalSections: { label: string; key: string; content: string }[] = pc.sections && Array.isArray(pc.sections) && pc.sections.length > 0
        ? pc.sections.map((s: any) => ({ label: s.label, key: s.key, content: s.content })).filter((s: any) => s.content && String(s.content).trim().length > 0)
        : [
            { label: 'Mục tiêu & Giới thiệu', key: 'introduction' },
            { label: 'Phạm vi công việc (Scope of Work)', key: 'scope_of_work' },
            { label: 'Phương pháp & Cách tiếp cận', key: 'methodology' },
            { label: 'Sản phẩm bàn giao (Deliverables)', key: 'deliverables' },
            { label: 'Đội ngũ & Nhân sự', key: 'team' },
            { label: 'Tiến độ & Timeline', key: 'timeline' },
            { label: 'Chính sách bảo hành & Hỗ trợ', key: 'warranty' },
            { label: 'Vì sao chọn chúng tôi?', key: 'why_us' },
        ].filter(s => !!pc[s.key]).map(s => ({ ...s, content: pc[s.key] }));

    // Group items for display
    const items = quotation.items || []
    const groupedItems: Record<string, any[]> = items.reduce((acc: any, item: any) => {
        const sectionName = item.section_name || '';
        if (!acc[sectionName]) acc[sectionName] = [];
        acc[sectionName].push(item);
        return acc;
    }, {});

    const sectionEntries = Object.entries(groupedItems).sort((a, b) => {
        if (a[0] === '') return 1;
        if (b[0] === '') return -1;
        // Find first item of each section to compare their sort_order
        return (a[1][0]?.sort_order || 0) - (b[1][0]?.sort_order || 0);
    });

    // Calculate discount totals (matching portal view)
    const subtotalRaw = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0)
    const subtotalNet = items.reduce((sum: number, item: any) => sum + (item.total_price || (item.quantity * item.unit_price * (1 - (item.discount || 0) / 100))), 0)
    const totalDiscount = subtotalRaw - subtotalNet

    const publicUrl = quotation.public_token ? `${baseUrl}/quote/${quotation.public_token}` : null
    const portalUrl = quotation.public_token ? `${baseUrl}/portal/${quotation.public_token}` : null


    return (
        <div className="flex flex-col gap-6 pb-20">
            <div className="print:hidden space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <Button variant="outline" size="icon" asChild className="h-9 w-9 shrink-0">
                            <Link href={backHref}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[11px] font-mono">{quotation.quotation_number}</Badge>
                                <StatusBadge entityType="quotation" status={quotation.status} />
                                {quotation.is_primary && (
                                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">Chính</Badge>
                                )}
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">{quotation.customer?.company_name}</h1>
                            {(quotation.title || quotation.version_name) && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                    {quotation.version_name ? <span className="font-semibold text-foreground">{quotation.version_name}</span> : null}
                                    {quotation.title ? (quotation.version_name ? <span>&bull; {quotation.title}</span> : quotation.title) : null}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <QuotationVersionHistory quotationId={id} />
                        
                        {quotation.public_token && (
                            <Button variant="outline" size="default" asChild className="font-medium text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950">
                                <Link href={publicUrl || '#'} target="_blank" className="flex items-center gap-2">
                                    <ExternalLink className="h-4 w-4" />
                                    Mở Portal báo giá
                                </Link>
                            </Button>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="default" className="gap-2 font-medium">
                                    <Share2 className="h-4 w-4" />
                                    Gửi & Chia sẻ
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64">
                                <DropdownMenuLabel>Truy cập Portal Khách Hàng</DropdownMenuLabel>
                                <DropdownMenuSeparator className="my-1.5 opacity-50" />

                                {!quotation.public_token ? (
                                    <div className="p-4 text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-md mx-1 mb-1">
                                        Vui lòng nhấn Sửa và Lưu để kích hoạt link chia sẻ.
                                    </div>
                                ) : (
                                    <>
                                        <DropdownMenuItem asChild className="rounded-md px-4 py-2 text-sm font-medium text-zinc-700 cursor-pointer">
                                            <Link href={publicUrl || '#'} target="_blank">
                                                <ExternalLink className="h-4 w-4 mr-3 opacity-50" />
                                                Mở Portal Báo Giá
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                if (publicUrl) {
                                                    navigator.clipboard.writeText(publicUrl)
                                                    toast.success('Đã sao chép link Portal Báo Giá')
                                                }
                                            }}
                                            className="rounded-md px-4 py-2 text-sm font-medium text-zinc-700 cursor-pointer"
                                        >
                                            <Copy className="h-4 w-4 mr-3 opacity-50" />
                                            Copy link Portal Báo Giá
                                        </DropdownMenuItem>
                                    </>
                                )}

                                <DropdownMenuSeparator className="my-2 opacity-50" />
                                <QuotationEmailButton quotation={quotation} triggerType="menuitem" />
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="outline" size="default" asChild className="font-medium">
                            <Link href={`/quotations/${quotation.id}/edit`} className="flex items-center gap-2">
                                <Edit className="h-4 w-4 text-muted-foreground" />
                                Sửa
                            </Link>
                        </Button>

                        {!['rejected', 'expired'].includes(quotation.status) && (
                            <ConvertQuotationButton quotationId={quotation.id} />
                        )}
                    </div>
                </div>

                <EntityPipelineTracker entityType="quotation" entityId={id} />

                <div className="pt-2">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'data' | 'preview')} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                            <TabsTrigger value="data" className="gap-2">
                                <Info className="h-4 w-4" />
                                Chi tiết dữ liệu
                            </TabsTrigger>
                            <TabsTrigger value="preview" className="gap-2">
                                <Eye className="h-4 w-4" />
                                Xem trước bản in
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {activeTab === 'data' && (
                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Customer Info Card */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-4 border-b bg-muted/30">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <CardTitle className="text-base font-semibold">Thông tin khách hàng</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div className="space-y-5">
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1.5">Đơn vị</p>
                                                <p className="font-semibold text-lg leading-tight text-foreground">{quotation.customer?.company_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1.5">Địa chỉ</p>
                                                <p className="text-sm leading-relaxed text-foreground">{quotation.customer?.address || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-5">
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1.5">Email tiếp nhận</p>
                                                <p className="text-sm font-medium text-foreground">{quotation.customer?.email || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1.5">Hotline liên hệ</p>
                                                <p className="text-sm font-medium text-foreground">{quotation.customer?.phone || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Proposal Content */}
                            {hasProposal && proposalSections.length > 0 && (
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base">Đề xuất giải pháp</CardTitle>
                                            <CardDescription>Proposal — {proposalSections.length} Stages</CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium">
                                                        <Maximize2 className="h-3.5 w-3.5" />
                                                        <span className="hidden sm:inline">Phóng to</span>
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                                    <DialogHeader className="pb-4 border-b">
                                                        <DialogTitle className="text-xl">Đề xuất giải pháp (Proposal)</DialogTitle>
                                                        <DialogDescription>Chi tiết {proposalSections.length} giai đoạn triển khai</DialogDescription>
                                                    </DialogHeader>
                                                    <div className="py-6 space-y-8">
                                                        {proposalSections.map((section, idx) => (
                                                            <div key={idx} className="space-y-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm text-muted-foreground shrink-0">
                                                                        {idx + 1}
                                                                    </div>
                                                                    <h3 className="text-lg text-foreground flex items-center gap-2">
                                                                        <span className="text-primary">{sectionIcons[section.key] || <Info className="h-4 w-4" />}</span>
                                                                        {section.label}
                                                                    </h3>
                                                                </div>
                                                                <div className="pl-11 text-sm text-zinc-700 leading-relaxed whitespace-pre-line">
                                                                    {pc[section.key]}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                            <Target className="h-5 w-5 text-muted-foreground ml-1" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="relative pl-12 before:absolute before:left-[17px] before:top-[32px] before:bottom-8 before:w-[2px] before:bg-muted before:rounded-full">
                                            {proposalSections.map((section, idx) => (
                                                <div key={idx} className="relative mb-8 last:mb-0">
                                                    <div className="absolute -left-12 top-[32px] -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white bg-zinc-950 text-[12px] z-10  border-[3px] border-white">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="rounded-md border border-border/60 bg-white overflow-hidden transition-all hover: hover:border-input/60 group">
                                                        <div className="flex items-center gap-4 px-6 py-4 border-b bg-muted/50 border-border group-hover:bg-muted transition-colors">
                                                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 text-white shadow group-hover:scale-105 transition-transform duration-300">
                                                                {sectionIcons[section.key] || <Info className="h-4 w-4" />}
                                                            </span>
                                                            <h4 className="text-[14px] text-foreground">
                                                                {section.label}
                                                            </h4>
                                                        </div>
                                                        <div className="px-6 py-5 text-[13px] text-muted-foreground font-medium leading-relaxed whitespace-pre-line bg-white">
                                                            {pc[section.key]}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Items Table */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-3">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl">Chi tiết hạng mục</CardTitle>
                                        <CardDescription>Investment Plan & Pricing Framework</CardDescription>
                                    </div>
                                    <Receipt className="h-5 w-5 text-muted-foreground" />
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-muted/40">
                                            <TableRow>
                                                <TableHead className="w-12 text-center text-xs">#</TableHead>
                                                <TableHead className="text-xs">Hạng mục & Mô tả</TableHead>
                                                <TableHead className="text-center text-xs">ĐVT</TableHead>
                                                <TableHead className="text-center text-xs">SL</TableHead>
                                                <TableHead className="text-right text-xs">Đơn giá</TableHead>
                                                <TableHead className="text-center text-xs">CK</TableHead>
                                                <TableHead className="text-right pr-6 text-xs">Thành tiền</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="bg-white">
                                            {sectionEntries.map(([sectionName, sectionItems], sectionIdx) => (
                                                <React.Fragment key={sectionIdx}>
                                                    {sectionName && (
                                                        <TableRow className="bg-muted/60 border-y">
                                                            <TableCell className="py-2 w-12 text-center">
                                                                <div className="w-6 h-6 rounded-md bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center mx-auto">
                                                                    {sectionIdx + 1}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell colSpan={6} className="py-2">
                                                                <span className="text-xs font-semibold text-foreground">{sectionName}</span>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                    {sectionItems.map((item: any, idx: number) => (
                                                        <TableRow key={item.id} className="hover:bg-muted/30 group last:border-0 align-top">
                                                            <TableCell className="text-center w-12 py-3">
                                                                {!sectionName && (
                                                                    <span className="text-xs font-medium text-muted-foreground tabular-nums">
                                                                        {idx + 1}
                                                                    </span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="py-3">
                                                                <div className="flex items-baseline gap-2">
                                                                    {sectionName && (
                                                                        <span className="text-xs font-medium text-muted-foreground tabular-nums shrink-0">
                                                                            {`${sectionIdx + 1}.${idx + 1}`}
                                                                        </span>
                                                                    )}
                                                                    <div className="space-y-1 min-w-0">
                                                                        <div className="flex items-baseline gap-2 flex-wrap">
                                                                            <p className="font-semibold text-foreground text-sm leading-tight">{item.product_name}</p>
                                                                            {item.is_optional && (
                                                                                <Badge variant="outline" className="h-4 px-1 text-[11px] font-medium border-border bg-muted text-muted-foreground">Tùy chọn</Badge>
                                                                            )}
                                                                        </div>
                                                                        {item.description && (
                                                                            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                                                                                {item.description}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center text-sm text-muted-foreground whitespace-nowrap py-3 align-top">{item.unit}</TableCell>
                                                            <TableCell className="text-center text-sm font-medium text-foreground py-3 align-top">{item.quantity}</TableCell>
                                                            <TableCell className="text-right text-sm text-muted-foreground tabular-nums whitespace-nowrap py-3 align-top">{formatCurrency(item.unit_price)}</TableCell>
                                                            <TableCell className="text-center text-sm text-muted-foreground tabular-nums whitespace-nowrap py-3 align-top">{item.discount ? `${item.discount}%` : '—'}</TableCell>
                                                            <TableCell className="text-right pr-6 text-sm font-semibold text-foreground tabular-nums whitespace-nowrap py-3 align-top">{formatCurrency(item.total_price)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <div className="border-t bg-muted/30 px-8 py-6 flex justify-end">
                                        <div className="w-full max-w-sm space-y-4">
                                            <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
                                                <span>Tạm tính:</span>
                                                <span className="text-foreground text-sm">{formatCurrency(subtotalRaw)}</span>
                                            </div>
                                            {totalDiscount > 0 && (
                                                <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
                                                    <span>Chiết khấu:</span>
                                                    <span className="text-foreground text-sm">-{formatCurrency(totalDiscount)}</span>
                                                </div>
                                            )}
                                            {totalDiscount > 0 && (
                                                <div className="flex justify-between items-center text-xs font-medium text-foreground">
                                                    <span className="font-semibold">Thành tiền sau CK:</span>
                                                    <span className="text-sm">{formatCurrency(subtotalNet)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
                                                <span>Thuế VAT ({quotation.vat_percent || 0}%):</span>
                                                <span className="text-foreground text-sm">{formatCurrency(quotation.vat_amount || 0)}</span>
                                            </div>
                                            <div className="pt-4 border-t border-border flex justify-between items-center">
                                                <span className="text-sm font-medium text-muted-foreground">Tổng thanh toán:</span>
                                                <span className="text-3xl tabular-nums text-foreground">{formatCurrency(quotation.total_amount || 0)}</span>
                                            </div>
                                            <div className="flex justify-between items-start pt-2 text-[11px] text-muted-foreground font-medium">
                                                <span className="shrink-0">Bằng chữ:</span>
                                                <span className="text-right ml-4">{readNumberToWords(quotation.total_amount || 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Terms & Notes */}
                            <div className="grid gap-6 sm:grid-cols-2">
                                <Card className="shadow-sm">
                                    <CardHeader className="pb-4 border-b bg-muted/30">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                                            <CardTitle className="text-base font-semibold">Điều khoản thanh toán</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="text-sm text-foreground leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-zinc-900/50 p-5 rounded-lg border border-slate-100 dark:border-zinc-800">
                                            {quotation.terms || 'Chưa có thông tin điều khoản.'}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardHeader className="pb-4 border-b bg-muted/30">
                                        <div className="flex items-center gap-2">
                                            <Info className="h-4 w-4 text-muted-foreground" />
                                            <CardTitle className="text-base font-semibold">Ghi chú bổ sung</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="text-sm text-foreground leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-zinc-900/50 p-5 rounded-lg border border-slate-100 dark:border-zinc-800">
                                            {quotation.notes || 'Không có ghi chú nào.'}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Combined Status Card */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-4 border-b bg-muted/30">
                                    <CardTitle className="text-base font-semibold">Khái quát</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 pt-6">
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-slate-50 border border-slate-100 dark:bg-zinc-900/50 dark:border-zinc-800">
                                            <p className="text-3xl font-bold tracking-tight text-foreground">{stats?.totalViews ?? quotation.view_count ?? 0}</p>
                                            <p className="text-xs font-medium text-muted-foreground mt-1.5 uppercase tracking-wider">Lượt xem</p>
                                        </div>
                                        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-slate-50 border border-slate-100 dark:bg-zinc-900/50 dark:border-zinc-800">
                                            <p className="text-sm font-bold text-foreground mt-1">
                                                {quotation.valid_until ? formatDate(quotation.valid_until) : 'N/A'}
                                            </p>
                                            <p className="text-xs font-medium text-muted-foreground mt-1.5 uppercase tracking-wider">Ngày hết hạn</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-border">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground font-medium">Khởi tạo:</span>
                                            <span className="font-semibold">{formatDate(quotation.created_at)}</span>
                                        </div>
                                        {quotation.updated_at !== quotation.created_at && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-muted-foreground font-medium">Cập nhật:</span>
                                                <span className="font-semibold">{formatDate(quotation.updated_at)}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* View Analytics */}
                            <QuotationViewAnalytics quotationId={quotation.id} />

                            {/* Payment Details Card */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-4 border-b bg-muted/30 flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                        <CardTitle className="text-base font-semibold">Thông tin thanh toán</CardTitle>
                                    </div>
                                    <Globe className="h-4 w-4 text-muted-foreground opacity-50" />
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-medium text-muted-foreground">Đơn vị thụ hưởng</p>
                                        <p className="font-bold text-sm text-foreground">{quotation.bank_account_name || brandConfig?.bank_account_name || "CÔNG TY TNHH TULIE"}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-medium text-muted-foreground">Số tài khoản chính</p>
                                        <p className="font-bold text-2xl tracking-tighter text-foreground font-mono select-all">
                                            {quotation.bank_account_no || brandConfig?.bank_account_no || "0110163102"}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 pt-3 border-t border-slate-100 dark:border-zinc-800">
                                        <div className="space-y-1.5">
                                            <p className="text-xs font-medium text-muted-foreground">Ngân hàng</p>
                                            <p className="font-bold text-sm text-foreground">{quotation.bank_name || brandConfig?.bank_name || "MB BANK"}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-xs font-medium text-muted-foreground">Chi nhánh</p>
                                            <p className="font-bold text-sm text-foreground">{quotation.bank_branch || brandConfig?.bank_branch || "VIỆT NAM"}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'preview' && (
                    <div className="space-y-8">
                        <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
                            {/* Layout Toggle - Segmented Control */}
                            <Tabs value={layout} onValueChange={(v) => setLayout(v as 'modern' | 'basic')} className="w-full max-w-[400px]">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="modern" className="gap-2">
                                        <Eye className="h-4 w-4" />
                                        Chế độ xem
                                    </TabsTrigger>
                                    <TabsTrigger value="basic" className="gap-2">
                                        <Printer className="h-4 w-4" />
                                        Chế độ in
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="gap-2 font-medium"
                                    onClick={() => window.print()}
                                >
                                    <Printer className="h-4 w-4" />
                                    In báo giá
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-center bg-muted rounded-md p-8 md:p-12 border border-border/60 min-h-[900px] relative group">
                            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none"
                                style={{ backgroundImage: "linear-gradient(#000 1.5px, transparent 1.5px), linear-gradient(90deg, #000 1.5px, transparent 1.5px)", backgroundSize: "40px 40px" }}>
                            </div>
                            <div className="w-full max-w-[210mm] bg-white [0_50px_120px_-20px_rgba(0,0,0,0.18)] overflow-hidden rounded-sm transition-transform ring-1 ring-zinc-300/40 relative z-10 border border-border" ref={printRef}>
                                {layout === 'modern' ? (
                                    <QuotationModernPaper quotation={quotation} brandConfig={brandConfig} />
                                ) : (
                                    <QuotationDocumentPaper quotation={quotation} brandConfig={brandConfig} />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Print specific container - ensures multi-page support */}
            <div className="hidden print:block !m-0 !p-0">
                <style dangerouslySetInnerHTML={{
                    __html: `
                        @media print {
                            @page { margin: 10mm; size: A4 portrait; }
                            html, body { 
                                margin: 0 !important; 
                                padding: 0 !important; 
                                background: white !important;
                                height: auto !important;
                                min-height: initial !important;
                                overflow: visible !important;
                                width: 100% !important;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                            /* Force visibility of print container and fix parent clipping */
                            body > div, main, .print-container { 
                                width: 100% !important; 
                                max-width: none !important; 
                                margin: 0 !important; 
                                padding: 0 !important;
                                height: auto !important;
                                min-height: initial !important;
                                overflow: visible !important;
                                display: block !important;
                                position: relative !important;
                            }
                            .print\\:hidden, header, nav, footer, button, .no-print { 
                                display: none !important; 
                            }
                            /* Ensure paper components don't clip */
                            .quotation-paper-modern, .bg-white {
                                overflow: visible !important;
                                height: auto !important;
                                min-height: initial !important;
                                display: block !important;
                            }
                        }
                    ` }} />
                <div className="bg-white w-full">
                    {layout === 'modern' ? (
                        <QuotationModernPaper quotation={quotation} brandConfig={brandConfig} />
                    ) : (
                        <QuotationDocumentPaper quotation={quotation} brandConfig={brandConfig} />
                    )}
                </div>
            </div>
        </div>
    )
}
