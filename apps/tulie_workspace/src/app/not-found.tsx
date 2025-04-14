import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
            <div className="text-center max-w-md mx-auto px-6">
                <div className="text-6xl mb-4" style={{ color: 'var(--color-fg-tertiary)' }}>404</div>
                <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-fg)' }}>
                    Trang không tồn tại
                </h1>
                <p className="mb-8" style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-base)' }}>
                    Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all"
                    style={{ backgroundColor: 'var(--color-info)', borderRadius: 'var(--radius-md)' }}
                >
                    ← Về trang chủ
                </Link>
            </div>
        </div>
    )
}
