'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui'
import { Button } from '@repo/ui'
import { DocumentAttachmentManager, AttachmentItem } from '@/components/quotations/document-attachment-manager'
import { updateQuotePortal } from '@/lib/supabase/services/quote-portal-service'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { LoadingSpinner } from '@repo/ui'

interface PortalAttachmentsProps {
    portalId: string
    initialAttachments: AttachmentItem[]
}

export function PortalAttachments({ portalId, initialAttachments }: PortalAttachmentsProps) {
    const [attachments, setAttachments] = useState<AttachmentItem[]>(initialAttachments)
    const [isSaving, setIsSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    const handleChange = (newAttachments: AttachmentItem[]) => {
        setAttachments(newAttachments)
        setHasChanges(true)
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await updateQuotePortal(portalId, { attachments } as any)
            toast.success('Đã lưu tài liệu đính kèm')
            setHasChanges(false)
        } catch (err) {
            toast.error('Lỗi khi lưu tài liệu')
            console.error(err)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Tài liệu đính kèm</CardTitle>
                        <CardDescription className="mt-1">
                            File PDF, hình ảnh, link demo hoặc reference gửi cho khách
                        </CardDescription>
                    </div>
                    {hasChanges && (
                        <Button size="sm" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="h-4 w-4" />}
                            Lưu
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <DocumentAttachmentManager
                    attachments={attachments}
                    onChange={handleChange}
                />
            </CardContent>
        </Card>
    )
}
