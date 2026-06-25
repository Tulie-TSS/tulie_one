'use client'

import { useState } from 'react'
import { Check, Coins, AlertTriangle, Hourglass, Calendar, CalendarRange, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type TimelineContract = {
    id: string
    contract_number: string | null
    title: string | null
    total_amount: number | null
    start_date: string | null
    signed_date: string | null
    end_date: string | null
    customer?: { abbreviation?: string | null; company_name?: string | null } | null
    milestones: TimelineMilestone[] | null
}

type TimelineMilestone = {
    id: string
    name: string
    type: string
    status: string
    due_date: string | null
    amount?: number | null
    percentage?: number | null
}

type ViewMode = 'gantt' | 'pipeline'

function toDate(value: string) {
    const [year, month, day] = value.slice(0, 10).split('-').map(Number)
    return new Date(year, month - 1, day)
}

function formatDateShort(value: string) {
    const d = toDate(value)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    return `${day}.${month}`
}

function formatDateRange(startVal: string, endVal: string) {
    return `${formatDateShort(startVal)} - ${formatDateShort(endVal)}`
}

function formatAmount(value: number | null | undefined) {
    if (value == null) return ''
    return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
}

function getMilestoneState(milestone: TimelineMilestone, today: Date) {
    if (milestone.status === 'completed') return 'done'
    if (!milestone.due_date) return 'pending'
    return toDate(milestone.due_date).getTime() < today.getTime() ? 'overdue' : 'pending'
}

function getMilestoneIcon(milestone: TimelineMilestone, state: string) {
    if (state === 'done') return Check
    if (milestone.type === 'payment') return Coins
    if (state === 'overdue') return AlertTriangle
    return Hourglass
}

type MilestoneState = 'done' | 'overdue' | 'payment_pending' | 'pending'

const milestoneColors: Record<MilestoneState, string> = {
    done: 'text-emerald-500 dark:text-emerald-400',
    overdue: 'text-red-500 dark:text-red-400',
    payment_pending: 'text-amber-500 dark:text-amber-400',
    pending: 'text-zinc-400 dark:text-zinc-500',
}

function getMilestoneColor(milestone: TimelineMilestone, state: string) {
    if (state === 'done') return milestoneColors.done
    if (state === 'overdue') return milestoneColors.overdue
    if (milestone.type === 'payment') return milestoneColors.payment_pending
    return milestoneColors.pending
}

const milestoneBg: Record<MilestoneState, string> = {
    done: 'bg-emerald-500',
    overdue: 'bg-red-500',
    payment_pending: 'bg-amber-500',
    pending: 'bg-zinc-300 dark:bg-zinc-600',
}

function getMilestoneBg(milestone: TimelineMilestone, state: string) {
    if (state === 'done') return milestoneBg.done
    if (state === 'overdue') return milestoneBg.overdue
    if (milestone.type === 'payment') return milestoneBg.payment_pending
    return milestoneBg.pending
}

function getGroupCriticalState(group: TimelineMilestone[], today: Date): MilestoneState {
    if (group.some(m => getMilestoneState(m, today) === 'overdue')) return 'overdue'
    if (group.every(m => getMilestoneState(m, today) === 'done')) return 'done'
    if (group.some(m => m.type === 'payment')) return 'payment_pending'
    return 'pending'
}

export function ActiveContractTimeline({ contracts }: { contracts: TimelineContract[] }) {
    const [viewMode, setViewMode] = useState<ViewMode>('gantt')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayLabel = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })

    // Lọc các hợp đồng hợp lệ để hiển thị
    const validContracts = contracts.filter(c => (c.start_date || c.signed_date) && c.end_date)

    if (validContracts.length === 0) {
        return (
            <section className="relative rounded-3xl border border-white/50 dark:border-zinc-900/30 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-xl text-card-foreground shadow-[0_8px_32px_-8px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/10">
                    <div>
                        <h2 className="text-sm font-semibold tracking-tight text-foreground">Tiến độ hợp đồng đang triển khai</h2>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Theo dõi mốc đến hạn và doanh thu</p>
                    </div>
                </div>
                <div className="py-16 text-center text-sm text-muted-foreground">
                    Chưa có hợp đồng đang triển khai có đủ ngày bắt đầu và kết thúc.
                </div>
            </section>
        )
    }

    // 1. Tính toán trục thời gian dùng chung cho sơ đồ Gantt
    const startDates = validContracts.map(c => toDate(c.start_date || c.signed_date!))
    const endDates = validContracts.map(c => toDate(c.end_date!))
    const minTime = Math.min(...startDates.map(d => d.getTime()))
    const maxTime = Math.max(...endDates.map(d => d.getTime()))

    const timelineStart = new Date(minTime)
    const minDate = new Date(timelineStart.getFullYear(), timelineStart.getMonth(), 1)
    const timelineEnd = new Date(maxTime)
    const maxDate = new Date(timelineEnd.getFullYear(), timelineEnd.getMonth() + 2, 0) // Ngày cuối cùng của tháng kế tiếp

    const totalDuration = Math.max(1, maxDate.getTime() - minDate.getTime())

    // Tạo danh sách tháng
    const months: { label: string; year: number; month: number }[] = []
    const temp = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
    while (temp <= maxDate) {
        months.push({
            label: `Tháng ${String(temp.getMonth() + 1).padStart(2, '0')}`,
            year: temp.getFullYear(),
            month: temp.getMonth()
        })
        temp.setMonth(temp.getMonth() + 1)
    }

    const todayPercent = ((today.getTime() - minDate.getTime()) / totalDuration) * 100

    return (
        <section className="relative rounded-3xl border border-white/50 dark:border-zinc-900/30 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-xl text-card-foreground shadow-[0_8px_32px_-8px_rgba(0,0,0,0.04)] overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full blur-[40px] pointer-events-none opacity-80 z-0 bg-glow-emerald" />
            {/* Header với Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-b border-border gap-4 bg-muted/5">
                <div>
                    <h2 className="text-sm font-semibold tracking-tight text-foreground">Tiến độ hợp đồng đang triển khai</h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        Quản trị tiến trình, mốc thanh toán và bàn giao theo tiêu chuẩn dự án
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                    {/* Chú giải trạng thái */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground border-r border-border/80 pr-4 mr-1">
                        <span className="flex items-center gap-1 font-semibold">
                            <Check className="size-3.5 text-emerald-500" /> Đã hoàn thành
                        </span>
                        <span className="flex items-center gap-1 font-semibold">
                            <Coins className="size-3.5 text-amber-500" /> Thanh toán
                        </span>
                        <span className="flex items-center gap-1 font-semibold">
                            <AlertTriangle className="size-3.5 text-red-500" /> Quá hạn
                        </span>
                        <span className="flex items-center gap-1 font-semibold">
                            <Hourglass className="size-3.5 text-zinc-400" /> Chưa làm
                        </span>
                    </div>

                    {/* Bộ lọc View Mode */}
                    <div className="flex bg-muted/60 p-0.5 rounded-lg border border-border/80 shadow-inner">
                        <button
                            onClick={() => setViewMode('gantt')}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all",
                                viewMode === 'gantt'
                                    ? "bg-background text-foreground shadow-sm border border-border/20"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <CalendarRange className="size-3.5" />
                            Biểu đồ Gantt
                        </button>
                        <button
                            onClick={() => setViewMode('pipeline')}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all",
                                viewMode === 'pipeline'
                                    ? "bg-background text-foreground shadow-sm border border-border/20"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <LayoutGrid className="size-3.5" />
                            Quy trình
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'gantt' ? (
                /* CHẾ ĐỘ XEM GANTT CHART ĐỒNG BỘ */
                <div className="relative flex flex-row select-none w-full overflow-hidden">
                    {/* Sticky Sidebar Hợp đồng */}
                    <div className="w-52 md:w-60 shrink-0 sticky left-0 z-30 bg-card/95 backdrop-blur-sm border-r border-border shadow-[4px_0_12px_rgba(0,0,0,0.02)] divide-y divide-border/60">
                        {/* Góc trống header */}
                        <div className="h-10 border-b border-border bg-muted/20 flex items-center px-4">
                            <span className="text-[10px] font-bold tracking-wider text-muted-foreground/80">Hợp đồng / Khách hàng</span>
                        </div>
                        {validContracts.map(contract => {
                            const startValue = contract.start_date || contract.signed_date!
                            return (
                                <div key={contract.id} className="h-[72px] px-4 flex flex-col justify-center gap-1 bg-card hover:bg-muted/10 transition-colors">
                                    <div className="flex items-center justify-between gap-1.5 min-w-0">
                                        <Link
                                            href={`/contracts/${contract.id}`}
                                            className="text-[11.5px] font-bold text-foreground hover:text-primary transition-colors truncate"
                                            title={contract.contract_number || 'Xem chi tiết'}
                                        >
                                            {contract.customer?.abbreviation || contract.contract_number || 'Hợp đồng'}
                                        </Link>
                                        <span className="text-[8px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-1 rounded shrink-0 border border-emerald-200/50 dark:border-emerald-900/30">
                                            Running
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground truncate" title={contract.customer?.company_name || contract.title || ''}>
                                        {contract.customer?.company_name || contract.title || 'Dịch vụ'}
                                    </p>
                                    <div className="flex items-center justify-between text-[9.5px] font-mono text-muted-foreground/80 mt-0.5">
                                        <span className="font-semibold text-foreground">{formatAmount(contract.total_amount)}</span>
                                        <span>{formatDateRange(startValue, contract.end_date!)}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Timeline Container */}
                    <div className="flex-1 overflow-hidden relative min-w-0 w-full">
                        {/* Month columns header */}
                        <div className="h-10 border-b border-border bg-muted/20 flex items-stretch w-full">
                            {months.map((m, idx) => (
                                <div key={idx} className="flex-1 border-r border-border/40 last:border-r-0 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-zinc-500">{m.label} / {m.year}</span>
                                </div>
                            ))}
                        </div>

                        {/* Background Grid Lines */}
                        <div className="absolute inset-0 top-10 pointer-events-none z-0 flex">
                            {months.map((_, idx) => (
                                <div key={idx} className="flex-1 border-r border-dashed border-border/20 last:border-r-0 h-full" />
                            ))}
                        </div>

                        {/* Today Marker Line (vertical sync across rows) */}
                        {todayPercent >= 0 && todayPercent <= 100 && (
                            <div
                                className="absolute top-10 bottom-0 w-[2px] bg-red-500 dark:bg-red-400 z-20 pointer-events-none transition-all"
                                style={{ left: `${todayPercent}%` }}
                            >
                                <div className="absolute top-1 -translate-x-1/2 bg-red-500 dark:bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                                    Hôm nay ({todayLabel})
                                </div>
                            </div>
                        )}

                        {/* Rows */}
                        <div className="divide-y divide-border/60">
                            {validContracts.map(contract => {
                                const startValue = contract.start_date || contract.signed_date!
                                const start = toDate(startValue)
                                const end = toDate(contract.end_date!)
                                const duration = Math.max(24 * 60 * 60 * 1000, end.getTime() - start.getTime())

                                // Tính toán phần trạng thái bar hiển thị trên trục
                                const leftPercent = ((start.getTime() - minDate.getTime()) / totalDuration) * 100
                                const widthPercent = ((end.getTime() - start.getTime()) / totalDuration) * 100

                                // Tính toán tiến trình hoàn thành của dự án
                                const elapsed = Math.max(0, Math.min(100, ((today.getTime() - start.getTime()) / duration) * 100))

                                // Gom nhóm milestones theo ngày hết hạn (tránh đè nhau)
                                const milestones = (contract.milestones || []).filter(m => m.due_date)
                                milestones.sort((a, b) => toDate(a.due_date!).getTime() - toDate(b.due_date!).getTime())

                                const milestonesByDate: Record<string, TimelineMilestone[]> = {}
                                milestones.forEach(m => {
                                    const dateStr = m.due_date!.slice(0, 10)
                                    if (!milestonesByDate[dateStr]) {
                                        milestonesByDate[dateStr] = []
                                    }
                                    milestonesByDate[dateStr].push(m)
                                })

                                return (
                                    <div key={contract.id} className="h-[72px] relative flex items-center z-10 hover:bg-muted/5 transition-colors overflow-visible">
                                        {/* Contract Gantt Bar */}
                                        <div
                                            className="absolute h-[22px] rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 overflow-hidden flex items-center shadow-sm select-none"
                                            style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                                        >
                                            {/* Completed/Elapsed Fill */}
                                            <div
                                                className="absolute left-0 top-0 bottom-0 bg-zinc-800/10 dark:bg-zinc-200/10 border-r border-zinc-350 dark:border-zinc-700"
                                                style={{ width: `${elapsed}%` }}
                                            />
                                            {/* Inner Contract label */}
                                            <span className="px-3.5 text-[9px] font-bold text-muted-foreground/80 truncate z-10 select-none">
                                                {contract.customer?.abbreviation || contract.contract_number}
                                            </span>
                                        </div>

                                        {/* Milestones Nodes */}
                                        {Object.entries(milestonesByDate).map(([dateStr, group]) => {
                                            const mDue = toDate(dateStr)
                                            const mPercent = ((mDue.getTime() - minDate.getTime()) / totalDuration) * 100
                                            const criticalState = getGroupCriticalState(group, today)
                                            const bgClass = milestoneBg[criticalState]
                                            const repMilestone = group[0]
                                            const Icon = getMilestoneIcon(repMilestone, criticalState)

                                            return (
                                                <div
                                                    key={dateStr}
                                                    className="absolute z-30 group"
                                                    style={{ left: `${mPercent}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
                                                >
                                                    {/* Premium custom node - Larger size (30px), squircle shape, gradient glow, hover feedback */}
                                                    <div className={cn(
                                                        'w-[30px] h-[30px] rounded-lg border border-white dark:border-zinc-950 shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center text-white group-hover:scale-110 group-hover:shadow-lg',
                                                        criticalState === 'done' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-350 dark:border-emerald-500/30 shadow-[0_2px_8px_rgba(16,185,129,0.4)]' :
                                                        criticalState === 'overdue' ? 'bg-gradient-to-br from-rose-500 to-red-600 border-red-350 dark:border-red-500/30 shadow-[0_2px_8px_rgba(239,68,68,0.4)]' :
                                                        criticalState === 'payment_pending' ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-350 dark:border-amber-500/30 shadow-[0_2px_8px_rgba(245,158,11,0.4)]' :
                                                        'bg-gradient-to-br from-zinc-350 to-zinc-500 dark:from-zinc-650 dark:to-zinc-800 border-zinc-250 dark:border-zinc-600/30 shadow-[0_2px_6px_rgba(0,0,0,0.15)]'
                                                    )}>
                                                        {group.length > 1 ? (
                                                            <span className="text-[10px] font-extrabold leading-none">{group.length}</span>
                                                        ) : (
                                                            <Icon className="size-[14px] text-white shrink-0" />
                                                        )}
                                                    </div>

                                                    {/* Premium Hover Card (Tooltip) - Light Background, balanced fonts & icons, shadow border */}
                                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 shadow-lg min-w-[200px] max-w-[280px] translate-y-1 group-hover:translate-y-0">
                                                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-white dark:bg-zinc-900 border-r border-b border-zinc-200 dark:border-zinc-800 rotate-45 -translate-y-1" />
                                                        {group.map((m, idx) => {
                                                            const mState = getMilestoneState(m, today)
                                                            return (
                                                                <div key={m.id} className={cn("space-y-1", idx > 0 && "mt-2.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60")}>
                                                                    <div className="flex items-start justify-between gap-3">
                                                                        <span className="font-bold text-zinc-900 dark:text-zinc-100 whitespace-normal break-words max-w-[130px] leading-snug text-[11.5px]" title={m.name}>
                                                                            {m.name}
                                                                        </span>
                                                                        <span className={cn("text-[9px] font-extrabold px-1.5 py-0.5 rounded font-mono shrink-0 tracking-wider",
                                                                            mState === 'done' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" :
                                                                            mState === 'overdue' ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400" :
                                                                            m.type === 'payment' ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400" : 
                                                                            "bg-zinc-50 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                                                                        )}>
                                                                            {mState === 'done' ? 'Xong' : mState === 'overdue' ? 'Q.Hạn' : 'Chờ'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between text-[10px] text-zinc-550 dark:text-zinc-400 font-mono mt-1">
                                                                        <span className="flex items-center gap-1">
                                                                            <Calendar className="size-3 text-zinc-400" />
                                                                            {formatDateShort(m.due_date!)}
                                                                        </span>
                                                                        {m.type === 'payment' && m.percentage != null && (
                                                                            <span className="font-semibold">{m.percentage}%</span>
                                                                        )}
                                                                    </div>
                                                                    {m.type === 'payment' && m.amount != null && (
                                                                        <div className="text-[10px] text-zinc-700 dark:text-zinc-300 text-right font-mono font-bold mt-0.5">
                                                                            {formatAmount(m.amount)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                /* CHẾ ĐỘ XEM WORKFLOW PIPELINE CHI TIẾT */
                <div className="divide-y divide-border/60 p-4 space-y-4">
                    {validContracts.map(contract => {
                        const startValue = contract.start_date || contract.signed_date!
                        const start = toDate(startValue)
                        const end = toDate(contract.end_date!)
                        const duration = Math.max(1, end.getTime() - start.getTime())
                        
                        const milestones = (contract.milestones || []).filter(m => m.due_date)
                        // Sắp xếp mốc theo thứ tự thời gian tăng dần
                        milestones.sort((a, b) => toDate(a.due_date!).getTime() - toDate(b.due_date!).getTime())

                        return (
                            <article key={contract.id} className="first:pt-0 pt-4">
                                {/* Contract Header - Compact single-line row */}
                                <div className="flex flex-row items-center justify-between gap-2 border-b border-border/40 pb-2 mb-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Link
                                            href={`/contracts/${contract.id}`}
                                            className="text-xs font-extrabold text-foreground hover:text-primary transition-colors shrink-0"
                                        >
                                            {contract.customer?.abbreviation || contract.contract_number || 'Hợp đồng'}
                                        </Link>
                                        <span className="text-[10px] text-muted-foreground truncate hidden md:inline">
                                            – {contract.customer?.company_name || contract.title}
                                        </span>
                                        <span className="text-[8px] font-extrabold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-200/40 shrink-0">
                                            Đang thực hiện
                                        </span>
                                    </div>

                                    {/* Stats Info */}
                                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground shrink-0 font-mono">
                                        <span>DT: <strong className="text-foreground font-bold">{formatAmount(contract.total_amount)}</strong></span>
                                        <span className="text-border">|</span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="size-2.5" />
                                            {formatDateRange(startValue, contract.end_date!)}
                                        </span>
                                    </div>
                                </div>

                                {/* Connected Horizonal Steps Track */}
                                {milestones.length === 0 ? (
                                    <div className="bg-muted/10 border border-dashed rounded-lg py-5 text-center text-xs text-muted-foreground">
                                        Chưa có mốc sự kiện nào được tạo cho hợp đồng này.
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin">
                                        {milestones.map((milestone, mIdx) => {
                                            const state = getMilestoneState(milestone, today)
                                            const Icon = getMilestoneIcon(milestone, state)
                                            const colorClass = getMilestoneColor(milestone, state)
                                            const bgClass = getMilestoneBg(milestone, state)
                                            
                                            // Mốc hiện tại cần xử lý (mốc pending/overdue đầu tiên trong chuỗi)
                                            const isNextUp = state !== 'done' && (
                                                mIdx === 0 || 
                                                getMilestoneState(milestones[mIdx - 1], today) === 'done'
                                            )

                                            return (
                                                <div key={milestone.id} className="flex items-center shrink-0">
                                                    {/* Card Milestone - Standard typography, compact layout */}
                                                    <div className={cn(
                                                        "relative flex flex-col p-3 rounded-xl border bg-card w-[170px] transition-all duration-300 hover:shadow-md",
                                                        state === 'done' ? "border-emerald-100 dark:border-emerald-950/20" :
                                                        state === 'overdue' ? "border-red-100 dark:border-red-950/20" :
                                                        milestone.type === 'payment' ? "border-amber-100 dark:border-amber-950/20" :
                                                        "border-zinc-200 dark:border-zinc-800",
                                                        isNextUp && "ring-2 ring-zinc-950 dark:ring-zinc-250 ring-offset-2 dark:ring-offset-zinc-950 shadow-md"
                                                    )}>
                                                        {/* Badge đánh dấu mốc ưu tiên */}
                                                        {isNextUp && (
                                                            <span className="absolute -top-2 left-2.5 px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow">
                                                                Mốc tiếp theo
                                                            </span>
                                                        )}

                                                        {/* Header */}
                                                        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground mb-1.5 border-b border-border/40 pb-1">
                                                            <span>Mốc {mIdx + 1}</span>
                                                            <span className="flex items-center gap-0.5 font-mono">
                                                                <Calendar className="size-3 text-zinc-400" />
                                                                {formatDateShort(milestone.due_date!)}
                                                            </span>
                                                        </div>

                                                        {/* Title - Adhering to font guidelines */}
                                                        <h4 className="text-xs font-bold text-foreground whitespace-normal break-words leading-tight mt-0.5 min-h-[32px]" title={milestone.name}>
                                                            {milestone.name}
                                                        </h4>

                                                        {/* Bottom Info */}
                                                        <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between">
                                                            <div className="flex items-center gap-1.5 min-w-0">
                                                                <span className={cn(
                                                                    "p-1 rounded-md flex items-center justify-center border shrink-0 shadow-sm",
                                                                    state === 'done' ? "bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50" :
                                                                    state === 'overdue' ? "bg-red-500/10 dark:bg-red-950/30 border-red-200 dark:border-red-900/50" :
                                                                    milestone.type === 'payment' ? "bg-amber-500/10 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50" :
                                                                    "bg-zinc-500/10 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                                                                )}>
                                                                    <Icon className={cn("size-3.5", colorClass)} />
                                                                </span>
                                                                <span className="text-[10px] font-medium text-muted-foreground capitalize truncate">
                                                                    {milestone.type === 'payment' ? 'Thu' : 'Làm'}
                                                                </span>
                                                            </div>

                                                            {milestone.type === 'payment' && (milestone.percentage || milestone.amount) && (
                                                                <span className="text-xs font-extrabold text-foreground font-mono text-right shrink-0" title={formatAmount(milestone.amount)}>
                                                                    {milestone.percentage}%
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Connector Line - shorter width */}
                                                    {mIdx < milestones.length - 1 && (
                                                        <div className="w-5 h-[2px] bg-zinc-200 dark:bg-zinc-800 relative">
                                                            {state === 'done' && (
                                                                <div className="absolute inset-0 bg-emerald-500" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </article>
                        )
                    })}
                </div>
            )}
        </section>
    )
}
