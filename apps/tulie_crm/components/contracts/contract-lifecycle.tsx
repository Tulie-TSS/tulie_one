'use client'

import { Contract, ContractMilestone, Project } from '@/types'
import { Check, Circle, ChevronRight, FileText, CreditCard, Rocket, PackageCheck, ArrowRight } from 'lucide-react'
import { Badge } from '@repo/ui'
import { Button } from '@repo/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LifecycleStep {
    id: string
    label: string
    description: string
    status: 'completed' | 'active' | 'upcoming'
    date?: string
    document?: string
    documentType?: string
    link?: string
}

interface ContractLifecycleProps {
    contract: Contract
    project?: Project | null
}

function getLifecycleSteps(contract: Contract, project?: Project | null): LifecycleStep[] {
    const hasSignedDate = !!contract.signed_date
    const isActive = contract.status === 'active'
    const isCompleted = contract.status === 'completed'
    const milestones = contract.milestones || []

    const isOrder = contract.type === 'order'
    const docLabel = isOrder ? 'Đơn đặt hàng' : (contract.title || 'Hợp đồng dịch vụ')
    const docType = isOrder ? 'order' : 'contract'

    // Separate milestones
    const paymentMilestones = milestones.filter(m => m.type === 'payment' || !m.type)
    const workMilestones = milestones.filter(m => m.type === 'work' || m.type === 'delivery')

    const firstPayment = paymentMilestones[0]
    const lastPayment = paymentMilestones[paymentMilestones.length - 1]
    const hasMultiplePayments = paymentMilestones.length > 1

    const steps: LifecycleStep[] = []

    // Step 1: Cơ hội & Báo giá
    steps.push({
        id: 'sales',
        label: '1. Khởi tạo & Báo giá',
        description: 'Tiếp nhận yêu cầu và phê duyệt báo giá phương án',
        status: 'completed',
        link: contract.quotation_id ? `/quotations/${contract.quotation_id}` : undefined,
    })

    // Step 2: Ký kết hợp đồng
    steps.push({
        id: 'contracting',
        label: `2. Ký kết ${docLabel}`,
        description: contract.signed_date 
            ? `Đã ký ngày ${new Date(contract.signed_date).toLocaleDateString('vi-VN')}`
            : `Khởi tạo hồ sơ ${docLabel.toLowerCase()}`,
        status: contract.signed_date ? 'completed' : (contract.status === 'draft' ? 'active' : 'completed'),
        date: contract.signed_date,
        document: docLabel,
        documentType: docType,
    })

    // Step 3: Tạm ứng hợp đồng (nếu có đợt thanh toán đầu tiên)
    if (firstPayment) {
        const isDone = firstPayment.status === 'completed'
        steps.push({
            id: 'advance_payment',
            label: `3. Tạm ứng: ${firstPayment.name || 'Đợt 1'}`,
            description: `Số tiền: ${new Intl.NumberFormat('vi-VN').format(firstPayment.amount || 0)}đ (${firstPayment.percentage ? firstPayment.percentage + '%' : 'Cố định'})`,
            status: isDone ? 'completed' : (contract.status === 'active' ? 'active' : 'upcoming'),
            date: firstPayment.completed_at || firstPayment.due_date,
            document: 'Đề nghị thanh toán (Tạm ứng)',
            documentType: 'payment_request&milestone=0',
        })
    }

    // Step 4: Triển khai thực tế
    const allWorkDone = workMilestones.length > 0 && workMilestones.every(m => m.status === 'completed')
    const anyWorkStarted = workMilestones.some(m => m.status === 'completed')
    let workStatus: 'completed' | 'active' | 'upcoming' = 'upcoming'
    if (isCompleted || allWorkDone) {
        workStatus = 'completed'
    } else if (isActive || anyWorkStarted) {
        workStatus = 'active'
    }
    
    // Build a neat summary of work items
    const workSummary = workMilestones.length > 0
        ? workMilestones.map(m => `${m.name} (${m.status === 'completed' ? 'Xong' : 'Đang làm'})`).join(' → ')
        : 'Thực hiện dịch vụ/sản phẩm theo hợp đồng'

    steps.push({
        id: 'execution',
        label: '4. Triển khai & Nghiệm thu',
        description: workSummary,
        status: workStatus,
        link: contract.project_id ? `/projects/${contract.project_id}` : undefined,
        document: workMilestones.some(m => m.type === 'delivery') ? 'Biên bản bàn giao' : undefined,
        documentType: 'delivery_minutes',
    })

    // Step 5: Thanh toán quyết toán (Đợt cuối)
    if (hasMultiplePayments && lastPayment) {
        const isDone = lastPayment.status === 'completed'
        steps.push({
            id: 'final_payment',
            label: `5. Quyết toán: ${lastPayment.name || 'Đợt cuối'}`,
            description: `Số tiền: ${new Intl.NumberFormat('vi-VN').format(lastPayment.amount || 0)}đ (${lastPayment.percentage ? lastPayment.percentage + '%' : 'Cố định'})`,
            status: isDone ? 'completed' : (workStatus === 'completed' ? 'active' : 'upcoming'),
            date: lastPayment.completed_at || lastPayment.due_date,
            document: 'Đề nghị thanh toán (Quyết toán)',
            documentType: `payment_request&milestone=${paymentMilestones.length - 1}`,
        })
    }

    // Step 6: Bảo hành & Kết thúc
    steps.push({
        id: 'closure',
        label: '6. Nghiệm thu & Kết thúc',
        description: isCompleted ? 'Dự án đã nghiệm thu bàn giao và đóng hồ sơ' : 'Đóng hợp đồng và lưu trữ',
        status: isCompleted ? 'completed' : 'upcoming',
    })

    return steps
}

