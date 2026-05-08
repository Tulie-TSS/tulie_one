'use client'

import React, { useState } from 'react'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useOkrs, Objective } from '@/hooks/useOkrs'
import { useCycles } from '@/hooks/useCycles'
import { 
    PageHeader, 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    Button, 
    Badge, 
    Progress,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Avatar,
    AvatarImage,
    AvatarFallback,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@repo/ui'
import { 
    Target, 
    TrendingUp, 
    Users, 
    User, 
    Link as LinkIcon, 
    Plus, 
    Loader2, 
    Network,
    ArrowRight,
    ChevronDown,
    ChevronRight,
    LayoutGrid,
    List
} from 'lucide-react'
import { NewOkrDialog } from '@/components/strategy/new-okr-dialog'

export default function OkrPage() {
    const { t } = useLocaleStore()
    const { user } = useCurrentUser()
    const { cycles } = useCycles()
    const [selectedCycleId, setSelectedCycleId] = useState<string>('all')
    const { objectives, loading, error, refetch } = useOkrs({ 
        cycleId: selectedCycleId === 'all' ? undefined : selectedCycleId 
    })

    const [viewMode, setViewMode] = useState<'list' | 'cascade'>('cascade')
    const [newOkrOpen, setNewOkrOpen] = useState(false)

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    const companyOkrs = objectives.filter(o => o.level === 'company')
    const deptOkrs = objectives.filter(o => o.level === 'department')
    const individualOkrs = objectives.filter(o => o.level === 'individual' || o.level === 'team')
    const myOkrs = objectives.filter(o => o.owner_id === user?.id)

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <PageHeader 
                title="KPI & OKRs" 
                description="Liên kết mục tiêu cá nhân với chiến lược tổng thể của công ty."
            >
                <div className="flex items-center gap-3">
                    <Select value={selectedCycleId} onValueChange={setSelectedCycleId}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Chọn chu kỳ" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả chu kỳ</SelectItem>
                            {cycles.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={() => setNewOkrOpen(true)}>
                        <Plus className="size-4 mr-2" />
                        Tạo OKR mới
                    </Button>
                </div>
            </PageHeader>

            <NewOkrDialog 
                open={newOkrOpen} 
                onOpenChange={setNewOkrOpen} 
                onSuccess={refetch}
            />

            <Tabs defaultValue="my" className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="my" className="flex items-center gap-2">
                            <User className="size-3.5" />
                            Cá nhân
                        </TabsTrigger>
                        <TabsTrigger value="dept" className="flex items-center gap-2">
                            <Users className="size-3.5" />
                            Phòng ban
                        </TabsTrigger>
                        <TabsTrigger value="company" className="flex items-center gap-2">
                            <TrendingUp className="size-3.5" />
                            Tổng công ty
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center bg-muted rounded-lg p-1">
                        <Button 
                            variant={viewMode === 'cascade' ? 'secondary' : 'ghost'} 
                            size="sm" 
                            className="h-8 px-3"
                            onClick={() => setViewMode('cascade')}
                        >
                            <Network className="size-3.5 mr-2" />
                            Cây mục tiêu
                        </Button>
                        <Button 
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                            size="sm" 
                            className="h-8 px-3"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="size-3.5 mr-2" />
                            Danh sách
                        </Button>
                    </div>
                </div>

                <TabsContent value="my" className="space-y-4">
                    {myOkrs.length === 0 ? (
                        <EmptyOkrs level="cá nhân" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myOkrs.map(okr => (
                                <OkrCard key={okr.id} okr={okr} allObjectives={objectives} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="dept" className="space-y-4">
                    {deptOkrs.length === 0 ? (
                        <EmptyOkrs level="phòng ban" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {deptOkrs.map(okr => (
                                <OkrCard key={okr.id} okr={okr} allObjectives={objectives} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="company" className="space-y-4">
                    {companyOkrs.length === 0 ? (
                        <EmptyOkrs level="tổng công ty" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {companyOkrs.map(okr => (
                                <OkrCard key={okr.id} okr={okr} allObjectives={objectives} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

function OkrCard({ okr, allObjectives }: { okr: Objective; allObjectives: Objective[] }) {
    const parent = allObjectives.find(o => o.id === okr.parent_objective_id)
    
    return (
        <Card className="hover:border-primary/40 transition-all group">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="capitalize text-[10px]">
                        {okr.level}
                    </Badge>
                    <div className="flex -space-x-2">
                        <Avatar className="size-6 border-2 border-background">
                            <AvatarImage src={okr.owner?.avatar_url || ''} />
                            <AvatarFallback className="text-[10px]">{okr.owner?.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
                <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-2">
                    {okr.title}
                </CardTitle>
                {parent && (
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground bg-muted/50 p-1.5 rounded border border-dashed">
                        <Network className="size-3" />
                        <span className="truncate">Đóng góp cho: <strong>{parent.title}</strong></span>
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                        <span>Tiến độ tổng thể</span>
                        <span className="text-primary">{Math.round(okr.progress_percentage)}%</span>
                    </div>
                    <Progress value={okr.progress_percentage} className="h-1.5" />
                </div>

                <div className="space-y-2 pt-2 border-t border-dashed">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Key Results</div>
                    {okr.key_results?.map(kr => (
                        <div key={kr.id} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground line-clamp-1">{kr.title}</span>
                                <span className="font-semibold">{kr.current_value}/{kr.target_value}{kr.unit}</span>
                            </div>
                            <Progress value={(kr.current_value / kr.target_value) * 100} className="h-1 opacity-60" />
                        </div>
                    ))}
                    {(!okr.key_results || okr.key_results.length === 0) && (
                        <p className="text-[11px] italic text-muted-foreground">Chưa có kết quả then chốt nào được thiết lập.</p>
                    )}
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            <LinkIcon className="size-2.5" />
                            3 Projects
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2 hover:bg-primary/10 hover:text-primary">
                        Chi tiết <ArrowRight className="size-3 ml-1" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function EmptyOkrs({ level }: { level: string }) {
    return (
        <Card className="border-dashed py-20">
            <CardContent className="flex flex-col items-center justify-center gap-4">
                <div className="p-4 rounded-full bg-muted">
                    <Target className="size-8 text-muted-foreground opacity-30" />
                </div>
                <div className="text-center">
                    <h3 className="font-semibold">Chưa có OKRs {level}</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        Thiết lập mục tiêu để bắt đầu theo dõi hiệu quả công việc và sự đóng góp của bạn.
                    </p>
                </div>
                <Button variant="outline">
                    <Plus className="size-4 mr-2" />
                    Thiết lập ngay
                </Button>
            </CardContent>
        </Card>
    )
}
