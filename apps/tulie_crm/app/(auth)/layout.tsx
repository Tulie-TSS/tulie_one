export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50/50 relative overflow-hidden">
            {/* Subtle background pattern or tint */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
            
            <div className="w-full max-w-[440px] p-6 relative z-10">
                {children}
            </div>
        </div>
    )
}
