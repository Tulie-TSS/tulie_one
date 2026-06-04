'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { PageHeader, Card, CardContent, CardHeader, CardTitle, Badge } from '@repo/ui'
import { Plus, TrendingUp, DollarSign, Package, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BusinessKpi } from '@/types/command-center.types'

const SERVICES = [
  { key: 'photo_id', label: 'Ảnh thẻ', icon: '📸', color: '#E53935' },
  { key: 'design_print', label: 'Thiết kế/In ấn', icon: '🎨', color: '#FB8C00' },
  { key: 'website', label: 'Website/Landing page', icon: '🌐', color: '#1E88E5' },
  { key: 'n8n_workflow', label: 'N8N Workflow', icon: '⚡', color: '#43A047' },
]

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount)
}

export default function KpiPage() {
  const [kpis, setKpis] = useState<BusinessKpi[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-01`
  })
  const [editingKpi, setEditingKpi] = useState<BusinessKpi | null>(null)

  const fetchKpis = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('business_kpis')
      .select('*')
      .eq('user_id', user.id)
      .order('kpi_month', { ascending: false })

    setKpis(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchKpis() }, [fetchKpis])

  const currentKpi = kpis.find(k => k.kpi_month === selectedMonth)

  const totalRevenue = currentKpi
    ? (currentKpi.photo_id_revenue || 0) + (currentKpi.design_print_revenue || 0) +
      (currentKpi.website_revenue || 0) + (currentKpi.n8n_workflow_revenue || 0)
    : 0

  const totalOrders = currentKpi
    ? (currentKpi.photo_id_orders || 0) + (currentKpi.design_print_orders || 0) +
      (currentKpi.website_orders || 0) + (currentKpi.n8n_workflow_orders || 0)
    : 0

  const totalCosts = currentKpi
    ? (currentKpi.contractor_costs || 0) + (currentKpi.operating_costs || 0)
    : 0

  const netProfit = totalRevenue - totalCosts

  const handleSaveKpi = async (formData: Partial<BusinessKpi>) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('business_kpis').upsert(
      { ...formData, user_id: user.id, kpi_month: selectedMonth },
      { onConflict: 'user_id,kpi_month' }
    )
    setEditingKpi(null)
    fetchKpis()
  }

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(2026, i, 1)
    return {
      value: `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-01`,
      label: d.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="🚀 KPI Tulie Business"
          description="Theo dõi doanh thu và hiệu quả kinh doanh"
        />
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="h-9 px-3 rounded-lg border bg-background text-sm font-medium"
        >
          {months.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="shadow-sm">
          <CardContent className="py-4 text-center">
            <DollarSign className="size-5 mx-auto text-emerald-500 mb-1" />
            <p className="text-xs text-muted-foreground">Doanh thu</p>
            <p className="text-lg font-bold text-emerald-600">{formatVND(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="py-4 text-center">
            <Package className="size-5 mx-auto text-blue-500 mb-1" />
            <p className="text-xs text-muted-foreground">Đơn hàng</p>
            <p className="text-lg font-bold">{totalOrders}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="py-4 text-center">
            <TrendingUp className="size-5 mx-auto text-amber-500 mb-1" />
            <p className="text-xs text-muted-foreground">Chi phí</p>
            <p className="text-lg font-bold text-amber-600">{formatVND(totalCosts)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="py-4 text-center">
            <DollarSign className="size-5 mx-auto mb-1" style={{ color: netProfit >= 0 ? '#43A047' : '#E53935' }} />
            <p className="text-xs text-muted-foreground">Lợi nhuận</p>
            <p className="text-lg font-bold" style={{ color: netProfit >= 0 ? '#43A047' : '#E53935' }}>
              {formatVND(netProfit)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service Breakdown */}
      <Card className="shadow-sm">
        <CardHeader className="border-b border-muted/40 pb-4">
          <CardTitle className="text-sm font-semibold">Chi tiết theo dịch vụ</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {currentKpi ? (
            <div className="space-y-4">
              {SERVICES.map(service => {
                const orders = (currentKpi as any)[`${service.key}_orders`] || 0
                const revenue = (currentKpi as any)[`${service.key}_revenue`] || 0
                const revenuePercent = totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0

                return (
                  <div key={service.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span>{service.icon}</span>
                        <span className="font-medium">{service.label}</span>
                        <Badge variant="secondary" className="text-[10px]">{orders} đơn</Badge>
                      </span>
                      <span className="font-semibold" style={{ color: service.color }}>
                        {formatVND(revenue)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${revenuePercent}%`, backgroundColor: service.color }}
                      />
                    </div>
                  </div>
                )
              })}

              {/* Costs Section */}
              <div className="border-t border-muted/40 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Chi phí thuê khoán</span>
                  <span className="font-medium">{formatVND(currentKpi.contractor_costs || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Chi phí vận hành</span>
                  <span className="font-medium">{formatVND(currentKpi.operating_costs || 0)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <p className="text-muted-foreground text-sm">Chưa có dữ liệu KPI cho tháng này.</p>
              <button
                onClick={() => handleSaveKpi({})}
                className="text-sm text-primary hover:underline"
              >
                + Tạo KPI tháng này
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Trend (if multiple months exist) */}
      {kpis.length > 1 && (
        <Card className="shadow-sm">
          <CardHeader className="border-b border-muted/40 pb-4">
            <CardTitle className="text-sm font-semibold">Xu hướng doanh thu theo tháng</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-end gap-2 h-32">
              {kpis.slice(0, 6).reverse().map(kpi => {
                const rev = (kpi.photo_id_revenue || 0) + (kpi.design_print_revenue || 0) +
                  (kpi.website_revenue || 0) + (kpi.n8n_workflow_revenue || 0)
                const maxRev = Math.max(...kpis.map(k =>
                  (k.photo_id_revenue || 0) + (k.design_print_revenue || 0) +
                  (k.website_revenue || 0) + (k.n8n_workflow_revenue || 0)
                ))
                const heightPercent = maxRev > 0 ? Math.max(4, (rev / maxRev) * 100) : 4

                return (
                  <div key={kpi.kpi_month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-medium">{formatVND(rev)}</span>
                    <div
                      className={cn(
                        'w-full rounded-t-md transition-all duration-500',
                        kpi.kpi_month === selectedMonth ? 'bg-primary' : 'bg-muted'
                      )}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[9px] text-muted-foreground">
                      {new Date(kpi.kpi_month).toLocaleDateString('vi-VN', { month: 'short' })}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
