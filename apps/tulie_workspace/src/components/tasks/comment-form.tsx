'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CommentForm({ taskId, onCommentAdded }: { taskId: string; onCommentAdded?: () => void }) {
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setLoading(true)
        try {
            const res = await fetch(`/api/tasks/${taskId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            })
            
            if (res.ok) {
                setContent('')
                router.refresh() // Refresh the server component to load new comments
                if (onCommentAdded) {
                    onCommentAdded()
                }
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Viết bình luận..." 
                rows={2} 
                disabled={loading}
                className="w-full px-3 py-2 resize-none" 
                style={{
                    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg)', color: 'var(--color-fg)',
                    fontSize: 'var(--text-sm)', outline: 'none',
                }} 
            />
            <button 
                type="submit"
                disabled={loading || !content.trim()}
                className="px-4 py-2 self-end font-medium cursor-pointer disabled:opacity-50" 
                style={{
                    backgroundColor: 'var(--color-info)', color: 'white',
                    borderRadius: 'var(--radius-md)', border: 'none',
                    fontSize: 'var(--text-sm)'
                }}
            >
                {loading ? 'Đang gửi...' : 'Gửi'}
            </button>
        </form>
    )
}
