'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { Button } from '@repo/ui'
import { Badge } from '@repo/ui'
import { Input } from '@repo/ui'
import { Label } from '@repo/ui'
import { FileText, Download, Printer, Check, ChevronRight, ChevronDown, Building2, User, Mail, Phone, MapPin, ClipboardList, CreditCard, Package, AlertTriangle, Save, RefreshCw, Eye, EyeOff, CircleCheck, Circle, FileCheck, ExternalLink, Trash2 } from 'lucide-react'
import { LoadingSpinner } from '@repo/ui'
import { Contract } from '@/types'
import { Alert, AlertDescription } from '@repo/ui'
import { Switch, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@repo/ui'


interface ContractDocumentsProps {
    contract: Contract
}

export function ContractDocuments({ contract }: ContractDocumentsProps) {
    const [loading, setLoading] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [dbDocs, setDbDocs] = useState<any[]>([])
    const [regenerating, setRegenerating] = useState(false)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [deleteTargetItem, setDeleteTargetItem] = useState<DocItem | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [includeProposal, setIncludeProposal] = useState<boolean>(
        (contract as any).include_proposal_appendix !== false
    )
    const isProposalQuotation = (contract as any).quotation?.type === 'proposal'

    const hasSignedDocs = dbDocs.some(d => d.status === 'signed')

    const loadDocs = useCallback(() => {
        fetch(`/api/contracts/${contract.id}/documents`)
            .then(r => r.ok ? r.json() : { documents: [] })
            .then(data => setDbDocs(data.documents || []))
            .catch(() => {})
    }, [contract.id])

    // Load DB documents on mount
    useEffect(() => {
        loadDocs()
    }, [loadDocs])

    // Regenerate all documents from current contract data
    const handleRegenerate = async () => {
        setRegenerating(true)
        try {
            const res = await fetch(`/api/contracts/${contract.id}/documents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    regenerate: true,
                    ...(isProposalQuotation ? { include_proposal_appendix: includeProposal } : {})
                })
            })
            if (!res.ok) throw new Error('Failed')
            toast.success('Đã tạo lại giấy tờ thành công')
            loadDocs()
        } catch {
            toast.error('Không thể tạo lại giấy tờ')
        } finally {
            setRegenerating(false)
        }
    }

    const onRegenerateClick = () => {
        if (hasSignedDocs) {
            setShowConfirmDialog(true)
        } else {
            handleRegenerate()
        }
    }

    // Build doc items list from DB docs or fallback to static types
    interface DocItem {
        key: string
        type: string
        label: string
        description: string
        icon: any
        fromDb: boolean
        dbDocId?: string
        milestoneId?: string
        isVisible?: boolean
        docStatus?: string
    }

    // priority values for document statuses to determine which to show when duplicates exist
    const priorityMap: Record<string, number> = { signed: 4, sent: 3, pending: 2, draft: 1 }


    const DOC_META: Record<string, { label: string; description: string; icon: any }> = {
        contract: { label: 'Hợp đồng kinh tế', description: 'Hợp đồng ký kết giữa 2 bên với đầy đủ điều khoản pháp lý', icon: FileText },
        freelance_contract: { label: contract.title || 'Hợp đồng Cộng tác viên', description: 'Hợp đồng thỏa thuận cung cấp dịch vụ cá nhân', icon: FileText },
        order: { label: 'Đơn đặt hàng', description: 'Đơn đặt hàng chi tiết sản phẩm/dịch vụ', icon: ClipboardList },
        payment_request: { label: 'Đề nghị thanh toán', description: 'Đề nghị thanh toán theo hợp đồng kinh tế', icon: CreditCard },
        delivery_minutes: { label: 'Biên bản giao nhận', description: 'Biên bản xác nhận giao nhận hàng hóa/dịch vụ', icon: Package },
    }

    const isFramework = contract.type === 'contract'
    const isOrder = contract.type === 'order'
    const isFreelancer = contract.category === 'freelancer'

    const sortDocItems = (items: DocItem[]) => {
        const getRank = (type: string) => {
            if (type === 'contract' || type === 'freelance_contract' || type === 'order') return 1
            if (type === 'payment_request') return 2
            if (type === 'delivery_minutes') return 3
            return 4
        }
        return [...items].sort((a, b) => {
            const rankA = getRank(a.type)
            const rankB = getRank(b.type)
            if (rankA !== rankB) return rankA - rankB
            if (a.type === 'payment_request' && b.type === 'payment_request') {
                const matchA = a.label.match(/ĐNTT\s+(\d+)/i)
                const matchB = b.label.match(/ĐNTT\s+(\d+)/i)
                if (matchA && matchB) {
                    return parseInt(matchA[1]) - parseInt(matchB[1])
                }
                const milestones = contract.milestones || []
                const idxA = milestones.findIndex(m => m.id === a.milestoneId)
                const idxB = milestones.findIndex(m => m.id === b.milestoneId)
                if (idxA !== -1 && idxB !== -1) return idxA - idxB
            }
            return 0
        })
    }

    const docItems: DocItem[] = (() => {
        if (dbDocs.length > 0) {
            const uniqueDocsMap = new Map<string, any>()
            for (const doc of dbDocs) {
                const num = doc.doc_number || doc.type
                const key = `${doc.milestone_id || 'none'}-${num}`
                
                const currentPriority = priorityMap[doc.status] || 0
                
                if (!uniqueDocsMap.has(key)) {
                    uniqueDocsMap.set(key, doc)
                } else {
                    const existingDoc = uniqueDocsMap.get(key)
                    const existingPriority = priorityMap[existingDoc.status] || 0
                    if (currentPriority > existingPriority) {
                        uniqueDocsMap.set(key, doc)
                    }
                }
            }
            const uniqueDbDocs = Array.from(uniqueDocsMap.values())

            const paymentMilestones = (contract.milestones || []).filter((m: any) => m.amount > 0)
            const mapped = uniqueDbDocs.map((doc) => {
                const meta = DOC_META[doc.type] || DOC_META.contract
                const milestone = contract.milestones?.find(m => m.id === doc.milestone_id)
                const mIdx = milestone ? paymentMilestones.findIndex(m => m.id === milestone.id) : -1
                const paymentIdx = mIdx !== -1 ? mIdx + 1 : 0
                
                const match = (doc.doc_number || '').match(/[-_]v(\d+)$/i)
                const versionSuffix = match ? ` (v${match[1]})` : ''
                
                const baseLabel = doc.type === 'payment_request' && paymentIdx > 0
                    ? `ĐNTT ${paymentIdx}: ${milestone?.name || `Đợt ${paymentIdx}`}`
                    : meta.label

                return {
                    key: doc.id,
                    type: doc.type,
                    label: `${baseLabel}${versionSuffix}`,
                    description: doc.doc_number || meta.description,
                    icon: meta.icon,
                    fromDb: true,
                    dbDocId: doc.id,
                    milestoneId: doc.milestone_id,
                    isVisible: doc.is_visible_on_portal !== false,
                    docStatus: doc.status || 'draft',
                }
            })
            return sortDocItems(mapped)
        }

        // Fallback: static doc types based on contract type
        let types: string[] = []
        if (isFreelancer) {
            types = ['freelance_contract', 'delivery_minutes']
        } else if (isOrder) {
            types = ['order', 'payment_request', 'delivery_minutes']
        } else {
            types = ['contract', 'payment_request', 'delivery_minutes']
        }
        
        return sortDocItems(types.map(type => {
            const meta = DOC_META[type]
            return {
                key: type,
                type,
                label: meta.label,
                description: meta.description,
                icon: meta.icon,
                fromDb: false,
                isVisible: false,
            }
        }))
    })()

    // Preview: open stored doc directly or generate on-the-fly
    const handlePreviewDoc = (item: DocItem) => {
        setLoading(item.key)
        if (item.dbDocId) {
            window.open(`/api/contracts/${contract.id}/documents/${item.dbDocId}/preview`, '_blank')
        } else {
            window.open(`/api/contracts/${contract.id}/preview?type=${item.type}`, '_blank')
        }
        setLoading(null)
    }

    const handleToggleVisibility = async (item: DocItem) => {
        if (!item.dbDocId) return
        setLoading(item.key)
        try {
            const nextVal = !item.isVisible
            const res = await fetch(`/api/contracts/${contract.id}/documents/${item.dbDocId}/toggle-visibility`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_visible: nextVal })
            })
            if (!res.ok) throw new Error('Cập nhật thất bại')
            setDbDocs(prev => prev.map(d => d.id === item.dbDocId ? { ...d, is_visible_on_portal: nextVal } : d))
            toast.success(nextVal ? 'Đã hiển thị trên Portal' : 'Đã ẩn khỏi Portal')
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(null)
        }
    }

    const handleToggleStatus = async (item: DocItem) => {
        if (!item.dbDocId) return
        setLoading(item.key)
        try {
            const res = await fetch(`/api/contracts/${contract.id}/documents/${item.dbDocId}/toggle-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
            if (!res.ok) throw new Error('Cập nhật thất bại')
            const data = await res.json()
            setDbDocs(prev => prev.map(d => d.id === item.dbDocId ? { ...d, status: data.status } : d))
            toast.success(data.status === 'signed' ? 'Đã đánh dấu hoàn thành' : 'Đã chuyển về bản nháp')
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(null)
        }
    }

    // Print
    const handlePrintDoc = async (item: DocItem) => {
        setLoading(item.key)
        const win = window.open('', '_blank')
        if (!win) { setLoading(null); return }
        win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Đang tạo...</title><style>body{display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;color:#666;}</style></head><body><p>Đang tải...</p></body></html>`)
        win.document.close()

        try {
            let html: string
            if (item.dbDocId) {
                const res = await fetch(`/api/contracts/${contract.id}/documents/${item.dbDocId}/preview`)
                html = await res.text()
            } else {
                const res = await fetch(`/api/contracts/${contract.id}/generate-document`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: item.type, additionalVariables: customerInfo })
                })
                const data = await res.json()
                html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Print</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet"><style>body,table,tr,td,th,div,p,span,ul,li{font-family:Arial,"Noto Sans JP","Hiragino Kaku Gothic ProN","Hiragino Sans","Meiryo","MS Gothic",sans-serif;}@media print{@page{size:A4;margin:15.24mm 15.24mm 16.256mm;@bottom-right{content:"Trang " counter(page) " / " counter(pages);font-family:Arial,sans-serif;font-size:10pt;}}body{margin:0;background:none;}body>div{padding:0!important;margin:0!important;max-width:none!important;box-shadow:none!important;border:none!important;}}</style></head><body>${data.content || ''}</body></html>`
            }
            win.document.open()
            win.document.write(html)
            win.document.close()
            win.focus()
            setTimeout(() => win.print(), 300)
        } catch {
            win.close()
        } finally {
            setLoading(null)
        }
    }

    // Delete document
    const handleDeleteDoc = async () => {
        if (!deleteTargetItem?.dbDocId) return
        setDeleting(true)
        try {
            const res = await fetch(`/api/contracts/${contract.id}/documents/${deleteTargetItem.dbDocId}`, {
                method: 'DELETE'
            })
            if (!res.ok) throw new Error('Xóa thất bại')
            setDbDocs(prev => prev.filter(d => d.id !== deleteTargetItem.dbDocId))
            toast.success(`Đã xóa "${deleteTargetItem.label}"`)
            setShowDeleteDialog(false)
            setDeleteTargetItem(null)
        } catch (err: any) {
            toast.error(err.message || 'Không thể xóa giấy tờ')
        } finally {
            setDeleting(false)
        }
    }

    // Download
    const handleDownloadDoc = async (item: DocItem) => {
        setLoading(item.key)
        try {
            let html: string
            if (item.dbDocId) {
                const res = await fetch(`/api/contracts/${contract.id}/documents/${item.dbDocId}/preview`)
                html = await res.text()
            } else {
                const res = await fetch(`/api/contracts/${contract.id}/generate-document`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: item.type, additionalVariables: customerInfo })
                })
                const data = await res.json()
                html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${item.label}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet"><style>body,table,tr,td,th,div,p,span,ul,li{font-family:Arial,"Noto Sans JP","Hiragino Kaku Gothic ProN","Hiragino Sans","Meiryo","MS Gothic",sans-serif;}@media print{@page{size:A4;margin:15.24mm 15.24mm 16.256mm;@bottom-right{content:"Trang " counter(page) " / " counter(pages);font-family:Arial,sans-serif;font-size:10pt;}}body{margin:0;background:none;}body>div{padding:0!important;margin:0!important;max-width:none!important;box-shadow:none!important;border:none!important;}}</style></head><body>${data.content || ''}</body></html>`
            }
            const blob = new Blob([html], { type: 'text/html' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            const fileDocNum = item.description && item.description !== (DOC_META[item.type]?.description || '') 
                ? item.description 
                : contract.contract_number
            a.download = `${item.label} - ${fileDocNum}.html`
            a.click()
            URL.revokeObjectURL(url)
        } catch {
            alert('Không thể tải giấy tờ')
        } finally {
            setLoading(null)
        }
    }

    // Editable customer info — pre-filled from snapshot or customer
    const snapshot = contract.customer_snapshot
    const cust = contract.customer

    const isDigitalByDefault = (() => {
        const title = (contract.title || '').toLowerCase()
        const desc = (contract.description || '').toLowerCase()
        const qTitle = ((contract as any).quotation?.title || '').toLowerCase()
        const prodName = (contract.product_name_in_contract || (contract as any).quotation?.product_name_in_contract || '').toLowerCase()
        
        const digitalKeywords = ['website', 'web', 'phần mềm', 'phan mem', 'app', 'giao diện', 'giao dien', 'logo', 'thiết kế', 'thiet ke', 'branding']
        const hasKeyword = (t: string) => digitalKeywords.some(kw => t.includes(kw))
        
        return hasKeyword(title) || hasKeyword(desc) || hasKeyword(qTitle) || hasKeyword(prodName)
    })()

    const initialDeliveryMethod = (snapshot as any)?.delivery_method === 'physical' ? 'physical' : ((snapshot as any)?.delivery_method === 'digital' ? 'digital' : (isDigitalByDefault ? 'digital' : 'physical'))
    const initialDeliveryAddress = (snapshot as any)?.delivery_address || 
        (initialDeliveryMethod === 'digital' 
            ? 'Bản mềm qua Internet (Email/Cloud/Drive)' 
            : (snapshot?.address || cust?.address || ''))

    const [customerInfo, setCustomerInfo] = useState({
        customer_company: snapshot?.company_name || cust?.company_name || '',
        customer_representative_title: snapshot?.representative_title || cust?.representative_title || '',
        customer_representative: snapshot?.representative || cust?.representative || '',
        customer_position: snapshot?.position || cust?.position || '',
        customer_email: snapshot?.email || cust?.email || '',
        customer_phone: snapshot?.phone || cust?.phone || '',
        customer_tax_code: snapshot?.tax_code || cust?.tax_code || '',
        customer_address: snapshot?.address || cust?.address || '',
        customer_invoice_address: snapshot?.invoice_address || cust?.invoice_address || '',
        delivery_method: initialDeliveryMethod,
        delivery_address: initialDeliveryAddress,
    })
    const [infoChanged, setInfoChanged] = useState(false)
    const [savingInfo, setSavingInfo] = useState(false)

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setCustomerInfo(prev => ({ ...prev, [name]: value }))
        setInfoChanged(true)
    }

    // Save customer info to contract's customer_snapshot
    const handleSaveCustomerInfo = useCallback(async () => {
        setSavingInfo(true)
        try {
            const res = await fetch(`/api/contracts/${contract.id}/snapshot`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company_name: customerInfo.customer_company,
                    representative_title: customerInfo.customer_representative_title,
                    representative: customerInfo.customer_representative,
                    position: customerInfo.customer_position,
                    email: customerInfo.customer_email,
                    phone: customerInfo.customer_phone,
                    tax_code: customerInfo.customer_tax_code,
                    address: customerInfo.customer_address,
                    invoice_address: customerInfo.customer_invoice_address,
                    delivery_method: customerInfo.delivery_method,
                    delivery_address: customerInfo.delivery_address,
                })
            })
            if (!res.ok) throw new Error('Lỗi lưu thông tin')
            setInfoChanged(false)
            toast.success('Đã lưu thông tin khách hàng')
        } catch (err: any) {
            toast.error(err.message || 'Không thể lưu thông tin')
        } finally {
            setSavingInfo(false)
        }
    }, [contract.id, customerInfo])

    const isFreelance = contract.category === 'freelancer'

    // Validation warnings for document completeness
    const missingDocFields: string[] = []
    if (!contract.signed_date) missingDocFields.push('Ngày ký hợp đồng')
    if (!isFreelance && !contract.customer?.abbreviation) missingDocFields.push('Tên viết tắt KH (mã giấy tờ)')
    if (!contract.milestones?.some(m => m.type === 'payment')) missingDocFields.push('Mốc thanh toán')
    if (!isFreelance && !contract.quotation_id) missingDocFields.push('Báo giá liên kết (danh sách sản phẩm)')

    return (
        <Card>
            <CardHeader className="pb-4 border-b bg-muted/20">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileText className="h-5 w-5" />
                            Bộ giấy tờ
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                            Xuất giấy tờ từ dữ liệu hợp đồng — tự động điền thông tin
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs gap-1 shrink-0"
                        onClick={onRegenerateClick}
                        disabled={regenerating}
                    >
                        <RefreshCw className={`h-3 w-3 ${regenerating ? 'animate-spin' : ''}`} />
                        {regenerating ? 'Đang tạo...' : 'Tạo lại'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                {/* Warning for missing data */}
                {missingDocFields.length > 0 && (
                    <Alert className="bg-amber-50 border-amber-200">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-xs text-amber-800">
                            <strong>Thiếu thông tin:</strong> {missingDocFields.join(' • ')}.
                            Giấy tờ vẫn preview được nhưng các phần thiếu sẽ để trống.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Editable customer info form */}
                {!isFreelance ? (
                <div className="rounded-lg border border-dashed">
                    <button
                        type="button"
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 rounded-lg transition-colors"
                        onClick={() => setShowForm(!showForm)}
                    >
                        <div>
                            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                                Thông tin điền vào giấy tờ
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                {customerInfo.customer_company || 'Chưa có'} • {customerInfo.customer_representative || 'Chưa có đại diện'}
                            </p>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showForm ? 'rotate-180' : ''}`} />
                    </button>

                    {showForm && (
                        <div className="px-3 pb-3 space-y-2.5 border-t">
                            <div className="grid grid-cols-1 gap-2 pt-2.5">
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground">Công ty</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                        <Input
                                            name="customer_company"
                                            value={customerInfo.customer_company}
                                            onChange={handleInfoChange}
                                            className="pl-8 h-8 text-xs"
                                            placeholder="Tên công ty"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">Đại diện pháp luật</Label>
                                        <div className="flex gap-1.5">
                                            <select
                                                name="customer_representative_title"
                                                value={customerInfo.customer_representative_title}
                                                onChange={(e) => { setCustomerInfo(prev => ({ ...prev, customer_representative_title: e.target.value })); setInfoChanged(true) }}
                                                className="h-8 rounded-md border border-input bg-background px-2 text-xs min-w-[60px]"
                                            >
                                                <option value="">—</option>
                                                <option value="Ông">Ông</option>
                                                <option value="Bà">Bà</option>
                                            </select>
                                            <div className="relative flex-1">
                                                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                <Input
                                                    name="customer_representative"
                                                    value={customerInfo.customer_representative}
                                                    onChange={handleInfoChange}
                                                    className="pl-8 h-8 text-xs"
                                                    placeholder="Họ tên"
                                                />
                                            </div>
                                        </div>
                                        {customerInfo.customer_representative_title && customerInfo.customer_representative && (
                                            <p className="text-[9px] text-muted-foreground">{customerInfo.customer_representative_title} {customerInfo.customer_representative}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">Chức vụ</Label>
                                        <Input
                                            name="customer_position"
                                            value={customerInfo.customer_position}
                                            onChange={handleInfoChange}
                                            className="h-8 text-xs"
                                            placeholder="Giám đốc..."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input
                                                name="customer_email"
                                                value={customerInfo.customer_email}
                                                onChange={handleInfoChange}
                                                className="pl-8 h-8 text-xs"
                                                placeholder="email@..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">SĐT</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input
                                                name="customer_phone"
                                                value={customerInfo.customer_phone}
                                                onChange={handleInfoChange}
                                                className="pl-8 h-8 text-xs"
                                                placeholder="0xxx..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground">MST</Label>
                                    <Input
                                        name="customer_tax_code"
                                        value={customerInfo.customer_tax_code}
                                        onChange={handleInfoChange}
                                        className="h-8 text-xs"
                                        placeholder="Mã số thuế"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground">Hình thức bàn giao</Label>
                                    <Select
                                        value={customerInfo.delivery_method}
                                        onValueChange={(val) => {
                                            setCustomerInfo(prev => {
                                                const updated = { ...prev, delivery_method: val }
                                                if (val === 'digital' && (prev.delivery_address === '' || prev.delivery_address === (snapshot?.address || cust?.address || ''))) {
                                                    updated.delivery_address = 'Bản mềm qua Internet (Email/Cloud/Drive)'
                                                } else if (val === 'physical' && (prev.delivery_address === '' || prev.delivery_address === 'Bản mềm qua Internet (Email/Cloud/Drive)')) {
                                                    updated.delivery_address = snapshot?.address || cust?.address || ''
                                                }
                                                return updated
                                            })
                                            setInfoChanged(true)
                                        }}
                                    >
                                        <SelectTrigger className="w-full h-8 text-xs font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="digital" className="text-xs">Sản phẩm kỹ thuật số (Bản mềm)</SelectItem>
                                            <SelectItem value="physical" className="text-xs">Sản phẩm vật lý (Giao hàng tận nơi)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground">Địa chỉ / Phương thức bàn giao</Label>
                                    <Input
                                        name="delivery_address"
                                        value={customerInfo.delivery_address}
                                        onChange={(e) => {
                                            setCustomerInfo(prev => ({ ...prev, delivery_address: e.target.value }))
                                            setInfoChanged(true)
                                        }}
                                        className="h-8 text-xs"
                                        placeholder="Địa chỉ giao hàng hoặc phương thức bàn giao"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground">Địa chỉ trụ sở</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                        <Input
                                            name="customer_address"
                                            value={customerInfo.customer_address}
                                            onChange={handleInfoChange}
                                            className="pl-8 h-8 text-xs"
                                            placeholder="Địa chỉ đăng ký kinh doanh"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground">Địa chỉ xuất hóa đơn (nếu khác)</Label>
                                    <div className="relative">
                                        <FileText className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground opacity-50" />
                                        <Input
                                            name="customer_invoice_address"
                                            value={customerInfo.customer_invoice_address}
                                            onChange={handleInfoChange}
                                            className="pl-8 h-8 text-xs"
                                            placeholder="Bỏ trống nếu trùng địa chỉ trụ sở"
                                        />
                                    </div>
                                </div>
                            </div>

                                <Button
                                    size="sm"
                                    variant={infoChanged ? "default" : "outline"}
                                    onClick={handleSaveCustomerInfo}
                                    disabled={savingInfo || !infoChanged}
                                    className="w-full mt-2"
                                >
                                    {savingInfo ? (
                                        <><LoadingSpinner size="sm" className="mr-2" /> Đang lưu...</>
                                    ) : infoChanged ? (
                                        <><Save className="mr-2 h-3.5 w-3.5" /> Lưu thông tin khách hàng</>
                                    ) : (
                                        <><Check className="mr-2 h-3.5 w-3.5" /> Đã lưu</>
                                    )}
                                </Button>
                        </div>
                    )}
                </div>
                ) : (
                    <div className="rounded-lg border border-dashed bg-muted/30 p-3 text-center">
                        <p className="text-[11px] text-muted-foreground">Dữ liệu giấy tờ Cộng tác viên được đồng bộ tự động.</p>
                    </div>
                )}

                {/* Document list */}
                <div className="space-y-2">
                {docItems.map((item, idx) => {
                    const isActive = loading === item.key
                    const isGenerated = item.fromDb
                    const isSigned = item.docStatus === 'signed'

                    return (
                        <div
                            key={item.key}
                            className={`group flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-muted/50 ${isSigned ? 'bg-zinc-50 border-zinc-200 dark:bg-zinc-900/10 dark:border-zinc-800' : ''}`}
                        >
                            {isGenerated ? (
                                <button
                                    onClick={() => handleToggleStatus(item)}
                                    className="shrink-0 focus:outline-none"
                                    title={isSigned ? 'Đã hoàn thành — bấm để chuyển về nháp' : 'Bấm để đánh dấu hoàn thành'}
                                >
                                    {isSigned
                                        ? <CircleCheck className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                                        : <Circle className="h-5 w-5 text-zinc-300 hover:text-muted-foreground transition-colors" />
                                    }
                                </button>
                            ) : (
                                <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <p className={`text-sm font-medium truncate ${isSigned ? 'text-zinc-900 dark:text-zinc-100' : ''}`}>{item.label}</p>
                                    {isSigned && (
                                        <Badge variant="outline" className="text-[10px] leading-none px-1.5 py-0.5 text-zinc-800 border-zinc-200 bg-zinc-50 dark:text-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 shrink-0">
                                            Xong
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handlePreviewDoc(item)}
                                    disabled={isActive}
                                    title="Xem bản xem trước"
                                >
                                    {isActive ? <LoadingSpinner size="sm" /> : <ExternalLink className="h-4 w-4" />}
                                </Button>
                                {isGenerated && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleToggleVisibility(item)}
                                        disabled={isActive}
                                        title={item.isVisible ? "Đang hiện trên Portal — bấm để ẩn" : "Đang ẩn — bấm để hiện trên Portal"}
                                    >
                                        {item.isVisible ? <Eye className="h-4 w-4 text-zinc-600 dark:text-zinc-400" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handlePrintDoc(item)}
                                    disabled={isActive}
                                    title="In"
                                >
                                    <Printer className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleDownloadDoc(item)}
                                    disabled={isActive}
                                    title="Tải xuống"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                                {isGenerated && !isSigned && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => { setDeleteTargetItem(item); setShowDeleteDialog(true) }}
                                        disabled={isActive}
                                        title="Xóa giấy tờ này"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )
                })}
                </div>

                {/* Proposal appendix toggle - only show for proposal-type quotations */}
                {isProposalQuotation && (
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg border bg-muted/30">
                        <div className="flex items-center gap-2">
                            <FileCheck className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium">Kèm Phụ lục đề xuất giải pháp</span>
                        </div>
                        <Switch
                            checked={includeProposal}
                            onCheckedChange={setIncludeProposal}
                            className="scale-75"
                        />
                    </div>
                )}
            </CardContent>

            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận tạo bộ giấy tờ mới</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hợp đồng này đã có các giấy tờ đã ký (trạng thái “Xong”). Nếu tạo lại, hệ thống sẽ bảo lưu các bản đã ký và sinh một bản nháp mới (v2, v3...) để bạn chỉnh sửa hoặc gửi lại. Bạn có chắc chắn muốn tiếp tục?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            setShowConfirmDialog(false)
                            handleRegenerate()
                        }}>
                            Đồng ý tạo bản mới
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa giấy tờ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn sắp xóa <strong>“{deleteTargetItem?.label}”</strong>.
                            Thao tác này không thể hoàn tác. Nếu cần, bạn có thể tạo lại bất kỳ lúc nào bằng nút “Tạo lại”.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteDoc}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? 'Đang xóa...' : 'Xóa'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    )
}
