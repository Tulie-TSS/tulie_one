import { getProducts } from '@/lib/supabase/services/product-service'
import { Package, Plus } from 'lucide-react'
import Link from 'next/link'
import { Badge } from "@repo/ui"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sản phẩm & Dịch vụ</h1>
          <p className="text-muted-foreground">Quản lý danh mục sản phẩm, dịch vụ và giá</p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm sản phẩm
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-foreground">Chưa có sản phẩm nào</h3>
          <p className="mt-2 text-sm text-muted-foreground">Thêm sản phẩm/dịch vụ đầu tiên</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tên sản phẩm</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Danh mục</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Đơn vị</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Giá bán</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Giá vốn</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Margin</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => {
                const margin = product.cost_price
                  ? Math.round(((product.price - product.cost_price) / product.price) * 100)
                  : null
                return (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/products/${product.id}`} className="font-medium text-foreground hover:text-primary">
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{product.sku || '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{product.category || '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{product.unit}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-foreground">{formatCurrency(product.price)}</td>
                    <td className="px-4 py-3 text-sm text-right text-muted-foreground">
                      {product.cost_price ? formatCurrency(product.cost_price) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {margin !== null ? (
                        <span className={margin >= 30 ? 'text-emerald-600 font-medium' : margin >= 15 ? 'text-amber-600' : 'text-red-500'}>
                          {margin}%
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={product.is_active ? 'default' : 'secondary'}>
                        {product.is_active ? 'Hoạt động' : 'Ẩn'}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
