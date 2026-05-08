'use client'

import { RetailOrder } from '@/types'
import { DataTable } from '@/components/shared/data-table'
import { retailOrderColumns } from './order-columns'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteRetailOrders, updateRetailOrder } from '@/lib/supabase/services/retail-order-service'
import { Ban } from 'lucide-react'
import { RetailOrderExportButton } from './order-export-button'

interface RetailOrderListProps {
    initialData: RetailOrder[]
}

export function RetailOrderList({ initialData }: RetailOrderListProps) {
    const router = useRouter()

    const handleDelete = async (rows: RetailOrder[]) => {
        try {
            await deleteRetailOrders(rows.map((row) => row.id))
            toast.success(`Đã xóa ${rows.length} đơn hàng`)
            router.refresh()
        } catch (error) {
            toast.error(`Lỗi xóa đơn hàng: ${(error as any)?.message || 'Thử lại sau'}`)
        }
    }

    const handleBulkCancel = async (rows: RetailOrder[]) => {
        try {
            await Promise.all(
                rows.map((row) => updateRetailOrder(row.id, { order_status: 'cancelled' }))
            )
            toast.success(`Đã hủy ${rows.length} đơn hàng`)
            router.refresh()
        } catch (error) {
            toast.error(`Lỗi hủy đơn hàng: ${(error as any)?.message || 'Thử lại sau'}`)
        }
    }

    return (
        <div className="space-y-4">
            <DataTable
                columns={retailOrderColumns}
                data={initialData}
                searchKey="order_number"
                searchPlaceholder="Tìm theo mã đơn (Ví dụ: ORD-001)..."
                filters={[
                    {
                        columnId: 'order_status',
                        title: 'Trạng thái đơn',
                        options: [
                            { label: 'Chờ xử lý', value: 'pending' },
                            { label: 'Đang chỉnh sửa', value: 'editing' },
                            { label: 'Xong chỉnh sửa', value: 'edit_done' },
                            { label: 'Chờ giao hàng', value: 'waiting_ship' },
                            { label: 'Đang giao hàng', value: 'shipping' },
                            { label: 'Hoàn thành', value: 'completed' },
                            { label: 'Đã hủy', value: 'cancelled' },
                        ],
                    },
                    {
                        columnId: 'brand',
                        title: 'Thương hiệu',
                        options: [
                            { label: 'Agency', value: 'agency' },
                            { label: 'Studio', value: 'studio' },
                            { label: 'Academy', value: 'academy' },
                        ],
                    },
                    {
                        columnId: 'payment_status',
                        title: 'Thanh toán',
                        options: [
                            { label: 'Chờ thanh toán', value: 'pending' },
                            { label: 'Thanh toán một phần', value: 'partial' },
                            { label: 'Đã thanh toán', value: 'paid' },
                        ],
                    },
                ]}
                onDelete={handleDelete}
                bulkActions={[
                    {
                        label: 'Hủy đơn hàng',
                        icon: <Ban className="h-4 w-4" />,
                        onAction: handleBulkCancel,
                        variant: 'destructive',
                    },
                ]}
                extraActions={(rows) => (
                    <RetailOrderExportButton 
                        orderIds={rows.map(r => r.id)} 
                        variant="outline"
                        label={`Xuất ${rows.length} đơn đã chọn`}
                    />
                )}
                toolbarActions={(rows) => (
                    <RetailOrderExportButton 
                        orderIds={rows.map(r => r.id)} 
                        variant="secondary"
                        label={`Xuất ${rows.length} đơn theo bộ lọc`}
                    />
                )}
            />
        </div>
    )
}
