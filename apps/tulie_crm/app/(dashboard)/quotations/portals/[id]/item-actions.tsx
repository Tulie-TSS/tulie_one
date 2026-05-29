'use client'

import { useState } from 'react'
import { Button } from '@repo/ui'
import { Star, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toggleDefault, toggleRecommended } from '@/lib/supabase/services/quote-portal-service'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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
    const [localRecommended, setLocalRecommended] = useState(isRecommended)
    const [localDefault, setLocalDefault] = useState(isDefault)

    const handleSetDefault = async () => {
        if (localDefault) return 
        const previous = localDefault
        setLocalDefault(true) // Optimistic update
        setIsLoading(true)
        try {
            const res = await toggleDefault(portalId, quotationId)
            if (res.success) {
                toast.success('Đã đặt làm báo giá mặc định')
            } else {
                setLocalDefault(previous) // Rollback
                toast.error(res.error || 'Có lỗi xảy ra')
            }
        } catch (err) {
            setLocalDefault(previous) // Rollback
            toast.error('Lỗi khi thiết lập')
        } finally {
            setIsLoading(false)
        }
    }

    const handleToggleVisibility = async () => {
        const newValue = !localRecommended
        const previous = localRecommended
        setLocalRecommended(newValue) // Optimistic update
        setIsLoading(true)
        try {
            const res = await toggleRecommended(portalId, quotationId, newValue)
            if (res.success) {
                toast.success(newValue ? 'Đã hiển thị trên portal' : 'Đã ẩn khỏi portal')
            } else {
                setLocalRecommended(previous) // Rollback
                toast.error(res.error || 'Có lỗi xảy ra')
            }
        } catch (err) {
            setLocalRecommended(previous) // Rollback
            toast.error('Lỗi khi thiết lập')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-1.5">
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleToggleVisibility}
                disabled={isLoading}
                className={cn(
                    "text-xs h-8 px-2.5 gap-1.5 rounded-md transition-all font-medium",
                    localRecommended 
                        ? "text-foreground bg-primary/5 hover:bg-primary/10 border border-border" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                title="Ẩn/Hiện báo giá này trên Public Portal"
            >
                {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : localRecommended ? (
                    <Eye className="w-3.5 h-3.5" />
                ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                )}
                {localRecommended ? 'Đang Hiển Thị' : 'Đang Ẩn'}
            </Button>

            <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSetDefault}
                disabled={isLoading || localDefault}
                className={cn(
                    "text-xs h-8 px-2.5 gap-1.5 rounded-md transition-all font-medium",
                    localDefault
                        ? "text-foreground bg-primary/5 border border-border cursor-default"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                title="Mở mặc định khi khách hàng truy cập Portal"
            >
                <Star className={cn(
                    "w-3.5 h-3.5 transition-all",
                    localDefault ? 'fill-foreground text-foreground' : ''
                )} />
                {localDefault ? 'Mặc Định' : 'Đặt Mặc Định'}
            </Button>
        </div>
    )
}
