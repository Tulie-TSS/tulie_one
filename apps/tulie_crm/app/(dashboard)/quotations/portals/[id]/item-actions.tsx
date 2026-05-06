'use client'

import { useState } from 'react'
import { Button } from '@repo/ui'
import { Star } from 'lucide-react'
import { toggleDefault, toggleRecommended } from '@/lib/supabase/services/quote-portal-service'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function PortalItemActions({ 
    portalId, 
    quotationId, 
    isDefault,
    isRecommended
}: { 
    portalId: string, 
    quotationId: string, 
    isDefault: boolean,
    isRecommended: boolean
}) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSetDefault = async () => {
        if (isDefault) return 
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

    const handleToggleVisibility = async () => {
        setIsLoading(true)
        try {
            const res = await toggleRecommended(portalId, quotationId, !isRecommended)
            if (res.success) {
                toast.success(isRecommended ? 'Đã ẩn khỏi portal' : 'Đã hiển thị trên portal')
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
                onClick={handleToggleVisibility}
                disabled={isLoading}
                className={`text-xs px-2 ${isRecommended ? 'text-emerald-600' : 'text-slate-400'}`}
                title="Ẩn/Hiện báo giá này trên Public Portal"
            >
                {isRecommended ? 'Đang Hiển Thị' : 'Đang Ẩn'}
            </Button>

            <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSetDefault}
                disabled={isLoading || isDefault}
                className={`text-xs px-2 ${isDefault ? 'text-amber-500 opacity-100' : 'text-slate-400 hover:text-amber-500'}`}
                title="Mở mặc định khi khách hàng truy cập Portal"
            >
                <Star className={`w-4 h-4 mr-1.5 ${isDefault ? 'fill-current' : ''}`} />
                {isDefault ? 'Mặc Định' : 'Đặt Mặc Định'}
            </Button>
        </div>
    )
}
