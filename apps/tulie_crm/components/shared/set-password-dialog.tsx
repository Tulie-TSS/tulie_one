'use client'

import { useState } from 'react'
import { Button } from '@repo/ui'
import { Input } from '@repo/ui'
import { Label } from '@repo/ui'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@repo/ui'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@repo/ui'
import { DropdownMenuItem } from '@repo/ui'
import { Lock, Eye, EyeOff, RefreshCw, Copy, Check } from 'lucide-react'
import { LoadingSpinner } from '@repo/ui'
import { toast } from 'sonner'
import { setEntityPassword } from '@/lib/supabase/services/portal-actions'

interface SetPasswordDialogProps {
    entityId: string
    tableName: 'quotations' | 'projects' | 'contracts'
    hasPassword?: boolean
    hasFinancialPassword?: boolean
    triggerType?: 'button' | 'menuitem' | 'icon'
}

export function SetPasswordDialog({
    entityId,
    tableName,
    hasPassword = false,
    hasFinancialPassword = false,
    triggerType = 'button',
}: SetPasswordDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'portal' | 'financial'>('portal')
    
    // States for Portal
    const [portalPassword, setPortalPassword] = useState('')
    const [showPortalPassword, setShowPortalPassword] = useState(false)
    const [isPortalLoading, setIsPortalLoading] = useState(false)
    const [portalCopied, setPortalCopied] = useState(false)

    // States for Financial
    const [financialPassword, setFinancialPassword] = useState('')
    const [showFinancialPassword, setShowFinancialPassword] = useState(false)
    const [isFinancialLoading, setIsFinancialLoading] = useState(false)
    const [financialCopied, setFinancialCopied] = useState(false)

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            setPortalPassword('')
            setFinancialPassword('')
            setPortalCopied(false)
            setFinancialCopied(false)
            setActiveTab('portal')
        }
    }

    const generatePassword = (type: 'portal' | 'financial') => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
        let result = ''
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        if (type === 'portal') {
            setPortalPassword(result)
            setShowPortalPassword(true)
        } else {
            setFinancialPassword(result)
            setShowFinancialPassword(true)
        }
    }

    const handleCopy = (type: 'portal' | 'financial') => {
        const pass = type === 'portal' ? portalPassword : financialPassword
        if (pass) {
            navigator.clipboard.writeText(pass)
            if (type === 'portal') setPortalCopied(true)
            else setFinancialCopied(true)
            toast.success('Đã copy mật khẩu')
            setTimeout(() => {
                if (type === 'portal') setPortalCopied(false)
                else setFinancialCopied(false)
            }, 2000)
        }
    }

    const handleSave = async (type: 'portal' | 'financial') => {
        const passwordToSave = type === 'portal' ? portalPassword : financialPassword
        const setLoading = type === 'portal' ? setIsPortalLoading : setIsFinancialLoading
        
        setLoading(true)
        try {
            const result = await setEntityPassword(tableName, entityId, passwordToSave, type)
            if (result.success) {
                toast.success(passwordToSave ? `Đã cài đặt mật khẩu ${type === 'portal' ? 'Portal' : 'Tài chính'} thành công` : `Đã gỡ mật khẩu ${type === 'portal' ? 'Portal' : 'Tài chính'}`)
                if (type === 'portal') setPortalPassword('')
                else setFinancialPassword('')
            } else {
                toast.error(result.error || 'Có lỗi xảy ra')
            }
        } catch (error) {
            toast.error('Lỗi hệ thống')
        } finally {
            setLoading(false)
        }
    }

    const anyPasswordSet = hasPassword || hasFinancialPassword

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {triggerType === 'menuitem' ? (
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault()
                            setIsOpen(true)
                        }}
                        className="cursor-pointer"
                    >
                        <Lock className="h-4 w-4" />
                        {anyPasswordSet ? 'Tính năng bảo mật' : 'Thiết lập bảo mật'}
                    </DropdownMenuItem>
                ) : triggerType === 'icon' ? (
                    <Button variant={anyPasswordSet ? "default" : "outline"} size="icon" className="h-8 w-8" title={anyPasswordSet ? 'Đã thiết lập bảo mật' : 'Thiết lập bảo mật'}>
                        <Lock className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button variant={anyPasswordSet ? "default" : "outline"} className="gap-2">
                        <Lock className="h-4 w-4" />
                        Bảo mật cấp truy cập
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Thiết lập mật khẩu bảo mật (2 Cấp)</DialogTitle>
                    <DialogDescription>
                        Quản lý mật khẩu để bảo vệ Portal khách hàng. Bạn có thể khoá toàn bộ thẻ dự án (Cấp 1) hoặc chỉ khoá riêng các tài liệu nhạy cảm như báo giá/hợp đồng (Cấp 2).
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full mt-2">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="portal">Cấp 1: Dự án (Portal)</TabsTrigger>
                        <TabsTrigger value="financial">Cấp 2: Tài chính</TabsTrigger>
                    </TabsList>

                    <TabsContent value="portal" className="space-y-4 py-4 focus-visible:outline-none">
                        <div className="space-y-2">
                            <Label htmlFor="portal_password">Mật khẩu mới (Portal chung)</Label>
                            <div className="relative">
                                <Input
                                    id="portal_password"
                                    type={showPortalPassword ? "text" : "password"}
                                    value={portalPassword}
                                    onChange={(e) => setPortalPassword(e.target.value)}
                                    placeholder={hasPassword ? 'Nhập mật khẩu mới...' : 'Nhập mật khẩu...'}
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full hover:bg-transparent"
                                    onClick={() => setShowPortalPassword(!showPortalPassword)}
                                >
                                    {showPortalPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" size="sm" className="text-xs h-7" onClick={() => generatePassword('portal')}>
                                        <RefreshCw className="h-3 w-3 mr-1" />
                                        Tạo
                                    </Button>
                                    {portalPassword && (
                                        <Button type="button" variant="outline" size="sm" className="text-xs h-7" onClick={() => handleCopy('portal')}>
                                            {portalCopied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                                            {portalCopied ? 'Đã copy' : 'Copy'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                            <div className="space-y-1">
                                <Label className="text-xs">Mật khẩu hiện tại</Label>
                                <p className="text-[11px] text-muted-foreground">
                                    {hasPassword ? '🔒 Đã thiết lập (mã hoá)' : 'Mở công khai'}
                                </p>
                            </div>
                            <Button size="sm" onClick={() => handleSave('portal')} disabled={isPortalLoading}>
                                {isPortalLoading && <LoadingSpinner size="sm" className="mr-2" />}
                                {portalPassword ? 'Cập nhật' : (hasPassword ? 'Gỡ mật khẩu' : 'Lưu')}
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="financial" className="space-y-4 py-4 focus-visible:outline-none">
                        <div className="space-y-2">
                            <Label htmlFor="financial_password">Mật khẩu mới (Tài chính & Pháp lý)</Label>
                            <div className="relative">
                                <Input
                                    id="financial_password"
                                    type={showFinancialPassword ? "text" : "password"}
                                    value={financialPassword}
                                    onChange={(e) => setFinancialPassword(e.target.value)}
                                    placeholder={hasFinancialPassword ? 'Nhập mật khẩu mới...' : 'Nhập mật khẩu...'}
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full hover:bg-transparent"
                                    onClick={() => setShowFinancialPassword(!showFinancialPassword)}
                                >
                                    {showFinancialPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" size="sm" className="text-xs h-7" onClick={() => generatePassword('financial')}>
                                        <RefreshCw className="h-3 w-3 mr-1" />
                                        Tạo
                                    </Button>
                                    {financialPassword && (
                                        <Button type="button" variant="outline" size="sm" className="text-xs h-7" onClick={() => handleCopy('financial')}>
                                            {financialCopied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                                            {financialCopied ? 'Đã copy' : 'Copy'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                            <div className="space-y-1">
                                <Label className="text-xs">Mật khẩu hiện tại</Label>
                                <p className="text-[11px] text-muted-foreground">
                                    {hasFinancialPassword ? '🔒 Đã thiết lập (mã hoá)' : 'Mở công khai (nếu pass Cấp 1)'}
                                </p>
                            </div>
                            <Button size="sm" onClick={() => handleSave('financial')} disabled={isFinancialLoading}>
                                {isFinancialLoading && <LoadingSpinner size="sm" className="mr-2" />}
                                {financialPassword ? 'Cập nhật' : (hasFinancialPassword ? 'Gỡ mật khẩu' : 'Lưu')}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
                <DialogFooter className="mt-2 text-right sm:justify-center">
                    <p className="text-xs text-muted-foreground">Bạn có thể tạo mật khẩu và gửi trực tiếp cho Khách hàng.</p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
