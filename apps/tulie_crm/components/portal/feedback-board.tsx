'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@repo/ui'
import { Input } from '@repo/ui'
import { Textarea } from '@repo/ui'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@repo/ui'
import { Progress } from '@repo/ui'
import {
    MessageSquarePlus,
    Send,
    CheckCircle2,
    Clock,
    Circle,
    Pause,
    XCircle,
    RotateCcw,
    ImagePlus,
    Link2,
    ChevronDown,
    ChevronUp,
    MessageCircle,
    ClipboardList,
    Plus,
    ListTodo
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface FeedbackItem {
    id: string
    project_id: string
    customer_id?: string
    title: string
    content?: string
    attachments: { url: string; type: string; name: string }[]
    status: 'pending' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled' | 'revision_needed'
    priority: 'low' | 'normal' | 'high' | 'urgent'
    created_by_name: string
    created_by_role: string
    responded_at?: string
    responded_by?: string
    response_content?: string
    sort_order: number
    created_at: string
    updated_at: string
}

interface FeedbackBoardProps {
    projectId: string
    customerId?: string
    customerName?: string
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Circle; bg: string; text: string; dot: string; border: string }> = {
    pending:          { label: 'Chờ phản hồi', icon: Clock,       bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-500',   border: 'border-amber-200' },
    in_progress:      { label: 'Đang xử lý',   icon: RotateCcw,   bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-500',    border: 'border-blue-200' },
    completed:        { label: 'Hoàn thành',    icon: CheckCircle2, bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
    on_hold:          { label: 'Tạm dừng',      icon: Pause,       bg: 'bg-zinc-50',     text: 'text-zinc-500',    dot: 'bg-zinc-400',    border: 'border-zinc-200' },
    cancelled:        { label: 'Đã hủy',        icon: XCircle,     bg: 'bg-rose-50',     text: 'text-rose-700',    dot: 'bg-rose-500',    border: 'border-rose-200' },
    revision_needed:  { label: 'Cần chỉnh sửa', icon: RotateCcw,   bg: 'bg-orange-50',   text: 'text-orange-700',  dot: 'bg-orange-500',  border: 'border-orange-200' },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; indicator: string }> = {
    low:    { label: 'Thấp',   color: 'text-zinc-500', indicator: 'bg-zinc-400' },
    normal: { label: 'Bình thường', color: 'text-zinc-700', indicator: 'bg-zinc-500' },
    high:   { label: 'Cao',    color: 'text-orange-600', indicator: 'bg-orange-500' },
    urgent: { label: 'Gấp',   color: 'text-rose-600', indicator: 'bg-rose-500' },
}

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_CONFIG[status] || STATUS_CONFIG.pending
    return (
        <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border", s.bg, s.border)}>
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dot)} />
            <span className={cn("text-[11px] font-semibold tracking-wide whitespace-nowrap", s.text)}>{s.label}</span>
        </div>
    )
}

function formatTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Vừa xong'
    if (mins < 60) return `${mins} phút trước`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} giờ trước`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} ngày trước`
    return new Date(dateStr).toLocaleDateString('vi-VN')
}

