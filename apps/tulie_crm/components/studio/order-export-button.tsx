'use client'

import React, { useState } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Button } from '@repo/ui'
import { FileDown, Loader2 } from 'lucide-react'
import { RetailOrder } from '@/types'
import OrderExportPdf from './order-export-pdf'
import { getRetailOrdersWithItems } from '@/lib/supabase/services/retail-order-service'
import { toast } from 'sonner'
import { FileSpreadsheet } from 'lucide-react'

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

    const handleExportExcel = async () => {
        if (orderIds.length === 0) {
            toast.error('Vui lòng chọn ít nhất một đơn hàng để xuất')
            return
        }

        try {
            setIsLoading(true)
            const orders = await getRetailOrdersWithItems(orderIds)
            
            // Prepare CSV data
            const headers = ["STT", "Mã đơn", "Học sinh", "SĐT", "Lớp/Địa chỉ", "Vỉ ảnh/Sản phẩm", "Tổng tiền", "Đã thu", "Ghi chú"];
            
            const rows = orders.map((order, index) => {
                const itemsText = order.items?.map(item => `${item.product_name} (x${item.quantity})`).join('; ') || '';
                const classInfo = [
                    order.metadata?.class_name,
                    order.metadata?.grade,
                    order.metadata?.school_name
                ].filter(Boolean).join(' - ');

                const shippingAddress = order.shipping_info?.address;
                const address = classInfo 
                    ? (shippingAddress ? `${classInfo} (${shippingAddress})` : classInfo)
                    : (shippingAddress || order.metadata?.address || '');

                return [
                    index + 1,
                    order.order_number,
                    order.customer_name,
                    order.customer_phone || "",
                    address.replace(/"/g, '""'),
                    itemsText.replace(/"/g, '""'),
                    order.total_amount,
                    order.paid_amount,
                    (order.notes || "").replace(/"/g, '""')
                ];
            });

            // Convert to CSV with quotes and UTF-8 BOM
            const csvContent = "\ufeff" + [headers, ...rows].map(row => 
                row.map(cell => `"${cell}"`).join(",")
            ).join("\n");

            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `danh-sach-don-hang-studio-${new Date().getTime()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success('Đã xuất file Excel thành công')
        } catch (error) {
            console.error('Error exporting excel:', error)
            toast.error('Có lỗi xảy ra khi xuất file')
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
        <div className="flex items-center gap-2">
            <Button 
                variant={variant} 
                size={size} 
                onClick={handleExportExcel}
                className="gap-2"
                disabled={orderIds.length === 0}
            >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
            </Button>
            <Button 
                variant={variant} 
                size={size} 
                onClick={handlePrepare}
                className="gap-2"
                disabled={orderIds.length === 0}
            >
                <FileDown className="h-4 w-4" />
                PDF
            </Button>
        </div>
    )
}
