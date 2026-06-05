'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Checkbox,
  Badge,
  toast
} from '@repo/ui'
import { Loader2, RefreshCw, Calendar, DollarSign, Package, FileText, CheckCircle2 } from 'lucide-react'

interface CrmSyncDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface MilestoneItem {
  id: string
  name: string
  description: string | null
  due_date: string | null
  status: string
  amount: number | null
  type: string
  contract: {
    id: string
    title: string
    project_id: string | null
  } | null
  syncedTask: {
    id: string
    title: string
    status: string
  } | null
}

interface OrderItem {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string | null
  order_date: string
  delivery_type: string
  order_status: string
  total_amount: number | null
  syncedTasks: Array<{
    id: string
    title: string
    status: string
  }>
}

export function CrmSyncDialog({ open, onOpenChange, onSuccess }: CrmSyncDialogProps) {
  const [activeTab, setActiveTab] = useState<'b2b' | 'b2c'>('b2b')
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [milestones, setMilestones] = useState<MilestoneItem[]>([])
  const [orders, setOrders] = useState<OrderItem[]>([])
  
  // Filters
  const [showOnlyUnsynced, setShowOnlyUnsynced] = useState(true)

  // Selection
  const [selectedMilestoneIds, setSelectedMilestoneIds] = useState<string[]>([])
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/crm-sync')
      if (!res.ok) throw new Error('Không thể tải dữ liệu từ CRM')
      const data = await res.json()
      setMilestones(data.milestones || [])
      setOrders(data.orders || [])
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải dữ liệu đồng bộ')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      fetchData()
      setSelectedMilestoneIds([])
      setSelectedOrderIds([])
    }
  }, [open, fetchData])

  const handleSync = async () => {
    if (selectedMilestoneIds.length === 0 && selectedOrderIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một mục để đồng bộ')
      return
    }

    setSyncing(true)
    try {
      const res = await fetch('/api/crm-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneIds: selectedMilestoneIds,
          orderIds: selectedOrderIds
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Có lỗi xảy ra khi đồng bộ')
      }

      const result = await res.json()
      toast.success(
        `Đồng bộ thành công! Đã nhập ${result.milestonesCount} mốc hợp đồng và ${result.ordersCount} đơn hàng.`
      )
      
      setSelectedMilestoneIds([])
      setSelectedOrderIds([])
      onSuccess?.()
      fetchData() // Refresh list inside modal
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi đồng bộ công việc')
    } finally {
      setSyncing(false)
    }
  }

  const toggleSelectMilestone = (id: string) => {
    setSelectedMilestoneIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const selectAllMilestones = (items: MilestoneItem[]) => {
    const unsyncedIds = items.filter(m => !m.syncedTask).map(m => m.id)
    if (selectedMilestoneIds.length === unsyncedIds.length) {
      setSelectedMilestoneIds([])
    } else {
      setSelectedMilestoneIds(unsyncedIds)
    }
  }

  const selectAllOrders = (items: OrderItem[]) => {
    const unsyncedIds = items.filter(o => o.syncedTasks.length === 0).map(o => o.id)
    if (selectedOrderIds.length === unsyncedIds.length) {
      setSelectedOrderIds([])
    } else {
      setSelectedOrderIds(unsyncedIds)
    }
  }

  // Filter lists
  const filteredMilestones = milestones.filter(m => !showOnlyUnsynced || !m.syncedTask)
  const filteredOrders = orders.filter(o => !showOnlyUnsynced || o.syncedTasks.length === 0)

  const formatVND = (val: number | null) => {
    if (val === null) return 'N/A'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
  }

  const getStatusLabelVi = (status: string) => {
    const map: Record<string, string> = {
      backlog: 'Chờ làm',
      ready: 'Sẵn sàng',
      doing: 'Đang làm',
      in_review: 'Đang duyệt',
      done: 'Hoàn thành',
      quarantine: 'Cách ly',
      cancelled: 'Đã hủy',
      on_hold: 'Tạm dừng',
    }
    return map[status] || status
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <RefreshCw className={`size-5 ${loading ? 'animate-spin' : ''}`} />
              Đồng bộ dữ liệu từ CRM
            </DialogTitle>
            <div className="flex items-center gap-2 mr-6">
              <Checkbox
                id="filter-unsynced"
                checked={showOnlyUnsynced}
                onCheckedChange={(checked) => setShowOnlyUnsynced(!!checked)}
              />
              <label htmlFor="filter-unsynced" className="text-xs font-medium cursor-pointer select-none text-muted-foreground">
                Chỉ hiện mục chưa đồng bộ
              </label>
            </div>
          </div>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex border-b px-6 bg-muted/10">
          <button
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-[2px] ${
              activeTab === 'b2b'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('b2b')}
          >
            <FileText className="size-4" />
            Hợp đồng B2B ({milestones.filter(m => !m.syncedTask).length} việc mới)
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-[2px] ${
              activeTab === 'b2c'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('b2c')}
          >
            <Package className="size-4" />
            Đơn hàng Studio B2C ({orders.filter(o => o.syncedTasks.length === 0).length} đơn mới)
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[350px] max-h-[50vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="size-8 animate-spin mb-2 text-primary" />
              <p className="text-sm">Đang truy vấn dữ liệu từ CRM...</p>
            </div>
          ) : activeTab === 'b2b' ? (
            /* B2B MILESTONES TAB */
            filteredMilestones.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <CheckCircle2 className="size-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm">Không tìm thấy mốc hợp đồng B2B nào cần xử lý.</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="w-12 p-3 text-center">
                        <Checkbox
                          checked={
                            filteredMilestones.filter(m => !m.syncedTask).length > 0 &&
                            selectedMilestoneIds.length === filteredMilestones.filter(m => !m.syncedTask).length
                          }
                          onCheckedChange={() => selectAllMilestones(filteredMilestones)}
                        />
                      </th>
                      <th className="p-3 font-semibold text-muted-foreground text-[12px] uppercase">Giai đoạn / Mốc</th>
                      <th className="p-3 font-semibold text-muted-foreground text-[12px] uppercase">Hợp đồng</th>
                      <th className="p-3 font-semibold text-muted-foreground text-[12px] uppercase">Hạn hoàn thành</th>
                      <th className="p-3 font-semibold text-muted-foreground text-[12px] uppercase">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMilestones.map((m) => (
                      <tr
                        key={m.id}
                        className={`border-b hover:bg-muted/10 transition-colors ${m.syncedTask ? 'bg-muted/30 text-muted-foreground' : ''}`}
                      >
                        <td className="p-3 text-center">
                          <Checkbox
                            checked={selectedMilestoneIds.includes(m.id)}
                            onCheckedChange={() => toggleSelectMilestone(m.id)}
                            disabled={!!m.syncedTask}
                          />
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{m.name}</div>
                          {m.amount && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <DollarSign className="size-3" /> {formatVND(m.amount)}
                            </div>
                          )}
                        </td>
                        <td className="p-3 max-w-[200px] truncate">{m.contract?.title || 'N/A'}</td>
                        <td className="p-3">
                          {m.due_date ? (
                            <div className="flex items-center gap-1.5 text-xs">
                              <Calendar className="size-3.5 text-muted-foreground" />
                              {new Date(m.due_date).toLocaleDateString('vi-VN')}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">N/A</span>
                          )}
                        </td>
                        <td className="p-3">
                          {m.syncedTask ? (
                            <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary">
                              Đồng bộ: {getStatusLabelVi(m.syncedTask.status)}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] bg-muted/50 text-muted-foreground border-transparent">
                              Chưa đồng bộ
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            /* B2C ORDERS TAB */
            filteredOrders.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <CheckCircle2 className="size-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm">Không tìm thấy đơn hàng Studio lẻ nào cần xử lý.</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="w-12 p-3 text-center">
                        <Checkbox
                          checked={
                            filteredOrders.filter(o => o.syncedTasks.length === 0).length > 0 &&
                            selectedOrderIds.length === filteredOrders.filter(o => o.syncedTasks.length === 0).length
                          }
                          onCheckedChange={() => selectAllOrders(filteredOrders)}
                        />
                      </th>
                      <th className="p-3 font-semibold text-muted-foreground text-[12px] uppercase">Đơn hàng / Khách hàng</th>
                      <th className="p-3 font-semibold text-muted-foreground text-[12px] uppercase">Gói giao hàng</th>
                      <th className="p-3 font-semibold text-muted-foreground text-[12px] uppercase">Ngày hẹn chụp</th>
                      <th className="p-3 font-semibold text-muted-foreground text-[12px] uppercase">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => (
                      <tr
                        key={o.id}
                        className={`border-b hover:bg-muted/10 transition-colors ${o.syncedTasks.length > 0 ? 'bg-muted/30 text-muted-foreground' : ''}`}
                      >
                        <td className="p-3 text-center">
                          <Checkbox
                            checked={selectedOrderIds.includes(o.id)}
                            onCheckedChange={() => toggleSelectOrder(o.id)}
                            disabled={o.syncedTasks.length > 0}
                          />
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-foreground">{o.customer_name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">Mã đơn: {o.order_number}</div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {o.delivery_type === 'physical' ? '🚚 In + Ship' : '📧 File Digital'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          {o.order_date ? (
                            <div className="flex items-center gap-1.5 text-xs">
                              <Calendar className="size-3.5 text-muted-foreground" />
                              {new Date(o.order_date).toLocaleDateString('vi-VN')}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">N/A</span>
                          )}
                        </td>
                        <td className="p-3">
                          {o.syncedTasks.length > 0 ? (
                            <div className="space-y-1">
                              <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary block w-fit">
                                Đã đồng bộ ({o.syncedTasks.length} tasks)
                              </Badge>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-[10px] bg-muted/50 text-muted-foreground border-transparent">
                              Chưa đồng bộ
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-6 border-t bg-muted/5 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {activeTab === 'b2b'
              ? `Đang chọn ${selectedMilestoneIds.length} mốc hợp đồng B2B`
              : `Đang chọn ${selectedOrderIds.length} đơn hàng B2C`}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy bỏ
            </Button>
            <Button
              onClick={handleSync}
              disabled={
                syncing ||
                (activeTab === 'b2b' ? selectedMilestoneIds.length === 0 : selectedOrderIds.length === 0)
              }
              className="min-w-[120px]"
            >
              {syncing ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Đang đồng bộ...
                </>
              ) : (
                'Đồng bộ việc'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
