export default function CtvLoading() {
    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-10 h-10 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto" />
                <p className="text-zinc-500 text-sm">Đang tải thông tin hợp đồng...</p>
            </div>
        </div>
    )
}
