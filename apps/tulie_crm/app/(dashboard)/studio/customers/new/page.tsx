'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@repo/ui'
import { Input } from '@repo/ui'
import { Label } from '@repo/ui'
import { Textarea } from '@repo/ui'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@repo/ui'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@repo/ui'
import { Separator } from '@repo/ui'
import { ArrowLeft, Save } from 'lucide-react'
import { LoadingSpinner } from '@repo/ui'
import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createCustomer } from '@/lib/supabase/services/customer-service'
import { toast } from 'sonner'

const customerSchema = z.object({
    company_name: z.string().min(2, 'Họ tên khách hàng phải có ít nhất 2 ký tự'),
    tax_code: z.string().optional(),
    email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    invoice_address: z.string().optional(),
    industry: z.string().optional(),
    company_size: z.string().optional(),
    website: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
    customer_type: z.enum(['individual', 'business']),
    status: z.enum(['lead', 'prospect', 'customer', 'vip', 'churned']),
    notes: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerSchema>

export default function NewStudioCustomerPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            status: 'lead',
            customer_type: 'individual',
        },
    })

    const onSubmit = async (data: CustomerFormData) => {
        setIsLoading(true)

        try {
            const supabase = createClient()
            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError || !user) {
                toast.error('Bạn cần đăng nhập để thực hiện thao tác này')
                setIsLoading(false)
                return
            }

            // Clean up data
            const cleanedData = {
                ...data,
                customer_type: data.customer_type,
                tax_code: data.tax_code || undefined,
                email: data.email || undefined,
                phone: data.phone || undefined,
                address: data.address || undefined,
                invoice_address: data.invoice_address || undefined,
                industry: data.industry || undefined,
                company_size: data.company_size || undefined,
                website: data.website || undefined,
                notes: data.notes || undefined,
            }

            const result = await createCustomer({
                ...cleanedData,
                assigned_to: user.id,
                created_by: user.id,
            })

            if (result) {
                toast.success('Thêm khách hàng Studio thành công')
                setIsLoading(false)
                router.push('/studio/customers')
                router.refresh()
            } else {
                throw new Error('Không nhận được phản hồi từ hệ thống')
            }
        } catch (error: any) {
            console.error('Failed to create studio customer:', error)
            toast.error(error.message || 'Có lỗi xảy ra khi thêm khách hàng')
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80">
                    <Link href="/studio/customers">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Thêm khách hàng Studio mới</h1>
                    <p className="text-muted-foreground">
                        Nhập thông tin khách hàng cá nhân cho khối Studio
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                            <CardDescription>
                                Thông tin chính của khách hàng cá nhân
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="company_name">
                                    Họ tên khách hàng <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="company_name"
                                    placeholder="VD: Nguyễn Văn A"
                                    {...register('company_name')}
                                />
                                {errors.company_name && (
                                    <p className="text-sm text-destructive">
                                        {errors.company_name.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tax_code">Mã số thuế / CCCD</Label>
                                <Input
                                    id="tax_code"
                                    placeholder="VD: 0123456789"
                                    {...register('tax_code')}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="email@domain.com"
                                        {...register('email')}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Số điện thoại</Label>
                                    <Input
                                        id="phone"
                                        placeholder="VD: 0901234567"
                                        {...register('phone')}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website">Website / Portfolio</Label>
                                <Input
                                    id="website"
                                    placeholder="https://..."
                                    {...register('website')}
                                />
                                {errors.website && (
                                    <p className="text-sm text-destructive">
                                        {errors.website.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Trạng thái</Label>
                                <Select
                                    defaultValue="lead"
                                    onValueChange={(value) =>
                                        setValue('status', value as CustomerFormData['status'])
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lead">Tiềm năng</SelectItem>
                                        <SelectItem value="prospect">Đang theo dõi</SelectItem>
                                        <SelectItem value="customer">Khách hàng</SelectItem>
                                        <SelectItem value="vip">VIP</SelectItem>
                                        <SelectItem value="churned">Đã rời bỏ</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address & Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Địa chỉ & Ghi chú</CardTitle>
                            <CardDescription>
                                Địa chỉ liên hệ và ghi chú thông tin
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="address">Địa chỉ</Label>
                                <Textarea
                                    id="address"
                                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                    {...register('address')}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="invoice_address">
                                    Địa chỉ xuất hóa đơn
                                </Label>
                                <Textarea
                                    id="invoice_address"
                                    placeholder="Địa chỉ xuất hóa đơn đỏ (nếu có)"
                                    {...register('invoice_address')}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="notes">Ghi chú</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Thông tin thêm về khách hàng..."
                                    {...register('notes')}
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/studio/customers">Hủy</Link>
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                        <Save className="h-4 w-4" />
                        Lưu khách hàng
                    </Button>
                </div>
            </form>
        </div>
    )
}
