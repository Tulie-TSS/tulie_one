'use client'

import { useState } from 'react'
import { Button } from '@repo/ui'
import { LoadingSpinner } from '@repo/ui'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@repo/ui'
import { Input } from '@repo/ui'
import { Label } from '@repo/ui'
import { Textarea } from '@repo/ui'
import { CheckCircle, Banknote } from 'lucide-react'
import { confirmMilestonePayment } from '@/lib/supabase/services/contract-service'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils/format'

interface MilestoneConfirmButtonProps {
    milestoneId: string
    milestoneName: string
    amount: number
    status: string
}

export function MilestoneConfirmButton({ milestoneId, milestoneName, amount, status }: MilestoneConfirmButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
    const [notes, setNotes] = useState('')
    const router = useRouter()

    if (status === 'completed') {
        return null
    }

    async function handleConfirm() {
        setIsLoading(true)
        try {
            const result = await confirmMilestonePayment(milestoneId, {
                payment_date: new Date(paymentDate).toISOString(),
                notes: notes || undefined,
            })

            if (result.success) {
                toast.success('Đã xác nhận thanh toán', {
                    description: `Milestone "${milestoneName}" — ${formatCurrency(amount)}. Hóa đơn đã được tạo tự động.`,
                })
                setIsOpen(false)
                router.refresh()
            } else {
                toast.error('Lỗi xác nhận', { description: result.error })
            }
        } catch (err: any) {
            toast.error('Lỗi hệ thống', { description: err.message })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Banknote className="h-3.5 w-3.5" />
                    Xác nhận TT
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận thanh toán milestone</AlertDialogTitle>
                    <AlertDialogDescription>
                        Xác nhận khách hàng đã thanh toán đợt <strong>"{milestoneName}"</strong> với
                        số tiền <strong>{formatCurrency(amount)}</strong>. Hệ thống sẽ tự động tạo
                        hóa đơn và ghi nhận vào doanh thu.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="payment_date">Ngày thanh toán</Label>
                        <Input
                            id="payment_date"
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
                        <Textarea
                            id="notes"
                            placeholder="VD: Chuyển khoản qua Vietcombank..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                        />
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4" />
                                Xác nhận & Tạo hóa đơn
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
