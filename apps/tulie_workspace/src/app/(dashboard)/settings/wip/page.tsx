'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { WIP_DEFAULTS, HOFSTADTER_DEFAULTS } from '@/lib/constants/wip-defaults'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { createClient } from '@/lib/supabase'
import {
    PageHeader,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Button,
    Label,
    Input,
    Checkbox,
    toast
} from '@repo/ui'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

export default function WipSettingsPage() {
    const { t } = useLocaleStore()
    const { user, loading, refetch } = useCurrentUser()
    const [personalLimit, setPersonalLimit] = useState<number>(WIP_DEFAULTS.PERSONAL)
    const [hofstadterMultiplier, setHofstadterMultiplier] = useState<number>(HOFSTADTER_DEFAULTS.DEFAULT_MULTIPLIER)
    const [allowOverride, setAllowOverride] = useState<boolean>(true)
    const [saving, setSaving] = useState<boolean>(false)

    // Sync input states with user data
    useEffect(() => {
        if (user) {
            setPersonalLimit(user.personal_wip_limit ?? WIP_DEFAULTS.PERSONAL)
            setHofstadterMultiplier(user.hofstadter_multiplier ?? HOFSTADTER_DEFAULTS.DEFAULT_MULTIPLIER)
        }
    }, [user])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        // Validation
        if (personalLimit < WIP_DEFAULTS.PERSONAL_MIN || personalLimit > WIP_DEFAULTS.PERSONAL_MAX) {
            toast.error(`${t('wip.maxDoing')} phải từ ${WIP_DEFAULTS.PERSONAL_MIN} đến ${WIP_DEFAULTS.PERSONAL_MAX}`)
            return
        }

        if (hofstadterMultiplier < HOFSTADTER_DEFAULTS.MIN_MULTIPLIER || hofstadterMultiplier > HOFSTADTER_DEFAULTS.MAX_MULTIPLIER) {
            toast.error(`${t('wip.defaultCoeff')} phải từ ${HOFSTADTER_DEFAULTS.MIN_MULTIPLIER} đến ${HOFSTADTER_DEFAULTS.MAX_MULTIPLIER}`)
            return
        }

        setSaving(true)
        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('user_profiles')
                .update({
                    personal_wip_limit: personalLimit,
                    hofstadter_multiplier: parseFloat(hofstadterMultiplier.toFixed(2)),
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)

            if (error) throw error

            await refetch()
            toast.success('Lưu cấu hình WIP thành công!')
        } catch (err: any) {
            toast.error(err.message || 'Lỗi lưu cài đặt')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <Link 
                href="/settings" 
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="size-3.5" />
                {t('settings.backToSettings')}
            </Link>

            <PageHeader 
                title={t('settings.wip')} 
                description="Thiết lập các giới hạn bảo vệ Flow State và tối ưu hóa dự đoán thời lượng hoàn thành công việc của bạn."
            />

            <form onSubmit={handleSave} className="space-y-6">
                {/* Personal WIP limit card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">{t('wip.personalLimit')}</CardTitle>
                        <CardDescription>
                            Giới hạn số lượng công việc có thể đặt ở trạng thái &quot;Đang làm&quot; (Doing) cùng một lúc.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="personal-limit">{t('wip.maxDoing')}</Label>
                            <Input
                                id="personal-limit"
                                type="number"
                                min={WIP_DEFAULTS.PERSONAL_MIN}
                                max={WIP_DEFAULTS.PERSONAL_MAX}
                                value={personalLimit}
                                onChange={(e) => setPersonalLimit(parseInt(e.target.value) || WIP_DEFAULTS.PERSONAL)}
                                className="w-32"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                {t('wip.allowed')}: {WIP_DEFAULTS.PERSONAL_MIN} - {WIP_DEFAULTS.PERSONAL_MAX}
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox 
                                id="can-override" 
                                checked={allowOverride} 
                                onCheckedChange={(checked) => setAllowOverride(!!checked)}
                            />
                            <Label 
                                htmlFor="can-override" 
                                className="text-sm font-medium leading-none cursor-pointer"
                            >
                                {t('wip.allowOverride')}
                            </Label>
                        </div>
                    </CardContent>
                </Card>

                {/* Hofstadter multiplier card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">{t('wip.hofstadter')}</CardTitle>
                        <CardDescription>
                            Hệ số dùng để tính toán thời lượng thực tế của công việc dựa trên luật Hofstadter.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="hofstadter-multiplier">{t('wip.defaultCoeff')}</Label>
                            <Input
                                id="hofstadter-multiplier"
                                type="number"
                                step="0.05"
                                min={HOFSTADTER_DEFAULTS.MIN_MULTIPLIER}
                                max={HOFSTADTER_DEFAULTS.MAX_MULTIPLIER}
                                value={hofstadterMultiplier}
                                onChange={(e) => setHofstadterMultiplier(parseFloat(e.target.value) || HOFSTADTER_DEFAULTS.DEFAULT_MULTIPLIER)}
                                className="w-32"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                {t('wip.formula')}. {t('wip.range')}: {HOFSTADTER_DEFAULTS.MIN_MULTIPLIER} - {HOFSTADTER_DEFAULTS.MAX_MULTIPLIER}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Save button */}
                <Button type="submit" disabled={saving} className="cursor-pointer">
                    {saving ? (
                        <>
                            <Loader2 className="size-4 mr-2 animate-spin" />
                            Đang lưu...
                        </>
                    ) : (
                        <>
                            <Save className="size-4 mr-2" />
                            {t('settings.save')}
                        </>
                    )}
                </Button>
            </form>
        </div>
    )
}
