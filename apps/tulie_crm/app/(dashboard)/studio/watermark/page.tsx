'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    Upload,
    Download,
    Trash2,
    RefreshCw,
    Sliders,
    Sparkles,
    Image as ImageIcon,
    Check,
    Split,
    Info,
    CheckCircle2,
    Columns2
} from 'lucide-react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Button,
    Input,
    Label,
    Slider,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch
} from '@repo/ui'
import { toast } from 'sonner'

// Type definitions
interface WatermarkConfig {
    text: string;
    pattern: 'grid' | 'center';
    opacity: number;
    fontSize: number;
    rotation: number;
    color: string;
    maxDimension: number;
    quality: number;
    drawSecurityLines: boolean;
}

interface ProcessedResult {
    dataUrl: string;
    width: number;
    height: number;
    sizeBytes: number;
}

interface AfterFile {
    id: string;
    file: File;
    originalImage: HTMLImageElement | null;
    processed: ProcessedResult | null;
}

const createCombinedImage = (
    beforeDataUrl: string,
    afterDataUrl: string
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const imgBefore = new Image()
        imgBefore.onload = () => {
            const imgAfter = new Image()
            imgAfter.onload = () => {
                const hB = imgBefore.naturalHeight || imgBefore.height
                const wB = imgBefore.naturalWidth || imgBefore.width
                const hA = imgAfter.naturalHeight || imgAfter.height
                const wA = imgAfter.naturalWidth || imgAfter.width

                // Scale After image to match the height of Before image
                const scale = hB / hA
                const wA_scaled = Math.round(wA * scale)

                const canvas = document.createElement('canvas')
                const dividerWidth = 4
                canvas.width = wB + wA_scaled + dividerWidth
                canvas.height = hB

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Context error'))
                    return
                }

                // Draw left image (Before)
                ctx.drawImage(imgBefore, 0, 0, wB, hB)

                // Draw divider (white vertical line)
                ctx.fillStyle = '#ffffff'
                ctx.fillRect(wB, 0, dividerWidth, hB)

                // Draw right image (After)
                ctx.drawImage(imgAfter, wB + dividerWidth, 0, wA_scaled, hB)

                // Draw labels: "TRƯỚC (ẢNH GỐC)" and "SAU (DEMO BẢO VỆ)"
                const fontSize = Math.max(14, Math.round(hB * 0.025))
                ctx.font = `bold ${fontSize}px Inter, "Segoe UI", sans-serif`
                ctx.textBaseline = 'top'
                
                const padding = 10
                const tagMargin = Math.max(10, Math.round(hB * 0.02))

                // Left Label
                const textB = 'TRƯỚC (ẢNH GỐC)'
                const textB_width = ctx.measureText(textB).width
                ctx.fillStyle = 'rgba(0, 0, 0, 0.65)'
                ctx.fillRect(tagMargin, tagMargin, textB_width + padding * 2, fontSize + padding * 2)
                ctx.fillStyle = '#ffffff'
                ctx.fillText(textB, tagMargin + padding, tagMargin + padding)

                // Right Label
                const textA = 'SAU (DEMO BẢO VỆ)'
                const textA_width = ctx.measureText(textA).width
                ctx.fillStyle = 'rgba(239, 68, 68, 0.85)'
                ctx.fillRect(wB + dividerWidth + tagMargin, tagMargin, textA_width + padding * 2, fontSize + padding * 2)
                ctx.fillStyle = '#ffffff'
                ctx.fillText(textA, wB + dividerWidth + tagMargin + padding, tagMargin + padding)

                resolve(canvas.toDataURL('image/jpeg', 0.85))
            }
            imgAfter.onerror = () => reject(new Error('Failed to load after image'))
            imgAfter.src = afterDataUrl
        }
        imgBefore.onerror = () => reject(new Error('Failed to load before image'))
        imgBefore.src = beforeDataUrl
    })
}

