'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui'
import { Button } from '@repo/ui'
import { Input } from '@repo/ui'
import { Label } from '@repo/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui'
import { Checkbox } from '@repo/ui'
import { Badge } from '@repo/ui'
import { Separator } from '@repo/ui'
import { LoadingSpinner } from '@repo/ui'
import { ArrowLeft, Globe, Plus, FileText, CheckCircle, Copy, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createQuotePortal } from '@/lib/supabase/services/quote-portal-service'
import { getCustomers } from '@/lib/supabase/services/customer-service'
import { getQuotations } from '@/lib/supabase/services/quotation-service'
import { formatCurrency } from '@/lib/utils/format'
import { DocumentAttachmentManager, AttachmentItem } from '@/components/quotations/document-attachment-manager'

export default function NewPortalPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const [customers, setCustomers] = useState<any[]>([])
    const [quotations, setQuotations] = useState<any[]>([])

    const [title, setTitle] = useState('')
    const [selectedCustomerId, setSelectedCustomerId] = useState('')
    const [selectedQuotationIds, setSelectedQuotationIds] = useState<string[]>([])
    const [attachments, setAttachments] = useState<AttachmentItem[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [customerData, quotationData] = await Promise.all([
                    getCustomers('business'),
                    getQuotations(),
                ])
                setCustomers(customerData || [])
                setQuotations(quotationData || [])
            } catch (err) {
                console.error('Error loading data:', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const filteredQuotations = selectedCustomerId
        ? quotations.filter((q) => q.customer_id === selectedCustomerId)
        : quotations

    const toggleQuotation = (id: string) => {
        setSelectedQuotationIds((prev) =>
            prev.includes(id) ? prev.filter((qid) => qid !== id) : [...prev, id]
        )
    }

    const handleCreate = async () => {
        if (!selectedCustomerId) {
            toast.error('Vui lòng chọn khách hàng')
            return
        }
        if (selectedQuotationIds.length === 0) {
            toast.error('Vui lòng chọn ít nhất 1 báo giá')
            return
        }

        setIsSaving(true)
        try {
            const result = await createQuotePortal({
                title: title || 'Portal báo giá',
                customer_id: selectedCustomerId,
                quotation_ids: selectedQuotationIds,
                attachments: attachments,
            })
            if (result.success && result.data) {
                toast.success('Tạo Portal thành công!')
                router.push(`/quotations/portals/${result.data.id}`)
            } else {
                toast.error(result.error || 'Có lỗi xảy ra khi tạo Portal')
                console.error('Portal creation failed:', result.error)
            }
        } catch (err) {
            toast.error('Có lỗi xảy ra khi tạo Portal')
            console.error(err)
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Page Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/quotations/portals">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center border border-border">
                        <Globe className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Tạo Portal báo giá</h1>
                        <p className="text-sm font-medium text-muted-foreground mt-1">
                            Tạo trang chia sẻ nhiều phương án báo giá cho khách hàng
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Portal Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin Portal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Tên Portal</Label>
                                <Input
                                    placeholder="VD: Portal báo giá — Công ty ABC"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Chọn khách hàng</Label>
                                <Select value={selectedCustomerId} onValueChange={(val) => {
                                    setSelectedCustomerId(val)
                                    setSelectedQuotationIds([])
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn khách hàng..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.company_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quotation Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Chọn báo giá</CardTitle>
                            <CardDescription>
                                Chọn các phương án báo giá để đưa vào Portal
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!selectedCustomerId ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                    Vui lòng chọn khách hàng trước
                                </p>
                            ) : filteredQuotations.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                    Khách hàng này chưa có báo giá nào
                                </p>
                            ) : (
                                <div className="grid gap-3">
                                    {filteredQuotations.map((q) => (
                                        <div
                                            key={q.id}
                                            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                                                selectedQuotationIds.includes(q.id)
                                                    ? 'bg-primary/5 border-primary'
                                                    : 'hover:bg-muted/50'
                                            }`}
                                            onClick={() => toggleQuotation(q.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={selectedQuotationIds.includes(q.id)}
                                                    onCheckedChange={() => toggleQuotation(q.id)}
                                                />
                                                <div>
                                                    <p className="font-medium text-sm">{q.quotation_number}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {q.version_name || q.title || 'Chưa đặt tên'}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium tabular-nums text-muted-foreground">
                                                {formatCurrency(q.total_amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Attachments */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tài liệu đính kèm</CardTitle>
                            <CardDescription>
                                Upload file PDF, hình ảnh hoặc thêm link demo / reference
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DocumentAttachmentManager
                                attachments={attachments}
                                onChange={setAttachments}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column — Summary */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Tổng quan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Khách hàng</span>
                                    <span className="font-medium">
                                        {customers.find((c) => c.id === selectedCustomerId)?.company_name || 'Chưa chọn'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Số báo giá</span>
                                    <span className="font-medium">{selectedQuotationIds.length}</span>
                                </div>
                            </div>

                            {selectedQuotationIds.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm font-medium mb-2">Báo giá đã chọn:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedQuotationIds.map((id) => {
                                                const q = quotations.find((q) => q.id === id)
                                                return (
                                                    <Badge key={id} variant="outline">
                                                        {q?.quotation_number}
                                                    </Badge>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}

                            <Separator />

                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleCreate}
                                disabled={isSaving || !selectedCustomerId || selectedQuotationIds.length === 0}
                            >
                                {isSaving && <LoadingSpinner size="sm" className="mr-2" />}
                                <Plus className="h-4 w-4" />
                                Tạo Portal
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
