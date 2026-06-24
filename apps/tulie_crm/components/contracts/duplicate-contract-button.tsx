'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@repo/ui'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { duplicateContract } from '@/lib/supabase/services/contract-service'

interface DuplicateContractButtonProps {
    contractId: string
    compact?: boolean
}

export function DuplicateContractButton({ contractId, compact = false }: DuplicateContractButtonProps) {
    const router = useRouter()
    const [isDuplicating, setIsDuplicating] = useState(false)

    const handleDuplicate = async () => {
        setIsDuplicating(true)
        try {
            const duplicated = await duplicateContract(contractId)
            toast.success('Đã tạo bản nháp nhân bản')
            router.push(`/contracts/${duplicated.id}/edit`)
            router.refresh()
        } catch (error) {
            toast.error((error as Error).message || 'Không thể nhân bản hợp đồng')
        } finally {
            setIsDuplicating(false)
        }
    }

    return (
        <Button type="button" variant="outline" size="sm" onClick={handleDuplicate} disabled={isDuplicating}>
            <Copy className="h-4 w-4" />
            {!compact && <span className="ml-2">{isDuplicating ? 'Đang nhân bản...' : 'Nhân bản'}</span>}
        </Button>
    )
}
