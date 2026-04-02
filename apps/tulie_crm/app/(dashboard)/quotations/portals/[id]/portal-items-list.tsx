'use client'

import { useState, useTransition } from 'react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { ArrowUp, ArrowDown, ArrowUpDown, Calendar, SortAsc } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/format'
import { reorderPortalItems } from '@/lib/supabase/services/quote-portal-service'
import { PortalItemActions } from './item-actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface PortalItem {
    id: string
    quotation_id: string
    sort_order: number
    is_recommended: boolean
    is_default: boolean
    created_at: string
    quotation?: {
        id: string
        quotation_number?: string
        title?: string
        status?: string
        total_amount?: number
        version_name?: string
        created_at?: string
    }
}

export function PortalItemsList({
    portalId,
    initialItems,
}: {
    portalId: string
    initialItems: PortalItem[]
}) {
    const [items, setItems] = useState<PortalItem[]>(initialItems)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const persistOrder = async (newItems: PortalItem[]) => {
        const orderedIds = newItems.map(i => i.quotation_id)
        startTransition(async () => {
            const res = await reorderPortalItems(portalId, orderedIds)
            if (res.success) {
                router.refresh()
            } else {
                toast.error(res.error || 'Lỗi khi sắp xếp')
            }
        })
    }

    const handleAutoSort = () => {
        const sorted = [...items].sort(
            (a, b) => (a.quotation?.total_amount || 0) - (b.quotation?.total_amount || 0)
        )
        const reindexed = sorted.map((item, idx) => ({ ...item, sort_order: idx }))
        setItems(reindexed)
        persistOrder(reindexed)
        toast.success('Đã sắp xếp giá từ thấp đến cao')
    }

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return
        if (direction === 'down' && index === items.length - 1) return

        const newItems = [...items]
        const targetIdx = direction === 'up' ? index - 1 : index + 1
        ;[newItems[index], newItems[targetIdx]] = [newItems[targetIdx], newItems[index]]
        const reindexed = newItems.map((item, idx) => ({ ...item, sort_order: idx }))
        setItems(reindexed)
        persistOrder(reindexed)
    }

    if (items.length === 0) {
        return (
            <div className="p-8 text-center text-sm text-muted-foreground">
                Chưa có báo giá nào trong portal này.
            </div>
        )
    }

    return (
        <div>
            {/* Sort toolbar */}
            <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-muted/30">
                <span className="text-xs text-muted-foreground font-medium">
                    {items.length} phương án
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAutoSort}
                        disabled={isPending}
                        className="text-xs h-7 px-2.5 gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                        <SortAsc className="w-3.5 h-3.5" />
                        Sắp xếp theo giá ↑
                    </Button>
                </div>
            </div>

            {/* Items list */}
            <div className="divide-y divide-border">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/50 transition-colors ${isPending ? 'opacity-60 pointer-events-none' : ''}`}
                    >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Manual reorder arrows */}
                            <div className="flex flex-col items-center gap-0.5 pt-0.5">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 text-muted-foreground/40 hover:text-foreground"
                                    onClick={() => moveItem(index, 'up')}
                                    disabled={index === 0 || isPending}
                                >
                                    <ArrowUp className="h-3 w-3" />
                                </Button>
                                <span className="text-[10px] text-muted-foreground font-mono tabular-nums leading-none">
                                    {index + 1}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 text-muted-foreground/40 hover:text-foreground"
                                    onClick={() => moveItem(index, 'down')}
                                    disabled={index === items.length - 1 || isPending}
                                >
                                    <ArrowDown className="h-3 w-3" />
                                </Button>
                            </div>

                            {/* Item info */}
                            <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Link
                                        href={`/quotations/${item.quotation?.id}`}
                                        className="text-sm font-medium text-foreground hover:underline truncate"
                                    >
                                        #{item.quotation?.quotation_number} — {item.quotation?.title}
                                    </Link>
                                    <Badge variant="secondary" className="text-[10px] shrink-0">
                                        {item.quotation?.status}
                                    </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </span>
                                    <span className="font-bold text-foreground tabular-nums">
                                        {formatCurrency(item.quotation?.total_amount || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="shrink-0">
                            <PortalItemActions
                                portalId={portalId}
                                quotationId={item.quotation_id}
                                isDefault={item.is_default || false}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