export function ContractLifecycle({ contract, project }: ContractLifecycleProps) {
    const steps = getLifecycleSteps(contract, project)
    const activeIndex = steps.findIndex(s => s.status === 'active')
    const progress = activeIndex >= 0
        ? Math.round((activeIndex / (steps.length - 1)) * 100)
        : steps.every(s => s.status === 'completed') ? 100 : 0

    return (
        <Card>
            <CardHeader className="pb-2 pt-3 px-4 border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                        <Rocket className="h-3.5 w-3.5 text-muted-foreground" />
                        Vòng đời dự án
                    </CardTitle>
                    <Badge variant={progress === 100 ? 'default' : 'secondary'} className="text-[10px] h-5 px-1.5">
                        {progress}% hoàn thành
                    </Badge>
                </div>
                {/* Progress bar */}
                <div className="h-1 bg-muted rounded-full overflow-hidden mt-1.5">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </CardHeader>
            <CardContent className="space-y-0.5 px-4 pb-3 pt-2.5">
                {steps.map((step, index) => {
                    const isLast = index === steps.length - 1
                    const isCompleted = step.status === 'completed'
                    const isActive = step.status === 'active'

                    return (
                        <div key={step.id} className="relative">
                            {/* Connector line */}
                            {!isLast && (
                                <div className={cn(
                                    "absolute left-[21px] top-[36px] w-[1.5px] h-[calc(100%-20px)]",
                                    isCompleted ? "bg-primary" : "bg-muted"
                                )} />
                            )}

                            <div className={cn(
                                "flex items-start gap-3 py-1.5 px-1.5 rounded-lg transition-colors",
                                isActive && "bg-muted/50"
                            )}>
                                {/* Status icon */}
                                <div className={cn(
                                    "h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-semibold border-2 relative z-10",
                                    isCompleted && "bg-primary border-primary text-primary-foreground",
                                    isActive && "bg-background border-primary text-primary",
                                    !isCompleted && !isActive && "bg-muted border-muted text-muted-foreground"
                                )}>
                                    {isCompleted ? (
                                        <Check className="h-3.5 w-3.5" />
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <div className="flex items-center gap-2">
                                        <p className={cn(
                                            "text-xs font-semibold",
                                            !isCompleted && !isActive && "text-muted-foreground"
                                        )}>
                                            {step.label}
                                        </p>
                                        {isActive && (
                                            <Badge className="text-[9px] h-4.5 px-1.5 bg-orange-600 hover:bg-orange-600 text-white rounded-full border-none">
                                                Đang thực hiện
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{step.description}</p>

                                    {/* Actions row */}
                                    {(step.link || step.document) && (isCompleted || isActive) && (
                                        <div className="flex items-center gap-2 mt-1">
                                            {step.link && (
                                                <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5" asChild>
                                                    <Link href={step.link}>
                                                        Xem chi tiết
                                                        <ChevronRight className="h-3 w-3 ml-0.5" />
                                                    </Link>
                                                </Button>
                                            )}
                                            {step.document && step.documentType && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-5 text-[10px] px-1.5"
                                                    onClick={() => {
                                                        window.open(`/api/contracts/${contract.id}/preview?type=${step.documentType}`, '_blank')
                                                    }}
                                                >
                                                    <FileText className="h-3 w-3 mr-0.5" />
                                                    {step.document}
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Date */}
                                {step.date && !isNaN(new Date(step.date).getTime()) && (
                                    <span className="text-[9px] text-muted-foreground shrink-0 pt-1">
                                        {new Date(step.date).toLocaleDateString('vi-VN')}
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
