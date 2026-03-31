'use client'

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { submitPhotoOrder } from '../actions'
import { 
  Button, Input, Label, Switch, Textarea,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Badge, Separator,
  LoadingSpinner
} from '@repo/ui'
import { Camera, CheckCircle2, Eye, ImagePlus, Link2, MapPin, MinusIcon, Package, Percent, PlusIcon, Printer, Sparkles, Star, Tag, Truck, Upload, User, X } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { PrintLayoutPreview } from './PrintLayoutPreview'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types'

const EXTRA_PRINT_PRICE = 40000
const SHIPPING_FEE_HANOI = 15000
const SHIPPING_FEE_OTHER = 25000

// Map product names to icons and metadata
const PACKAGE_META: Record<string, { icon: typeof Camera; freePrints: number; popular?: boolean; features: string[] }> = {
  '79': {
    icon: Camera,
    freePrints: 1,
    features: ['Thay nền', 'Chỉnh sáng cơ bản', 'Tăng nét nhẹ', 'Không ghép tóc', 'Không ghép áo', 'Tặng 1 vỉ in'],
  },
  '199': {
    icon: Star,
    freePrints: 2,
    popular: true,
    features: ['Thay nền', 'Chỉnh sáng', 'Chỉnh da', 'Ghép tóc, xoá tóc mái', 'Làm lộ tai', 'Ghép 01 trang phục', 'Chỉnh sửa 2 lần', 'Tặng 2 vỉ in'],
  },
  '339': {
    icon: Sparkles,
    freePrints: 4,
    features: ['Thay nền', 'Chỉnh sáng cao cấp', 'Chỉnh da cao cấp', 'Chỉnh màu ảnh cao cấp', 'Ghép tóc, xoá tóc mái', 'Làm lộ tai', 'Ghép 02 trang phục', 'Chỉnh sửa 5 lần', 'Tặng 4 vỉ in'],
  },
}

function getPackageMeta(product: Product) {
  // Match by price (in thousands)
  const priceKey = Math.floor(product.price / 1000).toString()
  return PACKAGE_META[priceKey] || { icon: Camera, freePrints: 0, features: [] }
}

const PRINT_SIZES = [
  { id: 'mix', name: 'Vỉ Mix (3×4x6 + 5×3x4 + 3×2x3)' },
  { id: '2x3', name: 'Cỡ 2×3 cm — 18 ảnh/vỉ' },
  { id: '3x4', name: 'Cỡ 3×4 cm — 10 ảnh/vỉ' },
  { id: '4x6', name: 'Cỡ 4×6 cm — 5 ảnh/vỉ' },
  { id: '3.5x4.5', name: 'Cỡ 3.5×4.5 cm — 8 ảnh/vỉ' },
  { id: '3.3x4.8', name: 'Cỡ 3.3×4.8 cm — 8 ảnh/vỉ' },
  { id: '4.5x4.5', name: 'Cỡ 4.5×4.5 cm — 6 ảnh/vỉ' },
  { id: '5x5', name: 'Cỡ 5.0×5.0 cm — 4 ảnh/vỉ' },
]

// Stepper component
function QtyStepper({ value, onChange, min = 0 }: { value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="flex items-center border border-border rounded-lg bg-white select-none">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="px-2.5 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-l-lg transition-colors"
      >
        <MinusIcon className="size-3.5" />
      </button>
      <span className="w-8 text-center text-sm font-bold text-foreground tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="px-2.5 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-r-lg transition-colors"
      >
        <PlusIcon className="size-3.5" />
      </button>
    </div>
  )
}

