'use client'

import { useState } from 'react'
import { Button } from '@repo/ui'
import { Star } from 'lucide-react'
import { toggleDefault } from '@/lib/supabase/services/quote-portal-service'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function PortalItemActions({ 
    portalId, 
    quotationId, 
    isDefault 
}: { 
    portalId: string, 
    quotationId: string, 
    isDefault: boolean 
}) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSetDefault = async () => {
        if (isDefault) return // already default
        setIsLoading(true)
        try {
            const res = await toggleDefault(portalId, quotationId)
            if (res.success) {
                toast.success('Đã đặt làm báo giá mặc định')
                router.refresh()
            } else {
                toast.error(res.error || 'Có lỗi xảy ra')
            }
        } catch (err) {
            toast.error('Lỗi khi thiết lập')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSetDefault}
                disabled={isLoading || isDefault}
                className={`text-xs px-2 ${isDefault ? 'text-amber-500 opacity-100' : 'text-slate-400 hover:text-amber-500'}`}
                title="Mở mặc định khi khách hàng truy cập Portal"
            >
                <Star className={`w-4 h-4 mr-1.5 ${isDefault ? 'fill-current' : ''}`} />
                {isDefault ? 'Đang Mở Mặc Định' : 'Đặt Làm Mặc Định'}
            </Button>
        </div>
    )
}
