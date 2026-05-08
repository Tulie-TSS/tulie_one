'use client'

import React, { useState } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Button } from '@repo/ui'
import { FileDown, Loader2 } from 'lucide-react'
import { RetailOrder } from '@/types'
import OrderExportPdf from './order-export-pdf'
import { getRetailOrdersWithItems } from '@/lib/supabase/services/retail-order-service'
import { toast } from 'sonner'

interface RetailOrderExportButtonProps {
    orderIds: string[]
    variant?: 'default' | 'outline' | 'secondary' | 'ghost'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    label?: string
}

export function RetailOrderExportButton({ 
    orderIds, 
    variant = 'outline', 
    size = 'sm',
    label = 'Xuất danh sách chi tiết'
}: RetailOrderExportButtonProps) {
    const [ordersWithItems, setOrdersWithItems] = useState<RetailOrder[] | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handlePrepare = async () => {
        if (orderIds.length === 0) {
            toast.error('Vui lòng chọn ít nhất một đơn hàng để xuất')
            return
        }

        try {
            setIsLoading(true)
            const data = await getRetailOrdersWithItems(orderIds)
            setOrdersWithItems(data)
            toast.success('Đã sẵn sàng tải xuống')
        } catch (error) {
            console.error('Error preparing export:', error)
            toast.error('Có lỗi xảy ra khi chuẩn bị dữ liệu')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <Button variant={variant} size={size} disabled className="gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang chuẩn bị...
            </Button>
        )
    }

    if (ordersWithItems) {
        return (
            <PDFDownloadLink
                document={<OrderExportPdf orders={ordersWithItems} />}
                fileName={`danh-sach-don-hang-studio-${new Date().getTime()}.pdf`}
                className="inline-block"
            >
                {({ loading }) => (
                    <Button 
                        variant="default" 
                        size={size} 
                        className="gap-2"
                        disabled={loading}
                        onClick={() => setTimeout(() => setOrdersWithItems(null), 2000)}
                    >
                        <FileDown className="h-4 w-4" />
                        {loading ? 'Đang tạo PDF...' : 'Tải PDF về'}
                    </Button>
                )}
            </PDFDownloadLink>
        )
    }

    return (
        <Button 
            variant={variant} 
            size={size} 
            onClick={handlePrepare}
            className="gap-2"
            disabled={orderIds.length === 0}
        >
            <FileDown className="h-4 w-4" />
            {label}
        </Button>
    )
}