export default function OrderForm({ products, isAdmin = false }: { products: Product[]; isAdmin?: boolean }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const draftSaving = useRef(false)

  // Auto-save draft when customer fills in name + phone
  useEffect(() => {
    if (customerName.length < 2 || customerPhone.length < 10 || draftSaving.current) return

    const timer = setTimeout(async () => {
      if (draftSaving.current) return
      draftSaving.current = true
      try {
        const res = await fetch('/api/studio/draft-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerName, customerPhone }),
        })
        const data = await res.json()
        if (data.draftId) {
          setDraftId(data.draftId)
        }
      } catch (err) {
        console.error('Draft save failed:', err)
      } finally {
        draftSaving.current = false
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [customerName, customerPhone])

  // Build packages from DB products
  const PACKAGES = useMemo(() => products.map(p => {
    const meta = getPackageMeta(p)
    return {
      id: p.id,        // Real UUID from DB
      sku: p.sku || '',
      name: p.name,
      price: p.price,
      desc: p.description || '',
      freePrints: meta.freePrints,
      icon: meta.icon,
      popular: meta.popular || false,
      features: meta.features,
    }
  }), [products])

  // Multi-package state: {id: qty} — default 0 for all, 1 for popular
  const [pkgQuantities, setPkgQuantities] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    products.forEach(p => {
      const meta = getPackageMeta(p)
      init[p.id] = meta.popular ? 1 : 0
    })
    return init
  })
  const [pkgNotes, setPkgNotes] = useState<Record<string, string>>({})

  // Print state — per-vỉ sizes
  const [wantPrint, setWantPrint] = useState(false)
  const [showLayoutPreview, setShowLayoutPreview] = useState(false)
  const [viSizes, setViSizes] = useState<string[]>([])
  const [extraViCount, setExtraViCount] = useState(0)
  const [showAllLayouts, setShowAllLayouts] = useState(false)

  // Shipping region state
  const [shippingRegion, setShippingRegion] = useState<'hanoi' | 'other'>('hanoi')

  // Shipping state (shown when print is on — no separate toggle)
  const [shippingName, setShippingName] = useState('')
  const [shippingPhone, setShippingPhone] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')

  // Discount state
  const [discountType, setDiscountType] = useState<'amount' | 'percent'>('amount')
  const [discountValue, setDiscountValue] = useState('')

  // Photo upload state
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string; path: string }[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const supabase = createClient()
    const newFiles: typeof uploadedFiles = []

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} quá lớn (tối đa 10MB)`)
        continue
      }
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 8)
      const filePath = `orders/${timestamp}_${randomId}.${ext}`

      const { error } = await supabase.storage.from('id-photos').upload(filePath, file)
      if (error) {
        toast.error(`Lỗi upload ${file.name}: ${error.message}`)
        continue
      }
      const { data: urlData } = supabase.storage.from('id-photos').getPublicUrl(filePath)
      newFiles.push({ name: file.name, url: urlData.publicUrl, path: filePath })
    }

    setUploadedFiles(prev => [...prev, ...newFiles])
    setIsUploading(false)
    if (newFiles.length > 0) toast.success(`Đã tải lên ${newFiles.length} ảnh`)
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const removeFile = useCallback((path: string) => {
    setUploadedFiles(prev => prev.filter(f => f.path !== path))
  }, [])

  // Derived calculations
  const totalFreePrints = useMemo(() => {
    return PACKAGES.reduce((sum, pkg) => sum + (pkgQuantities[pkg.id] || 0) * pkg.freePrints, 0)
  }, [pkgQuantities])

  const packageTotal = useMemo(() => {
    return PACKAGES.reduce((sum, pkg) => sum + (pkgQuantities[pkg.id] || 0) * pkg.price, 0)
  }, [pkgQuantities])

  const extraPrints = wantPrint ? extraViCount : 0
  const printExtraCost = extraPrints * EXTRA_PRINT_PRICE
  const totalPrintQty = wantPrint ? totalFreePrints + extraViCount : 0
  const totalPkgCount = Object.values(pkgQuantities).reduce((a, b) => a + b, 0)

  // Shipping fee logic: free for 199k/339k packages
  const hasFreeShipping = useMemo(() => {
    return PACKAGES.some(pkg => {
      const priceK = Math.floor(pkg.price / 1000)
      return (priceK === 199 || priceK === 339) && (pkgQuantities[pkg.id] || 0) > 0
    })
  }, [pkgQuantities, PACKAGES])

  const shippingFee = wantPrint ? (hasFreeShipping ? 0 : (shippingRegion === 'hanoi' ? SHIPPING_FEE_HANOI : SHIPPING_FEE_OTHER)) : 0
  const subtotal = packageTotal + printExtraCost + shippingFee

  // Discount calculation
  const discountAmount = useMemo(() => {
    const val = parseFloat(discountValue) || 0
    if (val <= 0) return 0
    if (discountType === 'percent') {
      return Math.round(subtotal * Math.min(val, 100) / 100)
    }
    return Math.min(val, subtotal)
  }, [discountType, discountValue, subtotal])

  const totalPrice = Math.max(0, subtotal - discountAmount)

  // Compute viLabels: which package each vỉ belongs to
  const viLabels = useMemo(() => {
    const labels: string[] = []
    for (const pkg of PACKAGES) {
      const qty = pkgQuantities[pkg.id] || 0
      if (qty <= 0 || pkg.freePrints <= 0) continue
      const priceK = Math.round(pkg.price / 1000)
      for (let q = 0; q < qty; q++) {
        for (let v = 0; v < pkg.freePrints; v++) {
          labels.push(`Gói ${priceK}k`)
        }
      }
    }
    // Extra paid vỉ
    for (let i = 0; i < extraViCount; i++) {
      labels.push('In thêm')
    }
    return labels
  }, [pkgQuantities, extraViCount, PACKAGES])

  // Sync viSizes array when totalFreePrints or extraViCount changes
  const totalViSlots = totalFreePrints + extraViCount
  if (viSizes.length !== totalViSlots) {
    const newSizes = [...viSizes]
    while (newSizes.length < totalViSlots) newSizes.push('mix')
    while (newSizes.length > totalViSlots) newSizes.pop()
    if (JSON.stringify(newSizes) !== JSON.stringify(viSizes)) {
      setViSizes(newSizes)
    }
  }

  const updateViSize = (index: number, sizeId: string) => {
    setViSizes(prev => {
      const next = [...prev]
      next[index] = sizeId
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const hasPrintOnly = wantPrint && (totalFreePrints + extraViCount) > 0
    if (totalPkgCount === 0 && !hasPrintOnly) {
      toast.error('Vui lòng chọn ít nhất 1 gói dịch vụ hoặc dịch vụ in ấn')
      return
    }
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)

    // Include draftId if we have a saved draft
    if (draftId) {
      formData.set('draftId', draftId)
    }

    // Build packages JSON
    const pkgArray = PACKAGES.filter(p => (pkgQuantities[p.id] || 0) > 0).map(p => ({
      id: p.id,
      qty: pkgQuantities[p.id],
      note: pkgNotes[p.id] || '',
    }))

    formData.set('packages', JSON.stringify(pkgArray))
    formData.set('viSizes', wantPrint ? JSON.stringify(viSizes) : '[]')
    formData.set('viLabels', wantPrint ? JSON.stringify(viLabels) : '[]')
    formData.set('printQuantity', wantPrint ? totalPrintQty.toString() : '0')
    formData.set('photoUrls', JSON.stringify(uploadedFiles.map(f => f.url)))

    // Discount info
    if (discountAmount > 0) {
      formData.set('discountType', discountType)
      formData.set('discountValue', discountValue)
      formData.set('discountAmount', discountAmount.toString())
    }

    // Shipping info (always included when printing)
    if (wantPrint) {
      formData.set('shippingName', shippingName)
      formData.set('shippingPhone', shippingPhone)
      formData.set('shippingAddress', shippingAddress)
      formData.set('shippingRegion', shippingRegion)
      formData.set('shippingFee', shippingFee.toString())
    }

    const res = await submitPhotoOrder(formData)
    setIsSubmitting(false)

    if (res.success) {
      toast.success('Đặt đơn thành công!', { description: 'Đang chuyển đến trang theo dõi đơn hàng...' })
      // Redirect to success page which handles portal loading with retries
      const params = new URLSearchParams()
      if (res.token) params.set('token', res.token)
      if (res.orderId) params.set('order', res.orderId)
      router.push(`/anhthe/success?${params.toString()}`)
    } else {
      toast.error('Lỗi đặt đơn', { description: res.error })
    }
  }

  return (
    <div className="min-h-screen bg-muted/50 font-sans text-foreground pb-20 selection:bg-black selection:text-white">
      {/* Header */}
      <div className="bg-white border-b border-border pt-8 sm:pt-10 pb-6 sm:pb-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <img src="/file/tulie-agency-logo.png" alt="Logo" className="h-10 sm:h-14 w-auto object-contain grayscale" />
            <div className="w-px h-8 sm:h-10 bg-muted" />
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-foreground">Ảnh thẻ Online</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 font-medium">ID Photo Service</p>
            </div>
          </div>
          <Badge variant="outline" className="hidden sm:inline-flex bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 py-1 gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Đang nhận đơn
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-6 sm:mt-10 space-y-6 sm:space-y-8">

          {/* Section 1: Customer Info */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 px-4 sm:px-6 py-4 sm:py-5 border-b border-border">
              <div className="w-9 h-9 rounded-md bg-zinc-900 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-white">1</span>
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-bold">Thông tin khách hàng</CardTitle>
                <CardDescription className="text-[11px] sm:text-xs mt-0.5">Nhập thông tin để chúng tôi trao trả kết quả</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="customerName" className="text-xs font-semibold text-muted-foreground">
                    Họ và tên <span className="text-red-500">*</span>
                  </Label>
                  <Input id="customerName" name="customerName" placeholder="Nguyễn Văn A" required className="h-10 sm:h-11 rounded-lg border-border focus:border-zinc-400 placeholder:text-zinc-300" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="customerPhone" className="text-xs font-semibold text-muted-foreground">
                    Số điện thoại <span className="text-red-500">*</span>
                  </Label>
                  <Input id="customerPhone" name="customerPhone" type="tel" placeholder="09xx xxx xxx" required className="h-10 sm:h-11 rounded-lg border-border focus:border-zinc-400 placeholder:text-zinc-300" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                </div>
              </div>

              {/* Photo section — grouped under one container */}
              <div className="rounded-md border border-border overflow-hidden">
                <div className="px-4 py-3 bg-muted border-b border-border">
                  <p className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5"><Camera className="size-3.5" /> Ảnh gốc để sửa</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Quý khách có thể tải lên hoặc chèn link ở đây, hoặc gửi ảnh qua Zalo/Messenger cho shop</p>
                </div>
                <div className="p-4 space-y-4">
                  {/* Link input */}
                  <div className="space-y-1.5">
                    <Label htmlFor="notes" className="text-[11px] font-medium text-muted-foreground">
                      Link ảnh gốc / Ghi chú <span className="text-muted-foreground">(tuỳ chọn)</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-300">
                        <Link2 className="size-4" />
                      </div>
                      <Input
                        id="notes"
                        name="notes"
                        className="pl-9 h-10 sm:h-11 rounded-lg border-border focus:border-zinc-400 placeholder:text-zinc-300"
                        placeholder="Dán link Google Drive hoặc nhập yêu cầu đặc biệt..."
                      />
                    </div>
                  </div>

                  {/* Upload zone */}
                  <div className="space-y-2">
                    <Label className="text-[11px] font-medium text-muted-foreground">
                      Tải ảnh gốc lên <span className="text-muted-foreground">(tuỳ chọn)</span>
                    </Label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className={cn(
                        "w-full flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-md border-2 border-dashed transition-all cursor-pointer",
                        isUploading
                          ? "border-input bg-muted cursor-wait"
                          : "border-border hover:border-zinc-400 hover:bg-muted/50 active:bg-muted",
                      )}
                    >
                      {isUploading ? (
                        <LoadingSpinner size="md" />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                          <ImagePlus className="size-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-xs font-semibold text-zinc-700">
                          {isUploading ? 'Đang tải lên...' : 'Chụp ảnh hoặc chọn từ thư viện'}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">JPG, PNG, HEIC — tối đa 10MB/ảnh</p>
                      </div>
                    </button>

                    {/* Uploaded files preview */}
                    {uploadedFiles.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                        {uploadedFiles.map((file) => (
                          <div key={file.path} className="relative group rounded-lg overflow-hidden border border-border bg-muted aspect-square">
                            <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeFile(file.path)}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                            >
                              <X className="size-3.5" />
                            </button>
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-1.5 py-1">
                              <p className="text-[9px] text-white font-medium truncate">{file.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demo Images — Sample Results */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 px-4 sm:px-6 py-4 sm:py-5 border-b border-border">
              <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                <Sparkles className="w-4.5 h-4.5 text-zinc-700" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-bold">Kết quả mẫu</CardTitle>
                <CardDescription className="text-[11px] sm:text-xs mt-0.5">So sánh chất lượng giữa các gói</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="rounded-md overflow-hidden border border-border">
                <img
                  src="/file/anhthe-1.jpg"
                  alt="Kết quả mẫu ảnh thẻ người lớn — so sánh Ảnh gốc, Gói 79k, Gói 199k, Gói 339k"
                  className="w-full h-auto"
                  loading="eager"
                />
              </div>
              <div className="rounded-md overflow-hidden border border-border">
                <img
                  src="/file/anhthe-2.jpg"
                  alt="Kết quả mẫu ảnh thẻ trẻ em — so sánh Ảnh gốc, Gói 79k, Gói 199k, Gói 339k"
                  className="w-full h-auto"
                  loading="eager"
                />
              </div>
              <p className="text-[11px] text-muted-foreground text-center font-medium">
                Gói càng cao, ảnh càng được chỉnh sửa kỹ lưỡng hơn — bao gồm ghép tóc, ghép trang phục, chỉnh da cao cấp
              </p>
            </CardContent>
          </Card>

          {/* Section 2: Package Selection — Multi-quantity */}
          <Card className="bg-transparent border-0 shadow-none ring-0 p-0">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 px-1 py-0 mb-4 sm:mb-5">
              <div className="w-9 h-9 rounded-md bg-zinc-900 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-white">2</span>
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-bold">Chọn gói dịch vụ</CardTitle>
                <CardDescription className="text-[11px] sm:text-xs mt-0.5">Mỗi gói tương ứng 1 bộ ảnh cho 1 người chụp</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-0 grid gap-4">
              {PACKAGES.map(pkg => {
                const qty = pkgQuantities[pkg.id] || 0
                const isSelected = qty > 0
                const Icon = pkg.icon

                return (
                  <Card
                    key={pkg.id}
                    className={cn(
                      "overflow-hidden transition-all duration-200",
                      isSelected
                        ? "border-zinc-900 ring-1 ring-zinc-900/10"
                        : "hover:border-input",
                    )}
                  >
                    {/* Card header */}
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={cn(
                            "w-10 h-10 rounded-md flex items-center justify-center shrink-0 transition-all",
                            isSelected ? "bg-zinc-900 text-white shadow-lg shadow-black/10" : "bg-muted text-muted-foreground",
                          )}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-[15px] font-bold text-foreground">{pkg.name}</h3>
                              {pkg.popular && (
                                <Badge className="text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Phổ biến
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed">{pkg.desc}</p>

                            {/* Features — visible on desktop */}
                            <div className="hidden sm:flex flex-wrap gap-x-4 gap-y-1 mt-3">
                              {pkg.features.map((f, i) => (
                                <span key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                                  <CheckCircle2 className="size-3 text-muted-foreground shrink-0" />
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Price + Stepper — right side */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="text-right">
                            <div className="flex items-baseline gap-0.5">
                              <span className="text-lg sm:text-xl font-bold text-foreground tracking-tighter tabular-nums">{new Intl.NumberFormat('vi-VN').format(pkg.price)}</span>
                              <span className="text-xs font-semibold text-muted-foreground">đ</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">/ người</p>
                          </div>
                          <QtyStepper
                            value={qty}
                            onChange={(v) => setPkgQuantities(prev => ({ ...prev, [pkg.id]: v }))}
                          />
                        </div>
                      </div>

                      {/* Features — mobile only */}
                      <div className="sm:hidden flex flex-wrap gap-x-4 gap-y-1 mt-3 ml-[52px]">
                        {pkg.features.map((f, i) => (
                          <span key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                            <CheckCircle2 className="size-3 text-muted-foreground shrink-0" />
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Note field — shown when qty > 0 */}
                    {isSelected && (
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                        <div className="bg-muted rounded-lg p-3 border border-border space-y-2">
                          <Label className="text-[11px] font-semibold text-muted-foreground">
                            Ghi chú gói này (size in, yêu cầu đặc biệt…)
                          </Label>
                          <p className="text-[11px] text-muted-foreground font-normal">Với size in, khách hàng có thể chọn cụ thể ở mục bên dưới</p>
                          <Textarea
                            value={pkgNotes[pkg.id] || ''}
                            onChange={(e) => setPkgNotes(prev => ({ ...prev, [pkg.id]: e.target.value }))}
                            placeholder={`VD: In vỉ 3x4, ghép áo vest xanh đen...`}
                            className="min-h-[60px] text-xs bg-white border-border rounded-lg resize-none placeholder:text-zinc-300"
                            rows={2}
                          />
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })}
            </CardContent>
          </Card>

          {/* Section 3: Print Options */}
          <Card className="bg-transparent border-0 shadow-none ring-0 p-0">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 px-1 py-0 mb-4 sm:mb-5">
              <div className="w-9 h-9 rounded-md bg-zinc-900 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-white">3</span>
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-bold">Dịch vụ In ấn</CardTitle>
                <CardDescription className="text-[11px] sm:text-xs mt-0.5">Giấy in chính hãng Canon — độ bền lên tới 100 năm</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Card className="overflow-hidden">
              {/* Toggle */}
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-[13px] font-bold text-foreground">
                      Muốn in ảnh cứng
                    </p>
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {totalFreePrints > 0 ? `Bạn đang được tặng ${totalFreePrints} vỉ miễn phí từ các gói đã chọn` : 'Chọn gói dịch vụ để nhận vỉ in miễn phí'}
                    </p>
                  </div>
                  {/* Segmented toggle: Không / Có */}
                  <div className="flex shrink-0 rounded-lg border border-border overflow-hidden text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setWantPrint(false)}
                      className={cn(
                        "px-3.5 py-1.5 transition-colors",
                        !wantPrint ? "bg-zinc-900 text-white" : "bg-white text-muted-foreground hover:bg-muted"
                      )}
                    >
                      Không
                    </button>
                    <button
                      type="button"
                      onClick={() => setWantPrint(true)}
                      className={cn(
                        "px-3.5 py-1.5 transition-colors border-l border-border",
                        wantPrint ? "bg-zinc-900 text-white" : "bg-white text-muted-foreground hover:bg-muted"
                      )}
                    >
                      Có
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLayoutPreview(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border text-[11px] font-semibold text-muted-foreground hover:bg-muted hover:text-zinc-800 transition-colors"
                >
                  <Eye className="size-3.5" />
                  Xem mẫu vỉ ảnh
                </button>

                {/* Layout Preview Dialog */}
                <Dialog open={showLayoutPreview} onOpenChange={setShowLayoutPreview}>
                  <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden" showCloseButton={false}>
                    {/* Sticky header with close button */}
                    <div className="flex items-start justify-between p-4 sm:p-6 pb-3 border-b border-border">
                      <div>
                        <DialogTitle className="text-base font-bold">Các kiểu vỉ in ảnh</DialogTitle>
                        <p className="text-xs text-muted-foreground mt-1">Khổ giấy Canon 10×15 cm — độ bền lên tới 100 năm</p>
                      </div>
                      <DialogClose className="shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center bg-muted hover:bg-muted transition-colors">
                        <X className="size-4 text-muted-foreground" />
                      </DialogClose>
                    </div>
                    {/* Scrollable content */}
                    <div className="max-h-[70vh] overflow-y-auto p-4 sm:p-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {PRINT_SIZES.map(size => (
                          <div key={size.id} className="rounded-md border border-border overflow-hidden">
                            <div className="px-3 py-2 border-b border-border bg-muted">
                              <p className="text-xs font-bold text-foreground">{size.name}</p>
                            </div>
                            <div className="p-2">
                              <PrintLayoutPreview sizeId={size.id} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Print Options Panel */}
              {wantPrint && (
                <div className="border-t border-border p-4 sm:p-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Per-vỉ size selection */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-muted-foreground">Chọn size cho từng vỉ</Label>
                      <span className="text-[11px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{totalViSlots} vỉ</span>
                    </div>

                    {viSizes.map((sizeId, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0",
                          idx < totalFreePrints
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        )}>
                          {idx + 1}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium shrink-0 min-w-[52px]">
                          {viLabels[idx] || ''}
                        </span>
                        <Select value={sizeId} onValueChange={(v) => updateViSize(idx, v)}>
                          <SelectTrigger className="h-9 rounded-lg border-border bg-muted/50 text-xs flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRINT_SIZES.map(size => (
                              <SelectItem key={size.id} value={size.id}>{size.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-[10px] text-muted-foreground font-medium shrink-0 w-16 text-right">
                          {idx < totalFreePrints ? 'Miễn phí' : `+${new Intl.NumberFormat('vi-VN').format(EXTRA_PRINT_PRICE)}đ`}
                        </span>
                      </div>
                    ))}

                    {/* Add extra vỉ */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setExtraViCount(Math.max(0, extraViCount - 1))}
                        disabled={extraViCount === 0}
                        className="px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted disabled:opacity-30 transition-colors"
                      >
                        <MinusIcon className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setExtraViCount(extraViCount + 1)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-1"
                      >
                        <PlusIcon className="size-3" />
                        Thêm vỉ ({new Intl.NumberFormat('vi-VN').format(EXTRA_PRINT_PRICE)}đ/vỉ)
                      </button>
                    </div>
                  </div>

                  {/* Layout Preview — show all vỉ with collapse */}
                  {viSizes.length > 0 && (() => {
                    const visibleSizes = showAllLayouts ? viSizes : viSizes.slice(0, 1)
                    return (
                      <div className="space-y-2">
                        {visibleSizes.map((sizeId, idx) => (
                          <div key={idx} className="bg-muted rounded-md border border-border overflow-hidden">
                            <div className="px-3 py-1.5 bg-muted/50 border-b border-border flex items-center gap-2">
                              <span className="text-[10px] font-bold text-muted-foreground">Vỉ {idx + 1}</span>
                              {viLabels[idx] && <span className="text-[10px] font-medium text-muted-foreground">({viLabels[idx]})</span>}
                            </div>
                            <PrintLayoutPreview sizeId={sizeId} />
                          </div>
                        ))}
                        {viSizes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setShowAllLayouts(!showAllLayouts)}
                            className="w-full text-center py-2 text-[11px] font-semibold text-muted-foreground hover:text-muted-foreground transition-colors"
                          >
                            {showAllLayouts ? '▲ Thu gọn' : `▼ Xem tất cả ${viSizes.length} vỉ`}
                          </button>
                        )}
                      </div>
                    )
                  })()}

                  {/* Cost breakdown */}
                  <div className="bg-muted rounded-lg p-3 sm:p-4 border border-border text-[12px] sm:text-[13px] space-y-2">
                    <div className="flex justify-between items-center text-muted-foreground font-medium">
                      <span>Vỉ in miễn phí (theo gói)</span>
                      <span className="font-bold text-foreground">{totalFreePrints} vỉ</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground font-medium">
                      <span>Vỉ in thêm ({new Intl.NumberFormat('vi-VN').format(EXTRA_PRINT_PRICE)}đ/vỉ)</span>
                      <span className={cn("font-bold", extraPrints > 0 ? "text-foreground" : "text-muted-foreground")}>{extraPrints} vỉ</span>
                    </div>
                    {extraPrints > 0 && (
                      <div className="flex justify-between items-center text-muted-foreground font-medium">
                        <span>Phí in thêm</span>
                        <span className="font-bold text-foreground">+{new Intl.NumberFormat('vi-VN').format(printExtraCost)}đ</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-muted-foreground font-medium">
                      <span>Phí vận chuyển</span>
                      <span className={cn("font-bold", hasFreeShipping ? "text-emerald-600" : "text-foreground")}>
                        {hasFreeShipping ? 'Miễn phí' : `+${new Intl.NumberFormat('vi-VN').format(shippingFee)}đ`}
                      </span>
                    </div>
                  </div>

                  {/* Shipping fee — region selector */}
                  <div className="space-y-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Truck className="size-4 text-muted-foreground" />
                      <Label className="text-xs font-semibold text-muted-foreground">Phí vận chuyển</Label>
                    </div>
                    {hasFreeShipping ? (
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                        <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-bold text-emerald-700">Miễn phí vận chuyển</span>
                        <span className="text-[11px] text-emerald-600 font-medium">(gói 199k/339k)</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Select value={shippingRegion} onValueChange={(v: 'hanoi' | 'other') => setShippingRegion(v)}>
                          <SelectTrigger className="h-10 rounded-lg border-border bg-muted/50 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hanoi">
                              <span className="flex items-center gap-2">
                                <MapPin className="size-3.5 text-muted-foreground" />
                                Hà Nội — {new Intl.NumberFormat('vi-VN').format(SHIPPING_FEE_HANOI)}đ
                              </span>
                            </SelectItem>
                            <SelectItem value="other">
                              <span className="flex items-center gap-2">
                                <MapPin className="size-3.5 text-muted-foreground" />
                                Tỉnh/Thành khác — {new Intl.NumberFormat('vi-VN').format(SHIPPING_FEE_OTHER)}đ
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                      ⏱ Hà Nội: 1–2 ngày · Tỉnh/Thành khác: 2–5 ngày.
                      <br />Có thể chậm hơn trong các dịp lễ, Tết, săn sale.
                    </p>
                  </div>

                  {/* Shipping info — inline, no separate toggle */}
                  <div className="space-y-4 pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Package className="size-4 text-muted-foreground" />
                      <Label className="text-xs font-semibold text-muted-foreground">Thông tin nhận hàng</Label>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const nameEl = document.getElementById('customerName') as HTMLInputElement
                        const phoneEl = document.getElementById('customerPhone') as HTMLInputElement
                        if (shippingName === nameEl?.value && shippingPhone === phoneEl?.value) {
                          // Toggle off — clear fields
                          setShippingName('')
                          setShippingPhone('')
                        } else {
                          if (nameEl?.value) setShippingName(nameEl.value)
                          if (phoneEl?.value) setShippingPhone(phoneEl.value)
                        }
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-lg border transition-all text-xs font-semibold flex items-center gap-2.5",
                        shippingName && shippingPhone
                          ? "bg-zinc-900 border-zinc-900 text-white"
                          : "bg-white border-input text-zinc-700 hover:border-zinc-400 hover:bg-muted active:bg-muted"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                        shippingName && shippingPhone
                          ? "border-white bg-white"
                          : "border-input"
                      )}>
                        {shippingName && shippingPhone && (
                          <CheckCircle2 className="size-4 text-foreground" />
                        )}
                      </div>
                      Cùng thông tin khách hàng bên trên
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground">
                          Tên người nhận <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={shippingName}
                          onChange={(e) => setShippingName(e.target.value)}
                          placeholder="Nguyễn Văn B"
                          required={wantPrint}
                          className="h-10 sm:h-11 rounded-lg border-border focus:border-zinc-400 placeholder:text-zinc-300"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground">
                          SĐT người nhận <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={shippingPhone}
                          onChange={(e) => setShippingPhone(e.target.value)}
                          type="tel"
                          placeholder="09xx xxx xxx"
                          required={wantPrint}
                          className="h-10 sm:h-11 rounded-lg border-border focus:border-zinc-400 placeholder:text-zinc-300"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">
                        Địa chỉ giao hàng <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                        required={wantPrint}
                        className="min-h-[70px] text-xs bg-white border-border rounded-lg resize-none placeholder:text-zinc-300"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              )}
              </Card>
            </CardContent>
          </Card>

          {/* Section 4: Discount — admin only */}
          {isAdmin && (
          <Card className="bg-transparent border-0 shadow-none ring-0 p-0">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 px-1 py-0 mb-4 sm:mb-5">
              <div className="w-9 h-9 rounded-md bg-zinc-900 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-white">4</span>
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-bold">Giảm giá</CardTitle>
                <CardDescription className="text-[11px] sm:text-xs mt-0.5">Nhập mã giảm giá hoặc ưu đãi đặc biệt</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Card className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Type toggle */}
                <div className="flex rounded-lg border border-border overflow-hidden shrink-0 h-10 sm:h-11">
                  <button
                    type="button"
                    onClick={() => setDiscountType('amount')}
                    className={cn(
                      "px-3 sm:px-4 text-xs font-bold transition-all flex items-center gap-1.5",
                      discountType === 'amount'
                        ? "bg-zinc-900 text-white"
                        : "bg-white text-muted-foreground hover:bg-muted"
                    )}
                  >
                    đ
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('percent')}
                    className={cn(
                      "px-3 sm:px-4 text-xs font-bold transition-all flex items-center gap-1.5",
                      discountType === 'percent'
                        ? "bg-zinc-900 text-white"
                        : "bg-white text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Percent className="size-3" />
                  </button>
                </div>

                {/* Value input */}
                <div className="relative flex-1">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder={discountType === 'amount' ? 'Nhập số tiền giảm...' : 'Nhập % giảm (VD: 10)'}
                    value={discountValue ? (discountType === 'amount' ? new Intl.NumberFormat('vi-VN').format(Number(discountValue)) : discountValue) : ''}
                    onChange={(e) => {
                      if (discountType === 'amount') {
                        const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '')
                        setDiscountValue(raw)
                      } else {
                        const raw = e.target.value.replace(/[^0-9.]/g, '')
                        setDiscountValue(raw)
                      }
                    }}
                    className="h-10 sm:h-11 rounded-lg border-border focus:border-zinc-400 placeholder:text-zinc-300 pr-14"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-300 pointer-events-none">
                    {discountType === 'amount' ? 'đ' : '%'}
                  </div>
                </div>
              </div>

              {/* Discount preview */}
              {discountAmount > 0 && (
                <div className="mt-3 flex items-center justify-between px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                    <Tag className="size-3.5" />
                    Giảm giá {discountType === 'percent' ? `${discountValue}%` : ''}
                  </span>
                  <span className="text-sm font-bold text-emerald-800 tabular-nums">
                    -{new Intl.NumberFormat('vi-VN').format(discountAmount)}đ
                  </span>
                </div>
              )}
              </Card>
            </CardContent>
          </Card>
          )}

          {/* Order Summary + Submit */}
          <Card className="sticky bottom-4 z-10 shadow-lg shadow-black/5">
            <CardContent className="px-4 py-3 sm:p-6 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-widest">Tổng cộng (tạm tính)</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-3xl font-bold text-foreground tracking-tighter tabular-nums">
                    {new Intl.NumberFormat('vi-VN').format(totalPrice)}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-muted-foreground">đ</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium truncate">
                  {totalPkgCount > 0 ? `${totalPkgCount} gói` : ''}
                  {wantPrint && totalPrintQty > 0 && `${totalPkgCount > 0 ? ' · ' : ''}${totalPrintQty} vỉ in`}
                  {wantPrint && hasFreeShipping && ' · free ship'}
                  {discountAmount > 0 && (
                    <span className="text-emerald-600 font-semibold"> · -{new Intl.NumberFormat('vi-VN').format(discountAmount)}đ</span>
                  )}
                </p>
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || (totalPkgCount === 0 && !(wantPrint && (totalFreePrints + extraViCount) > 0))}
                className="shrink-0 font-bold text-[13px] h-11 sm:h-12 px-6 sm:px-10 transition-all disabled:opacity-40"
              >
                {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                {isSubmitting ? 'Đang gửi...' : 'Gửi đơn hàng'}
              </Button>
            </CardContent>
          </Card>

        </main>
      </form>
    </div>
  )
}
