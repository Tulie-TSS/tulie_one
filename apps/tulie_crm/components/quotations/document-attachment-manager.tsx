'use client'

import { useState, useRef } from 'react'
import { Button } from '@repo/ui'
import { Input } from '@repo/ui'
import { Label } from '@repo/ui'
import { X, UploadCloud, File, Link as LinkIcon } from 'lucide-react'
import { toast } from 'sonner'
import { LoadingSpinner } from '@repo/ui'

export type AttachmentItem = {
    id: string
    name: string
    url: string
    type: 'link' | 'file'
    path?: string // For supabase storage files to allow deletion
}

interface DocumentAttachmentManagerProps {
    attachments: AttachmentItem[]
    onChange: (attachments: AttachmentItem[]) => void
}

export function DocumentAttachmentManager({ attachments = [], onChange }: DocumentAttachmentManagerProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [isAddingLink, setIsAddingLink] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')
    const [linkName, setLinkName] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleAddLink = () => {
        if (!linkUrl.trim()) {
            toast.error('Vui lòng nhập URL tài liệu')
            return
        }

        const newItem: AttachmentItem = {
            id: `att-${Date.now()}`,
            name: linkName.trim() || new URL(linkUrl).hostname,
            url: linkUrl.trim(),
            type: 'link'
        }

        onChange([...attachments, newItem])
        setLinkUrl('')
        setLinkName('')
        setIsAddingLink(false)
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/documents', {
                method: 'POST',
                body: formData
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Upload failed')
            }

            const newItem: AttachmentItem = {
                id: `att-${Date.now()}`,
                name: file.name,
                url: data.url,
                path: data.path,
                type: 'file'
            }

            onChange([...attachments, newItem])
            toast.success('Đã tải lên tệp thành công')
        } catch (error: any) {
            console.error('Upload error:', error)
            toast.error(error.message || 'Có lỗi xảy ra khi tải lên tệp')
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleRemove = async (id: string) => {
        const itemToRemove = attachments.find(a => a.id === id)
        if (!itemToRemove) return

        // Update UI immediately for responsiveness
        const updated = attachments.filter(a => a.id !== id)
        onChange(updated)

        // delete from supabase if it's a file
        if (itemToRemove.type === 'file' && itemToRemove.path) {
            try {
                const res = await fetch(`/api/documents?path=${encodeURIComponent(itemToRemove.path)}`, {
                    method: 'DELETE'
                })
                if (!res.ok) {
                    console.error('Failed to delete file from storage')
                    // Not showing toast to avoid jarring user experience 
                    // if it fails we just have a dangling file, which is fine
                }
            } catch (err) {
                console.error('Delete API error', err)
            }
        }
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-3">
                {attachments.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-md bg-stone-50 group hover:border-black transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="h-10 w-10 shrink-0 bg-white border rounded-md flex items-center justify-center text-muted-foreground">
                                {item.type === 'link' ? <LinkIcon className="h-4 w-4" /> : <File className="h-4 w-4" />}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                                <a 
                                    href={item.url} 
                                    target="_blank" 
                                    rel="noreferrer noopener"
                                    className="text-xs text-muted-foreground hover:text-black truncate block"
                                >
                                    {item.url}
                                </a>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(item.id)}
                            className="shrink-0 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>

            {attachments.length === 0 && !isAddingLink && (
                <div className="text-center py-6 border-2 border-dashed rounded-md bg-stone-50/50">
                    <p className="text-sm text-muted-foreground mb-4">Chưa có tài liệu đính kèm nào</p>
                    <div className="flex justify-center gap-3">
                        <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingLink(true)}>
                            <LinkIcon className="h-4 w-4" />
                            Thêm Link
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                            {isUploading ? <LoadingSpinner size="sm" className="mr-2" /> : <UploadCloud className="h-4 w-4" />}
                            Tải tệp lên
                        </Button>
                        <input 
                            type="file" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            accept=".pdf,.doc,.docx,.xls,.xlsx,image/*" 
                        />
                    </div>
                </div>
            )}

            {(attachments.length > 0 || isAddingLink) && (
                <div className="flex flex-wrap gap-3">
                    {!isAddingLink ? (
                        <>
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingLink(true)}>
                                <LinkIcon className="h-4 w-4" />
                                Thêm Link
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                {isUploading ? <LoadingSpinner size="sm" className="mr-2" /> : <UploadCloud className="h-4 w-4" />}
                                Tải tệp lên
                            </Button>
                            <input 
                                type="file" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleFileUpload} 
                                accept=".pdf,.doc,.docx,.xls,.xlsx,image/*" 
                            />
                        </>
                    ) : (
                        <div className="w-full flex items-end gap-3 p-4 border rounded-md bg-stone-50/50">
                            <div className="space-y-2 flex-1">
                                <Label>Tên tài liệu / Reference</Label>
                                <Input 
                                    placeholder="VD: Hồ sơ năng lực 2026" 
                                    value={linkName} 
                                    onChange={(e) => setLinkName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2 flex-[2]">
                                <Label>URL (Link)</Label>
                                <Input 
                                    placeholder="https://..." 
                                    value={linkUrl} 
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button type="button" onClick={handleAddLink}>Thêm</Button>
                                <Button type="button" variant="ghost" onClick={() => setIsAddingLink(false)}>Huỷ</Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            <p className="text-[11px] text-muted-foreground italic mt-2">Hỗ trợ các định dạng PDF, Word, Excel, Hình ảnh (Max 15MB) hoặc Link mở rộng (Google Drive, Notion...)</p>
        </div>
    )
}
