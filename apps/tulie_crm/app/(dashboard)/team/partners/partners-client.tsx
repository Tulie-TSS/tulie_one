'use client'

import { useState } from 'react'
import { PartnerRegistration, updatePartnerRegistrationStatus } from '@/lib/supabase/services/partner-service'
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
    Card, CardContent, CardHeader, CardTitle,
    Badge, Button, Dialog, DialogContent, DialogHeader, DialogTitle,
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
    Input
} from '@repo/ui'
import { MoreHorizontal, FileText, CheckCircle2, XCircle, Search, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils/format'
import { useRouter } from 'next/navigation'

export function PartnersClient({ initialData }: { initialData: PartnerRegistration[] }) {
    const [registrations] = useState(initialData)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedPartner, setSelectedPartner] = useState<PartnerRegistration | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const router = useRouter()

    const filtered = registrations.filter(r => 
        r.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone?.includes(searchTerm)
    )

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
        setIsProcessing(true)
        const res = await updatePartnerRegistrationStatus(id, status)
        setIsProcessing(false)
        if (res.success) {
            toast.success(status === 'approved' ? 'Đã duyệt đối tác thành công' : 'Đã từ chối đơn đăng ký')
            setSelectedPartner(null)
            router.refresh()
        } else {
            toast.error(res.error || 'Có lỗi xảy ra')
        }
    }

    const ROLE_LABELS = {
        'lead_only': 'Giới thiệu khách',
        'consult_close': 'Tư vấn & Chốt',
        'full_close': 'Tự chốt HĐ'
    }

    const STATUS_MAP = {
        'pending': { label: 'Chờ duyệt', variant: 'secondary' },
        'approved': { label: 'Đã duyệt', variant: 'default' },
        'rejected': { label: 'Đã từ chối', variant: 'destructive' }
    }

    return (
        <Card>
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Danh sách đăng ký</CardTitle>
                <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Tìm theo tên, SĐT..." 
                        className="pl-8" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Họ tên / SĐT</TableHead>
                            <TableHead>Vai trò mong muốn</TableHead>
                            <TableHead>Hồ sơ CCCD</TableHead>
                            <TableHead>Ngày đăng ký</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map(reg => (
                            <TableRow key={reg.id}>
                                <TableCell>
                                    <div className="font-medium">{reg.full_name}</div>
                                    <div className="text-sm text-muted-foreground">{reg.phone}</div>
                                    {reg.email && <div className="text-xs text-muted-foreground">{reg.email}</div>}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="bg-primary/5">
                                        {ROLE_LABELS[reg.preferred_role as keyof typeof ROLE_LABELS] || reg.preferred_role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Button variant="outline" size="sm" onClick={() => setSelectedPartner(reg)} className="h-8">
                                        <FileText className="w-4 h-4 mr-2" /> Hồ sơ
                                    </Button>
                                </TableCell>
                                <TableCell className="tabular-nums text-muted-foreground font-medium text-sm">
                                    {formatDate(reg.created_at)}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={(STATUS_MAP[reg.status as keyof typeof STATUS_MAP]?.variant as any) || 'secondary'}>
                                        {STATUS_MAP[reg.status as keyof typeof STATUS_MAP]?.label || reg.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleUpdateStatus(reg.id, 'approved')} disabled={reg.status === 'approved' || isProcessing}>
                                                <CheckCircle2 className="w-4 h-4 mr-2" /> Phê duyệt
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleUpdateStatus(reg.id, 'rejected')} disabled={reg.status === 'rejected' || isProcessing}>
                                                <XCircle className="w-4 h-4 mr-2 text-destructive" /> Từ chối
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">Không tìm thấy đơn đăng ký nào</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>

            <Dialog open={!!selectedPartner} onOpenChange={(open) => !open && setSelectedPartner(null)}>
                <DialogContent className="max-w-2xl sm:max-w-2xl bg-white" aria-describedby="partner-dialog-description">
                    <DialogHeader>
                        <DialogTitle>Hồ sơ xét duyệt Đối tác</DialogTitle>
                    </DialogHeader>
                    {selectedPartner && (
                        <div id="partner-dialog-description" className="space-y-6 pt-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Họ và tên</p>
                                    <p className="font-semibold text-base">{selectedPartner.full_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Số điện thoại</p>
                                    <p className="font-semibold text-base">{selectedPartner.phone}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Vai trò đăng ký</p>
                                    <p className="font-medium text-foreground">{ROLE_LABELS[selectedPartner.preferred_role as keyof typeof ROLE_LABELS]}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">TK Ngân hàng</p>
                                    <p className="font-medium">
                                        {selectedPartner.bank_name ? `${selectedPartner.bank_name} - ${selectedPartner.bank_account_number}` : 'Chưa cập nhật'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 border p-4 rounded-xl bg-slate-50">
                                <h3 className="font-semibold text-sm">Căn cước công dân</h3>
                                {selectedPartner.id_card_type === 'images' ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Mặt trước</p>
                                            {selectedPartner.id_card_front_url ? (
                                                <a href={selectedPartner.id_card_front_url} target="_blank" rel="noopener noreferrer">
                                                    <img src={selectedPartner.id_card_front_url} alt="CCCD Mặt trước" className="rounded-lg object-cover w-full h-auto border shadow-sm aspect-[1.6] hover:opacity-90 transition-opacity" />
                                                </a>
                                            ) : (
                                                <div className="flex items-center justify-center w-full aspect-[1.6] bg-muted rounded-lg border border-dashed"><span className="text-xs text-muted-foreground">Trống</span></div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Mặt sau</p>
                                            {selectedPartner.id_card_back_url ? (
                                                <a href={selectedPartner.id_card_back_url} target="_blank" rel="noopener noreferrer">
                                                    <img src={selectedPartner.id_card_back_url} alt="CCCD Mặt sau" className="rounded-lg object-cover w-full h-auto border shadow-sm aspect-[1.6] hover:opacity-90 transition-opacity" />
                                                </a>
                                            ) : (
                                                <div className="flex items-center justify-center w-full aspect-[1.6] bg-muted rounded-lg border border-dashed"><span className="text-xs text-muted-foreground">Trống</span></div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-rose-500" />
                                            <span className="font-medium text-sm">Tài liệu PDF</span>
                                        </div>
                                        {selectedPartner.id_card_pdf_url && (
                                            <Button size="sm" variant="outline" asChild>
                                                <a href={selectedPartner.id_card_pdf_url} target="_blank" rel="noopener noreferrer" className="gap-2">Xem PDF <ExternalLink className="w-3.5 h-3.5" /></a>
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Ghi chú của ứng viên</p>
                                <p className="p-3 bg-muted rounded border border-border/50 text-sm whitespace-pre-wrap">{selectedPartner.note || 'Không có ghi chú.'}</p>
                            </div>

                            {selectedPartner.status === 'pending' && (
                                <div className="flex items-center justify-end gap-3 pt-4 border-t mt-6">
                                    <Button variant="outline" onClick={() => handleUpdateStatus(selectedPartner.id, 'rejected')} disabled={isProcessing} className="text-destructive hover:text-destructive hover:bg-destructive/10">Từ chối</Button>
                                    <Button onClick={() => handleUpdateStatus(selectedPartner.id, 'approved')} disabled={isProcessing}>Phê duyệt Đối tác</Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    )
}
