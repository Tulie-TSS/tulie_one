import { redirect } from 'next/navigation'

// Finance module has been moved to the dedicated Tulie ERP app (port 3003)
export default function FinancePage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md mx-auto p-8 rounded-md border border-border">
        <div className="flex h-14 w-14 items-center justify-center rounded-md bg-orange-500/10 mx-auto mb-4">
          <svg className="h-7 w-7 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl text-foreground mb-2">Đã chuyển sang ERP</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Module Tài chính đã được tách thành ứng dụng ERP riêng để quản lý tài chính chuyên nghiệp hơn.
        </p>
        <a
          href="http://localhost:3003"
          className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
        >
          Mở Tulie ERP →
        </a>
      </div>
    </div>
  )
}
