'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Badge,
    Button,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    Textarea,
    Label,
    Input,
    LoadingSpinner
} from '@repo/ui'
import { CheckCircle2, XCircle, Search, FileText, ImageIcon, Briefcase, Plus, User } from 'lucide-react'
import { toast } from 'sonner'
import { getPartnerRegistrations, updatePartnerRegistrationStatus } from '@/lib/supabase/services/partner-registration-service'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export function PartnerRegistrationsTab() {
    const [registrations, setRegistrations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedReg, setSelectedReg] = useState<any | null>(null)
    const [rejectReason, setRejectReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentUser, setCurrentUser] = useState<any | null>(null)

    const fetchRegistrations = async () => {
        try {
            setLoading(true)
            const data = await getPartnerRegistrations()
            setRegistrations(data)

            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            setCurrentUser(session?.user || null)
        } catch (error) {
            toast.error('Không thể tải danh sách đăng ký CTV')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRegistrations()
    }, [])

    const handleApprove = async () => {
        if (!selectedReg || !currentUser) return
        
        try {
            setIsSubmitting(true)
            await updatePartnerRegistrationStatus(selectedReg.id, 'approved', currentUser.id)
            toast.success('Đã duyệt đơn đăng ký CTV')
            setSelectedReg(null)
            fetchRegistrations()
        } catch (error) {
            toast.error('Lỗi khi duyệt đơn')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReject = async () => {
        if (!selectedReg || !currentUser) return
        if (!rejectReason.trim()) {
            toast.error('Vui lòng nhập lý do từ chối')
            return
        }
        
        try {
            setIsSubmitting(true)
            await updatePartnerRegistrationStatus(selectedReg.id, 'rejected', currentUser.id, rejectReason)
            toast.success('Đã từ chối đơn đăng ký CTV')
            setSelectedReg(null)
            setRejectReason('')
            fetchRegistrations()
        } catch (error) {
            toast.error('Lỗi khi từ chối đơn')
        } finally {
            setIsSubmitting(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const labels: Record<string, string> = {
            pending: 'Chờ duyệt',
            approved: 'Đã duyệt',
            rejected: 'Từ chối',
        }
        const colors: Record<string, string> = {
            pending: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
            approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
            rejected: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
        }
        return (
            <Badge variant="outline" className={`rounded-md text-[11px] font-medium ${colors[status] || ''}`}>
                {labels[status] || status}
            </Badge>
        )
    }

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'lead_only': return 'Giới thiệu khách'
            case 'consult_close': return 'Tư vấn & Chốt'
            case 'full_close': return 'Tự chốt hợp đồng'
            default: return role
        }
    }

    if (loading) {
        return (
            <Card>
                <div className="flex justify-center p-8"><LoadingSpinner /></div>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                    <CardTitle>Đăng ký Cộng tác viên</CardTitle>
                    <CardDescription>
                        Quản lý các đơn đăng ký trở thành đối tác kinh doanh từ trang Affiliate.
                    </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchRegistrations}>
                    Làm mới
                </Button>
            </CardHeader>
            <CardContent>
                {registrations.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg border-dashed">
                        <Briefcase className="w-12 h-12 text-muted-foreground opacity-50 mx-auto mb-4" />
                        <h3 className="font-semibold text-lg">Chưa có lượt đăng ký nào</h3>
                        <p className="text-sm text-muted-foreground mt-1">Các đơn đăng ký từ website sẽ xuất hiện ở đây.</p>
                    </div>
                ) : (
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Họ tên / Liên hệ</TableHead>
                                    <TableHead>Vai trò mong muốn</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Ngày đăng ký</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {registrations.map(reg => (
                                    <TableRow key={reg.id}>
                                        <TableCell>
                                            <div className="font-medium">{reg.full_name}</div>
                                            <div className="text-xs text-muted-foreground">{reg.phone}</div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium">{getRoleLabel(reg.preferred_role)}</span>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(reg.status)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{format(new Date(reg.created_at), 'dd/MM/yyyy HH:mm')}</div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="outline" onClick={() => setSelectedReg(reg)}>
                                                Chi tiết
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>

            {/* Chi tiết Dialog */}
            <Dialog open={!!selectedReg} onOpenChange={(v: boolean) => !v && setSelectedReg(null)}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    {selectedReg && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center justify-between">
                                    <DialogTitle>Chi tiết đăng ký Đối tác</DialogTitle>
                                    {getStatusBadge(selectedReg.status)}
                                </div>
                                <DialogDescription>
                                    Đăng ký lúc: {format(new Date(selectedReg.created_at), "HH:mm dd/MM/yyyy", { locale: vi })}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid md:grid-cols-2 gap-6 py-4">
                                {/* Cột 1: Thông tin */}
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold flex items-center border-b pb-2">
                                            <User className="w-4 h-4 mr-2" /> Thông tin cá nhân
                                        </h4>
                                        <div className="grid grid-cols-3 text-sm gap-y-2">
                                            <div className="text-muted-foreground">Họ tên:</div>
                                            <div className="col-span-2 font-medium">{selectedReg.full_name}</div>
                                            
                                            <div className="text-muted-foreground">SĐT:</div>
                                            <div className="col-span-2">{selectedReg.phone}</div>
                                            
                                            <div className="text-muted-foreground">Email:</div>
                                            <div className="col-span-2">{selectedReg.email || '-'}</div>
                                            
                                            <div className="text-muted-foreground">Địa chỉ:</div>
                                            <div className="col-span-2">{selectedReg.address || '-'}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold flex items-center border-b pb-2">
                                            <Briefcase className="w-4 h-4 mr-2" /> Yêu cầu công việc
                                        </h4>
                                        <div className="grid grid-cols-3 text-sm gap-y-2">
                                            <div className="text-muted-foreground">Vai trò:</div>
                                            <div className="col-span-2 font-bold text-primary">{getRoleLabel(selectedReg.preferred_role)}</div>
                                            
                                            <div className="text-muted-foreground">Kinh nghiệm:</div>
                                            <div className="col-span-2 italic text-muted-foreground">{selectedReg.experience || 'Không có'}</div>
                                            
                                            <div className="text-muted-foreground">Nguồn giới thiệu:</div>
                                            <div className="col-span-2">{selectedReg.referral_source || '-'}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold flex items-center border-b pb-2">
                                            <FileText className="w-4 h-4 mr-2" /> Thông tin Ngân hàng
                                        </h4>
                                        <div className="grid grid-cols-3 text-sm gap-y-2">
                                            <div className="text-muted-foreground">Ngân hàng:</div>
                                            <div className="col-span-2">{selectedReg.bank_name || '-'}</div>
                                            
                                            <div className="text-muted-foreground">Số TK:</div>
                                            <div className="col-span-2 font-mono bg-muted px-1 w-fit rounded">{selectedReg.bank_account_number || '-'}</div>
                                            
                                            <div className="text-muted-foreground">Chủ TK:</div>
                                            <div className="col-span-2 uppercase">{selectedReg.bank_account_name || '-'}</div>
                                        </div>
                                    </div>
                                    
                                    {selectedReg.status !== 'pending' && (
                                        <div className="bg-muted p-3 rounded-md text-sm">
                                            <div className="font-semibold mb-1">
                                                Thông tin xét duyệt:
                                            </div>
                                            <div>Bởi: <span className="font-medium">{selectedReg.users?.full_name || 'Admin'}</span></div>
                                            <div>Lúc: {selectedReg.reviewed_at ? format(new Date(selectedReg.reviewed_at), 'dd/MM/yyyy HH:mm') : '-'}</div>
                                            {selectedReg.reject_reason && (
                                                <div className="mt-1 text-red-600">Lý do: {selectedReg.reject_reason}</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Cột 2: CCCD và Action */}
                                <div className="space-y-4 flex flex-col">
                                    <h4 className="text-sm font-semibold flex items-center border-b pb-2">
                                        <ImageIcon className="w-4 h-4 mr-2" /> Căn cước công dân
                                    </h4>
                                    <div className="flex-1 bg-muted/50 rounded-lg border border-dashed flex flex-col p-4 gap-4">
                                        {selectedReg.id_card_type === 'pdf' ? (
                                            <div className="flex flex-col items-center justify-center p-8 text-center flex-1">
                                                <FileText className="w-12 h-12 text-primary/40 mb-3" />
                                                <p className="font-medium mb-2">Bản scan PDF CCCD</p>
                                                {selectedReg.id_card_pdf_url ? (
                                                    <a href={selectedReg.id_card_pdf_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm font-medium">Bấm vào đây để xem/tải về</a>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">Không có link đính kèm.</p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="text-xs font-semibold mb-2">MẶT TRƯỚC</div>
                                                    {selectedReg.id_card_front_url ? (
                                                        <a href={selectedReg.id_card_front_url} target="_blank" rel="noreferrer" className="block relative aspect-[8/5] bg-muted w-full overflow-hidden rounded-md border shadow-sm group">
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                <span className="text-white text-sm font-medium"> Xem ảnh lớn</span>
                                                            </div>
                                                            <img src={selectedReg.id_card_front_url} alt="Mặt trước CCCD" className="w-full h-full object-cover object-center" />
                                                        </a>
                                                    ) : (
                                                        <div className="aspect-[8/5] bg-muted w-full flex items-center justify-center rounded-md border border-dashed">
                                                            <span className="text-sm text-muted-foreground">Chưa cập nhật</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-semibold mb-2">MẶT SAU</div>
                                                    {selectedReg.id_card_back_url ? (
                                                        <a href={selectedReg.id_card_back_url} target="_blank" rel="noreferrer" className="block relative aspect-[8/5] bg-muted w-full overflow-hidden rounded-md border shadow-sm group">
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                <span className="text-white text-sm font-medium"> Xem ảnh lớn</span>
                                                            </div>
                                                            <img src={selectedReg.id_card_back_url} alt="Mặt sau CCCD" className="w-full h-full object-cover object-center" />
                                                        </a>
                                                    ) : (
                                                        <div className="aspect-[8/5] bg-muted w-full flex items-center justify-center rounded-md border border-dashed">
                                                            <span className="text-sm text-muted-foreground">Chưa cập nhật</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {selectedReg.status === 'pending' && (
                                        <div className="border-t pt-4 mt-auto">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="rejectReason" className="text-xs text-muted-foreground">Lý do từ chối (nếu có)</Label>
                                                    <Input 
                                                        id="rejectReason"
                                                        placeholder="VD: Không đủ hồ sơ, sai CCCD..."
                                                        value={rejectReason}
                                                        onChange={(e: any) => setRejectReason(e.target.value)}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50" onClick={handleReject} disabled={isSubmitting}>
                                                        <XCircle className="w-4 h-4 mr-2" /> Từ chối
                                                    </Button>
                                                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleApprove} disabled={isSubmitting}>
                                                        <CheckCircle2 className="w-4 h-4 mr-2" /> Duyệt
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    )
}
