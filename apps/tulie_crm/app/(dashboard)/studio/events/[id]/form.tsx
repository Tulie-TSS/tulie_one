'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Switch, Label, Textarea, Card, CardContent } from '@repo/ui'
import { toast } from 'sonner'
import { createEventSale, updateEventSale } from '@/lib/supabase/services/event-sale-service'

const DEFAULT_SERVICES = [
  {
    "id": "photo",
    "name": "Ảnh thẻ chuẩn Hàn Quốc",
    "originalPrice": 250000,
    "salePrice": 139000,
    "latePrice": 199000,
    "savingText": "-111K",
    "tagLabel": "Giới hạn",
    "tagStyle": "tagHot",
    "description": "Chỉnh sửa chuyên sâu, ghép trang phục chuyên nghiệp.",
    "features": [
      "Xử lý chuyên sâu, ghép trang phục Hàn Quốc",
      "Tặng kèm in 2 vỉ ảnh 10x15cm"
    ],
    "isCombo": false
  }
];

export function EventSaleForm({ initialData }: { initialData?: any }) {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [isActive, setIsActive] = useState(initialData?.is_active ?? true)
    
    // For arrays or json bodies, we use text state to let admins edit freely
    const [subdomainsText, setSubdomainsText] = useState<string>((initialData?.subdomains || []).join('\n'))
    
    // Stringify services back to json for simple text editor
    const [servicesJson, setServicesJson] = useState(
        initialData?.services ? JSON.stringify(initialData.services, null, 2) : JSON.stringify(DEFAULT_SERVICES, null, 2)
    )

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSubmitting(true)
        
        try {
            const formData = new FormData(e.currentTarget)
            
            // parse JSONs safely
            let parsedServices = []
            try {
                parsedServices = JSON.parse(servicesJson)
                if (!Array.isArray(parsedServices)) throw new Error('Dịch vụ phải là mảng Array JSON []')
            } catch (err: any) {
                toast.error('Lỗi định dạng JSON Dịch vụ: ' + err.message)
                setSubmitting(false)
                return
            }

            const domains = subdomainsText.split('\n').map(d => d.trim()).filter(Boolean)
            
            const deadlineRaw = formData.get('deadline_time') as string
            const deadline_time = deadlineRaw ? new Date(deadlineRaw).toISOString() : undefined

            const payload = {
                name: formData.get('name') as string,
                code: formData.get('code') as string,
                banner_text: formData.get('banner_text') as string,
                hero_title: formData.get('hero_title') as string,
                hero_subtitle: formData.get('hero_subtitle') as string,
                logo_url: formData.get('logo_url') as string,
                brand_name: formData.get('brand_name') as string,
                deadline_time,
                is_active: isActive,
                subdomains: domains,
                services: parsedServices
            }

            if (initialData?.id) {
                await updateEventSale(initialData.id, payload)
                toast.success('Cập nhật thành công')
            } else {
                await createEventSale(payload)
                toast.success('Đã tạo sự kiện mới')
                router.push('/studio/events')
            }
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Có lỗi xảy ra')
        } finally {
            setSubmitting(false)
        }
    }

    // Format local datetime for the input default value natively (YYYY-MM-DDThh:mm)
    const formatLocalDatetime = (isoString?: string) => {
        if (!isoString) return ''
        const d = new Date(isoString)
        if (isNaN(d.getTime())) return ''
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="rounded-md border-border">
                <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b">
                        <div>
                            <h3 className="text-lg font-medium">Trạng thái công khai</h3>
                            <p className="text-sm text-muted-foreground">Kích hoạt để cho phép người dùng truy cập subdomain</p>
                        </div>
                        <Switch
                            checked={isActive}
                            onCheckedChange={setIsActive}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tên sự kiện <span className="text-red-500">*</span></Label>
                            <Input name="name" defaultValue={initialData?.name} required placeholder="VD: NEU Career Fair 2026" />
                        </div>
                        <div className="space-y-2">
                            <Label>Mã Code (hậu tố Đơn hàng) <span className="text-red-500">*</span></Label>
                            <Input name="code" defaultValue={initialData?.code} required placeholder="VD: ISME" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Subdomains (Mỗi dòng một domain)</Label>
                        <Textarea 
                            value={subdomainsText} 
                            onChange={e => setSubdomainsText(e.target.value)} 
                            placeholder="isme.tulie.studio&#10;neu.tulie.studio" 
                            rows={3} 
                        />
                        <p className="text-xs text-muted-foreground">Bạn có thể trỏ nhiều domain thuộc tulie về trang này.</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-md border-border">
                <CardContent className="pt-6 space-y-4">
                    <h3 className="text-lg font-medium border-b pb-2 mb-4">Nhận diện Thương hiệu (Header & Banner)</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Brand Name (Góc trái Header)</Label>
                            <Input name="brand_name" defaultValue={initialData?.brand_name} placeholder="VD: ISME Career Fair 2026" />
                        </div>
                        <div className="space-y-2">
                            <Label>Logo URL (Hình ảnh góc trái Header)</Label>
                            <Input name="logo_url" defaultValue={initialData?.logo_url} placeholder="VD: https://tulie.studio/logo.png" />
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <Label className="text-emerald-600 font-bold">Thời hạn Ưu đãi (Deadline đếm ngược)</Label>
                        <Input type="datetime-local" name="deadline_time" defaultValue={formatLocalDatetime(initialData?.deadline_time)} />
                        <p className="text-xs text-muted-foreground">Nếu đặt thời hạn, hệ thống sẽ tự đếm ngược. Sau thời hạn, giá sẽ quay về mức `latePrice` hoặc `originalPrice`.</p>
                    </div>

                    <div className="space-y-2 pt-2">
                        <Label>Banner thả trên đỉnh (Urgency text)</Label>
                        <Input name="banner_text" defaultValue={initialData?.banner_text} placeholder="Ưu đãi chỉ áp dụng tại Ngày hội Hướng nghiệp..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tiêu đề chính (Hero Title)</Label>
                            <Input name="hero_title" defaultValue={initialData?.hero_title} placeholder="Chuẩn bị hồ sơ xin việc chuyên nghiệp" />
                        </div>
                        <div className="space-y-2">
                            <Label>Đoạn mô tả phụ (Hero Subtitle)</Label>
                            <Input name="hero_subtitle" defaultValue={initialData?.hero_subtitle} placeholder="Ảnh thẻ chuẩn Hàn Quốc & Website CV cá nhân..." />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-md border-border">
                <CardContent className="pt-6 space-y-4">
                    <h3 className="text-lg font-medium border-b pb-2">Danh sách Sản phẩm/Gói dịch vụ (JSON Array)</h3>
                    <p className="text-sm text-muted-foreground">Tuỳ biến hoàn toàn các sản phẩm bằng JSON. Có thể sử dụng SKU từ kho hoặc nhập tay hoàn toàn giá cả/tính năng cho riêng sự kiện này để làm Landinp Page Sale linh động.</p>
                    <Textarea 
                        value={servicesJson} 
                        onChange={e => setServicesJson(e.target.value)} 
                        className="font-mono text-xs min-h-[400px]" 
                        required 
                    />
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>Huỷ bỏ</Button>
                <Button type="submit" disabled={submitting}>
                    {submitting ? 'Đang lưu...' : 'Lưu Sự kiện'}
                </Button>
            </div>
        </form>
    )
}
