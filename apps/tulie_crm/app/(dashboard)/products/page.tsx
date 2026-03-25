// Products are now managed in Tulie ERP (port 3003)
// CRM can still reference products for quotation line items via shared DB

export default function ProductsPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md mx-auto p-8 rounded-xl border border-border bg-card">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-500/10 mx-auto mb-4">
          <svg className="h-7 w-7 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Đã chuyển sang ERP</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Danh mục Sản phẩm & Dịch vụ được quản lý tập trung trong Tulie ERP.
        </p>
        <a
          href="http://localhost:3003/products"
          className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
        >
          Mở Sản phẩm trên ERP →
        </a>
      </div>
    </div>
  )
}
