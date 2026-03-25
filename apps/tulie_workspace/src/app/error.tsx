'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
            <div className="text-center max-w-md mx-auto px-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ backgroundColor: 'var(--color-danger-bg)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                </div>
                <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-fg)' }}>
                    Đã xảy ra lỗi
                </h1>
                <p className="mb-6" style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-base)' }}>
                    {error.message || 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.'}
                </p>
                <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 px-6 py-3 font-medium text-white transition-all cursor-pointer"
                    style={{ backgroundColor: 'var(--color-info)', borderRadius: 'var(--radius-md)', border: 'none' }}
                >
                    Thử lại
                </button>
            </div>
        </div>
    )
}
