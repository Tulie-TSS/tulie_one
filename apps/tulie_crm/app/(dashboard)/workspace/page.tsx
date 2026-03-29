import { redirect } from 'next/navigation'

// Workspace has been moved to the dedicated Tulie Workspace app (port 3002)
// This redirect ensures CRM users are guided to the correct app
export default function WorkspacePage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md mx-auto p-8 rounded-md border border-border bg-card">
        <div className="flex h-14 w-14 items-center justify-center rounded-md bg-purple-500/10 mx-auto mb-4">
          <svg className="h-7 w-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Đã chuyển sang Workspace</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Module Workspace đã được tách thành ứng dụng riêng để quản lý dự án và công việc hiệu quả hơn.
        </p>
        <a
          href="http://localhost:3002"
          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
        >
          Mở Tulie Workspace →
        </a>
      </div>
    </div>
  )
}
