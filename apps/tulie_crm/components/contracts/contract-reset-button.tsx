'use client'

import { useState, useTransition } from 'react'
import { Button } from '@repo/ui'
import { RotateCcw } from 'lucide-react'
import { resetContract } from '@/lib/supabase/services/contract-service'
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
    AlertDialogTrigger,
} from '@repo/ui'
import { useRouter } from 'next/navigation'

export function ContractResetButton({ contractId }: { contractId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleReset = () => {
        startTransition(async () => {
            const result = await resetContract(contractId)
            if (result.success) {
                toast.success('Đã reset trạng thái hợp đồng thành công')
                setIsOpen(false)
                router.refresh()
            } else {
                toast.error(result.error || 'Có lỗi xảy ra khi reset hợp đồng')
            }
        })
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Làm lại (Reset)
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận reset hợp đồng?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Thao tác này sẽ đưa hợp đồng về trạng thái "Bản nháp", xóa ngày ký và đưa toàn bộ các mốc thanh toán/công việc về trạng thái "Chưa hoàn thành" (Pending).
                        Sử dụng tính năng này khi khách hàng delay triển khai và bạn muốn bắt đầu lại vòng đời hợp đồng mà không cần tạo mới.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleReset()
                        }}
                        disabled={isPending}
                        className="bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950"
                    >
                        {isPending ? 'Đang xử lý...' : 'Xác nhận Reset'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
