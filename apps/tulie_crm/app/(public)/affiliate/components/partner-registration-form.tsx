'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPartnerRegistrationSchema } from '@/lib/security/validation'
import { z } from 'zod'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Button,
    Input,
    Textarea,
    Label,
    RadioGroup,
    RadioGroupItem,
    ScrollArea,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@repo/ui'
import { FileUpload, UploadFile } from '@repo/ui/src/patterns/file-upload'
import { toast } from 'sonner'
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'

type FormData = z.infer<typeof createPartnerRegistrationSchema>

export function PartnerRegistrationForm() {
    const [open, setOpen] = React.useState(false)
    const [step, setStep] = React.useState(1)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isSuccess, setIsSuccess] = React.useState(false)
    
    // File state
    const [idCardType, setIdCardType] = React.useState<'images'|'pdf'>('images')
    const [frontFile, setFrontFile] = React.useState<UploadFile | null>(null)
    const [backFile, setBackFile] = React.useState<UploadFile | null>(null)
    const [pdfFile, setPdfFile] = React.useState<UploadFile | null>(null)

    const form = useForm<FormData>({
        resolver: zodResolver(createPartnerRegistrationSchema),
        defaultValues: {
            full_name: '',
            phone: '',
            email: '',
            address: '',
            id_card_type: 'images',
            bank_account_number: '',
            bank_account_name: '',
            bank_name: '',
            preferred_role: 'consult_close',
            experience: '',
            referral_source: '',
            note: ''
        }
    })

    // Reset when closed
    React.useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setStep(1)
                setIsSuccess(false)
                form.reset()
                setFrontFile(null)
                setBackFile(null)
                setPdfFile(null)
            }, 300)
        }
    }, [open, form])

    const uploadFile = async (file: File) => {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/partner-upload', {
            method: 'POST',
            body: formData
        })

        if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error || 'Upload thất bại')
        }

        const data = await res.json()
        return { url: data.url }
    }

    const nextStep = async () => {
        let valid = false
        if (step === 1) {
            valid = await form.trigger(['full_name', 'phone', 'email', 'address'])
        } else if (step === 2) {
            // Validate CCCD
            if (idCardType === 'images') {
                if (!frontFile?.url || !backFile?.url) {
                    toast.error('Vui lòng upload đầy đủ ảnh CCCD 2 mặt')
                    return
                }
                form.setValue('id_card_front_url', frontFile.url)
                form.setValue('id_card_back_url', backFile.url)
            } else {
                if (!pdfFile?.url) {
                    toast.error('Vui lòng upload file PDF CCCD')
                    return
                }
                form.setValue('id_card_pdf_url', pdfFile.url)
            }
            form.setValue('id_card_type', idCardType)
            valid = true
        }
        
        if (valid) setStep(step + 1)
    }

    const prevStep = () => setStep(step - 1)

    const onSubmit = async (data: FormData) => {
        try {
            setIsSubmitting(true)
            const res = await fetch('/api/partner-register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Đăng ký thất bại')
            }

            setIsSuccess(true)
            toast.success('Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.')
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Custom onChange to sync hook-form state
    const handleRoleChange = (val: string) => {
        form.setValue('preferred_role', val as any)
    }

    if (isSuccess) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button size="lg" className="w-full mt-2 group">
                        Đăng ký trở thành Đối tác
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Đăng ký thành công!</h2>
                        <p className="text-muted-foreground text-sm mb-6">
                            Cảm ơn bạn đã đăng ký trở thành đối tác của Tulie. Đội ngũ của chúng tôi sẽ xem xét thông tin và liên hệ với bạn qua số điện thoại hoặc email trong vòng 24h làm việc.
                        </p>
                        <Button onClick={() => setOpen(false)} variant="outline" className="w-full">
                            Đóng
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="w-full mt-2 group">
                    Đăng ký trở thành Đối tác
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden flex flex-col h-[90vh] sm:h-auto sm:max-h-[90vh]">
                <div className="px-6 py-4 border-b shrink-0">
                    <DialogTitle className="text-xl">Đăng ký Đối tác Kinh doanh</DialogTitle>
                    <DialogDescription>
                        Trở thành cộng tác viên phát triển kinh doanh của Tulie. Vui lòng điền thông tin chính xác.
                    </DialogDescription>
                </div>
                
                <div className="flex px-6 py-3 border-b bg-muted/40 shrink-0">
                    <div className="flex items-center text-sm font-medium text-muted-foreground">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 border ${step >= 1 ? 'bg-primary text-primary-foreground border-primary' : 'bg-background'}`}>1</span>
                        <span className={step >= 1 ? 'text-foreground' : ''}>Cá nhân</span>
                        <div className="w-8 h-[1px] bg-border mx-2" />
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 border ${step >= 2 ? 'bg-primary text-primary-foreground border-primary' : 'bg-background'}`}>2</span>
                        <span className={step >= 2 ? 'text-foreground' : ''}>CCCD</span>
                        <div className="w-8 h-[1px] bg-border mx-2" />
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 border ${step === 3 ? 'bg-primary text-primary-foreground border-primary' : 'bg-background'}`}>3</span>
                        <span className={step === 3 ? 'text-foreground' : ''}>Bổ sung</span>
                    </div>
                </div>

                <ScrollArea className="flex-1 px-6 py-4">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        
                        {/* ─── STEP 1 ──────────────────────────────── */}
                        <div className={step === 1 ? 'block space-y-4' : 'hidden'}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Họ và tên <span className="text-destructive">*</span></Label>
                                    <Input id="full_name" placeholder="Nguyễn Văn A" {...form.register('full_name')} />
                                    {form.formState.errors.full_name && <p className="text-xs text-destructive">{form.formState.errors.full_name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Số điện thoại <span className="text-destructive">*</span></Label>
                                    <Input id="phone" placeholder="0988..." {...form.register('phone')} />
                                    {form.formState.errors.phone && <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="email@example.com" {...form.register('email')} />
                                {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Địa chỉ thường trú</Label>
                                <Input id="address" placeholder="Quận/Huyện, Tỉnh/Thành phố..." {...form.register('address')} />
                            </div>
                        </div>

                        {/* ─── STEP 2 ──────────────────────────────── */}
                        <div className={step === 2 ? 'block space-y-6' : 'hidden'}>
                            <div className="space-y-3">
                                <Label>Bản sao Căn cước công dân <span className="text-destructive">*</span></Label>
                                <p className="text-sm text-muted-foreground">Tài liệu bảo mật, chỉ dùng để đối chiếu khi ký Hợp đồng CTV và chi trả hoa hồng.</p>
                                
                                <RadioGroup 
                                    value={idCardType} 
                                    onValueChange={(v) => setIdCardType(v as 'images'|'pdf')}
                                    className="flex w-full mb-4"
                                >
                                    <div className="flex items-center space-x-2 mr-6">
                                        <RadioGroupItem value="images" id="opt-images" />
                                        <Label htmlFor="opt-images">Ảnh 2 mặt (JPG/PNG)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="pdf" id="opt-pdf" />
                                        <Label htmlFor="opt-pdf">File PDF</Label>
                                    </div>
                                </RadioGroup>

                                {idCardType === 'pdf' ? (
                                    <FileUpload
                                        accept={{ 'application/pdf': ['.pdf'] }}
                                        maxFiles={1}
                                        maxSize={10 * 1024 * 1024}
                                        placeholder="Kéo thả hoặc nhấn để chọn file PDF CCCD"
                                        description="Bản scan PDF có bản quyền/watermark của ứng dụng VNeID (khuyên dùng)"
                                        onUpload={uploadFile}
                                        onFilesChange={(files) => setPdfFile(files[0] || null)}
                                        value={pdfFile ? [pdfFile] : []}
                                    />
                                ) : (
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <FileUpload
                                            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
                                            maxFiles={1}
                                            maxSize={10 * 1024 * 1024}
                                            placeholder="Mặt trước CCCD"
                                            description="Ảnh chụp rõ net, không bị cắt góc"
                                            onUpload={uploadFile}
                                            onFilesChange={(files) => setFrontFile(files[0] || null)}
                                            value={frontFile ? [frontFile] : []}
                                        />
                                        <FileUpload
                                            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
                                            maxFiles={1}
                                            maxSize={10 * 1024 * 1024}
                                            placeholder="Mặt sau CCCD"
                                            description="Bao gồm thông tin đặc điểm nhận dạng"
                                            onUpload={uploadFile}
                                            onFilesChange={(files) => setBackFile(files[0] || null)}
                                            value={backFile ? [backFile] : []}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ─── STEP 3 ──────────────────────────────── */}
                        <div className={step === 3 ? 'block space-y-4' : 'hidden'}>
                            <h3 className="font-medium">Tài khoản Ngân hàng (Để nhận hoa hồng)</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="bank_name">Ngân hàng</Label>
                                    <Input id="bank_name" placeholder="VD: Vietcombank" {...form.register('bank_name')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bank_account_number">Số tài khoản</Label>
                                    <Input id="bank_account_number" placeholder="123456789" {...form.register('bank_account_number')} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bank_account_name">Chủ tài khoản</Label>
                                <Input id="bank_account_name" placeholder="Tên in hoa không dấu..." {...form.register('bank_account_name')} />
                                <p className="text-[10px] text-muted-foreground mt-1">Lưu ý: Tên chủ tài khoản phải trùng khớp với Căn cước công dân.</p>
                            </div>

                            <div className="h-px bg-border my-4" />

                            <h3 className="font-medium">Thông tin bổ sung</h3>
                            <div className="space-y-2">
                                <Label>Vai trò bạn muốn tham gia</Label>
                                <Select defaultValue="consult_close" onValueChange={handleRoleChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn vai trò" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lead_only">Chỉ giới thiệu khách (Hoa hồng 10%) - Không cần tư vấn</SelectItem>
                                        <SelectItem value="consult_close">Tư vấn & chốt hợp đồng (Hoa hồng 15%) - Role tiêu chuẩn</SelectItem>
                                        <SelectItem value="full_close">Tự chốt (Hoa hồng 20%) - Dành cho chuyên gia</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="experience">Kinh nghiệm của bạn (Tuỳ chọn)</Label>
                                <Textarea id="experience" placeholder="VD: Đã làm Sales B2B 2 năm, có mối quan hệ với tệp doanh nghiệp SME..." className="h-20" {...form.register('experience')} />
                            </div>
                        </div>
                    </form>
                </ScrollArea>

                <div className="px-6 py-4 border-t bg-muted/40 shrink-0 flex justify-between">
                    {step > 1 ? (
                        <Button type="button" variant="outline" onClick={prevStep}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại
                        </Button>
                    ) : (
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Hủy</Button>
                    )}
                    
                    {step < 3 ? (
                        <Button type="button" onClick={nextStep}>
                            Tiếp tục
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                            {isSubmitting ? 'Đang gửi...' : 'Hoàn tất Đăng ký'}
                            {!isSubmitting && <CheckCircle2 className="w-4 h-4 ml-2" />}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
