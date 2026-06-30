'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@repo/ui'
import { formatCurrency, formatDate, readNumberToWords } from '@/lib/utils/format'
import { CheckCircle, CheckCircle2, XCircle, Building2, Calendar, FileText, User, Mail, Phone, Globe, Info, CreditCard, MapPin, Printer, Target, ClipboardList, Lightbulb, Package, Users, Clock, Shield, Award, BookOpen, Layout, FileSignature, ExternalLink, LinkIcon, File } from 'lucide-react'
import { LoadingSpinner } from '@repo/ui'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@repo/ui'
import { Input } from '@repo/ui'
import { Label } from '@repo/ui'
import { toast } from 'sonner'
import { updateQuotationStatus } from '@/lib/supabase/services/portal-actions'
import { cn } from '@/lib/utils'
import { QuotationDocumentPaper } from '@/components/quotations/quotation-document-paper'
import { Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Separator } from '@repo/ui'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@repo/ui'
import { Check } from 'lucide-react'
import { useQuotationTracking } from '@/hooks/use-quotation-tracking'

import { Checkbox } from '@repo/ui'

// Add missing types for PDF libs
declare global {
    interface Window {
        html2canvas: any;
        jspdf: any;
    }
}

interface QuotationContentProps {
    quotation: any
    brandConfig?: any
}