export function FeedbackBoard({ projectId, customerId, customerName }: FeedbackBoardProps) {
    const [items, setItems] = useState<FeedbackItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

    // New item form state
    const [newTitle, setNewTitle] = useState('')
    const [newContent, setNewContent] = useState('')
    const [newPriority, setNewPriority] = useState<string>('normal')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [imageUrl, setImageUrl] = useState('')

    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const fetchItems = useCallback(async () => {
        try {
            const res = await fetch(`/api/portal-feedback?project_id=${projectId}`)
            if (res.ok) {
                const data = await res.json()
                setItems(data)
            }
        } catch (err) {
            console.error('Error fetching feedback:', err)
        } finally {
            setIsLoading(false)
        }
    }, [projectId])

    useEffect(() => {
        fetchItems()
    }, [fetchItems])

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault()
                const file = item.getAsFile()
                if (file) {
                    const reader = new FileReader()
                    reader.onload = () => {
                        const dataUrl = reader.result as string
                        setNewContent(prev => prev + `\n<img src="${dataUrl}" alt="Pasted image" style="max-width:100%;border-radius:6px;border:1px solid #e4e4e7;margin:12px 0;" />\n`)
                        toast.success('Đã dán ảnh thành công')
                    }
                    reader.readAsDataURL(file)
                }
                break
            }
        }
    }, [])

    const handleInsertImage = () => {
        if (!imageUrl.trim()) return
        setNewContent(prev => prev + `\n<img src="${imageUrl}" alt="Inserted image" style="max-width:100%;border-radius:6px;border:1px solid #e4e4e7;margin:12px 0;" />\n`)
        setImageUrl('')
        toast.success('Đã chèn ảnh')
    }

    const handleSubmit = async () => {
        if (!newTitle.trim()) {
            toast.error('Vui lòng nhập tiêu đề yêu cầu')
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch('/api/portal-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: projectId,
                    customer_id: customerId,
                    title: newTitle.trim(),
                    content: newContent.trim() || null,
                    created_by_name: customerName || 'Khách hàng',
                    created_by_role: 'customer',
                    priority: newPriority,
                })
            })

            if (res.ok) {
                toast.success('Đã gửi yêu cầu chỉnh sửa!')
                setNewTitle('')
                setNewContent('')
                setNewPriority('normal')
                setShowForm(false)
                await fetchItems()
            } else {
                const err = await res.json()
                toast.error(err.error || 'Không thể tạo yêu cầu')
            }
        } catch {
            toast.error('Có lỗi xảy ra, vui lòng thử lại')
        } finally {
            setIsSubmitting(false)
        }
    }

    const totalCount = items.length
    const pendingCount = items.filter(i => ['pending', 'revision_needed'].includes(i.status)).length
    const activeCount = items.filter(i => i.status === 'in_progress').length
    const completedCount = items.filter(i => i.status === 'completed').length
    
    // Calculate progress safely
    const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

    return (
        <div className="w-full bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden font-sans">
            {/* Document Header */}
            <div className="bg-zinc-50/80 border-b border-zinc-200 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white border border-zinc-200/60 shadow-sm flex items-center justify-center shrink-0">
                        <ListTodo className="w-6 h-6 text-zinc-900" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-zinc-950 uppercase tracking-tight">Nhật ký xử lý yêu cầu</h2>
                        <div className="text-sm font-medium text-zinc-500 flex items-center gap-2 mt-0.5">
                            <span>Revision & Feedback Log</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-300" />
                            <span className="text-zinc-400">Project: {projectId.slice(0, 8).toUpperCase()}</span>
                        </div>
                    </div>
                </div>
                <Button 
                    onClick={() => setShowForm(!showForm)} 
                    className="bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm transition-all"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm yêu cầu mới
                </Button>
            </div>

            {/* Statistics Banner */}
            <div className="flex flex-col sm:flex-row border-b border-zinc-100 divide-y sm:divide-y-0 sm:divide-x divide-zinc-100">
                <div className="px-6 py-4 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-end mb-2">
                        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Tiến độ hoàn thành</p>
                        <span className="text-sm font-bold text-zinc-900">{Math.round(progressPercent)}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-2 bg-zinc-100" />
                </div>
                
                <div className="px-6 py-4 flex flex-wrap gap-x-12 gap-y-4">
                    <div>
                        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Tổng số</p>
                        <p className="text-2xl font-black tracking-tight text-zinc-900">{totalCount}</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1">Cần xử lý</p>
                        <p className="text-2xl font-black tracking-tight text-amber-700">{pendingCount}</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1">Đang làm</p>
                        <p className="text-2xl font-black tracking-tight text-blue-700">{activeCount}</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Hoàn thành</p>
                        <p className="text-2xl font-black tracking-tight text-emerald-700">{completedCount}</p>
                    </div>
                </div>
            </div>

            {/* Form Creation */}
            {showForm && (
                <div className="p-6 bg-zinc-50 border-b border-zinc-200">
                    <div className="max-w-4xl space-y-5 bg-white p-6 rounded-xl border border-zinc-200/60 shadow-sm">
                        <div className="flex items-center gap-2 mb-2 pb-4 border-b border-zinc-100">
                            <MessageSquarePlus className="w-5 h-5 text-zinc-900" />
                            <h3 className="font-semibold text-zinc-900">Tạo yêu cầu / Phản hồi mới</h3>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-zinc-700 mb-2 block uppercase tracking-wider">Tiêu đề yêu cầu <span className="text-rose-500">*</span></label>
                            <Input
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Ghi chú ngắn gọn (ví dụ: Thay đổi màu sắc logo)"
                                className="h-11 shadow-sm font-medium"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-zinc-700 mb-2 block uppercase tracking-wider">
                                Diễn giải chi tiết
                                <span className="text-zinc-400 font-medium normal-case tracking-normal ml-2">Hỗ trợ dán ảnh (Ctrl+V)</span>
                            </label>
                            <Textarea
                                ref={textareaRef}
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                onPaste={handlePaste}
                                placeholder="Mô tả cụ thể những gì bạn cần thay đổi hoặc cập nhật..."
                                className="min-h-[160px] shadow-sm resize-y leading-relaxed"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between pt-2">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider mr-1">Mức độ:</span>
                                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                                    <button
                                        key={key}
                                        onClick={() => setNewPriority(key)}
                                        className={cn(
                                            "lex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border",
                                            newPriority === key
                                                ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                                                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                                        )}
                                    >
                                        {newPriority === key && <span className={cn("w-1.5 h-1.5 rounded-full", "bg-current")} />}
                                        {config.label}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="flex gap-3 w-full sm:w-auto">
                                <Button variant="ghost" onClick={() => setShowForm(false)} className="flex-1 sm:flex-none">
                                    Hủy bỏ
                                </Button>
                                <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 sm:flex-none min-w-[120px]">
                                    {isSubmitting ? <Clock className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                    Gửi yêu cầu
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Body */}
            <div>
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <Clock className="w-8 h-8 text-zinc-300 animate-spin mb-3" />
                        <p className="text-sm font-medium text-zinc-500">Đang tải dữ liệu nhật ký...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center text-center bg-zinc-50/50">
                        <ClipboardList className="w-12 h-12 text-zinc-200 mb-4" />
                        <h4 className="text-base font-semibold text-zinc-700 mb-1">Chưa có bản ghi nào</h4>
                        <p className="text-sm text-zinc-500 max-w-sm">Danh sách yêu cầu chỉnh sửa và theo dõi trạng thái sẽ xuất hiện tại đây.</p>
                        <Button variant="outline" onClick={() => setShowForm(true)} className="mt-6 bg-white shadow-sm font-semibold">
                            Tạo tác vụ đầu tiên
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-white">
                                <TableRow className="hover:bg-transparent border-b-zinc-200">
                                    <TableHead className="w-[60px] h-12 pl-6 font-bold text-zinc-500 text-[11px] uppercase tracking-wider text-center">STT</TableHead>
                                    <TableHead className="h-12 font-bold text-zinc-500 text-[11px] uppercase tracking-wider">Nội dung phản hồi / Yêu cầu</TableHead>
                                    <TableHead className="w-[120px] h-12 font-bold text-zinc-500 text-[11px] uppercase tracking-wider">Mức độ</TableHead>
                                    <TableHead className="w-[140px] h-12 font-bold text-zinc-500 text-[11px] uppercase tracking-wider">Trạng thái</TableHead>
                                    <TableHead className="w-[180px] h-12 font-bold text-zinc-500 text-[11px] uppercase tracking-wider">Khởi tạo</TableHead>
                                    <TableHead className="w-[80px] pr-6"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item, index) => {
                                    const isExpanded = expandedIds.has(item.id)
                                    const isCompleted = item.status === 'completed'
                                    const priorityConf = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.normal
                                    
                                    return (
                                        <React.Fragment key={item.id}>
                                            {/* Main Row */}
                                            <TableRow 
                                                className={cn(
                                                    "group cursor-pointer transition-colors border-b-zinc-100", 
                                                    isExpanded ? "bg-zinc-50/50 hover:bg-zinc-50/80" : "hover:bg-zinc-50",
                                                    isCompleted && !isExpanded ? "opacity-60 bg-zinc-50/30" : ""
                                                )}
                                                onClick={() => toggleExpand(item.id)}
                                            >
                                                <TableCell className="pl-6 text-center">
                                                    <span className="text-xs font-bold text-zinc-400">#{(items.length - index).toString().padStart(2, '0')}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 py-1">
                                                        <span className={cn(
                                                            "font-semibold text-[13px] line-clamp-2",
                                                            isCompleted ? "line-through text-zinc-500" : "text-zinc-900"
                                                        )}>
                                                            {item.title}
                                                        </span>
                                                        {item.response_content && !isExpanded && (
                                                            <div className="flex items-center gap-1.5 text-[11px] text-blue-600 font-medium">
                                                                <MessageCircle className="w-3.5 h-3.5" />
                                                                Đã có phản hồi từ {item.responded_by || 'Agency'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={cn("w-1.5 h-1.5 rounded-full", priorityConf.indicator)} />
                                                        <span className={cn("text-[12px] font-semibold", priorityConf.color)}>{priorityConf.label}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={item.status} />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-[11px]">
                                                        <span className="font-semibold text-zinc-700">{formatTimeAgo(item.created_at)}</span>
                                                        <span className="text-zinc-400 truncate max-w-[140px]">bởi {item.created_by_name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="pr-6 text-right">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className={cn(
                                                            "w-8 h-8 p-0 shrink-0 text-zinc-400 group-hover:text-zinc-900 transition-transform",
                                                            isExpanded && "rotate-180 bg-zinc-200/50 text-zinc-900"
                                                        )}
                                                    >
                                                        <ChevronDown className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>

                                            {/* Expanded Detail Row */}
                                            {isExpanded && (
                                                <TableRow className="border-b-zinc-200 bg-zinc-50/50 hover:bg-zinc-50/50">
                                                    <TableCell colSpan={6} className="p-0">
                                                        <div className="px-6 py-6 border-l-2 border-l-primary/30 ml-[25px] mb-4 mt-2 bg-white rounded-r-xl shadow-sm mr-6 border-y border-r border-zinc-200/60 overflow-hidden">
                                                            
                                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                                                {/* Left: Original Request */}
                                                                <div className="lg:col-span-7 space-y-4">
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200 shrink-0">
                                                                            <span className="text-[10px] font-bold text-zinc-600">{item.created_by_name.charAt(0)}</span>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs font-semibold text-zinc-900">
                                                                                Nội dung yêu cầu từ {item.created_by_name}
                                                                            </p>
                                                                            <p className="text-[10px] text-zinc-500">
                                                                                Vào lúc {new Date(item.created_at).toLocaleString('vi-VN')}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {item.content ? (
                                                                        <div 
                                                                            className="text-[13px] text-zinc-700 leading-relaxed font-medium prose prose-sm max-w-none prose-img:rounded-md prose-img:border prose-img:border-zinc-200"
                                                                            dangerouslySetInnerHTML={{ __html: item.content }}
                                                                        />
                                                                    ) : (
                                                                        <p className="text-[13px] text-zinc-400 italic">Không có mô tả chi tiết.</p>
                                                                    )}
                                                                </div>

                                                                {/* Right: Agency Response */}
                                                                <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-zinc-100 pt-6 lg:pt-0 lg:pl-8">
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shrink-0">
                                                                            <MessageCircle className="w-3 h-3 text-blue-700" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs font-bold text-blue-900 uppercase tracking-tight">
                                                                                Agency phản hồi
                                                                            </p>
                                                                            {item.responded_at && (
                                                                                <p className="text-[10px] text-blue-600/70">
                                                                                    {new Date(item.responded_at).toLocaleString('vi-VN')}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {item.response_content ? (
                                                                        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100/50 text-[13px] text-blue-900 leading-relaxed font-medium">
                                                                            <div dangerouslySetInnerHTML={{ __html: item.response_content }} />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="bg-zinc-50 p-4 border border-zinc-100 border-dashed rounded-lg text-center">
                                                                            <p className="text-xs text-zinc-500 font-medium">Đang chờ phản hồi từ đội ngũ hỗ trợ...</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    )
}
