'use client'

import Link from 'next/link'
import { useLocaleStore } from '@/lib/stores/locale-store'
import type { Locale } from '@/lib/i18n/translations'
import {
    PageHeader, Card, CardContent, CardHeader, CardTitle, Button, Label,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@repo/ui'
import { Settings, Users, Shield, LayoutGrid } from 'lucide-react'

export default function SettingsPage() {
    const { t, locale, setLocale } = useLocaleStore()

    const settingsNav = [
        { href: '/settings', label: t('settings.general'), desc: t('settings.generalDesc'), icon: Settings, active: true },
        { href: '/settings/team', label: t('settings.team'), desc: t('settings.teamDesc'), icon: Users },
        { href: '/settings/wip', label: t('settings.wip'), desc: t('settings.wipDesc'), icon: Shield },
        { href: '/settings/life-roles', label: 'Lĩnh vực / Mảng', desc: 'Quản lý các mảng cuộc sống, công việc, mục tiêu (FPT, Tulie, Cá nhân...)', icon: LayoutGrid },
    ]

    return (
        <div className="space-y-6">
            <PageHeader title={t('settings.title')} description={t('settings.subtitle')} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settingsNav.map(item => (
                    <Link key={item.href} href={item.href} className="block group">
                        <Card className={`hover:border-primary/50 transition-colors ${item.active ? 'border-primary/50' : ''}`}>
                            <CardContent className="flex items-start gap-4 py-5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                                    <item.icon className="size-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="font-semibold mb-1 group-hover:text-primary transition-colors">{item.label}</div>
                                    <div className="text-sm text-muted-foreground">{item.desc}</div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">{t('settings.general')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 max-w-xl">
                    <div className="space-y-2">
                        <Label>{t('settings.theme')}</Label>
                        <Select defaultValue="light">
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">{t('settings.themeLight')}</SelectItem>
                                <SelectItem value="dark">{t('settings.themeDark')}</SelectItem>
                                <SelectItem value="auto">{t('settings.themeAuto')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>{t('settings.language')}</Label>
                        <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="vi">Tiếng Việt</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>{t('settings.timezone')}</Label>
                        <Select defaultValue="Asia/Ho_Chi_Minh">
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button>{t('settings.save')}</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Bảo mật</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 max-w-xl">
                    <form className="space-y-4" onSubmit={async (e) => {
                        e.preventDefault()
                        const form = e.target as HTMLFormElement
                        const password = (form.elements.namedItem('password') as HTMLInputElement).value
                        const confirm = (form.elements.namedItem('confirm') as HTMLInputElement).value
                        
                        if (password !== confirm) {
                            alert('Mật khẩu xác nhận không khớp')
                            return
                        }

                        // We can use supabase client here
                        const { createClient } = await import('@/lib/supabase')
                        const supabase = createClient()
                        const { error } = await supabase.auth.updateUser({ password })
                        
                        if (error) {
                            alert(error.message)
                        } else {
                            alert('Cập nhật mật khẩu thành công!')
                            form.reset()
                        }
                    }}>
                        <div className="space-y-2">
                            <Label>Mật khẩu mới</Label>
                            <input 
                                name="password"
                                type="password" 
                                required
                                className="w-full p-2 text-sm rounded-md border bg-background"
                                placeholder="Tối thiểu 6 ký tự"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Xác nhận mật khẩu</Label>
                            <input 
                                name="confirm"
                                type="password" 
                                required
                                className="w-full p-2 text-sm rounded-md border bg-background"
                            />
                        </div>
                        <Button type="submit">Cập nhật mật khẩu</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
