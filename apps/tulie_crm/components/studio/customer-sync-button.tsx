'use client'

import React, { useState } from 'react'
import { Button } from '@repo/ui'
import { RefreshCcw, Loader2 } from 'lucide-react'
import { syncAllRetailOrdersToCustomers } from '@/lib/supabase/services/retail-order-service'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function RetailCustomerSyncButton() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSync = async () => {
        try {
            setIsLoading(true)
            const result = await syncAllRetailOrdersToCustomers()
            toast.success(`Đã đồng bộ thành công ${result.count} khách hàng từ đơn hàng cũ`)
            router.refresh()
        } catch (error: any) {
            console.error('Error syncing customers:', error)
            toast.error(error.message || 'Có lỗi xảy ra khi đồng bộ dữ liệu')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSync}
            disabled={isLoading}
            className="gap-2"
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <RefreshCcw className="h-4 w-4" />
            )}
            {isLoading ? 'Đang đồng bộ...' : 'Đồng bộ khách từ đơn hàng'}
        </Button>
    )
}
