'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useLifeRoles } from '@/hooks/useLifeRoles'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { RoleIcon } from '@/components/command-center/role-icon'
import {
    PageHeader, Card, CardContent, CardHeader, CardTitle, Button, Label, Input,
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, toast, Badge
} from '@repo/ui'
import { Plus, Edit2, Trash2, ArrowLeft, Loader2, Check } from 'lucide-react'

const COLOR_PRESETS = [
    { name: 'Đỏ (FPT)', value: '#E53935' },
    { name: 'Xanh dương (Tulie)', value: '#1E88E5' },
    { name: 'Xanh lá (Cá nhân)', value: '#43A047' },
    { name: 'Cam', value: '#FB8C00' },
    { name: 'Tím', value: '#8E24AA' },
    { name: 'Hồng', value: '#D81B60' },
    { name: 'Mòng két (Teal)', value: '#00897B' },
    { name: 'Chàm (Indigo)', value: '#3949AB' },
    { name: 'Xám', value: '#757575' },
]

const ICON_PRESETS = [
    'Briefcase',
    'Rocket',
    'Home',
    'BookOpen',
    'GraduationCap',
    'Dumbbell',
    'Heart',
    'Coins',
    'Target',
    'Compass',
    'Smile',
    'Globe',
    'Laptop',
    'Activity',
]

