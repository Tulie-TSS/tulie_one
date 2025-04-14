export const dynamic = "force-dynamic";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background">
            {/* Split Screen Left - Branding Panel */}
            <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-zinc-950 p-12 text-white lg:flex">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-zinc-950 to-zinc-950 opacity-90 mix-blend-multiply" />
                
                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex h-9 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground text-xl ring-1 ring-white/20">
                        T
                    </div>
                    <span className="text-2xl">Tulie<span className="font-light text-muted-foreground">Workforce</span></span>
                </div>
                
                <div className="relative z-10 max-w-md">
                    <h1 className="mb-6 text-4xl leading-tight text-white">
                        Quản trị hệ thống tinh gọn và quyền lực.
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Giải pháp tối ưu hoá quy trình, tự động hoá tác vụ và quản lý nhân sự dành riêng cho Agency.
                    </p>
                </div>
                
                <div className="relative z-10 text-sm text-muted-foreground font-medium">
                    © 2026 Tulie Agency. All rights reserved.
                </div>
            </div>

            {/* Split Screen Right - Auth Form */}
            <div className="flex w-full items-center justify-center px-6 sm:px-12 lg:w-1/2 lg:px-24">
                <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
                    {children}
                </div>
            </div>
        </div>
    );
}
