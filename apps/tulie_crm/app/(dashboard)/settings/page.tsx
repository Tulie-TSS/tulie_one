"use client"
import * as React from 'react'
import { Checkbox } from '@repo/ui'
import { useState, useEffect } from 'react'
import { useConfirm } from '@repo/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui'
import { Badge } from '@repo/ui'
import { Button } from '@repo/ui'
import { Input } from '@repo/ui'
import { Textarea } from '@repo/ui'
import { Label } from '@repo/ui'
import { Separator } from '@repo/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui'
import { Switch } from '@repo/ui'
import { Building2, Bell, Palette, Shield, Database as DatabaseIcon, Tag, ListFilter, Plus, Trash2, Box, Send, Mail, CheckCircle2, Globe, Settings, BookOpen, FileText, CreditCard, Wallet, RefreshCw, Copy, GraduationCap, User } from 'lucide-react'
import { LoadingSpinner } from '@repo/ui'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import {
    getProductCategories,
    createProductCategory,
    deleteProductCategory,
    getProductUnits,
    updateProductUnits,
    getTelegramConfig,
    updateTelegramConfig,
    getBrandConfig,
    updateBrandConfig,
    getAppearanceConfig,
    updateAppearanceConfig,
    updateSystemSetting,
    getSystemSetting,
    getBrands,
    updateBrands,
    getBankAccounts,
    updateBankAccounts,
    getNoteTemplates,
    updateNoteTemplates
} from '@/lib/supabase/services/settings-service'
import { testTelegramConnection } from '@/lib/supabase/services/telegram-service'
import { testSmtpConnection, sendEmail } from '@/lib/supabase/services/email-service'
import {
    getDocumentBundles,
    deleteDocumentBundle,
    createDocumentBundle,
    getDocumentTemplates
} from '@/lib/supabase/services/document-template-service'
import { DocumentBundle, DocumentTemplate } from '@/types'
import { StatusBadge } from '@/components/shared/status-badge'