export default function WatermarkToolPage() {
    // ----------------------------------------------------
    // Watermark Configuration State
    // ----------------------------------------------------
    const [config, setConfig] = useState<WatermarkConfig>({
        text: 'DEMO',
        pattern: 'grid',
        opacity: 0.15,
        fontSize: 24,
        rotation: -30,
        color: '#ffffff',
        maxDimension: 1200, // max width/height in px
        quality: 0.70,      // JPEG quality
        drawSecurityLines: true,
    })

    // ----------------------------------------------------
    // Files State
    // ----------------------------------------------------
    const [beforeFile, setBeforeFile] = useState<File | null>(null)
    const [beforeOriginalImage, setBeforeOriginalImage] = useState<HTMLImageElement | null>(null)
    const [beforeProcessed, setBeforeProcessed] = useState<ProcessedResult | null>(null)

    const [afterFiles, setAfterFiles] = useState<AfterFile[]>([])
    const [activeAfterId, setActiveAfterId] = useState<string | null>(null)

    const [isProcessing, setIsProcessing] = useState(false)
    const [activeTab, setActiveTab] = useState<'slider' | 'side-by-side' | 'result'>('slider')

    // Ref to prevent duplicate processing triggers
    const isProcessingRef = useRef(false)

    // Helper to format bytes to human readable format
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    // ----------------------------------------------------
    // Load File into HTMLImageElement (Cached)
    // ----------------------------------------------------
    const loadImage = (file: File): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                const img = new Image()
                img.onload = () => resolve(img)
                img.onerror = () => reject(new Error('Không thể tải ảnh'))
                img.src = e.target?.result as string
            }
            reader.onerror = () => reject(new Error('Không thể đọc file'))
            reader.readAsDataURL(file)
        })
    }

    // ----------------------------------------------------
    // Core Canvas Image Processing
    // ----------------------------------------------------
    const processSingleImage = (
        img: HTMLImageElement,
        config: WatermarkConfig
    ): ProcessedResult => {
        let width = img.naturalWidth || img.width
        let height = img.naturalHeight || img.height

        // Calculate resizing scaling factor
        if (config.maxDimension > 0) {
            if (width > config.maxDimension || height > config.maxDimension) {
                if (width > height) {
                    height = Math.round((height * config.maxDimension) / width)
                    width = config.maxDimension
                } else {
                    width = Math.round((width * config.maxDimension) / height)
                    height = config.maxDimension
                }
            }
        }

        // Setup Canvas
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
            throw new Error('Canvas 2D context not supported')
        }

        // Draw downscaled original image
        ctx.drawImage(img, 0, 0, width, height)

        // Setup watermark text settings
        ctx.save()
        // Center watermark has a larger font size compared to repeated tiled grid watermarks
        const actualFontSize = config.pattern === 'center' ? config.fontSize * 2.2 : config.fontSize
        ctx.font = `bold ${actualFontSize}px Inter, "Segoe UI", sans-serif`
        ctx.globalAlpha = config.opacity
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'

        // Elegant text effect: Fill with pure color and draw soft drop shadow to contrast on light areas
        ctx.fillStyle = config.color
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetX = 1.5
        ctx.shadowOffsetY = 1.5

        const angleRad = (config.rotation * Math.PI) / 180

        if (config.pattern === 'center') {
            // Draw single center watermark
            ctx.translate(width / 2, height / 2)
            ctx.rotate(angleRad)
            ctx.fillText(config.text, 0, 0)
        } else {
            // Tiled/Grid pattern
            const stepX = Math.max(120, config.fontSize * 7)
            const stepY = Math.max(120, config.fontSize * 5)
            
            // Translate to center for rotation
            ctx.translate(width / 2, height / 2)
            ctx.rotate(angleRad)

            // Cover larger area to account for rotation corners
            const bounds = Math.max(width, height) * 2.5
            for (let x = -bounds / 2; x < bounds / 2; x += stepX) {
                for (let y = -bounds / 2; y < bounds / 2; y += stepY) {
                    ctx.fillText(config.text, x, y)
                }
            }
        }
        ctx.restore()

        // Draw security wavy lines to block AI removal if enabled
        if (config.drawSecurityLines) {
            ctx.save()
            const lineSpacing = 140
            
            // Grid 1: Vertical wavy lines (contrasting color stroke)
            ctx.strokeStyle = config.color === '#ffffff' ? '#000000' : '#ffffff'
            ctx.lineWidth = 0.6
            ctx.globalAlpha = config.opacity * 0.4
            
            for (let offset = -height; offset < width + height; offset += lineSpacing) {
                ctx.beginPath()
                for (let y = 0; y <= height; y += 15) {
                    const x = offset + Math.sin(y / 60) * 30
                    if (y === 0) {
                        ctx.moveTo(x, y)
                    } else {
                        ctx.lineTo(x, y)
                    }
                }
                ctx.stroke()
            }
            
            // Grid 2: Horizontal wavy lines (original color stroke)
            ctx.strokeStyle = config.color
            ctx.lineWidth = 0.6
            ctx.globalAlpha = config.opacity * 0.3
            
            for (let offset = -width; offset < height + width; offset += lineSpacing) {
                ctx.beginPath()
                for (let x = 0; x <= width; x += 15) {
                    const y = offset + Math.cos(x / 60) * 30
                    if (x === 0) {
                        ctx.moveTo(x, y)
                    } else {
                        ctx.lineTo(x, y)
                    }
                }
                ctx.stroke()
            }
            ctx.restore()
        }

        // Generate JPEG low-res URL
        const dataUrl = canvas.toDataURL('image/jpeg', config.quality)
        
        // Approximate byte size
        const base64Length = dataUrl.length - 'data:image/jpeg;base64,'.length
        const sizeBytes = Math.round((base64Length * 3) / 4)

        return {
            dataUrl,
            width,
            height,
            sizeBytes
        }
    }

    // ----------------------------------------------------
    // Reprocess All Images
    // ----------------------------------------------------
    const reprocessImages = async (
        bImg: HTMLImageElement | null,
        aFiles: AfterFile[],
        cfg: WatermarkConfig
    ) => {
        if (isProcessingRef.current) return
        isProcessingRef.current = true
        setIsProcessing(true)

        try {
            // 1. Process "Before" image
            let bProcessed: ProcessedResult | null = null
            if (bImg) {
                bProcessed = processSingleImage(bImg, cfg)
                setBeforeProcessed(bProcessed)
            }

            // 2. Process all "After" images
            const updatedAfterFiles = aFiles.map((item) => {
                if (item.originalImage) {
                    try {
                        const processed = processSingleImage(item.originalImage, cfg)
                        return { ...item, processed }
                    } catch (err) {
                        console.error('Lỗi khi xử lý ảnh after:', err)
                        return item
                    }
                }
                return item
            })

            setAfterFiles(updatedAfterFiles)
        } catch (error) {
            console.error('Lỗi khi đóng dấu ảnh:', error)
            toast.error('Có lỗi xảy ra khi đóng dấu ảnh')
        } finally {
            setIsProcessing(false)
            isProcessingRef.current = false
        }
    }

    // Trigger re-processing when configuration changes
    useEffect(() => {
        reprocessImages(beforeOriginalImage, afterFiles, config)
    }, [config])

    // ----------------------------------------------------
    // File Handlers
    // ----------------------------------------------------
    const handleBeforeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const loadingId = toast.loading('Đang xử lý ảnh gốc...')
        try {
            const img = await loadImage(file)
            setBeforeFile(file)
            setBeforeOriginalImage(img)
            
            const processed = processSingleImage(img, config)
            setBeforeProcessed(processed)
            toast.success('Đã tải lên ảnh gốc', { id: loadingId })
        } catch (err) {
            toast.error('Lỗi khi tải ảnh gốc', { id: loadingId })
        }
    }

    const handleAfterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        const loadingId = toast.loading(`Đang tải lên ${files.length} ảnh demo...`)
        try {
            const newAfters: AfterFile[] = []
            
            for (const file of files) {
                const img = await loadImage(file)
                const processed = processSingleImage(img, config)
                const id = Math.random().toString(36).substring(2, 9)
                newAfters.push({
                    id,
                    file,
                    originalImage: img,
                    processed
                })
            }

            setAfterFiles((prev) => {
                const combined = [...prev, ...newAfters]
                // Auto-select first active After if none selected
                if (!activeAfterId && combined.length > 0) {
                    setActiveAfterId(combined[0].id)
                }
                return combined
            })
            
            toast.success(`Đã thêm ${files.length} ảnh demo`, { id: loadingId })
        } catch (err) {
            toast.error('Có lỗi xảy ra khi tải ảnh demo', { id: loadingId })
        }
    }

    const replaceAfterFile = async (id: string, file: File) => {
        const loadingId = toast.loading('Đang thay thế ảnh...')
        try {
            const img = await loadImage(file)
            const processed = processSingleImage(img, config)
            
            setAfterFiles(prev => prev.map(item => {
                if (item.id === id) {
                    return {
                        ...item,
                        file,
                        originalImage: img,
                        processed
                    }
                }
                return item
            }))
            toast.success('Đã thay thế ảnh thành công', { id: loadingId })
        } catch (err) {
            toast.error('Lỗi khi thay thế ảnh', { id: loadingId })
        }
    }

    const deleteAfterFile = (id: string) => {
        setAfterFiles((prev) => {
            const filtered = prev.filter(item => item.id !== id)
            if (activeAfterId === id) {
                setActiveAfterId(filtered.length > 0 ? filtered[0].id : null)
            }
            return filtered
        })
        toast.info('Đã xóa ảnh demo')
    }

    // ----------------------------------------------------
    // Downloader Actions
    // ----------------------------------------------------
    const downloadSingleFile = (dataUrl: string, originalName: string, prefix: string) => {
        const link = document.createElement('a')
        link.href = dataUrl
        // Change file extension to .jpg since it is exported as image/jpeg
        const cleanName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName
        link.download = `${prefix}_${cleanName}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleDownloadAll = async () => {
        if (afterFiles.length === 0) {
            toast.error('Không có ảnh demo để tải xuống')
            return
        }

        const toastId = toast.loading('Đang chuẩn bị tải xuống toàn bộ...')
        let count = 0

        if (activeTab === 'side-by-side') {
            if (!beforeProcessed) {
                toast.error('Cần tải lên ảnh gốc để tạo ảnh song song', { id: toastId })
                return
            }
            // Download combined side-by-side comparisons
            for (let i = 0; i < afterFiles.length; i++) {
                const item = afterFiles[i]
                if (item.processed) {
                    try {
                        await new Promise(resolve => setTimeout(resolve, 250))
                        const combinedUrl = await createCombinedImage(beforeProcessed.dataUrl, item.processed.dataUrl)
                        downloadSingleFile(combinedUrl, item.file.name, `combined_compare_${i + 1}`)
                        count++
                    } catch (err) {
                        console.error('Lỗi khi ghép ảnh song song:', err)
                    }
                }
            }
        } else {
            // Download individual processed images
            if (beforeProcessed && beforeFile) {
                downloadSingleFile(beforeProcessed.dataUrl, beforeFile.name, 'watermarked_before')
                count++
            }

            for (let i = 0; i < afterFiles.length; i++) {
                const item = afterFiles[i]
                if (item.processed) {
                    await new Promise(resolve => setTimeout(resolve, 200))
                    downloadSingleFile(item.processed.dataUrl, item.file.name, `watermarked_demo_${i + 1}`)
                    count++
                }
            }
        }

        toast.success(`Đã tải xuống thành công ${count} tệp!`, { id: toastId })
    }

    // Active after image selected for slider
    const activeAfterItem = afterFiles.find(item => item.id === activeAfterId) || null

    return (
        <div className="space-y-6 pb-12">
            {/* Header section */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80">
                        <Link href="/studio">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold flex items-center gap-3">
                            <Split className="h-5 w-5 text-rose-500" />
                            Đóng dấu & so sánh ảnh
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Giảm dung lượng độ phân giải, chèn watermark bảo vệ và so sánh before/after cho khách hàng chọn.
                        </p>
                    </div>
                </div>
                {afterFiles.length > 0 && (
                    <Button 
                        onClick={handleDownloadAll} 
                        className="bg-gradient-to-tr from-rose-500 to-orange-500 text-white border-none hover:opacity-90 transition-all shadow-sm rounded-md"
                    >
                        <Download className="mr-2 h-4 w-4" /> Tải xuống tất cả ({afterFiles.length + (beforeFile ? 1 : 0)})
                    </Button>
                )}
            </div>

            {/* Main content grid */}
            <div className="grid gap-6 lg:grid-cols-12">
                
                {/* LEFT: Configuration & Upload panels */}
                <div className="lg:col-span-5 space-y-6">
                    
                    {/* Panel 1: Upload Images */}
                    <Card glow="coral" className="border-peach-tint">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Upload className="h-4 w-4 text-rose-500" /> Tải ảnh lên
                            </CardTitle>
                            <CardDescription>
                                Thêm 1 ảnh gốc và nhiều ảnh after để so sánh
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            
                            {/* Upload BEFORE File */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground">
                                    1. Ảnh gốc trước khi sửa (Before)
                                </Label>
                                {beforeFile ? (
                                    <div className="flex items-center justify-between p-3 rounded-xl border border-dashed bg-muted/30">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="h-10 w-10 bg-zinc-900 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                                                {beforeProcessed ? (
                                                    <img src={beforeProcessed.dataUrl} className="h-full w-full object-cover" alt="Before thumbnail" />
                                                ) : (
                                                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-xs font-medium truncate max-w-[180px]">{beforeFile.name}</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {beforeOriginalImage ? `${beforeOriginalImage.width}x${beforeOriginalImage.height}` : ''} • {formatBytes(beforeFile.size)}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full shrink-0"
                                            onClick={() => {
                                                setBeforeFile(null)
                                                setBeforeOriginalImage(null)
                                                setBeforeProcessed(null)
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="relative border border-dashed rounded-xl p-4 flex flex-col items-center justify-center bg-muted/10 hover:bg-muted/20 transition-all cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleBeforeUpload}
                                        />
                                        <Upload className="h-6 w-6 text-muted-foreground mb-1.5" />
                                        <span className="text-xs font-medium">Tải ảnh gốc (Before)</span>
                                        <span className="text-[10px] text-muted-foreground mt-0.5">JPG, PNG, WEBP</span>
                                    </div>
                                )}
                            </div>

                            {/* Upload AFTER Files */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground">
                                    2. Ảnh demo sau khi sửa (After - Nhiều option)
                                </Label>
                                
                                <div className="relative border border-dashed rounded-xl p-4 flex flex-col items-center justify-center bg-muted/10 hover:bg-muted/20 transition-all cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleAfterUpload}
                                    />
                                    <Upload className="h-6 w-6 text-muted-foreground mb-1.5" />
                                    <span className="text-xs font-medium">Tải thêm ảnh demo (After)</span>
                                    <span className="text-[10px] text-muted-foreground mt-0.5">Có thể chọn nhiều tệp cùng lúc</span>
                                </div>

                                {/* List of After files */}
                                {afterFiles.length > 0 && (
                                    <div className="space-y-2 mt-3 max-h-[220px] overflow-y-auto pr-1">
                                        {afterFiles.map((item, idx) => {
                                            const isActive = item.id === activeAfterId
                                            return (
                                                <div 
                                                    key={item.id}
                                                    onClick={() => setActiveAfterId(item.id)}
                                                    className={`group/item flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                                                        isActive 
                                                            ? 'border-rose-500 bg-rose-500/5 ring-1 ring-rose-500/20' 
                                                            : 'border-border bg-card hover:bg-muted/10'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                                        <div className="h-9 w-9 bg-zinc-900 rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative">
                                                            {item.processed ? (
                                                                <img src={item.processed.dataUrl} className="h-full w-full object-cover" alt="After thumbnail" />
                                                            ) : (
                                                                <ImageIcon className="h-4.5 w-4.5 text-muted-foreground" />
                                                            )}
                                                            <div className="absolute top-0 left-0 bg-black/60 text-[9px] text-white px-1 font-mono rounded-br">
                                                                #{idx + 1}
                                                            </div>
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="text-xs font-medium truncate max-w-[160px]">{item.file.name}</p>
                                                            <p className="text-[9px] text-muted-foreground">
                                                                {item.originalImage ? `${item.originalImage.width}x${item.originalImage.height}` : ''} • {formatBytes(item.file.size)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover/item:opacity-100 transition-opacity">
                                                        {/* Replace Button */}
                                                        <div className="relative">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 rounded-full text-muted-foreground hover:bg-muted"
                                                                asChild
                                                            >
                                                                <label className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                                                    <RefreshCw className="h-3.5 w-3.5" />
                                                                    <input 
                                                                        type="file" 
                                                                        accept="image/*" 
                                                                        className="hidden" 
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0]
                                                                            if (file) replaceAfterFile(item.id, file)
                                                                        }} 
                                                                    />
                                                                </label>
                                                            </Button>
                                                        </div>
                                                        {/* Delete Button */}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 rounded-full text-destructive hover:bg-destructive/10"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                deleteAfterFile(item.id)
                                                            }}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                        </CardContent>
                    </Card>

                    {/* Panel 2: Watermark & Output Settings */}
                    <Card glow="blue" className="border-blue-100">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Sliders className="h-4 w-4 text-blue-500" /> Cấu hình Watermark & Giảm chất lượng
                            </CardTitle>
                            <CardDescription>
                                Điều chỉnh thông số đóng dấu đè và bảo vệ độ phân giải
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            
                            {/* Watermark Text */}
                            <div className="space-y-1.5">
                                <Label htmlFor="wm-text" className="text-xs font-medium">Chữ Watermark</Label>
                                <Input
                                    id="wm-text"
                                    value={config.text}
                                    onChange={(e) => setConfig(prev => ({ ...prev, text: e.target.value.toUpperCase() }))}
                                    placeholder="Vd: TULIE STUDIO"
                                    className="h-9"
                                />
                            </div>

                            {/* Watermark Pattern */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Kiểu chèn</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant={config.pattern === 'grid' ? 'default' : 'outline'}
                                        size="sm"
                                        className="h-8 text-xs font-medium"
                                        onClick={() => setConfig(prev => ({ ...prev, pattern: 'grid' }))}
                                    >
                                        <Sparkles className="mr-1 h-3.5 w-3.5 text-rose-500" /> Lưới lặp lại (Khuyên dùng)
                                    </Button>
                                    <Button
                                        variant={config.pattern === 'center' ? 'default' : 'outline'}
                                        size="sm"
                                        className="h-8 text-xs font-medium"
                                        onClick={() => setConfig(prev => ({ ...prev, pattern: 'center' }))}
                                    >
                                        <ImageIcon className="mr-1 h-3.5 w-3.5" /> Giữa ảnh
                                    </Button>
                                </div>
                            </div>

                            {/* Anti-AI Grid Lines Option */}
                            <div className="flex items-center justify-between p-3 rounded-2xl border bg-muted/10">
                                <div className="space-y-0.5 pr-2">
                                    <Label htmlFor="wm-security" className="text-xs font-semibold">Lưới bảo vệ chống AI xóa</Label>
                                    <p className="text-[10px] text-muted-foreground leading-normal">
                                        Vẽ các nét lưới mảnh cắt ngang toàn bộ ảnh, phá vỡ cấu trúc điểm ảnh khiến các công cụ AI (Photoshop, Magic Eraser) không thể tái tạo lại vùng ảnh gốc.
                                    </p>
                                </div>
                                <Switch
                                    id="wm-security"
                                    checked={config.drawSecurityLines}
                                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, drawSecurityLines: checked }))}
                                />
                            </div>

                            {/* Watermark Opacity Slider */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                    <Label className="font-medium">Độ mờ watermark</Label>
                                    <span className="font-mono text-muted-foreground">{Math.round(config.opacity * 100)}%</span>
                                </div>
                                <Slider
                                    value={[config.opacity * 100]}
                                    onValueChange={(val) => setConfig(prev => ({ ...prev, opacity: (val[0] ?? 15) / 100 }))}
                                    min={5}
                                    max={50}
                                    step={1}
                                />
                            </div>

                            {/* Font Size Slider */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                    <Label className="font-medium">Kích thước chữ</Label>
                                    <span className="font-mono text-muted-foreground">{config.fontSize}px</span>
                                </div>
                                <Slider
                                    value={[config.fontSize]}
                                    onValueChange={(val) => setConfig(prev => ({ ...prev, fontSize: val[0] ?? 24 }))}
                                    min={12}
                                    max={48}
                                    step={1}
                                />
                            </div>

                            {/* Rotation angle */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                    <Label className="font-medium">Độ xoay chữ</Label>
                                    <span className="font-mono text-muted-foreground">{config.rotation}°</span>
                                </div>
                                <Slider
                                    value={[config.rotation]}
                                    onValueChange={(val) => setConfig(prev => ({ ...prev, rotation: val[0] ?? -30 }))}
                                    min={-90}
                                    max={90}
                                    step={5}
                                />
                            </div>

                            <div className="h-px bg-border my-4" />

                            {/* Protect options: Max Resolution */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Độ phân giải tối đa (Khống chế kích thước)</Label>
                                <Select
                                    value={config.maxDimension.toString()}
                                    onValueChange={(val) => setConfig(prev => ({ ...prev, maxDimension: parseInt(val) }))}
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Chọn độ phân giải tối đa" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="800">800px (Chất lượng thấp - An toàn nhất)</SelectItem>
                                        <SelectItem value="1000">1000px (Xem rõ nét, chống tải dùng tốt)</SelectItem>
                                        <SelectItem value="1200">1200px (Tiêu chuẩn - Khuyên dùng)</SelectItem>
                                        <SelectItem value="1600">1600px (Độ nét cao - Thích hợp xem chi tiết)</SelectItem>
                                        <SelectItem value="0">Giữ nguyên độ phân giải gốc</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* JPEG Quality */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Chất lượng lưu (Nén dung lượng)</Label>
                                <Select
                                    value={(config.quality * 100).toString()}
                                    onValueChange={(val) => setConfig(prev => ({ ...prev, quality: parseInt(val) / 100 }))}
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Chọn chất lượng JPEG" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="50">50% (Dung lượng siêu nhẹ - Tải siêu nhanh)</SelectItem>
                                        <SelectItem value="60">60% (Dung lượng rất nhẹ - Đạt yêu cầu)</SelectItem>
                                        <SelectItem value="70">70% (Tiêu chuẩn - Khuyên dùng)</SelectItem>
                                        <SelectItem value="85">85% (Chất lượng khá)</SelectItem>
                                        <SelectItem value="95">95% (Chất lượng cao nhất - Nặng nhất)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                        </CardContent>
                    </Card>

                </div>

                {/* RIGHT: Slider Preview & Comparison panel */}
                <div className="lg:col-span-7 space-y-6">
                    
                    {/* View mode toggle */}
                    <div className="flex bg-muted/40 p-1 rounded-lg w-fit border border-border">
                        <Button 
                            variant={activeTab === 'slider' ? 'default' : 'ghost'} 
                            size="sm" 
                            className="h-8 text-xs rounded-md"
                            onClick={() => setActiveTab('slider')}
                        >
                            <Split className="mr-1.5 h-3.5 w-3.5" /> Thanh trượt so sánh
                        </Button>
                        <Button 
                            variant={activeTab === 'side-by-side' ? 'default' : 'ghost'} 
                            size="sm" 
                            className="h-8 text-xs rounded-md"
                            onClick={() => setActiveTab('side-by-side')}
                        >
                            <Columns2 className="mr-1.5 h-3.5 w-3.5" /> Xem song song
                        </Button>
                        <Button 
                            variant={activeTab === 'result' ? 'default' : 'ghost'} 
                            size="sm" 
                            className="h-8 text-xs rounded-md"
                            onClick={() => setActiveTab('result')}
                        >
                            <ImageIcon className="mr-1.5 h-3.5 w-3.5" /> Xem ảnh demo tải về
                        </Button>
                    </div>

                    <Card glow="violet" className="border-zinc-200">
                        <CardContent className="p-4 sm:p-6">
                            
                            {/* Loading state indicator */}
                            {isProcessing && (
                                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl">
                                    <div className="flex flex-col items-center gap-3">
                                        <RefreshCw className="h-8 w-8 animate-spin text-rose-500" />
                                        <p className="text-sm font-medium">Đang xử lý ảnh...</p>
                                    </div>
                                </div>
                            )}

                            {/* View 1: Slider Mode */}
                            {activeTab === 'slider' && (
                                <div className="space-y-4">
                                    {beforeFile && activeAfterItem?.processed ? (
                                        <div className="space-y-3">
                                            <BeforeAfterSlider
                                                beforeUrl={beforeProcessed?.dataUrl || URL.createObjectURL(beforeFile)}
                                                afterUrl={activeAfterItem.processed.dataUrl}
                                                beforeLabel="Trước (Ảnh gốc)"
                                                afterLabel={`Sau (Watermark • ${activeAfterItem.processed.width}x${activeAfterItem.processed.height})`}
                                            />
                                            <p className="text-center text-xs text-muted-foreground italic flex items-center justify-center gap-1.5">
                                                <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                                Nhấp chuột và kéo thanh trượt ở giữa sang trái/phải để so sánh ảnh gốc với ảnh đã ghép có watermark.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="aspect-[4/3] w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center bg-muted/10 p-6 text-center">
                                            <Split className="h-10 w-10 text-muted-foreground/60 mb-3" />
                                            <h3 className="font-semibold text-sm mb-1">Chưa đủ ảnh để so sánh</h3>
                                            <p className="text-xs text-muted-foreground max-w-sm">
                                                Bạn cần tải lên <strong>ít nhất 1 ảnh gốc (Before)</strong> và <strong>ít nhất 1 ảnh sau khi sửa (After)</strong> để sử dụng trình so sánh thanh trượt.
                                            </p>
                                            <div className="mt-4 flex gap-2">
                                                {!beforeFile && (
                                                    <div className="relative">
                                                        <Button variant="outline" size="sm" className="h-8 text-xs relative overflow-hidden pointer-events-none">
                                                            Tải ảnh gốc
                                                        </Button>
                                                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleBeforeUpload} />
                                                    </div>
                                                )}
                                                {afterFiles.length === 0 && (
                                                    <div className="relative">
                                                        <Button variant="outline" size="sm" className="h-8 text-xs relative overflow-hidden pointer-events-none">
                                                            Tải ảnh demo
                                                        </Button>
                                                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleAfterUpload} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* View 2: Side-by-side Mode */}
                            {activeTab === 'side-by-side' && (
                                <div className="space-y-4">
                                    {beforeFile && activeAfterItem?.processed ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <span className="text-xs font-semibold text-muted-foreground block text-center md:text-left">
                                                        Ảnh gốc (Before)
                                                    </span>
                                                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border bg-zinc-950/20 shadow-inner">
                                                        <img 
                                                            src={beforeProcessed?.dataUrl || URL.createObjectURL(beforeFile)} 
                                                            alt="Before comparison"
                                                            className="w-full h-full object-contain pointer-events-none select-none"
                                                            draggable={false}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <span className="text-xs font-semibold text-rose-500 block text-center md:text-left">
                                                        Ảnh demo đã bảo vệ (After)
                                                    </span>
                                                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border bg-zinc-950/20 shadow-inner">
                                                        <img 
                                                            src={activeAfterItem.processed.dataUrl} 
                                                            alt="After comparison"
                                                            className="w-full h-full object-contain pointer-events-none select-none"
                                                            draggable={false}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-center text-xs text-muted-foreground italic flex items-center justify-center gap-1.5">
                                                <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                                Giao diện xem song song giúp khách hàng dễ dàng đối chiếu trực tiếp sự thay đổi giữa hai hình ảnh.
                                            </p>
                                            <div className="flex justify-end gap-2 mt-2">
                                                <Button 
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={async () => {
                                                        if (!beforeProcessed || !activeAfterItem?.processed) return
                                                        const loadingId = toast.loading('Đang ghép ảnh song song...')
                                                        try {
                                                            const combinedUrl = await createCombinedImage(beforeProcessed.dataUrl, activeAfterItem.processed.dataUrl)
                                                            downloadSingleFile(combinedUrl, activeAfterItem.file.name, 'combined_compare')
                                                            toast.success('Đã tải ảnh song song thành công', { id: loadingId })
                                                        } catch (err) {
                                                            toast.error('Lỗi khi tạo ảnh song song', { id: loadingId })
                                                        }
                                                    }}
                                                >
                                                    <Download className="mr-1.5 h-3.5 w-3.5" /> Tải ảnh ghép song song này
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="aspect-[4/3] w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center bg-muted/10 p-6 text-center">
                                            <Columns2 className="h-10 w-10 text-muted-foreground/60 mb-3" />
                                            <h3 className="font-semibold text-sm mb-1">Chưa đủ ảnh để xem song song</h3>
                                            <p className="text-xs text-muted-foreground max-w-sm">
                                                Bạn cần tải lên <strong>ít nhất 1 ảnh gốc (Before)</strong> và <strong>ít nhất 1 ảnh sau khi sửa (After)</strong> để sử dụng chế độ xem song song.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* View 3: Result/Processed View */}
                            {activeTab === 'result' && (
                                <div className="space-y-4">
                                    {activeAfterItem?.processed ? (
                                        <div className="space-y-4">
                                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border bg-zinc-900/40">
                                                <img 
                                                    src={activeAfterItem.processed.dataUrl} 
                                                    alt="Watermarked Demo Result" 
                                                    className="w-full h-full object-contain"
                                                />
                                                <div className="absolute bottom-3 right-3 bg-black/60 px-3 py-1.5 rounded-lg text-[10px] text-white backdrop-blur-sm flex flex-col gap-0.5">
                                                    <span className="font-semibold">Kích thước demo:</span>
                                                    <span>{activeAfterItem.processed.width} x {activeAfterItem.processed.height} px</span>
                                                    <span>Dung lượng: {formatBytes(activeAfterItem.processed.sizeBytes)}</span>
                                                </div>
                                            </div>
                                            
                                            {/* Size comparison statistics card */}
                                            <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl border bg-muted/20">
                                                <div>
                                                    <span className="text-[10px] text-muted-foreground font-semibold">Ảnh gốc</span>
                                                    <p className="text-sm font-semibold mt-0.5 truncate">{formatBytes(activeAfterItem.file.size)}</p>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">Chưa có dấu</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-muted-foreground font-semibold">Ảnh demo đã nén</span>
                                                    <p className="text-sm font-semibold text-rose-500 mt-0.5 truncate">{formatBytes(activeAfterItem.processed.sizeBytes)}</p>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">Đã chèn watermark</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-muted-foreground font-semibold">Mức độ bảo vệ</span>
                                                    <p className="text-sm font-semibold text-emerald-500 mt-0.5">
                                                        -{Math.round(((activeAfterItem.file.size - activeAfterItem.processed.sizeBytes) / activeAfterItem.file.size) * 100)}%
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">Giảm dung lượng tệp</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 justify-end">
                                                <Button 
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => downloadSingleFile(activeAfterItem.processed!.dataUrl, activeAfterItem.file.name, 'watermarked_demo')}
                                                >
                                                    <Download className="mr-1.5 h-3.5 w-3.5" /> Tải ảnh này về
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="aspect-[4/3] w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center bg-muted/10 p-6 text-center">
                                            <ImageIcon className="h-10 w-10 text-muted-foreground/60 mb-3" />
                                            <h3 className="font-semibold text-sm mb-1">Chưa có ảnh demo để xem trước</h3>
                                            <p className="text-xs text-muted-foreground max-w-sm">
                                                Hãy tải ảnh demo lên để hệ thống xử lý đóng dấu đè và hiển thị bản xem trước ảnh sẽ tải về.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </CardContent>
                    </Card>

                    {/* Quick Guide card */}
                    <Card size="sm" className="border-zinc-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                Quy trình bảo vệ ảnh demo của Tulie Studio
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground space-y-2">
                            <p>
                                1. <strong className="font-semibold">Ảnh gốc (Before)</strong>: Tải lên hình ảnh khách hàng chưa được chỉnh sửa trang phục/vóc dáng.
                            </p>
                            <p>
                                2. <strong className="font-semibold">Ảnh demo (After)</strong>: Tải lên nhiều phương án sau khi ghép áo. Bạn có thể nhấn vào biểu tượng <RefreshCw className="inline h-3 w-3 mx-0.5" /> ở từng hàng để thay đổi nhanh từng áo.
                            </p>
                            <p>
                                3. <strong className="font-semibold">Cấu hình & Tải về</strong>: Khống chế độ phân giải ở mức <strong>1000px</strong> hoặc <strong>1200px</strong> và đóng dấu <strong>Lưới lặp lại</strong> sẽ làm bức ảnh bị vỡ khi phóng to và không thể chỉnh sửa xóa chữ đè, giúp tránh khách hàng tự ý tải ảnh demo về sử dụng.
                            </p>
                        </CardContent>
                    </Card>

                </div>

            </div>
        </div>
    )
}

// ----------------------------------------------------
// BeforeAfterSlider Inner Component
// ----------------------------------------------------
interface BeforeAfterSliderProps {
    beforeUrl: string;
    afterUrl: string;
    beforeLabel?: string;
    afterLabel?: string;
}

function BeforeAfterSlider({
    beforeUrl,
    afterUrl,
    beforeLabel = 'Trước',
    afterLabel = 'Sau'
}: BeforeAfterSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50) // 0 to 100
    const [isDragging, setIsDragging] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleMove = (clientX: number) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const x = clientX - rect.left
        const position = Math.max(0, Math.min(100, (x / rect.width) * 100))
        setSliderPosition(position)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return
        handleMove(e.clientX)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return
        if (e.touches[0]) {
            handleMove(e.touches[0].clientX)
        }
    }

    useEffect(() => {
        const handleMouseUp = () => setIsDragging(false)
        window.addEventListener('mouseup', handleMouseUp)
        window.addEventListener('touchend', handleMouseUp)
        
        return () => {
            window.removeEventListener('mouseup', handleMouseUp)
            window.removeEventListener('touchend', handleMouseUp)
        }
    }, [isDragging])

    return (
        <div
            ref={containerRef}
            className="relative select-none overflow-hidden aspect-[4/3] w-full rounded-3xl border border-zinc-200 bg-zinc-950 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] cursor-ew-resize"
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
        >
            {/* Before Image (underneath) */}
            <img
                src={beforeUrl}
                alt="Before"
                className="absolute inset-0 h-full w-full object-contain pointer-events-none select-none bg-zinc-950/20"
                draggable={false}
            />
            <div className="absolute bottom-4 left-4 z-20 rounded-xl bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md border border-white/10 shadow-sm pointer-events-none">
                {beforeLabel}
            </div>

            {/* After Image (on top, width-clipped) */}
            <div
                className="absolute inset-y-0 left-0 right-0 overflow-hidden pointer-events-none select-none"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
            >
                <img
                    src={afterUrl}
                    alt="After"
                    className="absolute inset-0 h-full w-full object-contain pointer-events-none select-none bg-zinc-950/20"
                    draggable={false}
                />
                <div className="absolute bottom-4 right-4 z-20 rounded-xl bg-rose-500/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md border border-white/10 shadow-sm pointer-events-none">
                    {afterLabel}
                </div>
            </div>

            {/* Slider Line & Handle */}
            <div
                className="absolute inset-y-0 z-30 w-1 bg-white/90 shadow-[0_0_12px_rgba(0,0,0,0.4)] pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-zinc-950/90 text-white shadow-xl backdrop-blur-md transition-transform duration-200 group-hover:scale-105 pointer-events-none">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                        className="h-4 w-4 rotate-90"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                    </svg>
                </div>
            </div>
        </div>
    )
}
