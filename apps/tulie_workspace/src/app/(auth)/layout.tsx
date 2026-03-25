export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="w-full max-w-md mx-auto px-6">
                {children}
            </div>
        </div>
    )
}