export default function SettingsPage() {
    const { confirm: confirmDialog } = useConfirm()
    const [companySettings, setCompanySettings] = useState({
        name: "Tulie Agency",
        tax_code: "",
        address: "",
        email: "info@tulie.vn",
        phone: "",
        website: "tulie.vn",
        logo_url: "/file/tulie-agency-logo.png",
        favicon_url: "/logo-icon.png",
    })

    const [categories, setCategories] = useState<{ id: string, name: string }[]>([])
    const [newCategory, setNewCategory] = useState('')
    const [isAddingCategory, setIsAddingCategory] = useState(false)

    const [units, setUnits] = useState<string[]>([])
    const [newUnit, setNewUnit] = useState('')
    const [isSavingUnits, setIsSavingUnits] = useState(false)

    // New states for Brands
    const [brands, setBrands] = useState<string[]>([])
    const [newBrand, setNewBrand] = useState('')
    const [isSavingBrands, setIsSavingBrands] = useState(false)

    const [telegramConfig, setTelegramConfig] = useState({
        bot_token: '',
        chat_id: '',
        is_enabled: false,
        sepay_api_key: '',
        sepay_secret_key: '',
        academy_webhook_key: ''
    })
    const [isSavingTelegram, setIsSavingTelegram] = useState(false)
    const [isTestingTelegram, setIsTestingTelegram] = useState(false)
    const [smtpConfig, setSmtpConfig] = useState({
        host: '',
        port: 587,
        secure: false,
        user: '',
        pass: '',
        from_name: 'Tulie CRM',
        from_email: ''
    })
    const [isSavingSmtp, setIsSavingSmtp] = useState(false)
    const [isTestingSmtp, setIsTestingSmtp] = useState(false)
    const { theme, setTheme } = useTheme()
    const [appearance, setAppearance] = useState({
        sidebarCollapsed: false
    })
    const [brandConfig, setBrandConfig] = useState({
        brand_name: 'Tulie Agency',
        email: 'info@tulie.vn',
        favicon_url: "/logo-icon.png",
    })
    const [isSavingBrand, setIsSavingBrand] = useState(false)

    // New states for Bank Accounts and Note Templates
    const [bankAccounts, setBankAccounts] = useState<any[]>([])
    const [isSavingBankAccounts, setIsSavingBankAccounts] = useState(false)
    const [noteTemplates, setNoteTemplates] = useState<any[]>([])
    const [isSavingNoteTemplates, setIsSavingNoteTemplates] = useState(false)

    const [loadedTabs, setLoadedTabs] = React.useState<Set<string>>(new Set(['company']))

    const loadTabData = React.useCallback((tab: string) => {
        if (loadedTabs.has(tab)) return
        setLoadedTabs(prev => new Set(prev).add(tab))
        switch (tab) {
            case 'categories': loadCategories(); break
            case 'units': loadUnits(); break
            case 'brands': loadBrands(); break
            case 'telegram': loadTelegram(); break
            case 'payment-gateway': loadTelegram(); break // shares telegramConfig for sepay fields
            case 'appearance': loadAppearance(); break
            case 'mail': loadSmtp(); break
            case 'bundles': loadBundles(); break
            case 'bank-accounts': loadBankAccounts(); break
            case 'note-templates': loadNoteTemplates(); break
            case 'statuses': break // static data
            case 'notifications': break
            case 'security': break
            case 'data': break
        }
    }, [loadedTabs])

    useEffect(() => {
        loadCompanySettings()
        loadBrand()
    }, [])

    const [bundles, setBundles] = useState<DocumentBundle[]>([])
    const [templates, setTemplates] = useState<DocumentTemplate[]>([])
    const [isSavingBundle, setIsSavingBundle] = useState(false)
    const [newBundle, setNewBundle] = useState({ name: '', description: '', templates: [] as string[] })

    async function loadBundles() {
        const [bData, tData] = await Promise.all([
            getDocumentBundles(),
            getDocumentTemplates()
        ])
        setBundles(bData)
        setTemplates(tData)
    }

    const handleCreateBundle = async () => {
        if (!newBundle.name || newBundle.templates.length === 0) {
            toast.error('Vui lòng nhập tên và chọn ít nhất 1 mẫu giấy tờ')
            return
        }
        setIsSavingBundle(true)
        try {
            await createDocumentBundle(newBundle)
            setNewBundle({ name: '', description: '', templates: [] })
            await loadBundles()
            toast.success('Đã tạo bộ chứng từ mới')
        } catch {
            toast.error('Lỗi khi tạo bộ chứng từ')
        } finally {
            setIsSavingBundle(false)
        }
    }

    const handleDeleteBundle = async (id: string) => {
        const confirmed = await confirmDialog({
            title: 'Xoá bộ chứng từ',
            description: 'Xoá bộ chứng từ này? Hành động không thể hoàn tác.',
            variant: 'destructive',
            confirmText: 'Xoá',
        })
        if (!confirmed) return
        try {
            await deleteDocumentBundle(id)
            await loadBundles()
            toast.success('Đã xoá')
        } catch {
            toast.error('Lỗi khi xoá')
        }
    }

    async function loadBrand() {
        const config = await getBrandConfig()
        if (config) setBrandConfig(config)
    }

    async function loadSmtp() {
        const config = await getSystemSetting('smtp_config')
        if (config) setSmtpConfig(config)
    }

    async function loadAppearance() {
        const config = await getAppearanceConfig()
        setAppearance({ sidebarCollapsed: !!config.sidebarCollapsed })
    }

    async function loadCompanySettings() {
        const config = await getBrandConfig()
        setCompanySettings({
            name: config.brand_name || "Tulie Agency",
            tax_code: config.tax_code || "",
            address: config.address || "",
            email: config.email || "info@tulie.vn",
            phone: config.phone || "",
            website: config.website || "tulie.vn",
            logo_url: config.logo_url || "/file/tulie-agency-logo.png",
            favicon_url: config.favicon_url || "/logo-icon.png",
        })
    }

    async function loadTelegram() {
        const config = await getTelegramConfig()
        setTelegramConfig(config)
    }

    async function loadCategories() {
        try {
            const data = await getProductCategories()
            setCategories(data)
        } catch (error) {
            console.error('Failed to load categories:', error)
        }
    }

    async function loadUnits() {
        try {
            const data = await getProductUnits()
            setUnits(data)
        } catch (error) {
            console.error('Failed to load units:', error)
        }
    }

    async function loadBrands() { // Added
        try {
            const data = await getBrands()
            setBrands(data)
        } catch (error) {
            console.error('Failed to load brands:', error)
        }
    }

    const handleAddCategory = async () => {
        if (!newCategory.trim()) return
        setIsAddingCategory(true)
        try {
            await createProductCategory(newCategory.trim())
            setNewCategory('')
            await loadCategories()
            toast.success('Đã thêm danh mục mới')
        } catch (error) {
            toast.error('Lỗi khi thêm danh mục')
        } finally {
            setIsAddingCategory(false)
        }
    }

    const handleDeleteCategory = async (id: string) => {
        const confirmed = await confirmDialog({
            title: 'Xóa danh mục',
            description: 'Bạn có chắc chắn muốn xóa danh mục này?',
            variant: 'destructive',
            confirmText: 'Xóa',
        })
        if (!confirmed) return
        try {
            await deleteProductCategory(id)
            await loadCategories()
            toast.success('Đã xóa danh mục')
        } catch (error) {
            toast.error('Lỗi khi xóa danh mục')
        }
    }

    const [isSavingCompany, setIsSavingCompany] = useState(false)
    const handleSaveCompanySettings = async () => {
        setIsSavingCompany(true)
        try {
            await updateBrandConfig({
                brand_name: companySettings.name,
                tax_code: companySettings.tax_code,
                address: companySettings.address,
                email: companySettings.email,
                phone: companySettings.phone,
                website: companySettings.website,
                logo_url: companySettings.logo_url,
                favicon_url: companySettings.favicon_url,
            })
            toast.success("Đã lưu thông tin thương hiệu thành công!")
        } catch (error: any) {
            console.error('Brand config save error:', error)
            toast.error(`Lỗi khi lưu: ${error?.message || 'Không xác định'}`)
        } finally {
            setIsSavingCompany(false)
        }
    }

    const handleAddUnit = async () => {
        if (!newUnit.trim()) return
        if (units.includes(newUnit.trim())) {
            toast.error('Đơn vị tính này đã tồn tại')
            return
        }

        const updatedUnits = [...units, newUnit.trim()]
        setIsSavingUnits(true)
        try {
            await updateProductUnits(updatedUnits)
            setUnits(updatedUnits)
            setNewUnit('')
            toast.success('Đã thêm đơn vị tính mới')
        } catch (error) {
            toast.error('Lỗi khi lưu đơn vị tính')
        } finally {
            setIsSavingUnits(false)
        }
    }

    const handleDeleteUnit = async (unitToDelete: string) => {
        const confirmed = await confirmDialog({
            title: 'Xóa đơn vị tính',
            description: `Bạn có chắc chắn muốn xóa đơn vị tính "${unitToDelete}"?`,
            variant: 'destructive',
            confirmText: 'Xóa',
        })
        if (!confirmed) return

        const updatedUnits = units.filter(u => u !== unitToDelete)
        try {
            await updateProductUnits(updatedUnits)
            setUnits(updatedUnits)
            toast.success('Đã xóa đơn vị tính')
        } catch (error) {
            toast.error('Lỗi khi xóa đơn vị tính')
        }
    }

    const handleUpdateAppearance = async (field: string, value: any) => {
        const newAppearance = { ...appearance, [field]: value }
        setAppearance(newAppearance)
        try {
            await updateAppearanceConfig({
                darkMode: theme === 'dark',
                ...newAppearance,
                [field]: value
            })
        } catch (error) {
            console.error('Error saving appearance config:', error)
        }
    }
    const handleSaveTelegram = async () => {
        setIsSavingTelegram(true)
        try {
            await updateTelegramConfig(telegramConfig)
            toast.success('Đã lưu cấu hình Telegram')
        } catch (error) {
            toast.error('Lỗi khi lưu cấu hình Telegram')
        } finally {
            setIsSavingTelegram(false)
        }
    }

    const handleTestTelegram = async () => {
        setIsTestingTelegram(true)
        try {
            const success = await testTelegramConnection()
            if (success) {
                toast.success('Đã gửi tin nhắn thử nghiệm! Vui lòng kiểm tra Telegram.')
            } else {
                toast.error('Gửi tin nhắn thử nghiệm thất bại. Vui lòng kiểm tra lại Token và Chat ID.')
            }
        } catch (error) {
            toast.error('Lỗi khi kết nối tới Telegram')
        } finally {
            setIsTestingTelegram(false)
        }
    }

    const handleSaveSmtp = async () => {
        setIsSavingSmtp(true)
        try {
            await updateSystemSetting('smtp_config', smtpConfig)
            toast.success('Đã lưu cấu hình email SMTP')
        } catch (error) {
            toast.error('Lỗi khi lưu cấu hình SMTP')
        } finally {
            setIsSavingSmtp(false)
        }
    }

    const handleAddBrand = async () => { // Added
        if (!newBrand.trim()) return
        if (brands.includes(newBrand.trim())) {
            toast.error('Thương hiệu này đã tồn tại')
            return
        }

        const updatedBrands = [...brands, newBrand.trim()]
        setIsSavingBrands(true)
        try {
            await updateBrands(updatedBrands)
            setBrands(updatedBrands)
            setNewBrand('')
            toast.success('Đã thêm thương hiệu mới')
        } catch (error) {
            toast.error('Lỗi khi lưu thương hiệu')
        } finally {
            setIsSavingBrands(false)
        }
    }

    const handleDeleteBrand = async (brandToDelete: string) => { // Added
        const confirmed = await confirmDialog({
            title: 'Xóa thương hiệu',
            description: `Bạn có chắc chắn muốn xóa thương hiệu "${brandToDelete}"?`,
            variant: 'destructive',
            confirmText: 'Xóa',
        })
        if (!confirmed) return

        const updatedBrands = brands.filter(b => b !== brandToDelete)
        try {
            await updateBrands(updatedBrands)
            setBrands(updatedBrands)
            toast.success('Đã xóa thương hiệu')
        } catch (error) {
            toast.error('Lỗi khi xóa thương hiệu')
        }
    }

    const handleTestSmtp = async () => {
        if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
            toast.error('Vui lòng nhập đầy đủ thông tin SMTP')
            return
        }
        setIsTestingSmtp(true)
        try {
            const result = await testSmtpConnection(smtpConfig)
            if (result.success) {
                toast.success('Kết nối SMTP thành công! Email thử nghiệm đã được gửi.')
            } else {
                toast.error(`Lỗi kết nối: ${result.error}`)
            }
        } catch (error: any) {
            toast.error(`Lỗi hệ thống: ${error.message}`)
        } finally {
            setIsTestingSmtp(false)
        }
    }

    async function loadBankAccounts() {
        const data = await getBankAccounts()
        setBankAccounts(data)
    }

    async function loadNoteTemplates() {
        const data = await getNoteTemplates()
        setNoteTemplates(data)
    }

    const handleSaveBankAccounts = async (updatedAccounts: any[]) => {
        setIsSavingBankAccounts(true)
        try {
            await updateBankAccounts(updatedAccounts)
            setBankAccounts(updatedAccounts)
            toast.success('Đã lưu danh sách tài khoản ngân hàng')
        } catch {
            toast.error('Lỗi khi lưu tài khoản ngân hàng')
        } finally {
            setIsSavingBankAccounts(false)
        }
    }

    const handleSaveNoteTemplates = async (updatedTemplates: any[]) => {
        setIsSavingNoteTemplates(true)
        try {
            await updateNoteTemplates(updatedTemplates)
            setNoteTemplates(updatedTemplates)
            toast.success('Đã lưu danh sách mẫu ghi chú')
        } catch {
            toast.error('Lỗi khi lưu mẫu ghi chú')
        } finally {
            setIsSavingNoteTemplates(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-zinc-950 flex items-center justify-center shadow-lg transition-transform hover:scale-105 duration-300">
                    <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Cài đặt</h1>
                    <p className="text-[14px] text-muted-foreground font-medium">
                        Quản lý cấu hình hệ thống, thương hiệu và tích hợp.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="company" onValueChange={loadTabData} className="flex flex-col lg:flex-row gap-8">
                <aside className="lg:w-64 space-y-4">
                    <TabsList className="flex flex-col h-auto bg-muted/30 p-1.5 space-y-1 items-stretch rounded-xl border border-border/50">
                        <TabsTrigger
                            value="company"
                            className="justify-start gap-3 px-3 py-2 h-10 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm rounded-lg hover:bg-white/50 transition-all font-semibold border-none"
                        >
                            <Building2 className="h-4 w-4" />
                            Thông tin công ty
                        </TabsTrigger>
                        <TabsTrigger
                            value="categories"
                            className="justify-start gap-3 px-3 py-2 h-10 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm rounded-lg hover:bg-white/50 transition-all font-semibold border-none"
                        >
                            <Tag className="h-4 w-4" />
                            Danh mục sản phẩm
                        </TabsTrigger>
                        <TabsTrigger
                            value="units"
                            className="justify-start gap-3 px-3 py-2 h-10 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm rounded-lg hover:bg-white/50 transition-all font-semibold border-none"
                        >
                            <Box className="h-4 w-4" />
                            Đơn vị tính
                        </TabsTrigger>
                        <TabsTrigger
                            value="brands"
                            className="justify-start gap-3 px-3 py-2 h-10 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm rounded-lg hover:bg-white/50 transition-all font-semibold border-none"
                        >
                            <Globe className="h-4 w-4" />
                            Thương hiệu
                        </TabsTrigger>
                        <TabsTrigger
                            value="statuses"
                            className="justify-start gap-3 px-3 py-2 h-10 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm rounded-lg hover:bg-white/50 transition-all font-semibold border-none"
                        >
                            <ListFilter className="h-4 w-4" />
                            Hệ thống Trạng thái
                        </TabsTrigger>
                        <TabsTrigger
                            value="bundles"
                            className="justify-start gap-3 px-3 py-2 h-10 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm rounded-lg hover:bg-white/50 transition-all font-semibold border-none"
                        >
                            <BookOpen className="h-4 w-4" />
                            Bộ chứng từ (Bundle)
                        </TabsTrigger>
                        <TabsTrigger
                            value="bank-accounts"
                            className="justify-start gap-3 px-3 py-2 h-10 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm rounded-lg hover:bg-white/50 transition-all font-semibold border-none"
                        >
                            <CreditCard className="h-4 w-4" />
                            Tài khoản ngân hàng
                        </TabsTrigger>
                        <TabsTrigger
                            value="note-templates"
                            className="justify-start gap-3 px-3 py-2 h-10 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm rounded-lg hover:bg-white/50 transition-all font-semibold border-none"
                        >
                            <FileText className="h-4 w-4" />
                            Mẫu ghi chú / Điều khoản
                        </TabsTrigger>

                        <div className="py-2 px-3">
                            <Separator className="bg-border/50" />
                        </div>

                        <TabsTrigger
                            value="telegram"
                            className="justify-start gap-3 px-3 py-2 h-10 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm rounded-lg hover:bg-white/50 transition-all font-semibold border-none"
                        >
                            <Send className="h-4 w-4" />
                            Cài đặt Telegram
                        </TabsTrigger>
                        <TabsTrigger
                            value="payment-gateway"
                            className="justify-start gap-3 px-3 py-2 h-10 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm rounded-lg hover:bg-white/50 transition-all font-semibold border-none"
                        >
                            <Wallet className="h-4 w-4" />
                            Cổng thanh toán
                        </TabsTrigger>
                        <TabsTrigger
                            value="academy"
                            className="justify-start gap-3 px-3 py-2 h-10 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm rounded-lg hover:bg-white/50 transition-all font-semibold border-none"
                        >
                            <GraduationCap className="h-4 w-4" />
                            Tulie Academy
                        </TabsTrigger>
                        <TabsTrigger
                            value="mail"
                            className="justify-start gap-3 px-3 py-2 h-10 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm rounded-lg hover:bg-white/50 transition-all font-semibold border-none"
                        >
                            <Mail className="h-4 w-4" />
                            Email SMTP
                        </TabsTrigger>
                        <TabsTrigger
                            value="notifications"
                            className="justify-start gap-3 px-3 py-2 h-10 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm rounded-lg hover:bg-white/50 transition-all font-semibold border-none"
                        >
                            <Bell className="h-4 w-4" />
                            Thông báo
                        </TabsTrigger>

                        <div className="py-2 px-3">
                            <Separator className="bg-border/50" />
                        </div>

                        <TabsTrigger
                            value="appearance"
                            className="justify-start gap-3 px-3 py-2 h-10 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm rounded-lg hover:bg-white/50 transition-all font-semibold border-none"
                        >
                            <Palette className="h-4 w-4" />
                            Giao diện
                        </TabsTrigger>
                        <TabsTrigger
                            value="security"
                            className="justify-start gap-3 px-3 py-2 h-10 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm rounded-lg hover:bg-white/50 transition-all font-semibold border-none"
                        >
                            <Shield className="h-4 w-4" />
                            Bảo mật
                        </TabsTrigger>
                        <TabsTrigger
                            value="data"
                            className="justify-start gap-3 px-3 py-2 h-10 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm rounded-lg hover:bg-white/50 transition-all font-semibold border-none"
                        >
                            <DatabaseIcon className="h-4 w-4" />
                            Dữ liệu
                        </TabsTrigger>
                    </TabsList>
                </aside>

                <div className="flex-1 max-w-4xl">

                    {/* Company Settings */}
                    <TabsContent value="company">
                        <Card className="rounded-xl shadow-sm border-border/50 overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border/50">
                                <CardTitle className="text-xl font-bold tracking-tight">Thông tin công ty</CardTitle>
                                <CardDescription className="text-sm font-medium">
                                    Cập nhật thông tin hiển thị trên báo giá và hóa đơn
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="company_name">Tên công ty</Label>
                                        <Input
                                            id="company_name"
                                            value={companySettings.name}
                                            onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tax_code">Mã số thuế</Label>
                                        <Input
                                            id="tax_code"
                                            value={companySettings.tax_code}
                                            onChange={(e) => setCompanySettings({ ...companySettings, tax_code: e.target.value })}
                                            placeholder="0123456789"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Địa chỉ</Label>
                                    <Input
                                        id="address"
                                        value={companySettings.address}
                                        onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                                        placeholder="Địa chỉ công ty"
                                    />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={companySettings.email}
                                            onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                                            placeholder="contact@tulie.app"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Số điện thoại</Label>
                                        <Input
                                            id="phone"
                                            value={companySettings.phone}
                                            onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                                            placeholder="0901234567"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="website">Website</Label>
                                        <Input
                                            id="website"
                                            value={companySettings.website}
                                            onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                                            placeholder="tulie.vn"
                                        />
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium">Cấu hình nhận diện thương hiệu</h4>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="logo_url">Đường dẫn Logo (Hệ thống & Portal)</Label>
                                            <Input
                                                id="logo_url"
                                                value={companySettings.logo_url}
                                                onChange={(e) => setCompanySettings({ ...companySettings, logo_url: e.target.value })}
                                                placeholder="/file/tulie-agency-logo.png"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="favicon_url">Đường dẫn Favicon (Biểu tượng trình duyệt)</Label>
                                            <Input
                                                id="favicon_url"
                                                value={companySettings.favicon_url}
                                                onChange={(e) => setCompanySettings({ ...companySettings, favicon_url: e.target.value })}
                                                placeholder="/logo-icon.png"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 p-4 bg-muted/50 rounded-xl border border-border/50">
                                        <div className="space-y-1 flex-1">
                                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Xem trước Logo:</p>
                                            <div className="h-16 flex items-center bg-white p-3 rounded-xl border border-zinc-200">
                                                <img src={companySettings.logo_url} alt="Logo Preview" className="h-full object-contain" />
                                            </div>
                                        </div>
                                        <div className="space-y-1 w-32">
                                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Favicon:</p>
                                            <div className="h-16 w-16 flex items-center justify-center bg-white p-3 rounded-xl border border-zinc-200">
                                                <img src={companySettings.favicon_url} alt="Favicon Preview" className="h-10 w-10 object-contain" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Separator className="bg-border/50" />
                                <div className="flex justify-end pt-2">
                                    <Button onClick={handleSaveCompanySettings} disabled={isSavingCompany} className="rounded-xl px-8 font-bold shadow-md shadow-zinc-200">
                                        {isSavingCompany && <LoadingSpinner size="sm" className="mr-2" />}
                                        Lưu thay đổi
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Categories Settings */}
                    <TabsContent value="categories">
                        <Card className="rounded-xl shadow-sm border-border/50 overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border/50">
                                <CardTitle className="text-xl font-bold tracking-tight">Danh mục sản phẩm</CardTitle>
                                <CardDescription className="text-sm font-medium">
                                    Quản lý các nhóm sản phẩm và dịch vụ của bạn
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="flex gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="new_category" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tên danh mục mới</Label>
                                        <Input
                                            id="new_category"
                                            placeholder="Ví dụ: Digital Marketing"
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                            className="h-11 rounded-xl"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button onClick={handleAddCategory} disabled={isAddingCategory} className="h-11 rounded-xl font-bold px-6">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Thêm
                                        </Button>
                                    </div>
                                </div>

                                <div className="border border-border/50 rounded-xl divide-y divide-border/50 overflow-hidden shadow-sm">
                                    {categories.map((category) => (
                                        <div key={category.id} className="flex items-center justify-between p-4 bg-white hover:bg-muted/10 transition-colors">
                                            <span className="font-semibold text-sm text-zinc-900">{category.name}</span>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)} className="h-8 w-8 p-0 rounded-full text-zinc-400 hover:text-destructive hover:bg-destructive/10">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {categories.length === 0 && (
                                        <div className="p-12 text-center text-muted-foreground italic bg-zinc-50/50">
                                            <div className="flex flex-col items-center gap-2">
                                                <Tag className="h-8 w-8 opacity-20" />
                                                <p className="text-sm">Chưa có danh mục nào được tạo</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Units Settings */}
                    <TabsContent value="units">
                        <Card className="rounded-xl shadow-sm border-border/50 overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border/50">
                                <CardTitle className="text-xl font-bold tracking-tight">Đơn vị tính (ĐVT)</CardTitle>
                                <CardDescription className="text-sm font-medium">
                                    Quản lý các đơn vị tính cho sản phẩm và dịch vụ
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="flex gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="new_unit" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tên đơn vị mới</Label>
                                        <Input
                                            id="new_unit"
                                            placeholder="Ví dụ: Gói, Giờ, Mét..."
                                            value={newUnit}
                                            onChange={(e) => setNewUnit(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddUnit()}
                                            className="h-11 rounded-xl"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button onClick={handleAddUnit} disabled={isSavingUnits} className="h-11 rounded-xl font-bold px-6">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Thêm
                                        </Button>
                                    </div>
                                </div>

                                <div className="border border-border/50 rounded-xl divide-y divide-border/50 overflow-hidden shadow-sm">
                                    {units.map((unit) => (
                                        <div key={unit} className="flex items-center justify-between p-4 bg-white hover:bg-muted/10 transition-colors">
                                            <span className="font-semibold text-sm text-zinc-900">{unit}</span>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteUnit(unit)} className="h-8 w-8 p-0 rounded-full text-zinc-400 hover:text-destructive hover:bg-destructive/10">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {units.length === 0 && (
                                        <div className="p-12 text-center text-muted-foreground italic bg-zinc-50/50">
                                            <div className="flex flex-col items-center gap-2">
                                                <Box className="h-8 w-8 opacity-20" />
                                                <p className="text-sm">Chưa có đơn vị tính nào được cấu hình</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Brands Settings (New) */}
                    <TabsContent value="brands">
                        <Card className="rounded-xl shadow-sm border-border/50 overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border/50">
                                <CardTitle className="text-xl font-bold tracking-tight">Danh mục Thương hiệu</CardTitle>
                                <CardDescription className="text-sm font-medium">
                                    Quản lý các thương hiệu con của hệ thống (Tulie Agency, Tulie Studio...)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="flex gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="new_brand" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tên thương hiệu mới</Label>
                                        <Input
                                            id="new_brand"
                                            placeholder="Ví dụ: Tulie Lab..."
                                            value={newBrand}
                                            onChange={(e) => setNewBrand(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddBrand()}
                                            className="h-11 rounded-xl"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button onClick={handleAddBrand} disabled={isSavingBrands} className="h-11 rounded-xl font-bold px-6">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Thêm
                                        </Button>
                                    </div>
                                </div>

                                <div className="border border-border/50 rounded-xl divide-y divide-border/50 overflow-hidden shadow-sm">
                                    {brands.map((brand) => (
                                        <div key={brand} className="flex items-center justify-between p-4 bg-white hover:bg-muted/10 transition-colors">
                                            <span className="font-semibold text-sm text-zinc-900">{brand}</span>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteBrand(brand)} className="h-8 w-8 p-0 rounded-full text-zinc-400 hover:text-destructive hover:bg-destructive/10">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {brands.length === 0 && (
                                        <div className="p-12 text-center text-muted-foreground italic bg-zinc-50/50">
                                            <div className="flex flex-col items-center gap-2">
                                                <Globe className="h-8 w-8 opacity-20" />
                                                <p className="text-sm">Chưa có thương hiệu nào được cấu hình</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Statuses Settings */}
                    <TabsContent value="statuses">
                        <div className="grid gap-6">
                            <Card className="rounded-xl shadow-sm border-border/50 overflow-hidden">
                                <CardHeader className="bg-muted/30 border-b border-border/50">
                                    <CardTitle className="text-xl font-bold tracking-tight">Trạng thái Khách hàng</CardTitle>
                                    <CardDescription className="text-sm font-medium">Các giai đoạn trong phễu bán hàng Agency</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        {['lead', 'prospect', 'customer', 'vip', 'churned'].map((status) => (
                                            <div key={status} className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-muted/20 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <StatusBadge entityType="customer" status={status} />
                                                    <span className="text-xs text-muted-foreground font-medium italic">Quy trình bán hàng tiêu chuẩn</span>
                                                </div>
                                                <Button variant="ghost" size="sm" disabled className="text-xs font-bold text-zinc-400">Hệ thống</Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-xl shadow-sm border-border/50 overflow-hidden">
                                <CardHeader className="bg-muted/30 border-b border-border/50">
                                    <CardTitle className="text-xl font-bold tracking-tight">Trạng thái Báo giá</CardTitle>
                                    <CardDescription className="text-sm font-medium">Quy trình phê duyệt báo giá từ Agency</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        {['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'converted'].map((status) => (
                                            <div key={status} className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-muted/20 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <StatusBadge entityType="quotation" status={status} />
                                                    <span className="text-xs text-muted-foreground font-medium italic">Quy trình duyệt báo giá</span>
                                                </div>
                                                <Button variant="ghost" size="sm" disabled className="text-xs font-bold text-zinc-400">Hệ thống</Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Telegram Settings */}
                    <TabsContent value="telegram">
                        <Card className="rounded-xl shadow-sm border-border/50 overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-zinc-950 flex items-center justify-center shadow-md">
                                        <Send className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold tracking-tight">Cấu hình Telegram Bot</CardTitle>
                                        <CardDescription className="text-sm font-medium">
                                            Tích hợp thông báo đơn hàng và thanh toán trực tiếp qua Telegram.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-8 pt-6">
                                <div className="flex items-center justify-between p-5 bg-muted/30 rounded-2xl border border-border/50 shadow-sm">
                                    <div className="space-y-0.5">
                                        <Label className="text-base font-bold text-zinc-900">Kích hoạt thông báo</Label>
                                        <p className="text-sm text-muted-foreground font-medium">Bật/tắt toàn bộ thông báo gửi đến nhóm hoặc cá nhân.</p>
                                    </div>
                                    <Switch
                                        checked={telegramConfig.is_enabled}
                                        onCheckedChange={(val) => setTelegramConfig({ ...telegramConfig, is_enabled: val })}
                                    />
                                </div>

                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="bot_token">Bot Token (Từ @BotFather)</Label>
                                        <Input
                                            id="bot_token"
                                            placeholder="1234567890:ABCDE..."
                                            type="password"
                                            value={telegramConfig.bot_token}
                                            onChange={(e) => setTelegramConfig({ ...telegramConfig, bot_token: e.target.value })}
                                            className="h-11 border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 rounded-xl font-mono text-xs"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="chat_id">Chat ID (Group hoặc Cá nhân)</Label>
                                        <Input
                                            id="chat_id"
                                            placeholder="-100123456789"
                                            value={telegramConfig.chat_id}
                                            onChange={(e) => setTelegramConfig({ ...telegramConfig, chat_id: e.target.value })}
                                            className="h-11 border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 rounded-xl font-mono text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="p-5 bg-card rounded-xl border shadow-sm">
                                    <h4 className="text-sm font-medium mb-4">Cấu hình loại thông báo:</h4>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {[
                                            { key: 'notify_new_retail_order', templateKey: 'template_new_retail_order', label: 'Đơn hàng B2C mới', placeholder: 'Dùng biến: {order_number}, {customer_name}, {customer_phone}, {total_amount}, {payment_status}, {order_status}', defaultTemplate: `<b>🛒 ĐƠN HÀNG MỚI</b>\n━━━━━━━━━━━━━━━━━━\n📋 Mã đơn: <b>{order_number}</b>\n👤 Khách: <b>{customer_name}</b>\n📱 SĐT: {customer_phone}\n💰 Tổng tiền: <b>{total_amount}</b>\n💳 Thanh toán: {payment_status}\n📌 Trạng thái: {order_status}\n━━━━━━━━━━━━━━━━━━\n<i>Vui lòng xử lý đơn hàng sớm nhất!</i>` },
                                            { key: 'notify_retail_payment', templateKey: 'template_retail_payment', label: 'Thanh toán B2C', placeholder: 'Dùng biến: {amount}, {order_number}, {customer_name}', defaultTemplate: `<b>💰 THANH TOÁN B2C</b>\n━━━━━━━━━━━━━━━━━━\n📋 Đơn hàng: <b>{order_number}</b>\n👤 Khách: <b>{customer_name}</b>\n💵 Số tiền: <b>+{amount}</b>\n━━━━━━━━━━━━━━━━━━\n<i>✅ Đã ghi nhận thanh toán thành công.</i>` },
                                            { key: 'notify_b2b_payment', templateKey: 'template_b2b_payment', label: 'Thanh toán B2B', placeholder: 'Dùng biến: {amount}, {contract_number}, {company_name}', defaultTemplate: `<b>💼 THANH TOÁN B2B</b>\n━━━━━━━━━━━━━━━━━━\n📄 Hợp đồng: <b>{contract_number}</b>\n🏢 Công ty: <b>{company_name}</b>\n💵 Số tiền: <b>+{amount}</b>\n━━━━━━━━━━━━━━━━━━\n<i>✅ Đã ghi nhận thanh toán doanh nghiệp.</i>` },
                                            { key: 'notify_new_quotation', templateKey: 'template_new_quotation', label: 'Báo giá mới đã tạo', placeholder: 'Dùng biến: {quotation_number}, {company_name}, {creator_name}, {total_amount}', defaultTemplate: `<b>📝 BÁO GIÁ MỚI</b>\n━━━━━━━━━━━━━━━━━━\n📋 Mã BG: <b>{quotation_number}</b>\n🏢 Khách: <b>{company_name}</b>\n👤 Người tạo: {creator_name}\n💰 Giá trị: <b>{total_amount}</b>\n━━━━━━━━━━━━━━━━━━\n<i>Báo giá đã sẵn sàng gửi khách hàng.</i>` },
                                            { key: 'notify_quotation_viewed', templateKey: 'template_quotation_viewed', label: 'Khách xem báo giá', placeholder: 'Dùng biến: {quotation_number}, {company_name}, {deal_title}, {view_count}', defaultTemplate: `<b>👁 KHÁCH XEM BÁO GIÁ</b>\n━━━━━━━━━━━━━━━━━━\n📋 Mã BG: <b>{quotation_number}</b>\n🏢 Khách: <b>{company_name}</b>\n📌 Deal: {deal_title}\n🔄 Lượt xem: <b>{view_count}</b>\n━━━━━━━━━━━━━━━━━━\n<i>Khách hàng đang quan tâm — hãy follow up!</i>` },
                                            { key: 'notify_quotation_accepted', templateKey: 'template_quotation_accepted', label: 'Khách duyệt báo giá', placeholder: 'Dùng biến: {quotation_number}, {company_name}, {total_amount}', defaultTemplate: `<b>✅ BÁO GIÁ ĐƯỢC DUYỆT</b>\n━━━━━━━━━━━━━━━━━━\n📋 Mã BG: <b>{quotation_number}</b>\n🏢 Khách: <b>{company_name}</b>\n💰 Giá trị: <b>{total_amount}</b>\n━━━━━━━━━━━━━━━━━━\n<i>🎉 Khách đã chấp nhận báo giá! Tiến hành ký hợp đồng.</i>` },
                                            { key: 'notify_new_invoice', templateKey: 'template_new_invoice', label: 'Hóa đơn mới đã xuất', placeholder: 'Dùng biến: {invoice_number}, {company_name}, {total_amount}', defaultTemplate: `<b>🧾 HÓA ĐƠN MỚI</b>\n━━━━━━━━━━━━━━━━━━\n📋 Mã HĐ: <b>{invoice_number}</b>\n🏢 Khách: <b>{company_name}</b>\n💰 Giá trị: <b>{total_amount}</b>\n━━━━━━━━━━━━━━━━━━\n<i>Hóa đơn đã được xuất và gửi cho khách hàng.</i>` },
                                            { key: 'notify_unmatched_payment', templateKey: 'template_unmatched_payment', label: 'Thanh toán không khớp', placeholder: 'Nội dung tùy chỉnh', defaultTemplate: `<b>⚠️ THANH TOÁN KHÔNG KHỚP</b>\n━━━━━━━━━━━━━━━━━━\n<i>Có giao dịch mới nhưng không thể tự động ghép với đơn hàng nào. Vui lòng kiểm tra sao kê và ghi nhận thủ công.</i>` },
                                        ].map((item) => (
                                            <div key={item.key} className="flex flex-col gap-3 p-4 border rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-100 dark:border-zinc-800">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor={item.key} className="text-xs font-bold">{item.label}</Label>
                                                    <Switch
                                                        id={item.key}
                                                        checked={(telegramConfig as any)[item.key] !== false}
                                                        onCheckedChange={(val) => setTelegramConfig({ ...telegramConfig, [item.key]: val })}
                                                    />
                                                </div>
                                                <div className="pt-2 border-t">
                                                    <Label className="text-sm font-medium mb-2 block">Nội dung mẫu (Telegram HTML)</Label>
                                                    <Textarea
                                                        value={(telegramConfig as any)[item.templateKey] || item.defaultTemplate || ''}
                                                        onChange={(e) => setTelegramConfig({ ...telegramConfig, [item.templateKey]: e.target.value })}
                                                        placeholder={item.placeholder}
                                                        className="min-h-[120px] text-xs font-mono whitespace-pre-wrap"
                                                    />
                                                    <p className="text-[11px] text-muted-foreground mt-1">{item.placeholder}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-5 bg-card rounded-xl border shadow-sm">
                                    <h4 className="text-sm font-medium mb-3">Hướng dẫn nhanh:</h4>
                                    <ol className="text-sm space-y-2 text-muted-foreground list-decimal pl-4">
                                        <li>Tạo bot qua <span className="text-zinc-900 dark:text-zinc-50 font-bold">@BotFather</span> để lấy Token.</li>
                                        <li>Thêm bot vào nhóm và lấy <span className="text-zinc-900 dark:text-zinc-50 font-bold">Chat ID</span> (Dùng bot @userinfobot hoặc @getidsbot).</li>
                                        <li>Nhấn <span className="text-zinc-900 dark:text-zinc-50 font-bold">Lưu cấu hình</span> để bắt đầu nhận thông báo.</li>
                                    </ol>
                                </div>

                                <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row gap-4 justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={handleTestTelegram}
                                        disabled={isTestingTelegram || !telegramConfig.bot_token || !telegramConfig.chat_id}
                                        className="font-bold h-11 px-6 rounded-xl border-zinc-300"
                                    >
                                        {isTestingTelegram ? <LoadingSpinner size="sm" className="mr-2" /> : <Send className="mr-2 h-4 w-4" />}
                                        Gửi tin nhắn thử
                                    </Button>
                                    <Button onClick={handleSaveTelegram} disabled={isSavingTelegram} className="font-bold h-11 px-8 rounded-xl shadow-md shadow-zinc-200">
                                        {isSavingTelegram ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                                        Lưu cấu hình
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Payment Gateway Settings */}
                    <TabsContent value="payment-gateway">
                        <Card className="rounded-xl shadow-sm border-border/50 overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-zinc-950 flex items-center justify-center shadow-md">
                                        <Wallet className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold tracking-tight">Cổng thanh toán</CardTitle>
                                        <CardDescription className="text-sm font-medium">
                                            Cấu hình SePay API và Webhook để tự động đối soát thanh toán.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-8 pt-6">
                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="sepay_api_key_pg">SePay API Key</Label>
                                        <Input
                                            id="sepay_api_key_pg"
                                            type="password"
                                            placeholder="Dán API Key cấp bởi SePay vào đây..."
                                            value={telegramConfig.sepay_api_key || ''}
                                            onChange={(e) => setTelegramConfig({ ...telegramConfig, sepay_api_key: e.target.value })}
                                            className="h-11 border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                                        />
                                        <p className="text-[11px] text-muted-foreground">Key do SePay cấp, dùng để cấp quyền truy cập giao dịch.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sepay_secret_key_pg">SePay Webhook Secret</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="sepay_secret_key_pg"
                                                type="text"
                                                placeholder="Mật khẩu Webhook (HMAC)"
                                                value={telegramConfig.sepay_secret_key || ''}
                                                onChange={(e) => setTelegramConfig({ ...telegramConfig, sepay_secret_key: e.target.value })}
                                                className="h-11 border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-11 px-3 rounded-xl border-zinc-300 text-xs font-bold shrink-0"
                                                onClick={async () => {
                                                    const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('')
                                                    const newConfig = { ...telegramConfig, sepay_secret_key: secret }
                                                    setTelegramConfig(newConfig)
                                                    
                                                    // Auto save
                                                    setIsSavingTelegram(true)
                                                    try {
                                                        await updateSystemSetting('telegram_config', newConfig)
                                                        toast.success('Đã tạo và tự động lưu Webhook Secret mới!')
                                                    } catch (error) {
                                                        toast.error('Lỗi khi lưu Webhook Secret mới')
                                                    } finally {
                                                        setIsSavingTelegram(false)
                                                    }
                                                }}
                                            >
                                                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                                                Tạo mới
                                            </Button>
                                            {telegramConfig.sepay_secret_key && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-11 px-3 rounded-xl border-zinc-300 text-xs font-bold shrink-0"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(telegramConfig.sepay_secret_key || '')
                                                        toast.success('Đã copy Webhook Secret')
                                                    }}
                                                >
                                                    <Copy className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">Tùy chọn: dùng cho xác thực HMAC signature từ SePay.</p>
                                    </div>
                                </div>

                                <div className="p-5 bg-muted/50 rounded-xl border space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium">SePay Webhook URL</h4>
                                        <Badge variant="secondary">Realtime Sync</Badge>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-[11px] font-mono break-all opacity-70">
                                            {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/sepay` : '...'}
                                        </div>
                                        <Button size="sm" variant="outline" className="h-10 px-4 rounded-xl text-xs font-bold border-zinc-300 shadow-sm" onClick={() => {
                                            const url = `${window.location.origin}/api/webhooks/sepay`
                                            navigator.clipboard.writeText(url)
                                            toast.success('Đã copy Webhook URL')
                                        }}>Copy</Button>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground italic leading-relaxed">Cấu hình URL này vào trang Dashboard SePay để tự động khớp tiền và gửi tin nhắn Telegram.</p>
                                </div>

                                <div className="pt-6 border-t border-border/50 flex justify-end">
                                    <Button onClick={handleSaveTelegram} disabled={isSavingTelegram} className="font-bold h-11 px-8 rounded-xl shadow-md shadow-zinc-200">
                                        {isSavingTelegram ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                                        Lưu cấu hình
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Academy Integration Settings */}
                    <TabsContent value="academy">
                        <Card className="rounded-xl shadow-sm border-border/50 overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-zinc-950 flex items-center justify-center shadow-md">
                                        <GraduationCap className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold tracking-tight">Tulie Academy</CardTitle>
                                        <CardDescription className="text-sm font-medium">
                                            Cấu hình Webhook kết nối hệ thống học tập với CRM.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-8 pt-6">
                                <div className="p-5 bg-muted/50 rounded-xl border space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium">Academy Webhook URL</h4>
                                        <Badge variant="outline">Academy Integration</Badge>
                                    </div>
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1 space-y-3">
                                            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-[11px] font-mono break-all opacity-70">
                                                {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/academy` : '...'}
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="academy_webhook_key_pg">Webhook API Key</Label>
                                                <Input
                                                    id="academy_webhook_key_pg"
                                                    placeholder="Nhập khóa để Academy xác thực"
                                                    value={telegramConfig.academy_webhook_key || ''}
                                                    onChange={(e) => setTelegramConfig({ ...telegramConfig, academy_webhook_key: e.target.value })}
                                                    className="h-10 text-xs border-zinc-200 dark:border-zinc-800 rounded-xl"
                                                />
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline" className="font-semibold border-zinc-300 shadow-sm" onClick={() => {
                                            const url = `${window.location.origin}/api/webhooks/academy`
                                            navigator.clipboard.writeText(url)
                                            toast.success('Đã copy Academy Webhook URL')
                                        }}>Copy</Button>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground italic leading-relaxed">Dùng khóa này cấu hình vào Tulie Academy để đẩy dữ liệu doanh thu về CRM.</p>
                                </div>

                                <div className="pt-6 border-t border-border/50 flex justify-end">
                                    <Button onClick={handleSaveTelegram} disabled={isSavingTelegram} className="font-bold h-11 px-8 rounded-xl shadow-md shadow-zinc-200">
                                        {isSavingTelegram ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                                        Lưu cấu hình
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Email SMTP Settings */}
                    <TabsContent value="mail">
                        <Card className="rounded-xl shadow-sm border-border/50 overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-zinc-950 flex items-center justify-center shadow-md">
                                        <Mail className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold tracking-tight">Email SMTP</CardTitle>
                                        <CardDescription className="text-sm font-medium">Cấu hình máy chủ gửi email cho khách hàng.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SMTP Host</Label>
                                        <Input
                                            placeholder="smtp.gmail.com"
                                            value={smtpConfig.host}
                                            onChange={e => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                                            className="h-11 rounded-xl border-zinc-200 dark:border-zinc-800"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SMTP Port</Label>
                                        <Input
                                            placeholder="587"
                                            value={smtpConfig.port}
                                            onChange={e => setSmtpConfig({ ...smtpConfig, port: Number(e.target.value) || 587 })}
                                            className="h-11 rounded-xl border-zinc-200 dark:border-zinc-800"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">User / Email</Label>
                                        <Input
                                            placeholder="email@example.com"
                                            value={smtpConfig.user}
                                            onChange={e => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                                            className="h-11 rounded-xl border-zinc-200 dark:border-zinc-800"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password / App Password</Label>
                                        <Input
                                            type="password"
                                            placeholder="****************"
                                            value={smtpConfig.pass}
                                            onChange={e => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
                                            className="h-11 rounded-xl border-zinc-200 dark:border-zinc-800"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tên người gửi (From Name)</Label>
                                        <Input
                                            placeholder="Tulie CRM"
                                            value={smtpConfig.from_name}
                                            onChange={e => setSmtpConfig({ ...smtpConfig, from_name: e.target.value })}
                                            className="h-11 rounded-xl border-zinc-200 dark:border-zinc-800"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email hiển thị (From Email)</Label>
                                        <Input
                                            placeholder="info@tulie.vn"
                                            value={smtpConfig.from_email}
                                            onChange={e => setSmtpConfig({ ...smtpConfig, from_email: e.target.value })}
                                            className="h-11 rounded-xl border-zinc-200 dark:border-zinc-800"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3 p-4 border border-border/50 rounded-2xl bg-muted/30 shadow-sm">
                                    <Switch
                                        id="smtp_secure"
                                        checked={smtpConfig.secure}
                                        onCheckedChange={val => setSmtpConfig({ ...smtpConfig, secure: val })}
                                    />
                                    <Label htmlFor="smtp_secure" className="text-sm font-bold text-zinc-900 cursor-pointer">Sử dụng SSL/TLS (Tắt nếu dùng Port 587 STARTTLS)</Label>
                                </div>

                                <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row gap-4 justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={handleTestSmtp}
                                        disabled={isTestingSmtp || !smtpConfig.host || !smtpConfig.user}
                                        className="font-bold h-11 px-6 rounded-xl border-zinc-300"
                                    >
                                        {isTestingSmtp ? <LoadingSpinner size="sm" className="mr-2" /> : <Send className="mr-2 h-4 w-4" />}
                                        Gửi email thử
                                    </Button>
                                    <Button onClick={handleSaveSmtp} disabled={isSavingSmtp} className="font-bold h-11 px-8 rounded-xl shadow-md shadow-zinc-200">
                                        {isSavingSmtp ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                                        Lưu cấu hình SMTP
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notification Settings */}
                    <TabsContent value="notifications">
                        <Card className="rounded-xl shadow-sm border-border/50 overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border/50">
                                <CardTitle className="text-xl font-bold tracking-tight">Cài đặt thông báo</CardTitle>
                                <CardDescription className="text-sm font-medium">
                                    Quản lý cách bạn nhận thông báo từ hệ thống
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-0 divide-y divide-border/50">
                                <div className="flex items-center justify-between py-6">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-bold text-zinc-900">Thông báo trong app</Label>
                                        <p className="text-sm text-muted-foreground font-medium italic">
                                            Nhận thông báo ngay trong ứng dụng
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between py-6">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-bold text-zinc-900">Email thông báo</Label>
                                        <p className="text-sm text-muted-foreground font-medium italic">
                                            Nhận email khi có cập nhật quan trọng
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between py-6">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-bold text-zinc-900">Cảnh báo hóa đơn quá hạn</Label>
                                        <p className="text-sm text-muted-foreground font-medium italic">
                                            Nhận thông báo khi hóa đơn sắp hoặc đã quá hạn
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between py-6">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-bold text-zinc-900">Báo giá được xem</Label>
                                        <p className="text-sm text-muted-foreground font-medium italic">
                                            Thông báo khi khách hàng mở xem báo giá
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Appearance Settings */}
                    <TabsContent value="appearance">
                        <Card className="rounded-xl shadow-sm border-border/50 overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border/50">
                                <CardTitle className="text-xl font-bold tracking-tight">Giao diện</CardTitle>
                                <CardDescription className="text-sm font-medium">
                                    Tùy chỉnh giao diện hiển thị của ứng dụng
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-0 divide-y divide-border/50">
                                <div className="flex items-center justify-between py-6">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-bold text-zinc-900">Chế độ tối</Label>
                                        <p className="text-sm text-muted-foreground font-medium italic">
                                            Sử dụng giao diện tối để bảo vệ mắt
                                        </p>
                                    </div>
                                    <Switch
                                        checked={theme === 'dark'}
                                        onCheckedChange={(val) => {
                                            const newTheme = val ? 'dark' : 'light'
                                            setTheme(newTheme)
                                            updateAppearanceConfig({ ...appearance, darkMode: val })
                                        }}
                                    />
                                </div>
                                <div className="flex items-center justify-between py-6">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-bold text-zinc-900">Sidebar thu gọn</Label>
                                        <p className="text-sm text-muted-foreground font-medium italic">
                                            Mặc định thu gọn sidebar
                                        </p>
                                    </div>
                                    <Switch
                                        checked={appearance.sidebarCollapsed}
                                        onCheckedChange={(val) => handleUpdateAppearance('sidebarCollapsed', val)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Settings */}
                    <TabsContent value="security">
                        <Card className="rounded-xl shadow-sm border-border/50 overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border/50">
                                <CardTitle className="text-xl font-bold tracking-tight">Bảo mật</CardTitle>
                                <CardDescription className="text-sm font-medium">
                                    Quản lý mật khẩu và bảo mật tài khoản
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-5 max-w-lg">
                                    <div className="space-y-2">
                                        <Label htmlFor="current_password text-xs font-bold uppercase tracking-wider text-muted-foreground">Mật khẩu hiện tại</Label>
                                        <Input id="current_password" type="password" className="h-11 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new_password text-xs font-bold uppercase tracking-wider text-muted-foreground">Mật khẩu mới</Label>
                                        <Input id="new_password" type="password" className="h-11 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm_password text-xs font-bold uppercase tracking-wider text-muted-foreground">Xác nhận mật khẩu mới</Label>
                                        <Input id="confirm_password" type="password" className="h-11 rounded-xl" />
                                    </div>
                                </div>
                                <Separator className="bg-border/50" />
                                <div className="flex justify-end pt-2">
                                    <Button className="rounded-xl px-8 font-bold h-11 shadow-md shadow-zinc-200">Đổi mật khẩu</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Data Settings */}
                    <TabsContent value="data">
                        <Card className="rounded-xl shadow-sm border-border/50 overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border/50">
                                <CardTitle className="text-xl font-bold tracking-tight">Quản lý dữ liệu</CardTitle>
                                <CardDescription className="text-sm font-medium">
                                    Xuất và nhập dữ liệu hệ thống linh hoạt
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="divide-y divide-border/50 p-0">
                                <div className="flex items-center justify-between p-6 hover:bg-muted/10 transition-colors">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-bold text-zinc-900">Xuất dữ liệu toàn bộ</Label>
                                        <p className="text-sm text-muted-foreground font-medium italic">
                                            Tải xuống toàn bộ dữ liệu (Khách hàng, Đơn hàng, v.v.) dưới dạng Excel (.xlsx)
                                        </p>
                                    </div>
                                    <Button variant="outline" className="h-10 px-6 rounded-xl font-bold shadow-sm">
                                        <DatabaseIcon className="mr-2 h-4 w-4" />
                                        Xuất Excel
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between p-6 hover:bg-muted/10 transition-colors">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-bold text-zinc-900">Nhập dữ liệu khách hàng</Label>
                                        <p className="text-sm text-muted-foreground font-medium italic">
                                            Hỗ trợ nhập danh sách khách hàng số lượng lớn từ file Excel mẫu
                                        </p>
                                    </div>
                                    <Button variant="outline" className="h-10 px-6 rounded-xl font-bold shadow-sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Chọn file
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Bundles Settings */}
                    <TabsContent value="bundles">
                        <Card className="rounded-xl shadow-sm border-border/50 overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border/50">
                                <CardTitle className="text-xl font-bold tracking-tight">Bộ chứng từ (Document Bundles)</CardTitle>
                                <CardDescription className="text-sm font-medium">
                                    Thiết lập các nhóm mẫu giấy tờ để tự động hóa quy trình hợp đồng & báo giá.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8 pt-6">
                                <div className="space-y-6 p-6 border border-border/50 rounded-2xl bg-muted/20 shadow-inner">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-8 w-8 rounded-lg bg-zinc-950 flex items-center justify-center shadow-md">
                                            <Plus className="h-4 w-4 text-white" />
                                        </div>
                                        <h4 className="text-base font-bold text-zinc-900">Thiết lập bộ mẫu mới</h4>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tên bộ chứng từ</Label>
                                            <Input
                                                placeholder="VD: In ấn - Trọng gói"
                                                value={newBundle.name}
                                                onChange={e => setNewBundle({ ...newBundle, name: e.target.value })}
                                                className="h-11 rounded-xl bg-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mô tả mục đích</Label>
                                            <Input
                                                placeholder="Dùng cho các dự án in ấn..."
                                                value={newBundle.description}
                                                onChange={e => setNewBundle({ ...newBundle, description: e.target.value })}
                                                className="h-11 rounded-xl bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chọn các mẫu giấy tờ đi kèm</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {templates.map(t => (
                                                <div
                                                    key={t.id}
                                                    className={cn(
                                                        "group flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 select-none cursor-pointer",
                                                        newBundle.templates.includes(t.id)
                                                            ? "bg-zinc-950 text-white border-zinc-950 shadow-md ring-2 ring-zinc-950 ring-offset-2"
                                                            : "bg-white border-border/50 hover:border-zinc-400 hover:shadow-sm"
                                                    )}
                                                    onClick={() => {
                                                        const current = newBundle.templates
                                                        if (current.includes(t.id)) {
                                                            setNewBundle({ ...newBundle, templates: current.filter(id => id !== t.id) })
                                                        } else {
                                                            setNewBundle({ ...newBundle, templates: [...current, t.id] })
                                                        }
                                                    }}
                                                >
                                                    <div className={cn(
                                                        "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                                                        newBundle.templates.includes(t.id) ? "bg-white/10" : "bg-muted/50"
                                                    )}>
                                                        <FileText className={cn("w-4 h-4", newBundle.templates.includes(t.id) ? "text-white" : "text-zinc-500")} />
                                                    </div>
                                                    <span className="text-sm font-bold tracking-tight">{t.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Button onClick={handleCreateBundle} disabled={isSavingBundle} className="w-full h-12 rounded-xl font-bold shadow-lg shadow-zinc-200 text-base">
                                        {isSavingBundle ? <LoadingSpinner size="sm" className="mr-2" /> : <Plus className="mr-2 h-5 w-5" />}
                                        Lưu bộ mẫu chứng từ
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-base font-bold text-zinc-900 tracking-tight">Danh sách Bộ mẫu hiện có ({bundles.length})</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {bundles.map(bundle => (
                                            <Card key={bundle.id} className="overflow-hidden border-border/50 shadow-sm rounded-2xl group hover:border-zinc-900/40 hover:shadow-md transition-all duration-300">
                                                <CardHeader className="p-5 bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between space-y-0">
                                                    <div>
                                                        <CardTitle className="text-base font-bold tracking-tight text-zinc-900">{bundle.name}</CardTitle>
                                                        {bundle.description && <CardDescription className="text-xs font-medium mt-0.5 line-clamp-1 italic">{bundle.description}</CardDescription>}
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors" onClick={() => handleDeleteBundle(bundle.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </CardHeader>
                                                <CardContent className="p-5">
                                                    <div className="flex flex-wrap gap-2">
                                                        {bundle.templates.map(tid => {
                                                            const t = templates.find(temp => temp.id === tid)
                                                            return (
                                                                <Badge key={tid} variant="secondary" className="text-[11px] font-bold px-3 py-1 rounded-lg bg-zinc-100 border-transparent text-zinc-700 hover:bg-zinc-200 transition-colors">
                                                                    <FileText className="w-3 h-3 mr-1.5 opacity-60" />
                                                                    {t?.name || tid}
                                                                </Badge>
                                                            )
                                                        })}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                        {bundles.length === 0 && (
                                            <div className="col-span-full py-16 text-center bg-muted/20 border-2 border-dashed border-border/50 rounded-2xl">
                                                <div className="flex flex-col items-center gap-3">
                                                    <BookOpen className="h-10 w-10 text-zinc-200" />
                                                    <div className="space-y-1">
                                                        <p className="font-bold text-zinc-500">Chưa có bộ mẫu nào</p>
                                                        <p className="text-sm text-zinc-400">Hãy tạo bộ mẫu đầu tiên để bắt đầu tự động hóa.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="bank-accounts">
                        <div className="space-y-6">
                            {/* Tài khoản công ty */}
                            <Card className="rounded-xl shadow-sm border-border/50">
                                <CardHeader className="bg-muted/30 border-b border-border/50">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-zinc-600" />
                                        <div>
                                            <CardTitle className="text-xl font-bold tracking-tight">Tài khoản công ty</CardTitle>
                                            <CardDescription className="text-sm font-medium">Hiển thị khi tạo báo giá B2B (Agency)</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-6">
                                    {bankAccounts.map((account, index) => account.type !== 'personal' && (
                                        <div key={index} className="space-y-4 border p-5 rounded-2xl relative bg-white shadow-sm border-border/50 group">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground italic">TK Công ty #{bankAccounts.filter((a, i) => a.type !== 'personal' && i <= index).length}</h4>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/5 rounded-full"
                                                    onClick={() => {
                                                        const newAccounts = [...bankAccounts]
                                                        newAccounts.splice(index, 1)
                                                        setBankAccounts(newAccounts)
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tên ngân hàng</Label>
                                                    <Input
                                                        value={account.bank_name}
                                                        onChange={(e) => {
                                                            const newAccounts = [...bankAccounts]
                                                            newAccounts[index].bank_name = e.target.value
                                                            setBankAccounts(newAccounts)
                                                        }}
                                                        placeholder="Ví dụ: VietinBank"
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Số tài khoản</Label>
                                                    <Input
                                                        value={account.account_no}
                                                        onChange={(e) => {
                                                            const newAccounts = [...bankAccounts]
                                                            newAccounts[index].account_no = e.target.value
                                                            setBankAccounts(newAccounts)
                                                        }}
                                                        placeholder="Ví dụ: 0110163102"
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tên chủ tài khoản</Label>
                                                    <Input
                                                        value={account.account_name}
                                                        onChange={(e) => {
                                                            const newAccounts = [...bankAccounts]
                                                            newAccounts[index].account_name = e.target.value
                                                            setBankAccounts(newAccounts)
                                                        }}
                                                        placeholder="Ví dụ: CÔNG TY TNHH TULIE"
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chi nhánh</Label>
                                                    <Input
                                                        value={account.bank_branch}
                                                        onChange={(e) => {
                                                            const newAccounts = [...bankAccounts]
                                                            newAccounts[index].bank_branch = e.target.value
                                                            setBankAccounts(newAccounts)
                                                        }}
                                                        placeholder="Ví dụ: Hà Nội"
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                            <div className="pt-3 border-t border-border/30">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Sử dụng mặc định cho</Label>
                                                <div className="flex flex-wrap gap-4">
                                                    {[
                                                        { value: 'quotation', label: 'Báo giá (Agency B2B)' },
                                                    ].map(option => (
                                                        <label key={option.value} className="flex items-center gap-2 cursor-pointer select-none">
                                                            <Checkbox
                                                                checked={(account.default_for || []).includes(option.value)}
                                                                onCheckedChange={(checked) => {
                                                                    const newAccounts = [...bankAccounts]
                                                                    const current = newAccounts[index].default_for || []
                                                                    newAccounts[index].default_for = checked
                                                                        ? [...current, option.value]
                                                                        : current.filter((v: string) => v !== option.value)
                                                                    setBankAccounts(newAccounts)
                                                                }}
                                                            />
                                                            <span className="text-xs font-medium text-zinc-700">{option.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {bankAccounts.filter(a => a.type !== 'personal').length === 0 && (
                                        <div className="p-8 text-center text-muted-foreground bg-zinc-50/50 rounded-xl border border-dashed border-border/50">
                                            <Building2 className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                            <p className="text-sm">Chưa có tài khoản công ty nào</p>
                                        </div>
                                    )}
                                    <Button
                                        variant="outline"
                                        className="w-full border-dashed h-12 rounded-xl text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 border-zinc-200"
                                        onClick={() => {
                                            setBankAccounts([...bankAccounts, { bank_name: '', account_no: '', account_name: '', bank_branch: '', default_for: [], type: 'company' }])
                                        }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Thêm tài khoản công ty
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Tài khoản cá nhân */}
                            <Card className="rounded-xl shadow-sm border-border/50">
                                <CardHeader className="bg-muted/30 border-b border-border/50">
                                    <div className="flex items-center gap-2">
                                        <User className="h-5 w-5 text-zinc-600" />
                                        <div>
                                            <CardTitle className="text-xl font-bold tracking-tight">Tài khoản cá nhân</CardTitle>
                                            <CardDescription className="text-sm font-medium">Hiển thị ở Studio B2C và cũng dùng được cho Agency B2B</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-6">
                                    {bankAccounts.map((account, index) => account.type === 'personal' && (
                                        <div key={index} className="space-y-4 border p-5 rounded-2xl relative bg-white shadow-sm border-border/50 group">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground italic">TK Cá nhân #{bankAccounts.filter((a, i) => a.type === 'personal' && i <= index).length}</h4>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/5 rounded-full"
                                                    onClick={() => {
                                                        const newAccounts = [...bankAccounts]
                                                        newAccounts.splice(index, 1)
                                                        setBankAccounts(newAccounts)
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tên ngân hàng</Label>
                                                    <Input
                                                        value={account.bank_name}
                                                        onChange={(e) => {
                                                            const newAccounts = [...bankAccounts]
                                                            newAccounts[index].bank_name = e.target.value
                                                            setBankAccounts(newAccounts)
                                                        }}
                                                        placeholder="Ví dụ: MBBank"
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Số tài khoản</Label>
                                                    <Input
                                                        value={account.account_no}
                                                        onChange={(e) => {
                                                            const newAccounts = [...bankAccounts]
                                                            newAccounts[index].account_no = e.target.value
                                                            setBankAccounts(newAccounts)
                                                        }}
                                                        placeholder="Ví dụ: 104002106705"
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tên chủ tài khoản</Label>
                                                    <Input
                                                        value={account.account_name}
                                                        onChange={(e) => {
                                                            const newAccounts = [...bankAccounts]
                                                            newAccounts[index].account_name = e.target.value
                                                            setBankAccounts(newAccounts)
                                                        }}
                                                        placeholder="Ví dụ: NGHIEM THI LIEN"
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chi nhánh</Label>
                                                    <Input
                                                        value={account.bank_branch}
                                                        onChange={(e) => {
                                                            const newAccounts = [...bankAccounts]
                                                            newAccounts[index].bank_branch = e.target.value
                                                            setBankAccounts(newAccounts)
                                                        }}
                                                        placeholder="Ví dụ: Hà Nội"
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                            <div className="pt-3 border-t border-border/30">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Sử dụng mặc định cho</Label>
                                                <div className="flex flex-wrap gap-4">
                                                    {[
                                                        { value: 'retail_order', label: 'Đơn hàng (Studio B2C)' },
                                                        { value: 'quotation', label: 'Báo giá (Agency B2B)' },
                                                    ].map(option => (
                                                        <label key={option.value} className="flex items-center gap-2 cursor-pointer select-none">
                                                            <Checkbox
                                                                checked={(account.default_for || []).includes(option.value)}
                                                                onCheckedChange={(checked) => {
                                                                    const newAccounts = [...bankAccounts]
                                                                    const current = newAccounts[index].default_for || []
                                                                    newAccounts[index].default_for = checked
                                                                        ? [...current, option.value]
                                                                        : current.filter((v: string) => v !== option.value)
                                                                    setBankAccounts(newAccounts)
                                                                }}
                                                            />
                                                            <span className="text-xs font-medium text-zinc-700">{option.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {bankAccounts.filter(a => a.type === 'personal').length === 0 && (
                                        <div className="p-8 text-center text-muted-foreground bg-zinc-50/50 rounded-xl border border-dashed border-border/50">
                                            <User className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                            <p className="text-sm">Chưa có tài khoản cá nhân nào</p>
                                        </div>
                                    )}
                                    <Button
                                        variant="outline"
                                        className="w-full border-dashed h-12 rounded-xl text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 border-zinc-200"
                                        onClick={() => {
                                            setBankAccounts([...bankAccounts, { bank_name: '', account_no: '', account_name: '', bank_branch: '', default_for: [], type: 'personal' }])
                                        }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Thêm tài khoản cá nhân
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Nút lưu chung */}
                            <div className="flex justify-end">
                                <Button onClick={() => handleSaveBankAccounts(bankAccounts)} disabled={isSavingBankAccounts} className="rounded-xl px-10 font-bold shadow-lg shadow-zinc-100">
                                    {isSavingBankAccounts && <LoadingSpinner size="sm" className="mr-2" />}
                                    Lưu danh sách
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="note-templates">
                        <Card className="rounded-xl shadow-sm border-border/50">
                            <CardHeader className="bg-muted/30 border-b border-border/50">
                                <CardTitle className="text-xl font-bold tracking-tight">Mẫu Ghi chú & Điều khoản</CardTitle>
                                <CardDescription className="text-sm font-medium">Cấu hình các mẫu văn bản cho từng loại dịch vụ để chọn nhanh khi tạo báo giá.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-6">
                                    {noteTemplates.map((template, index) => (
                                        <div key={index} className="space-y-4 border p-5 rounded-2xl relative bg-white shadow-sm border-border/50 group">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground italic">Mẫu #{index + 1}</h4>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/5 rounded-full"
                                                    onClick={() => {
                                                        const newTemplates = [...noteTemplates]
                                                        newTemplates.splice(index, 1)
                                                        setNoteTemplates(newTemplates)
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tên mẫu</Label>
                                                    <Input
                                                        value={template.name}
                                                        onChange={(e) => {
                                                            const newTemplates = [...noteTemplates]
                                                            newTemplates[index].name = e.target.value
                                                            setNoteTemplates(newTemplates)
                                                        }}
                                                        placeholder="VD: Studio - Gói Basic"
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loại dịch vụ (Gợi ý: studio, agency)</Label>
                                                    <Input
                                                        value={template.service_type}
                                                        onChange={(e) => {
                                                            const newTemplates = [...noteTemplates]
                                                            newTemplates[index].service_type = e.target.value
                                                            setNoteTemplates(newTemplates)
                                                        }}
                                                        placeholder="VD: studio"
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Điều khoản thanh toán</Label>
                                                <Textarea
                                                    value={template.payment_terms}
                                                    onChange={(e) => {
                                                        const newTemplates = [...noteTemplates]
                                                        newTemplates[index].payment_terms = e.target.value
                                                        setNoteTemplates(newTemplates)
                                                    }}
                                                    rows={3}
                                                    className="rounded-xl resize-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ghi chú</Label>
                                                <Textarea
                                                    value={template.notes}
                                                    onChange={(e) => {
                                                        const newTemplates = [...noteTemplates]
                                                        newTemplates[index].notes = e.target.value
                                                        setNoteTemplates(newTemplates)
                                                    }}
                                                    rows={3}
                                                    className="rounded-xl resize-none"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        className="w-full border-dashed h-12 rounded-xl text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 border-zinc-200"
                                        onClick={() => {
                                            setNoteTemplates([...noteTemplates, { name: '', service_type: '', payment_terms: '', notes: '' }])
                                        }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Thêm mẫu văn bản
                                    </Button>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Button onClick={() => handleSaveNoteTemplates(noteTemplates)} disabled={isSavingNoteTemplates} className="rounded-xl px-10 font-bold shadow-lg shadow-zinc-100">
                                        {isSavingNoteTemplates && <LoadingSpinner size="sm" className="mr-2" />}
                                        Lưu danh sách
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
