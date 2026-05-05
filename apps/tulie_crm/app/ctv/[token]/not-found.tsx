import Link from 'next/link'

export default function CtvNotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
            <div className="text-center space-y-4 max-w-sm">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto">
                    <span className="text-3xl">🔍</span>
                </div>
                <div>
                    <h1 className="text-white text-xl font-bold">Không tìm thấy hợp đồng</h1>
                    <p className="text-white/50 text-sm mt-2">
                        Link này không hợp lệ hoặc đã hết hạn. Vui lòng liên hệ Tulie Agency để nhận lại link.
                    </p>
                </div>
                <div className="pt-2 space-y-2 text-sm text-white/40">
                    <p>📧 lienhe@tulie.vn</p>
                    <p>📞 098 898 4554</p>
                </div>
            </div>
        </div>
    )
}
