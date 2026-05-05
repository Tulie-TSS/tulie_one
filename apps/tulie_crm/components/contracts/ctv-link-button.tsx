'use client'

import { useState } from 'react'
import { Copy, Check, UserRound } from 'lucide-react'
import { Button } from '@repo/ui'
import { toast } from 'sonner'

interface CtvLinkButtonProps {
    publicToken: string
}

export function CtvLinkButton({ publicToken }: CtvLinkButtonProps) {
    const [copied, setCopied] = useState(false)

    const ctvUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/ctv/${publicToken}`
        : `/ctv/${publicToken}`

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(ctvUrl)
            setCopied(true)
            toast.success('Đã copy link CTV vào clipboard', {
                description: 'Gửi link này cho cộng tác viên để họ điền thông tin cá nhân.',
                duration: 4000,
            })
            setTimeout(() => setCopied(false), 2500)
        } catch {
            toast.error('Không thể copy. Hãy copy thủ công:', { description: ctvUrl })
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
        >
            <UserRound className="h-4 w-4" />
            {copied ? (
                <><Check className="h-3.5 w-3.5 text-green-600" /> Đã copy</>
            ) : (
                <>Copy Link CTV</>
            )}
        </Button>
    )
}
