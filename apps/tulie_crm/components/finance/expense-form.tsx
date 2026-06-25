'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@repo/ui'
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
import { toast } from 'sonner'
import { createExpense, updateExpense } from '@/lib/supabase/services/expense-service'
import { LoadingSpinner } from '@repo/ui'

interface ExpenseDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    expense?: any // if provided, we are in Edit mode
    onSuccess: () => void
}

export function ExpenseDialog({ open, onOpenChange, expense, onSuccess }: ExpenseDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [title, setTitle] = useState('')
    const [amount, setAmount] = useState('')
    const [date, setDate] = useState('')
    const [category, setCategory] = useState('other')
    const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
    const [description, setDescription] = useState('')

    useEffect(() => {
        if (expense) {
            setTitle(expense.title || '')
            setAmount(expense.amount ? String(expense.amount) : '')
            setDate(expense.date ? expense.date.substring(0, 10) : new Date().toISOString().split('T')[0])
            setCategory(expense.category || 'other')
            setPaymentMethod(expense.payment_method || 'bank_transfer')
            setDescription(expense.description || '')
        } else {
            setTitle('')
            setAmount('')
            setDate(new Date().toISOString().split('T')[0])
            setCategory('other')
            setPaymentMethod('bank_transfer')
            setDescription('')
        }
    }, [expense, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!category) {
            toast.error('Vui lòng chọn danh mục chi phí')
            return
        }
        if (!amount || Number(amount) <= 0) {
            toast.error('Số tiền phải lớn hơn 0')
            return
        }

        try {
            setIsLoading(true)
            const payload = {
                title,
                amount: Number(amount),
                date,
                category,
                payment_method: paymentMethod,
                description
            }

            if (expense?.id) {
                await updateExpense(expense.id, payload)
                toast.success('Cập nhật chi phí thành công')
            } else {
                await createExpense(payload)
                toast.success('Thêm chi phí thành công')
            }
            onSuccess()
            onOpenChange(false)
        } catch (err: any) {
            toast.error(err.message || 'Lỗi hệ thống')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>{expense ? 'Cập nhật khoản chi' : 'Thêm khoản chi mới'}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="title">Tiêu đề / Khoản chi</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ví dụ: Tiền điện tháng 6, Mua hosting..."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="amount">Số tiền (VND)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Nhập số tiền..."
                                    required
                                    min="1"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="date">Ngày chi</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="category">Danh mục</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Chọn danh mục..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="salary">Lương nhân viên</SelectItem>
                                        <SelectItem value="marketing">Marketing / Quảng cáo</SelectItem>
                                        <SelectItem value="office">Văn phòng / Thuê nhà</SelectItem>
                                        <SelectItem value="server">Server / Tool / Hạ tầng</SelectItem>
                                        <SelectItem value="other">Chi phí khác</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="payment_method">Phương thức</Label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger id="payment_method">
                                        <SelectValue placeholder="Chọn phương thức..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bank_transfer">Chuyển khoản</SelectItem>
                                        <SelectItem value="cash">Tiền mặt</SelectItem>
                                        <SelectItem value="card">Thẻ tín dụng</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="description">Ghi chú thêm</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Thông tin chi tiết về khoản chi này..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <LoadingSpinner className="mr-2 h-4 w-4" />}
                            {expense ? 'Cập nhật' : 'Thêm mới'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