export default function LifeRolesSettingsPage() {
    const { roles, loading, addRole, updateRole, deleteRole } = useLifeRoles()
    const { t } = useLocaleStore()
    const [actionLoading, setActionLoading] = useState(false)
    
    // Modal state
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<any | null>(null) // null for create
    
    // Form state
    const [formData, setFormData] = useState({
        display_name: '',
        color: COLOR_PRESETS[0].value,
        icon: ICON_PRESETS[0],
        daily_time_budget_minutes: 120,
    })

    const handleOpenCreate = () => {
        setEditingRole(null)
        setFormData({
            display_name: '',
            color: COLOR_PRESETS[0].value,
            icon: ICON_PRESETS[0],
            daily_time_budget_minutes: 120,
        })
        setDialogOpen(true)
    }

    const handleOpenEdit = (role: any) => {
        setEditingRole(role)
        setFormData({
            display_name: role.display_name,
            color: role.color,
            icon: role.icon,
            daily_time_budget_minutes: role.daily_time_budget_minutes,
        })
        setDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.display_name.trim()) {
            toast.error('Vui lòng điền tên mảng/lĩnh vực')
            return
        }

        setActionLoading(true)
        try {
            if (editingRole) {
                await updateRole(editingRole.id, formData)
                toast.success('Đã cập nhật lĩnh vực thành công')
            } else {
                await addRole(formData)
                toast.success('Đã thêm lĩnh vực mới thành công')
            }
            setDialogOpen(false)
        } catch (err: any) {
            toast.error(err.message || 'Có lỗi xảy ra')
        } finally {
            setActionLoading(false)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa lĩnh vực "${name}"? Các công việc thuộc lĩnh vực này sẽ không còn liên kết.`)) {
            return
        }

        setActionLoading(true)
        try {
            await deleteRole(id)
            toast.success('Đã xóa lĩnh vực thành công')
        } catch (err: any) {
            toast.error(err.message || 'Lỗi khi xóa lĩnh vực')
        } finally {
            setActionLoading(false)
        }
    }

    const handleToggleActive = async (role: any) => {
        try {
            await updateRole(role.id, { is_active: !role.is_active })
            toast.success(`${role.is_active ? 'Đã tắt' : 'Đã kích hoạt'} lĩnh vực "${role.display_name}"`)
        } catch (err: any) {
            toast.error(err.message || 'Lỗi cập nhật trạng thái')
        }
    }

    return (
        <div className="space-y-6">
            <Link href="/settings" className="inline-flex items-center gap-1 no-underline mb-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('settings.backToSettings')}
            </Link>

            <PageHeader 
                title="Quản lý Lĩnh vực / Mảng (Life Roles)" 
                description="Quản lý các mảng cuộc sống và mảng công việc của bạn (FPT, Tulie, Cá nhân, NEU...) để phân chia thời gian và liên kết công việc." 
            >
                <Button onClick={handleOpenCreate} size="sm" className="shrink-0 cursor-pointer">
                    <Plus className="mr-2 size-4" />
                    Thêm lĩnh vực mới
                </Button>
            </PageHeader>

            {loading ? (
                <div className="flex h-[30vh] items-center justify-center">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
            ) : roles.length === 0 ? (
                <Card className="text-center p-8 bg-muted/20 border-dashed">
                    <CardContent className="py-6 space-y-4">
                        <p className="text-muted-foreground">Chưa có mảng/lĩnh vực hoạt động nào được khởi tạo.</p>
                        <Button onClick={handleOpenCreate} variant="outline">Tạo ngay mảng đầu tiên</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roles.map(role => (
                        <Card key={role.id} className="hover:border-primary/50 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="flex items-center justify-center size-9 rounded-lg" 
                                        style={{ backgroundColor: `${role.color}15`, color: role.color }}
                                    >
                                        <RoleIcon name={role.icon} className="size-4.5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-semibold tracking-tight">{role.display_name}</CardTitle>
                                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-0.5">{role.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                                        onClick={() => handleOpenEdit(role)}
                                    >
                                        <Edit2 className="size-3.5" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
                                        onClick={() => handleDelete(role.id, role.display_name)}
                                    >
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Thời gian phân bổ hàng ngày:</span>
                                    <span className="font-medium text-foreground">{role.daily_time_budget_minutes} phút</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Thứ tự ưu tiên:</span>
                                    <span className="font-medium text-foreground">{role.priority_order}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Trạng thái:</span>
                                    <Badge variant={role.is_active ? 'default' : 'secondary'} className="h-5 px-1.5 text-[10px] font-medium">
                                        {role.is_active ? 'Đang hoạt động' : 'Tắt'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>{editingRole ? 'Chỉnh sửa lĩnh vực' : 'Thêm lĩnh vực mới'}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="displayName">Tên hiển thị</Label>
                            <Input
                                id="displayName"
                                placeholder="Ví dụ: NEU, Học tiếng Anh, Gia đình..."
                                value={formData.display_name}
                                onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                                required
                            />
                        </div>

                        {/* Daily budget */}
                        <div className="space-y-2">
                            <Label htmlFor="budget">Thời lượng phân bổ hàng ngày (phút)</Label>
                            <Input
                                id="budget"
                                type="number"
                                min="10"
                                max="1440"
                                value={formData.daily_time_budget_minutes}
                                onChange={e => setFormData({ ...formData, daily_time_budget_minutes: parseInt(e.target.value) || 120 })}
                                required
                            />
                        </div>

                        {/* Colors */}
                        <div className="space-y-2">
                            <Label>Màu sắc đại diện</Label>
                            <div className="grid grid-cols-5 gap-2 pt-1">
                                {COLOR_PRESETS.map(color => {
                                    const isSelected = formData.color === color.value
                                    return (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color: color.value })}
                                            className="flex items-center justify-center h-8 rounded-md border text-white transition-all cursor-pointer relative"
                                            style={{ backgroundColor: color.value, borderColor: isSelected ? '#000' : 'transparent' }}
                                            title={color.name}
                                        >
                                            {isSelected && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-md">
                                                    <Check className="size-4 stroke-[3]" />
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Icons */}
                        <div className="space-y-2">
                            <Label>Biểu tượng (Icon)</Label>
                            <div className="grid grid-cols-7 gap-2 pt-1">
                                {ICON_PRESETS.map(iconName => {
                                    const isSelected = formData.icon === iconName
                                    return (
                                        <button
                                            key={iconName}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon: iconName })}
                                            className={`flex items-center justify-center h-9 rounded-lg border cursor-pointer transition-all ${
                                                isSelected 
                                                    ? 'border-primary bg-primary/10 text-primary' 
                                                    : 'border-muted bg-background/50 hover:bg-muted/40 text-muted-foreground'
                                            }`}
                                            title={iconName}
                                        >
                                            <RoleIcon name={iconName} className="size-4" />
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)} disabled={actionLoading}>
                                Hủy bỏ
                            </Button>
                            <Button type="submit" disabled={actionLoading}>
                                {actionLoading ? (
                                    <Loader2 className="size-4 animate-spin mr-2" />
                                ) : editingRole ? 'Lưu thay đổi' : 'Thêm lĩnh vực'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
