'use client'

import { useState } from 'react'
import { Button, Input } from '@repo/ui'
import { Edit2, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { updateQuotePortal } from '@/lib/supabase/services/quote-portal-service'
import { LoadingSpinner } from '@repo/ui'

interface PortalTitleEditorProps {
    portalId: string
    initialTitle: string
}

export function PortalTitleEditor({ portalId, initialTitle }: PortalTitleEditorProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [title, setTitle] = useState(initialTitle)
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error('Tên portal không được để trống')
            return
        }

        if (title === initialTitle) {
            setIsEditing(false)
            return
        }

        setIsSaving(true)
        try {
            await updateQuotePortal(portalId, { title })
            toast.success('Đã cập nhật tên Portal')
            setIsEditing(false)
        } catch (error) {
            toast.error('Có lỗi xảy ra khi cập nhật tên Portal')
            setTitle(initialTitle) // revert
            console.error(error)
        } finally {
            setIsSaving(false)
        }
    }

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <Input
                    autoFocus
                    className="h-8 max-w-[300px] text-lg font-semibold tracking-tight"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave()
                        if (e.key === 'Escape') {
                            setTitle(initialTitle)
                            setIsEditing(false)
                        }
                    }}
                    disabled={isSaving}
                />
                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <LoadingSpinner size="sm" /> : <Check className="h-4 w-4" />}
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50" onClick={() => {
                    setTitle(initialTitle)
                    setIsEditing(false)
                }} disabled={isSaving}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 group">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
                onClick={() => setIsEditing(true)}
            >
                <Edit2 className="h-4 w-4" />
            </Button>
        </div>
    )
}
