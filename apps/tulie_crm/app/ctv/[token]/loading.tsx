export default function CtvLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                <p className="text-white/50 text-sm">Đang tải thông tin hợp đồng...</p>
            </div>
        </div>
    )
}
