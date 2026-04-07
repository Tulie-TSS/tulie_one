'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Switch, Label, Textarea, Card, CardContent } from '@repo/ui'
import { toast } from 'sonner'
import { createEventSale, updateEventSale } from '@/lib/supabase/services/event-sale-service'
import { Plus, Trash, Code, List } from 'lucide-react'

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
    const [isJsonMode, setIsJsonMode] = useState(false)
    
    // For arrays or json bodies, we use text state to let admins edit freely
    const [subdomainsText, setSubdomainsText] = useState<string>((initialData?.subdomains || []).join('\n'))
    
    // UI Builder state
    const [servicesArr, setServicesArr] = useState<any[]>(() => {
        try {
            return initialData?.services || DEFAULT_SERVICES
        } catch(e) {
            return DEFAULT_SERVICES
        }
    })
    
    // JSON state
    const [servicesJson, setServicesJson] = useState(() => JSON.stringify(initialData?.services || DEFAULT_SERVICES, null, 2))

    const handleToggleMode = () => {
        if (isJsonMode) {
            try {
                const parsed = JSON.parse(servicesJson)
                if (!Array.isArray(parsed)) throw new Error('Dịch vụ phải là mảng []')
                setServicesArr(parsed)
                setIsJsonMode(false)
            } catch (err: any) {
                toast.error('Lỗi JSON: ' + err.message)
            }
        } else {
            const safeObj = servicesArr.map(s => ({
              ...s,
              features: (s.features || []).filter((f: string) => f.trim().length > 0)
            }))
            setServicesJson(JSON.stringify(safeObj, null, 2))
            setIsJsonMode(true)
        }
    }

    const updateService = (index: number, key: string, value: any) => {
        setServicesArr(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [key]: value };
            return next;
        });
    }
    
    const addService = () => {
        setServicesArr(prev => [
            ...prev,
            { id: `svc_${Date.now()}`, name: "Gói mới", originalPrice: 0, salePrice: 0, isCombo: false, features: [] }
        ])
    }
    
    const removeService = (index: number) => {
        setServicesArr(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSubmitting(true)
        
        try {
            const formData = new FormData(e.currentTarget)
            
            // parse JSONs safely
            let parsedServices = []
            try {
                if (isJsonMode) {
                    parsedServices = JSON.parse(servicesJson)
                } else {
                    parsedServices = servicesArr.map(s => ({
                      ...s,
                      features: (s.features || []).filter((f: string) => typeof f === 'string' && f.trim().length > 0)
                    }))
                }
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
                    <div className="flex justify-between items-end border-b pb-2 mb-4">
                        <div>
                            <h3 className="text-lg font-medium">Danh sách Dịch vụ / Gói</h3>
                            <p className="text-sm text-muted-foreground">Các gói sản phẩm khách hàng có thể chọn trên Landing Page.</p>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={handleToggleMode}>
                            {isJsonMode ? <><List className="w-4 h-4 mr-2"/>Chuyển về Bảng (Visual Cấu hình)</> : <><Code className="w-4 h-4 mr-2"/>Hiển thị Mã Nguồn JSON</>}
                        </Button>
                    </div>

                    {isJsonMode ? (
                        <Textarea 
                            value={servicesJson} 
                            onChange={e => setServicesJson(e.target.value)} 
                            className="font-mono text-xs min-h-[400px]" 
                            required 
                        />
                    ) : (
                        <div className="space-y-6">
                            {servicesArr.map((svc, i) => (
                                <div key={i} className="border border-border rounded-md p-5 bg-background shadow-sm space-y-4 relative">
                                    <div className="flex items-center justify-between pb-3 border-b">
                                        <h4 className="font-medium">Gói #{i + 1}</h4>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeService(i)} className="text-destructive hover:bg-destructive/10 h-8">
                                            <Trash className="w-4 h-4 mr-2"/> Xoá gói này
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="space-y-1">
                                            <Label>Mã (ID)</Label>
                                            <Input value={svc.id || ''} onChange={(e) => updateService(i, 'id', e.target.value)} placeholder="VD: combo_1" />
                                        </div>
                                        <div className="space-y-1 md:col-span-3">
                                            <Label>Tên dịch vụ/Gói</Label>
                                            <Input value={svc.name || ''} onChange={(e) => updateService(i, 'name', e.target.value)} placeholder="Ảnh thẻ chuẩn Hàn Quốc" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <Label>Giá gốc (đ)</Label>
                                            <Input type="number" value={svc.originalPrice ?? ''} onChange={(e) => updateService(i, 'originalPrice', e.target.value ? Number(e.target.value) : 0)} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Giá Ưu đãi đ (Sale)</Label>
                                            <Input type="number" value={svc.salePrice ?? ''} onChange={(e) => updateService(i, 'salePrice', e.target.value ? Number(e.target.value) : 0)} />
                                            <p className="text-[10px] text-muted-foreground mt-1">Sẽ dùng nếu Chưa đến Thời hạn</p>
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Giá Hết hạn đ (Late)</Label>
                                            <Input type="number" value={svc.latePrice ?? ''} onChange={(e) => updateService(i, 'latePrice', e.target.value ? Number(e.target.value) : undefined)} placeholder="Trống = Về Giá gốc" />
                                            <p className="text-[10px] text-muted-foreground mt-1">Sẽ dùng khi Quá thời hạn đếm ngược</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                                        <div className="space-y-1 md:col-span-2">
                                            <Label>Nhấn mạnh Tiết kiệm (Saving text)</Label>
                                            <Input value={svc.savingText || ''} onChange={(e) => updateService(i, 'savingText', e.target.value)} placeholder="VD: -60K" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Tag Banner (Góc tựa)</Label>
                                            <Input value={svc.tagLabel || ''} onChange={(e) => updateService(i, 'tagLabel', e.target.value)} placeholder="VD: Giảm 30%" />
                                        </div>
                                        <div className="space-y-1 flex flex-col">
                                            <Label className="mb-1">Màu sắc Tag</Label>
                                            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={svc.tagStyle || 'tagHot'} onChange={(e) => updateService(i, 'tagStyle', e.target.value)}>
                                                <option value="tagHot">Đỏ (Hot)</option>
                                                <option value="tagBest">Xanh (Best)</option>
                                                <option value="tagCombo">Vàng nhạt (Combo)</option>
                                            </select>
                                        </div>
                                        <div className="pb-2">
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" id={`isCombo-${i}`} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" checked={svc.isCombo} onChange={(e) => updateService(i, 'isCombo', e.target.checked)} />
                                                <Label htmlFor={`isCombo-${i}`} className="cursor-pointer">Gói Combo?</Label>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <Label>Mô tả ngắn ở dưới Tên gói</Label>
                                        <Input value={svc.description || ''} onChange={(e) => updateService(i, 'description', e.target.value)} placeholder="VD: Chỉnh sửa hình dạng khuôn mặt đa chiều..." />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Quyền lợi kèm theo (Mỗi dòng một quyền lợi)</Label>
                                        <Textarea 
                                            rows={4}
                                            value={(svc.features || []).join('\n')} 
                                            onChange={(e) => updateService(i, 'features', e.target.value.split('\n'))} 
                                            placeholder="Xử lý da chuyên sâu&#10;Tặng in 2 vỉ ảnh tiêu chuẩn&#10;Gửi kèm file gốc chất lượng cao..." 
                                            className="text-sm leading-relaxed"
                                        />
                                    </div>
                                </div>
                            ))}
                            <Button type="button" variant="outline" className="w-full border-dashed py-8" onClick={addService}>
                                <Plus className="w-4 h-4 mr-2" /> Thêm gói dịch vụ/sản phẩm mới
                            </Button>
                        </div>
                    )}
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