export function QuotationContent({ quotation: initialQuotation, brandConfig }: QuotationContentProps) {
    const [currentQuotation, setCurrentQuotation] = useState(initialQuotation)
    const [showConfirm, setShowConfirm] = useState(false)
    const [showReject, setShowReject] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [viewMode, setViewMode] = useState<'modern' | 'basic'>('modern')

    // View tracking
    const { trackInteraction } = useQuotationTracking(initialQuotation.id)

    const [confirmer, setConfirmer] = useState({
        name: '',
        email: '',
        phone: '',
        position: ''
    })

    const isPortalMode = !!(initialQuotation as any)._isPortalMode
    const rawPortalTitle = (initialQuotation as any)._portalTitle || ''
    const portalTitle = rawPortalTitle || 'Danh sách Báo giá'
    
    // Auto-detect item label based on portal title
    const isVariantMode = isPortalMode && portalTitle.toLowerCase().includes('phương án')
    const itemLabel = (isPortalMode && !isVariantMode) ? 'Báo giá' : 'Phương án'
    const sectionLabel = (isPortalMode && !isVariantMode) ? 'Hạng mục Báo giá' : 'Đề xuất Giải pháp'

    // Sibling-related helpers - Filter by visibility (is_recommended)
    const allSiblings = (initialQuotation as any).siblings || []
    const siblings = allSiblings.filter((s: any) => s.is_recommended !== false)
    const activeOptions = siblings.filter((s: any) => ['draft', 'sent', 'viewed'].includes(s.status))
    const historyItems = siblings.filter((s: any) => ['accepted', 'rejected', 'expired', 'converted'].includes(s.status))

    // Automatically show accepted one if it exists among siblings
    useEffect(() => {
        const acceptedQuotation = siblings.find((s: any) => s.status === 'accepted')
        if (acceptedQuotation && currentQuotation.status !== 'accepted') {
            setCurrentQuotation(acceptedQuotation)
        }
    }, [initialQuotation, siblings, currentQuotation.status])

    const handleConfirm = async () => {
        if (!confirmer.name || !confirmer.phone) {
            toast.error("Vui lòng nhập tên và số điện thoại")
            return
        }

        setIsSubmitting(true)
        try {
            trackInteraction('accept', { confirmerName: confirmer.name })
            const res = await updateQuotationStatus(currentQuotation.id, 'accepted', {
                ...confirmer,
                selectedItemIds: selectedItemIds
            })
            if (res?.success) {
                toast.success("Đã xác nhận chấp nhận báo giá thành công")
                setShowConfirm(false)
                window.location.reload()
            } else {
                toast.error(res?.error || "Lỗi khi xác nhận")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRejectSubmit = async () => {
        if (!rejectReason.trim()) {
            toast.error("Vui lòng nhập lý do từ chối")
            return
        }

        setIsSubmitting(true)
        try {
            trackInteraction('reject', { reason: rejectReason })
            const res = await updateQuotationStatus(currentQuotation.id, 'rejected', { reason: rejectReason })
            if (res?.success) {
                toast.success("Đã gửi phản hồi từ chối báo giá")
                setShowReject(false)
                window.location.reload()
            } else {
                toast.error(res?.error || "Lỗi khi xử lý")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const items = currentQuotation.items || []
    const hasDiscount = items.some((item: any) => item.discount > 0)

    const [selectedItemIds, setSelectedItemIds] = useState<string[]>(() => {
        const initialSelected: string[] = [];
        const seenGroups = new Set<string>();
        items.forEach((item: any) => {
            if (!item.is_optional) {
                if (item.alternative_group && item.alternative_group.trim() !== '') {
                    const groupKey = item.alternative_group.trim().toLowerCase();
                    if (!seenGroups.has(groupKey)) {
                        seenGroups.add(groupKey);
                        initialSelected.push(item.id);
                    }
                } else {
                    initialSelected.push(item.id);
                }
            }
        });
        return initialSelected;
    });

    const toggleItem = (itemId: string, alternativeGroup?: string) => {
        setSelectedItemIds(prev => {
            const isSelected = prev.includes(itemId);

            // If it's part of an alternative group, we switch to it
            if (alternativeGroup && alternativeGroup.trim() !== '') {
                const groupKey = alternativeGroup.trim().toLowerCase();
                // Get all other items in the same group
                const otherInGroup = items
                    .filter((i: any) => i.alternative_group?.trim().toLowerCase() === groupKey && i.id !== itemId)
                    .map((i: any) => i.id);

                // Remove others, add this one
                const filtered = prev.filter(id => !otherInGroup.includes(id));
                if (isSelected) {
                    return filtered.filter(id => id !== itemId);
                } else {
                    return [...filtered, itemId];
                }
            }

            // Normal toggle
            if (isSelected) {
                return prev.filter(id => id !== itemId);
            } else {
                return [...prev, itemId];
            }
        });
    }

    // Calculations based on current selection
    const selectedItems = items.filter((item: any) => selectedItemIds.includes(item.id));
    const subtotalRaw = selectedItems.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0)
    const subtotalNet = selectedItems.reduce((sum: number, item: any) => sum + (item.total_price || (item.quantity * item.unit_price * (1 - (item.discount || 0) / 100))), 0)
    const totalDiscount = subtotalRaw - subtotalNet
    const vatPercent = currentQuotation.vat_percent || 0
    const vatAmount = subtotalNet * (vatPercent / 100)
    const finalAmount = subtotalNet + vatAmount

    // Helper: Group items by section_name
    const sections: Record<string, any[]> = items.reduce((acc: any, item: any) => {
        const sectionName = item.section_name || '';
        if (!acc[sectionName]) acc[sectionName] = [];
        acc[sectionName].push(item);
        return acc;
    }, {});

    const sectionEntries = Object.entries(sections).sort((a, b) => {
        // Keep '' (no section) at the end or handle sorting by sort_order of first item
        if (a[0] === '') return 1;
        if (b[0] === '') return -1;
        return a[1][0].sort_order - b[1][0].sort_order;
    });

    // Icon mapping for proposal section types
    const sectionIcons: Record<string, React.ReactNode> = {
        'Mục tiêu & Giới thiệu': <Target className="w-4 h-4" />,
        'Phạm vi công việc (Scope of Work)': <ClipboardList className="w-4 h-4" />,
        'Phương pháp & Cách tiếp cận': <Lightbulb className="w-4 h-4" />,
        'Sản phẩm bàn giao (Deliverables)': <Package className="w-4 h-4" />,
        'Đội ngũ chuyên trách': <Users className="w-4 h-4" />,
        'Lộ trình triển khai (Timeline)': <Clock className="w-4 h-4" />,
        'Bảo hành & Hỗ trợ': <Shield className="w-4 h-4" />,
        'Vì sao chọn chúng tôi?': <Award className="w-4 h-4" />,
        'Case Studies & Portfolio': <BookOpen className="w-4 h-4" />,
    };

    // Proposal content helpers
    const pc = currentQuotation.proposal_content || {}
    const hasProposal = currentQuotation.type === 'proposal' && pc

    const handlePrint = () => {
        trackInteraction('print')
        window.print();
    };


    // Build proposal sections for rendering
    const proposalSections: { label: string; content: string }[] = []
    if (hasProposal) {
        if (pc.sections && Array.isArray(pc.sections) && pc.sections.length > 0) {
            // New format: respect the sections array and its custom labels exactly
            pc.sections.forEach((s: any) => {
                if (s.label && s.content && String(s.content).trim().length > 0) {
                    proposalSections.push({ label: s.label, content: s.content })
                }
            })
        } else {
            // Legacy fallback format
            if (pc.introduction) proposalSections.push({ label: 'Mục tiêu & Giới thiệu', content: pc.introduction })
            if (pc.scope_of_work) proposalSections.push({ label: 'Phạm vi công việc (Scope of Work)', content: pc.scope_of_work })
            if (pc.methodology) proposalSections.push({ label: 'Phương pháp & Cách tiếp cận', content: pc.methodology })
            if (pc.deliverables) proposalSections.push({ label: 'Sản phẩm bàn giao (Deliverables)', content: pc.deliverables })
            if (pc.team) proposalSections.push({ label: 'Đội ngũ chuyên trách', content: pc.team })
            if (pc.timeline) proposalSections.push({ label: 'Lộ trình triển khai (Timeline)', content: pc.timeline })
            if (pc.warranty) proposalSections.push({ label: 'Bảo hành & Hỗ trợ', content: pc.warranty })
            if (pc.why_us) proposalSections.push({ label: 'Vì sao chọn chúng tôi?', content: pc.why_us })
            if (pc.case_studies) proposalSections.push({ label: 'Case Studies & Portfolio', content: pc.case_studies })
            if (pc.custom_sections) {
                try {
                    const custom = typeof pc.custom_sections === 'string' ? JSON.parse(pc.custom_sections) : pc.custom_sections
                    if (Array.isArray(custom)) {
                        custom.forEach((s: any) => {
                            if (s.title && s.content) proposalSections.push({ label: s.title, content: s.content })
                        })
                    }
                } catch (e) { /* skip unparseable */ }
            }
        }
    }

    const hasSidebar = activeOptions.length > 1 || (historyItems && historyItems.length > 0) || (currentQuotation.attachments && currentQuotation.attachments.length > 0);
    const attachments = currentQuotation.attachments || [];

    return (
        <div className="quotation-page min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col xl:flex-row">
            {/* Sidebar (Desktop left, Mobile top) */}
            {hasSidebar && (
                <div className="w-full xl:w-[420px] shrink-0 border-b xl:border-b-0 xl:border-r border-slate-200 bg-white shadow-[1px_0_15px_-5px_rgba(0,0,0,0.05)] xl:sticky xl:top-0 h-auto xl:h-screen xl:overflow-y-auto print:hidden z-10 flex flex-col">
                    <div className="p-4 sm:p-5 xl:p-6 space-y-6 flex-1">
                        
                        {/* Options Section inside Sidebar */}
                        {activeOptions.length > 1 && (
                            <Card className="border-slate-200 shadow-sm overflow-hidden">
                                <CardHeader className="px-5 py-4 pb-0 space-y-2">
                                    <div className="flex items-center gap-1.5 w-fit rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                                        <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                                        {activeOptions.length} {sectionLabel}
                                    </div>
                                    <CardTitle className="text-xl font-bold text-slate-900 leading-none">
                                        {isPortalMode ? portalTitle : 'Lựa chọn phương án'}
                                    </CardTitle>
                                    <CardDescription className="text-[13.5px] leading-relaxed text-slate-500">
                                        {isPortalMode && !isVariantMode
                                            ? `Tổng hợp ${activeOptions.length} hạng mục báo giá thuộc dự án này.` 
                                            : `Dựa trên yêu cầu của bạn, chúng tôi đề xuất ${activeOptions.length} phương án tối ưu. Vui lòng bấm chọn để xem báo giá chi tiết.`}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="px-5 py-4 pt-3">
                                    <Separator className="mb-4" />
                                    <div className="flex flex-col gap-3.5">
                                        {activeOptions.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((opt: any, idx: number) => {
                                        const isActive = currentQuotation.id === opt.id;
                                        return (
                                            <div
                                                key={opt.id}
                                                onClick={() => {
                                                    setCurrentQuotation(opt);
                                                    setSelectedItemIds(() => {
                                                        const init: string[] = [];
                                                        const seen = new Set();
                                                        (opt.items || []).forEach((i: any) => {
                                                            if (!i.is_optional) {
                                                                if (i.alternative_group && i.alternative_group.trim()) {
                                                                    const key = i.alternative_group.trim().toLowerCase();
                                                                    if (!seen.has(key)) { seen.add(key); init.push(i.id); }
                                                                } else { init.push(i.id); }
                                                            }
                                                        });
                                                        return init;
                                                    });
                                                    
                                                    setTimeout(() => {
                                                        const paperElement = document.getElementById('quotation-paper-wrapper');
                                                        if (paperElement) {
                                                            const y = paperElement.getBoundingClientRect().top + window.scrollY - 20;
                                                            window.scrollTo({ top: y, behavior: 'smooth' });
                                                        }
                                                    }, 100);
                                                }}
                                                className={cn(
                                                    "cursor-pointer transition-all duration-200 relative group flex flex-col justify-between rounded-xl p-4 border",
                                                    isActive 
                                                        ? "border-slate-900 bg-white shadow-sm" 
                                                        : "border-slate-200 bg-slate-50/50 shadow-sm hover:border-slate-300 hover:bg-white hover:shadow-md"
                                                )}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <Badge variant={isActive ? "default" : "outline"} className={cn("text-[11px] font-medium border", !isActive && "text-slate-600 bg-white")}>
                                                        {itemLabel} {idx + 1}
                                                    </Badge>
                                                    
                                                    {isActive && (
                                                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                                            Đang xem
                                                        </div>
                                                    )}
                                                </div>
                                                <h4 className={cn("text-base font-bold leading-tight ", isActive ? "text-slate-900" : "text-slate-800")}>
                                                    {opt.title || `Gói tùy chọn ${idx + 1}`}
                                                </h4>
                                                
                                                {opt.notes && (
                                                    <p className="text-[13px] text-muted-foreground mt-1 line-clamp-1">{opt.notes.split('\n')[0]}</p>
                                                )}

                                                <Separator className={cn("my-3")} />
                                                
                                                <div className="flex items-end justify-between">
                                                    <div>
                                                        <div className="text-[11px] font-medium text-muted-foreground mb-0.5">
                                                            Tổng đầu tư
                                                        </div>
                                                        <div className="text-xl font-bold tabular-nums text-slate-900 leading-none">
                                                            {formatCurrency(opt.total_amount)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
            
                        {/* History Timeline inside Sidebar */}
                        {historyItems && historyItems.length > 0 && (
                            <Card className="border-slate-200 shadow-sm overflow-hidden">
                                <CardHeader className="px-5 py-4 pb-0 flex flex-row items-start gap-4 space-y-0 relative z-10 bg-white">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col gap-1 pt-0.5">
                                        <CardTitle className="text-lg sm:text-[19px] font-bold text-slate-900 leading-none">
                                            Lịch sử phiên bản
                                        </CardTitle>
                                        <CardDescription className="text-[13px] text-slate-500 font-medium leading-relaxed mt-1">
                                            Các bản thảo & phê duyệt trước đây
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-5 py-4 pt-4">
                                    <Separator className="mb-5" />
                                    <div className="relative pl-7 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-px before:bg-slate-200">
                                        {historyItems.map((item: any, i: number) => {
                                            const isActive = currentQuotation.id === item.id;
                                            return (
                                            <div key={item.id} className="relative mb-5 last:mb-0 group cursor-pointer" onClick={() => {
                                                setCurrentQuotation(item);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}>
                                                {/* Timeline dot/icon */}
                                                <div className={cn(
                                                    "absolute -left-7 top-0.5 w-5 h-5 rounded-full border-[3px] border-white z-10 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm",
                                                    item.status === 'accepted' ? "bg-emerald-500" :
                                                        item.status === 'rejected' ? "bg-rose-500" : "bg-slate-400"
                                                )}>
                                                    {item.status === 'accepted' ? <Check className="w-2.5 h-2.5 text-white stroke-[3]" /> :
                                                        item.status === 'rejected' ? <XCircle className="w-2.5 h-2.5 text-white" /> :
                                                            <FileText className="w-2.5 h-2.5 text-white" />}
                                                </div>

                                                <div className={cn(
                                                    "rounded-xl border p-3.5 transition-all shadow-sm group-hover:shadow-md outline outline-[1.5px] -outline-offset-1 outline-transparent flex items-center justify-between gap-3 bg-white",
                                                    isActive 
                                                        ? "border-emerald-200 outline-emerald-500/50 bg-emerald-50/30" 
                                                        : "border-slate-200 group-hover:border-slate-300"
                                                )}>
                                                    <div className="flex flex-col gap-1.5 overflow-hidden flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className={cn("font-bold text-sm truncate", isActive ? "text-emerald-900" : "text-slate-900")}>
                                                                #{item.quotation_number}
                                                            </span>
                                                            <span className={cn("text-[13px] font-semibold truncate max-w-[150px] sm:max-w-none", isActive ? "text-emerald-800" : "text-slate-700")}>
                                                                {item.title || item.version_name || 'Bản chào giá'}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                                                                <Calendar className="w-3 h-3 text-slate-400" />
                                                                {formatDate(item.created_at)}
                                                            </div>

                                                            <Badge variant="secondary" className={cn(
                                                                "text-[9px] px-1.5 py-0 font-bold leading-tight border shrink-0",
                                                                item.status === 'accepted' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                                    item.status === 'rejected' ? "bg-rose-50 text-rose-700 border-rose-200" : 
                                                                    item.status === 'converted' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-600 border-slate-200"
                                                            )}>
                                                                {item.status === 'accepted' ? 'Đã chấp nhận' : 
                                                                 item.status === 'rejected' ? 'Đã từ chối' : 
                                                                 item.status === 'converted' ? 'Đã chuyển đổi' : 
                                                                 item.status === 'expired' ? 'Hết hạn' : item.status}
                                                            </Badge>
                                                        </div>

                                                        {item.status === 'converted' && item.contracts?.[0] && (
                                                            <div className="mt-0.5 flex items-center gap-1 text-[10px] text-blue-600 font-bold italic">
                                                                <FileSignature className="w-3 h-3" />
                                                                Đã chuyển thành {item.contracts[0].type === 'order' ? 'Đơn hàng' : 'Hợp đồng'} {item.contracts[0].contract_number || item.contracts[0].order_number}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="shrink-0 flex flex-col items-end gap-1">
                                                        <span className={cn("text-[15px] font-bold tabular-nums ", isActive ? "text-emerald-900" : "text-slate-900")}>
                                                            {formatCurrency(item.total_amount)}
                                                        </span>
                                                        <span className={cn("text-[11px] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", isActive ? "text-emerald-600" : "text-slate-600 hover:text-slate-900")}>
                                                            Xem lại <ExternalLink className="w-3 h-3" />
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )})}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Attachments inside Sidebar */}
                        {attachments.length > 0 && (
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="px-5 py-4 pb-0 border-b border-transparent">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-slate-500" />
                                        <CardTitle className="text-sm font-semibold text-slate-900 leading-none">
                                            Tài liệu đính kèm
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-xs text-slate-500 mt-1.5 font-medium">
                                        Links demo, proposal & tài liệu liên quan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="px-5 pb-5 pt-2">
                                    <div className="flex flex-col gap-2">
                                        {attachments.map((item: any) => (
                                            <a 
                                                key={item.id}
                                                href={item.url} 
                                                target="_blank" 
                                                rel="noreferrer noopener"
                                                className="flex items-center gap-3 p-3 border rounded-md bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors group shadow-sm"
                                            >
                                                <div className="h-8 w-8 shrink-0 bg-slate-100 border border-slate-200/60 rounded-md flex items-center justify-center text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700 transition-colors">
                                                    {item.type === 'link' ? <LinkIcon className="h-3.5 w-3.5" /> : <File className="h-3.5 w-3.5" />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[13px] font-medium text-slate-900 truncate leading-tight">{item.name}</p>
                                                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{item.type === 'link' ? 'Liên kết ngoài' : 'Tệp đính kèm'}</p>
                                                </div>
                                                <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* -- END OF SIDEBAR OPTIONS -- */}

                    </div>
                    {/* Bottom padding for sidebar scroll (accounts for sticky footer) */}
                    <div className="h-28 shrink-0"></div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 bg-slate-50 relative pb-32 xl:pb-28 h-auto xl:h-screen xl:overflow-y-auto w-full">
            
            {/* Global print style enforcement */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                        font-family: var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, "MS Gothic", sans-serif !important;
                    }
                    [style*="font-family"] {
                        font-family: 'DFVN Neue Kaine', var(--font-sans), sans-serif !important;
                    }
                    body { background: #e5e7eb; }
                    .quotation-paper { box-shadow: none !important; margin: 0 !important; }
                    .print\\:hidden { display: none !important; }
                }
            `}} />

            {/* View Mode Toggle */}
            <div id="quotation-paper-wrapper" className="max-w-5xl mx-auto mb-4 flex items-center justify-end gap-2 print:hidden px-4 xl:px-0 pt-6">
                <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white shadow-sm p-1 gap-1">
                    <button
                        onClick={() => setViewMode('modern')}
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-2 rounded-md text-[13px] font-medium transition-all duration-200",
                            viewMode === 'modern'
                                ? "bg-slate-900 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        )}
                    >
                        <Layout className="w-3.5 h-3.5" />
                        Chế độ xem Web
                    </button>
                    <button
                        onClick={() => setViewMode('basic')}
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-2 rounded-md text-[13px] font-medium transition-all duration-200",
                            viewMode === 'basic'
                                ? "bg-slate-900 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        )}
                    >
                        <FileSignature className="w-3.5 h-3.5" />
                        Bản in PDF
                    </button>
                </div>
            </div>

            {/* A4 Container */}
            {viewMode === 'basic' ? (
                <div className="quotation-paper quotation-paper--basic mx-auto bg-white shadow-lg rounded-xl border border-slate-200/60 relative w-full max-w-5xl overflow-x-auto">
                    <QuotationDocumentPaper quotation={currentQuotation} brandConfig={brandConfig} selectedItemIds={selectedItemIds} />
                </div>
            ) : (
            <div
                className="quotation-paper quotation-paper--modern mx-auto bg-white shadow-lg rounded-xl border border-slate-200/60 relative w-full max-w-5xl overflow-x-auto"
            >

                <div className="quotation-inner p-6 sm:p-10">
                    <div>
                        {/* Header Section - Modern & Bilingual */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-0">
                            <div className="flex flex-col items-start w-full sm:w-[65%]">
                                {/* Logo Section - Height matches Title for alignment */}
                                <div className="h-20 sm:h-24 flex items-end mb-4 overflow-visible">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={brandConfig?.logo_url || "/file/tulie-agency-logo.png"}
                                        alt={brandConfig?.brand_name || "Tulie Agency"}
                                        className="h-16 sm:h-20 w-auto object-contain grayscale"
                                    />
                                </div>

                                <div className="space-y-1.5 w-full">
                                    <h1 className="text-xs sm:text-sm font-bold text-black leading-tight sm:leading-none sm:h-4 flex items-center">
                                        {brandConfig?.company_name || "Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie"}
                                    </h1>

                                    <div className="flex items-start gap-2 text-[12px] sm:text-[13px] text-slate-700 leading-snug">
                                        <MapPin className="h-3 w-3 mt-1 shrink-0" />
                                        <span>{brandConfig?.address || "Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, Thành phố Hà Nội, Việt Nam"}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-slate-700">
                                        <Phone className="h-3 w-3 shrink-0" />
                                        <span>{brandConfig?.hotline || "098.898.4554"}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-slate-700">
                                        <Mail className="h-3 w-3 shrink-0" />
                                        <span>{brandConfig?.email || "support@tulielab.vn"}</span>
                                    </div>

                                    {brandConfig?.tax_code && (
                                        <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-slate-700">
                                            <FileText className="h-3 w-3 shrink-0" />
                                            <span>MST: {brandConfig.tax_code}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-left sm:text-right w-full sm:w-auto">
                                {/* Title Section - Height matches Logo for alignment */}
                                <div className="h-auto sm:h-24 flex flex-col justify-end mb-4">
                                    <h2 className="text-4xl sm:text-5xl font-bold text-black leading-none" style={{ fontFamily: "'DFVN Neue Kaine', sans-serif" }}>Báo giá</h2>
                                    <p className="text-xl sm:text-2xl text-black font-medium mt-1" style={{ fontFamily: "'DFVN Neue Kaine', sans-serif" }}>Quotation</p>
                                </div>

                                <div className="space-y-0.5 text-[12px] sm:text-[13px] text-black">
                                    <p className="flex sm:justify-end gap-1 h-4 items-center">
                                        <span className="font-medium text-black">Số<span className="text-[0.8em] italic font-normal opacity-70">/ No</span>:</span>
                                        <span>{currentQuotation.quotation_number}</span>
                                    </p>
                                    <p className="flex sm:justify-end gap-1 h-4 items-center">
                                        <span className="font-medium text-black">Ngày<span className="text-[0.8em] italic font-normal opacity-70">/ Date</span>:</span>
                                        <span>{formatDate(currentQuotation.created_at)}</span>
                                    </p>
                                    <p className="flex sm:justify-end gap-1 h-4 items-center">
                                        <span className="font-medium text-black">Hết hạn<span className="text-[0.8em] italic font-normal opacity-70">/ Valid until</span>:</span>
                                        <span>{formatDate(currentQuotation.valid_until)}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <Separator className="my-6" />

                        <div className="mb-6">
                            <h3 className="text-[13px] font-semibold text-slate-900 mb-3 border-l-[3px] border-slate-900 pl-3 leading-none flex items-center gap-1">
                                Thông tin khách hàng
                                <span className="text-[12px] italic font-normal text-muted-foreground">/ Customer</span>
                            </h3>
                            <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-200 flex flex-col gap-2.5 text-[13px]">
                                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1">
                                    <span className="text-muted-foreground font-medium">Đơn vị:</span>
                                    <span className="font-semibold text-slate-900">{currentQuotation.customer?.company_name || currentQuotation.customer?.full_name || currentQuotation.customer?.name || "N/A"}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1">
                                    <span className="text-muted-foreground font-medium">Địa chỉ:</span>
                                    <span className="text-slate-700">{currentQuotation.customer?.address || "N/A"}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1">
                                    <span className="text-muted-foreground font-medium">Người liên hệ:</span>
                                    <span className="font-medium text-slate-900">{currentQuotation.customer?.representative || currentQuotation.customer?.contact_name || currentQuotation.customer?.full_name || "N/A"}</span>
                                </div>
                                {currentQuotation.customer?.tax_code && (
                                    <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1">
                                        <span className="text-muted-foreground font-medium">Mã số thuế:</span>
                                        <span className="text-slate-700">{currentQuotation.customer.tax_code}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Proposal Content - Premium Timeline Style */}
                        {hasProposal && proposalSections.length > 0 && (
                            <div className="mb-10">
                                {/* Proposal Header */}
                                <Card className="mb-6 border-slate-900 bg-slate-900 text-white overflow-hidden"
                                    style={{ WebkitPrintColorAdjust: 'exact' }}>
                                    <CardContent className="p-5">
                                        <h3 className="text-[15px] font-bold">Đề xuất giải pháp</h3>
                                        <p className="text-[12px] text-slate-400 mt-0.5 font-medium">Proposal — {proposalSections.length} hạng mục</p>
                                    </CardContent>
                                </Card>

                                {/* Timeline Steps */}
                                <div className="relative pl-8 before:absolute before:left-[11px] before:top-[24px] before:bottom-2 before:w-[2px] before:bg-slate-200 before:rounded-full">
                                    {proposalSections.map((section, idx) => {
                                        const icon = sectionIcons[section.label] || <Info className="w-4 h-4" />;
                                        return (
                                            <div key={idx} className="proposal-section relative mb-8 last:mb-0 flex items-start p-0">
                                                {/* Timeline dot */}
                                                <div className="absolute -left-8 top-6 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white bg-slate-900 text-[10px] font-bold z-10"
                                                    style={{ WebkitPrintColorAdjust: 'exact' }}>
                                                    {idx + 1}
                                                </div>

                                                <div className="flex-1 border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden m-0">
                                                    {/* Header - Flush with top */}
                                                    <div className="flex items-center gap-3 px-4 h-12 border-b bg-slate-50 border-slate-100 text-foreground"
                                                        style={{ WebkitPrintColorAdjust: 'exact' }}>
                                                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white shadow-sm"
                                                            style={{ WebkitPrintColorAdjust: 'exact' }}>
                                                            {icon}
                                                        </div>
                                                        <h4 className="text-[14px] font-bold leading-none">
                                                            {section.label}
                                                        </h4>
                                                    </div>
                                                    
                                                    {/* Body */}
                                                    <div className="px-6 py-5">
                                                        <div className="text-[12px] text-slate-700 leading-relaxed space-y-2">
                                                            {section.content.split('\n').filter((line: string) => line.trim()).map((line: string, i: number) => (
                                                                <div key={i} className="flex gap-2.5 pl-1 items-start">
                                                                    <div className="shrink-0 mt-[7px]">
                                                                        <div className="w-1 h-1 rounded-full bg-slate-400" />
                                                                    </div>
                                                                    <span className="flex-1 font-medium text-slate-800">{line.replace(/^[•\-\*]\s*/, '')}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Investment Details Table */}
                        <div className="mb-8 pt-6 border-t border-slate-100/50 mt-2">
                            <h3 className="text-[14px] font-bold text-slate-900 mb-6 border-l-[3px] border-slate-900 pl-3 flex items-center">
                                <span className="text-primary mr-2">{hasProposal ? `${proposalSections.length + 1}.` : ''}</span>
                                {hasProposal ? 'Kế hoạch đầu tư' : 'Chi tiết dịch vụ'}
                                {!hasProposal && <span className="text-[12px] italic font-normal text-muted-foreground ml-1">/ Service Details</span>}
                                {hasProposal && <span className="text-[11px] italic font-normal text-muted-foreground ml-2">(Investment Plan)</span>}
                            </h3>
                            <div className="border border-slate-200 rounded-lg overflow-x-auto">
                                <table className="w-full text-left border-collapse text-[11px] min-w-[900px]">
                                    <thead>
                                        <tr className="text-white shadow-sm table-header-gradient" style={{ background: "url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(255,255,255,0.12)'/%3E%3C/svg%3E\"), linear-gradient(to right, #09090b, #171717, #404040)", WebkitPrintColorAdjust: 'exact' }}>
                                            <th className="py-2.5 px-1 font-semibold w-10 text-center normal-case print:hidden whitespace-nowrap">Chọn</th>
                                            <th className="py-2.5 px-1 font-semibold w-10 text-center normal-case whitespace-nowrap">#</th>
                                            <th className="py-2.5 px-3 font-semibold normal-case" style={{ width: '100%' }}>
                                                Hạng mục & Mô tả chi tiết <br />
                                                <span className="text-[0.8em] font-normal opacity-60 italic normal-case">/ Items & Description</span>
                                            </th>
                                            <th className="py-2.5 px-3 font-semibold text-center w-20 normal-case whitespace-nowrap">
                                                ĐVT <br />
                                                <span className="text-[0.8em] font-normal opacity-60 italic normal-case">/ Unit</span>
                                            </th>
                                            <th className="py-2.5 px-3 font-semibold text-center w-20 normal-case whitespace-nowrap">
                                                SL <br />
                                                <span className="text-[0.8em] font-normal opacity-60 italic normal-case">/ Qty</span>
                                            </th>
                                            <th className="py-2.5 px-3 font-semibold text-right w-24 normal-case whitespace-nowrap">
                                                Đơn giá <br />
                                                <span className="text-[0.8em] font-normal opacity-60 italic normal-case">/ Unit Price</span>
                                            </th>
                                            {hasDiscount && <th className="py-2.5 px-2 font-semibold text-center w-14 normal-case text-[10px] whitespace-nowrap">CK(%)<br /><span className="text-[0.8em] font-normal opacity-60 italic">/ Disc.</span></th>}
                                            {hasDiscount && <th className="py-2.5 px-2 font-semibold text-right w-24 normal-case text-[10px] whitespace-nowrap">Giảm giá<br /><span className="text-[0.8em] font-normal opacity-60 italic">/ Discount</span></th>}
                                            <th className="py-2.5 px-3 font-semibold text-right w-28 normal-case whitespace-nowrap">
                                                Thành tiền <br />
                                                <span className="text-[0.8em] font-normal opacity-60 italic normal-case">/ Amount</span>
                                            </th>
                                            <th className="py-2.5 px-2 font-semibold text-center w-16 normal-case text-[10px] whitespace-nowrap">
                                                Thuế VAT<br />
                                                <span className="text-[0.8em] font-normal opacity-60 italic">/ Tax</span>
                                            </th>
                                            <th className="py-2.5 px-3 font-semibold text-right w-28 normal-case whitespace-nowrap">
                                                Thành tiền<br />
                                                <span className="text-[0.8em] font-normal opacity-60 italic normal-case">/ Total</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {sectionEntries.map(([sectionName, sectionItems], sectionIndex) => (
                                            <React.Fragment key={sectionIndex}>
                                                {sectionName && (
                                                    <tr className="bg-slate-100 border-b border-slate-200">
                                                        <td className="print:hidden w-10"></td>
                                                        <td className="w-10 py-2.5 whitespace-nowrap">
                                                            <div className="w-6 h-6 rounded-md bg-slate-900 text-white text-[11px] font-semibold flex items-center justify-center mx-auto"
                                                                style={{ WebkitPrintColorAdjust: 'exact' }}>
                                                                {sectionIndex + 1}
                                                            </div>
                                                        </td>
                                                        <td colSpan={hasDiscount ? 9 : 7} className="px-3 py-2.5 font-semibold text-slate-900 text-[13px] normal-case">
                                                            <span>{sectionName || "Sản phẩm & Dịch vụ chi tiết"}</span>
                                                        </td>
                                                    </tr>
                                                )}

                                                {(() => {
                                                    const sortedItems = sectionItems.sort((a: any, b: any) => a.sort_order - b.sort_order);
                                                    let selectedCounter = 0;
                                                    return sortedItems.map((item: any, index: number) => {
                                                    const isSelected = selectedItemIds.includes(item.id);
                                                    const isAlternative = item.alternative_group && item.alternative_group.trim() !== '';
                                                    if (isSelected) selectedCounter++;
                                                    const displayNumber = isSelected ? selectedCounter : null;

                                                    return (
                                                        <tr key={`${sectionIndex}-${index}`} className={cn(
                                                            "quotation-item-row transition-all duration-200",
                                                            !isSelected && "bg-slate-50 opacity-40 grayscale-[0.5] print:hidden",
                                                            isSelected && "hover:bg-slate-50/50"
                                                        )}>
                                                            <td className="w-10 text-center py-2 align-top print:hidden whitespace-nowrap">
                                                                <div className="flex items-center justify-center">
                                                                    <Checkbox
                                                                        checked={isSelected}
                                                                        onCheckedChange={() => toggleItem(item.id, item.alternative_group)}
                                                                        className="h-5 w-5 rounded-full transition-all data-[state=checked]:bg-zinc-950 data-[state=checked]:border-zinc-950 ring-offset-background [&_svg]:stroke-[3px] [&_svg]:text-white"
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td className="w-10 text-center py-2 align-top whitespace-nowrap">
                                                                <span className="text-xs font-medium text-slate-400 tabular-nums leading-tight">{sectionName ? `${sectionIndex + 1}.${displayNumber ?? (index + 1)}` : displayNumber ?? (index + 1)}</span>
                                                            </td>
                                                            <td className="px-3 align-top py-2">
                                                                <div className="flex flex-col gap-1">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <p className="font-semibold text-slate-900 leading-tight">{item.product_name}</p>
                                                                        {item.is_optional && (
                                                                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-input bg-muted text-muted-foreground font-bold">Tùy chọn</Badge>
                                                                        )}
                                                                        {isAlternative && (
                                                                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-input bg-muted text-zinc-700 font-bold">
                                                                                {item.alternative_group}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    {item.description && (
                                                                        <div className="text-slate-600 text-[11px] leading-relaxed mt-1 space-y-0.5">
                                                                            {item.description.split('\n').filter((line: string) => line.trim()).map((line: string, di: number) => (
                                                                                <div key={di} className="flex gap-1.5">
                                                                                    <span className="shrink-0 text-slate-400 text-[13px] leading-none mt-[2px]">•</span>
                                                                                    <span className="italic">{line.replace(/^[•\-\*]\s*/, '')}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-3 text-center text-slate-600 align-top py-2 whitespace-nowrap">{item.unit}</td>
                                                            <td className="px-3 text-center text-slate-600 align-top py-2 whitespace-nowrap">{item.quantity}</td>
                                                            <td className="px-3 text-right text-slate-600 align-top py-2 whitespace-nowrap">{formatCurrency(item.unit_price)}</td>
                                                            {hasDiscount && (
                                                                <td className="px-2 text-center text-slate-500 align-top py-2 text-[10px] whitespace-nowrap">{item.discount || 0}%</td>
                                                            )}
                                                            {hasDiscount && (
                                                                <td className="px-2 text-right text-slate-500 align-top py-2 text-[10px] whitespace-nowrap">
                                                                    {formatCurrency((item.quantity * item.unit_price * (item.discount || 0)) / 100)}
                                                                </td>
                                                            )}
                                                            <td className="px-3 text-right font-medium text-slate-700 align-top py-2 whitespace-nowrap">
                                                                {formatCurrency(item.quantity * item.unit_price * (1 - (item.discount || 0) / 100))}
                                                            </td>
                                                            <td className="px-2 text-center text-slate-500 align-top py-2 text-[10px] whitespace-nowrap">
                                                                {currentQuotation.vat_exempt_status === 'exempt' ? 'KCT' : `${item.vat_percent || 0}%`}
                                                            </td>
                                                            <td className="px-3 text-right font-bold text-slate-900 align-top py-2 whitespace-nowrap">
                                                                {formatCurrency((item.total_price || (item.quantity * item.unit_price * (1 - (item.discount || 0) / 100))) * (1 + (item.vat_percent || 0) / 100))}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                                })()}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 mt-6">
                                <div className="hidden sm:block"></div>
                                <Card className="border-slate-200 shadow-sm">
                                    <CardContent className="p-4 divide-y divide-slate-100">
                                        {totalDiscount > 0 && (
                                            <div className="flex justify-between py-2 text-[13px]">
                                                <span className="text-muted-foreground font-medium">Tạm tính</span>
                                                <span className="font-medium text-slate-900 tabular-nums">{formatCurrency(subtotalRaw)}</span>
                                            </div>
                                        )}
                                        {totalDiscount > 0 && (
                                            <div className="flex justify-between py-2 text-[13px]">
                                                <span className="text-muted-foreground font-medium">Tổng chiết khấu</span>
                                                <span className="text-slate-700 tabular-nums">-{formatCurrency(totalDiscount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between py-2 text-[13px]">
                                            <span className="text-slate-900 font-semibold">Thành tiền trước thuế</span>
                                            <span className="font-semibold text-slate-900 tabular-nums">{formatCurrency(subtotalNet)}</span>
                                        </div>
                                        <div className="flex justify-between py-2 text-[13px]">
                                            <span className="text-muted-foreground font-medium">
                                                {currentQuotation.vat_exempt_status === 'exempt' ? 'Không chịu thuế' : `Tổng thuế VAT (${currentQuotation.vat_percent}%)`}
                                            </span>
                                            <span className="font-medium text-slate-900 tabular-nums">{formatCurrency(vatAmount)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 bg-slate-50 -mx-4 px-4 rounded-b-lg">
                                            <span className="font-bold text-slate-900 text-[15px]">Tổng cộng thanh toán</span>
                                            <span className="font-bold text-xl text-slate-900 tabular-nums">{formatCurrency(finalAmount)}</span>
                                        </div>
                                        <div className="flex justify-between items-start pt-2.5 text-[11px] text-muted-foreground">
                                            <span className="shrink-0 italic">Số tiền viết bằng chữ:</span>
                                            <span className="text-right ml-4 italic">{readNumberToWords(finalAmount)}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>


                            {/* Footer Section: Notes & Bank Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
                                {/* Left Column: Notes & Terms */}
                                <Card className="border-slate-200 shadow-sm">
                                    <CardContent className="p-4 flex flex-col gap-4 h-full">
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-2 text-[13px]">
                                                Ghi chú <span className="text-muted-foreground italic font-normal">/ Notes</span>
                                            </h4>
                                            <div className="text-[12px] text-slate-700 leading-relaxed space-y-1.5">
                                                {pc?.notes && Array.isArray(pc.notes) ? (
                                                    pc.notes.map((note: string, i: number) => (
                                                        <div key={i} className="flex gap-2 items-start">
                                                            <div className="shrink-0 mt-[7px] w-1 h-1 rounded-full bg-slate-400" />
                                                            <span>{note}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    (currentQuotation.notes || brandConfig?.default_notes || 'Báo giá có hiệu lực trong vòng 07 ngày.\nGiá trên chưa bao gồm chi phí mua tên miền & hosting (nếu có).\nNội dung công việc sẽ được mô tả chi tiết trong hợp đồng.').split('\n').filter((line: string) => line.trim()).map((line: string, i: number) => (
                                                        <div key={i} className="flex gap-2 items-start">
                                                            <div className="shrink-0 mt-[7px] w-1 h-1 rounded-full bg-slate-400" />
                                                            <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                        <Separator />
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-2 text-[13px]">
                                                Điều khoản thanh toán <span className="text-muted-foreground italic font-normal">/ Payment Terms</span>
                                            </h4>
                                            <div className="text-[12px] text-slate-700 leading-relaxed space-y-1.5">
                                                {pc?.payment_terms && pc.payment_terms.installments ? (
                                                    <div className="space-y-3">
                                                        <div className="space-y-1.5">
                                                            {pc.payment_terms.installments.map((inst: any, i: number) => (
                                                                <div key={i} className="flex gap-2 items-start">
                                                                    <div className="shrink-0 mt-[7px] w-1 h-1 rounded-full bg-slate-400" />
                                                                    <span><strong>Đợt {inst.phase} ({inst.percent}%):</strong> {inst.description}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 border-dashed">
                                                            {pc.payment_terms.warranty_months && (
                                                                <div className="flex flex-col">
                                                                    <span className="text-[11px] text-slate-500">Bảo hành / Warranty</span>
                                                                    <span className="font-semibold text-slate-900">{pc.payment_terms.warranty_months} tháng</span>
                                                                </div>
                                                            )}
                                                            {pc.payment_terms.sla_response_hours && (
                                                                <div className="flex flex-col">
                                                                    <span className="text-[11px] text-slate-500">Response SLA</span>
                                                                    <span className="font-semibold text-slate-900"><span className="text-lg">≤</span>{pc.payment_terms.sla_response_hours}h</span>
                                                                </div>
                                                            )}
                                                            {pc.payment_terms.source_code_ownership !== undefined && (
                                                                <div className="flex flex-col col-span-2 mt-1">
                                                                    <span className="text-[11px] text-slate-500">Bản quyền mã nguồn / Source Code</span>
                                                                    <span className="font-semibold text-slate-900">{pc.payment_terms.source_code_ownership ? 'Bàn giao 100% bản quyền' : 'Không bao gồm bàn giao mã nguồn'}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    (currentQuotation.terms || brandConfig?.default_payment_terms || "50% đặt cọc khi xác nhận báo giá\n50% còn lại thanh toán khi hoàn thành").split('\n').filter((line: string) => line.trim()).map((line: string, i: number) => (
                                                        <div key={i} className="flex gap-2 items-start">
                                                            <div className="shrink-0 mt-[7px] w-1 h-1 rounded-full bg-slate-400" />
                                                            <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Right Column: Bank Transfer */}
                                <Card className="border-slate-200 shadow-sm h-fit">
                                    <CardContent className="p-4">
                                        <h4 className="font-semibold text-slate-900 mb-3 text-[13px]">
                                            Thông tin chuyển khoản <span className="text-muted-foreground italic font-normal">/ Bank Transfer</span>
                                        </h4>
                                        <div className="space-y-2.5 text-[13px]">
                                            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1">
                                                <span className="text-muted-foreground font-medium">Ngân hàng:</span>
                                                <span className="font-semibold text-slate-900">{currentQuotation.bank_name || brandConfig?.bank_name || "Techcombank"}</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1">
                                                <span className="text-muted-foreground font-medium">Số TK:</span>
                                                <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">{currentQuotation.bank_account_no || brandConfig?.bank_account_no || "190368686868"}</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1">
                                                <span className="text-muted-foreground font-medium">Chủ TK:</span>
                                                <span className="font-semibold text-slate-900">{currentQuotation.bank_account_name || brandConfig?.bank_account_name || "Công ty TNHH Tulie"}</span>
                                            </div>
                                            {(currentQuotation.bank_branch || brandConfig?.bank_branch) && (
                                                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1">
                                                    <span className="text-muted-foreground font-medium">Chi nhánh:</span>
                                                    <span className="font-semibold text-slate-900">{currentQuotation.bank_branch || brandConfig?.bank_branch}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>




                        {/* Decorative Footer */}
                        <div className="pt-6 flex flex-col items-center">
                            <div className="w-full h-px bg-slate-200 mb-6"></div>
                            <div className="flex justify-between items-center w-full px-2 text-[10px] text-slate-600">
                                <div className="flex items-center gap-4">
                                    <span className="font-semibold text-slate-900">{brandConfig?.brand_name || "Tulie Agency"}</span>
                                    <span className="h-2 w-px bg-slate-200"></span>
                                    <span>{brandConfig?.company_name || "Giải pháp công nghệ số"}</span>
                                </div>
                                <div className="flex items-center gap-4 font-medium">
                                    <span>{brandConfig?.website || "tulie.app"}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            )}

            {/* History Timeline Panel has been moved to sidebar */}

            {/* Sticky Action Footer - Shadcn Design */}
            <div className={cn(
                "fixed bottom-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.08)] p-4 sm:py-4 z-50 print:hidden transition-all duration-300",
                hasSidebar ? "left-0 xl:left-[420px]" : "left-0"
            )}>
                <div className="container max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="hidden sm:flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-[13px] font-medium text-muted-foreground">Tổng thanh toán</span>
                                <Separator orientation="vertical" className="h-3.5" />
                                <span className="text-[12px] text-muted-foreground font-medium flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5" /> Tư vấn thêm: <a href={`tel:${brandConfig?.hotline || "0988984554"}`} className="text-slate-900 font-semibold hover:text-blue-600 transition-colors">{brandConfig?.hotline || "098.898.4554"}</a>
                                </span>
                            </div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-[28px] font-bold text-slate-900 leading-none tabular-nums">{new Intl.NumberFormat('vi-VN').format(finalAmount)}</span>
                                <span className="text-sm font-bold text-muted-foreground">VND</span>
                            </div>
                        </div>
                        
                        <div className="sm:hidden flex flex-col items-center w-full mb-1">
                            <span className="text-[12px] font-medium text-muted-foreground mb-0.5">Tổng thanh toán</span>
                            <span className="text-2xl font-bold text-slate-900 tabular-nums">{new Intl.NumberFormat('vi-VN').format(finalAmount)} <span className="text-sm text-muted-foreground">VND</span></span>
                        </div>

                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 w-full sm:w-auto">
                            <Button
                                variant="ghost"
                                size="default"
                                className="font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 order-2 sm:order-1 h-10"
                                onClick={() => setShowReject(true)}
                                disabled={['accepted', 'rejected'].includes(currentQuotation.status)}
                            >
                                Từ chối
                            </Button>
                            <Button
                                variant="outline"
                                size="default"
                                className="font-medium shadow-sm hidden sm:flex order-3 sm:order-2 h-10"
                                onClick={() => window.print()}
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                In báo giá
                            </Button>
                            <Button
                                size="default"
                                className="col-span-2 sm:col-span-1 font-semibold order-1 sm:order-3 px-6 shadow-sm transition-all h-10"
                                onClick={() => setShowConfirm(true)}
                                disabled={isSubmitting || ['accepted', 'rejected'].includes(currentQuotation.status)}
                            >
                                {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                {currentQuotation.status === 'accepted' ? 'Đã xác nhận' : 'Xác nhận ngay'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles - Comprehensive to match live view exactly */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        size: A4;
                        margin: 5mm;
                    }
                    
                    /* Force color printing and system font fallback for CJK/Japanese characters */
                    *, *::before, *::after {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                        font-family: var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, "MS Gothic", sans-serif !important;
                    }
                    
                    [style*="font-family"] {
                        font-family: 'DFVN Neue Kaine', var(--font-sans), sans-serif !important;
                    }
                    
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        width: 100% !important;
                        overflow: visible !important;
                    }
                    
                    /* Hide non-print elements */
                    .fixed.bottom-0,
                    #headlessui-portal-root,
                    [data-sonner-toaster] {
                        display: none !important;
                    }
                    
                    /* === MAIN CONTAINERS - remove all min-height === */
                    .quotation-page {
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        min-height: 0 !important;
                        height: auto !important;
                    }
                    
                    .quotation-paper {
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                        max-width: none !important;
                        box-shadow: none !important;
                        min-height: 0 !important;
                        height: auto !important;
                        overflow: visible !important;
                    }
                    
                    .quotation-inner {
                        padding: 3mm 5mm !important;
                        min-height: 0 !important;
                        height: auto !important;
                        display: block !important;
                    }
                    
                    /* === FORCE DESKTOP LAYOUT for all sm: classes === */
                    .flex-col.sm\\:flex-row { flex-direction: row !important; }
                    .sm\\:flex-row { flex-direction: row !important; }
                    .sm\\:gap-0 { gap: 0 !important; }
                    .w-full.sm\\:w-\\[65\\%\\] { width: 65% !important; }
                    .sm\\:w-auto { width: auto !important; }
                    .sm\\:text-right { text-align: right !important; }
                    .sm\\:justify-end { justify-content: flex-end !important; }
                    .sm\\:not-italic { font-style: normal !important; }
                    .sm\\:text-slate-700 { color: rgb(51 65 85) !important; }
                    .sm\\:text-black { color: #000 !important; }
                    .sm\\:text-sm { font-size: 12px !important; }
                    .sm\\:text-5xl { font-size: 3rem !important; }
                    .sm\\:text-2xl { font-size: 1.5rem !important; }
                    .sm\\:text-\\[13px\\] { font-size: 13px !important; }
                    .hidden.sm\\:block { display: block !important; }
                    .sm\\:block { display: block !important; }
                    .sm\\:h-24 { height: 6rem !important; }
                    .sm\\:h-20 { height: 5rem !important; }
                    .sm\\:p-10 { padding: 3mm 5mm !important; }
                    .sm\\:min-w-0 { min-width: 0 !important; }
                    .text-left.sm\\:text-right { text-align: right !important; }
                    
                    /* Grid layouts - force desktop */
                    .grid.grid-cols-1.sm\\:grid-cols-2 {
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                    }
                    .grid.grid-cols-1.sm\\:grid-cols-\\[140px_1fr\\] {
                        grid-template-columns: 140px 1fr !important;
                    }
                    
                    /* Quotation info right side - force right align */
                    .quotation-inner p.flex.sm\\:justify-end {
                        justify-content: flex-end !important;
                    }
                    
                    /* === BACKGROUNDS === */
                    .bg-slate-50 {
                        background-color: #f8fafc !important;
                    }
                    .bg-slate-100 {
                        background-color: #f1f5f9 !important;
                    }
                    
                    /* === TABLE (modern view only) === */
                    .quotation-paper--modern table {
                        width: 100% !important;
                        border-collapse: separate !important;
                        border-spacing: 0 !important;
                        border: 1px solid #e2e8f0 !important;
                        border-radius: 8px !important;
                        overflow: hidden !important;
                        min-width: 0 !important;
                    }
                    
                    .quotation-paper--modern th {
                        background-color: #000 !important;
                        color: #fff !important;
                        padding: 6px 10px !important;
                        font-weight: 600 !important;
                        font-size: 9px !important;
                        border: none !important;
                    }
                    
                    .quotation-paper--modern td {
                        border-bottom: 0.5px solid #e2e8f0 !important;
                        padding: 5px 10px !important;
                        vertical-align: top !important;
                        font-size: 9px !important;
                    }
                    
                    .quotation-paper--modern tbody tr:last-child td { border-bottom: none !important; }
                    
                    /* === BASIC VIEW print - just clean up, keep original layout === */
                    .quotation-paper--basic {
                        max-width: none !important;
                        width: 100% !important;
                        box-shadow: none !important;
                    }
                    .quotation-paper--basic .quotation-paper-basic {
                        padding: 5mm !important;
                        width: 100% !important;
                    }
                    
                    /* === FONT SIZES - smaller for print === */
                    .text-xs { font-size: 9px !important; }
                    .text-sm { font-size: 11px !important; }
                    .text-\\[12px\\] { font-size: 10px !important; }
                    .text-\\[13px\\] { font-size: 11px !important; }
                    .text-\\[14px\\] { font-size: 12px !important; }
                    .text-\\[11px\\] { font-size: 9px !important; }
                    .text-\\[10px\\] { font-size: 8px !important; }
                    .text-\\[9px\\] { font-size: 7px !important; }
                    .text-\\[15px\\] { font-size: 13px !important; }
                    
                    /* Divider */
                    hr {
                        border-top: 1px solid #e2e8f0 !important;
                        margin: 8px 0 !important;
                    }
                    
                    /* Overflow fix */
                    .overflow-x-auto { overflow: visible !important; }
                    .min-w-\\[900px\\] { min-width: 0 !important; }
                    
                    /* Summary section */
                    .sm\\:w-\\[60\\%\\] { width: 55% !important; }
                    
                    /* Page break control */
                    .proposal-section { 
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    
                    tr {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    
                    /* Spacing adjustments for print - tighter */
                    .mb-5 { margin-bottom: 8px !important; }
                    .mb-6 { margin-bottom: 10px !important; }
                    .mb-8 { margin-bottom: 12px !important; }
                    .mb-10 { margin-bottom: 16px !important; }
                    .mt-8 { margin-top: 12px !important; }
                    .my-6 { margin-top: 8px !important; margin-bottom: 8px !important; }
                    .gap-6 { gap: 10px !important; }
                    .gap-4 { gap: 6px !important; }
                    .space-y-5 > * + * { margin-top: 8px !important; }
                    .space-y-1\.5 > * + * { margin-top: 2px !important; }
                    .pt-6 { padding-top: 10px !important; }
                    
                    .p-4 { padding: 8px !important; }
                    .p-5 { padding: 10px !important; }
                    .rounded-md { border-radius: 12px !important; }
                    .rounded-lg { border-radius: 8px !important; }
                    
                    .quotation-paper--modern .table-header-gradient, .quotation-paper--modern thead tr {
                        background: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(255,255,255,0.12)'/%3E%3C/svg%3E"), linear-gradient(to right, #09090b, #171717, #404040) !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            ` }} />

            {/* Confirmation Dialog */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent className="sm:max-w-[500px] rounded-lg p-0 overflow-hidden shadow-lg">
                    <div className="bg-zinc-900 text-white p-8">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Xác nhận chấp nhận báo giá</DialogTitle>
                            <p className="text-muted-foreground text-[10px] font-bold mt-1">Quotation Approval & Confirmation</p>
                        </DialogHeader>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-[11px] font-bold text-muted-foreground">Họ và tên <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    value={confirmer.name}
                                    onChange={(e) => setConfirmer({ ...confirmer, name: e.target.value })}
                                    placeholder="Nhập họ tên của bạn"
                                    className="h-12 rounded-md bg-muted border-border"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="phone" className="text-[11px] font-bold text-muted-foreground">Số điện thoại <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="phone"
                                        value={confirmer.phone}
                                        onChange={(e) => setConfirmer({ ...confirmer, phone: e.target.value })}
                                        placeholder="VD: 090..."
                                        className="h-12 rounded-md bg-muted border-border"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="position" className="text-[11px] font-bold text-muted-foreground">Chức vụ</Label>
                                    <Input
                                        id="position"
                                        value={confirmer.position}
                                        onChange={(e) => setConfirmer({ ...confirmer, position: e.target.value })}
                                        placeholder="VD: CEO, Manager..."
                                        className="h-12 rounded-md bg-muted border-border"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-[11px] font-bold text-muted-foreground">Email</Label>
                                <Input
                                    id="email"
                                    value={confirmer.email}
                                    onChange={(e) => setConfirmer({ ...confirmer, email: e.target.value })}
                                    placeholder="your@email.com"
                                    className="h-12 rounded-md bg-muted border-border"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                size="lg"
                                className="w-full font-bold shadow-xl transition-all"
                                onClick={handleConfirm}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                Xác nhận chấp nhận ngay
                            </Button>
                            <Button
                                variant="ghost"
                                size="lg"
                                className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                onClick={() => setShowConfirm(false)}
                                disabled={isSubmitting}
                            >
                                Hủy bỏ
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={showReject} onOpenChange={setShowReject}>
                <DialogContent className="sm:max-w-[500px] rounded-lg p-0 overflow-hidden shadow-lg">
                    <div className="bg-red-600 text-white p-8">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-white">Từ chối báo giá</DialogTitle>
                            <p className="text-red-200 text-[10px] font-bold mt-1">Rejection Reason & Feedback</p>
                        </DialogHeader>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="reason" className="text-[11px] font-bold text-muted-foreground">Lý do từ chối <span className="text-red-500">*</span></Label>
                            <textarea
                                id="reason"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Vui lòng cho chúng tôi biết lý do bạn từ chối báo giá này để chúng tôi có thể cải thiện..."
                                className="min-h-[120px] w-full rounded-md bg-muted border-border p-4 text-sm focus:ring-red-500 focus:border-red-500 outline-none border transition-all"
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                variant="destructive"
                                size="lg"
                                className="w-full font-bold shadow-xl transition-all"
                                onClick={handleRejectSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : <XCircle className="mr-2 h-4 w-4" />}
                                Gửi phản hồi từ chối
                            </Button>
                            <Button
                                variant="ghost"
                                size="lg"
                                className="w-full text-muted-foreground transition-all"
                                onClick={() => setShowReject(false)}
                                disabled={isSubmitting}
                            >
                                Hủy bỏ
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            </div>
        </div >
    )
}
