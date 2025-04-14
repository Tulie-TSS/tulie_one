import { getProducts } from '@/lib/supabase/services/product-service'
import { Package, Plus } from 'lucide-react'
import Link from 'next/link'
import { Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@repo/ui"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-foreground">Sản phẩm & Dịch vụ</h1>
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
        <div className="rounded-md border border-border p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-foreground">Chưa có sản phẩm nào</h3>
          <p className="mt-2 text-sm text-muted-foreground">Thêm sản phẩm/dịch vụ đầu tiên</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Đơn vị</TableHead>
                <TableHead className="text-right">Giá bán</TableHead>
                <TableHead className="text-right">Giá vốn</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const margin = product.cost_price
                  ? Math.round(((product.price - product.cost_price) / product.price) * 100)
                  : null
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Link href={`/products/${product.id}`} className="font-medium text-foreground hover:text-primary">
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{product.sku || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{product.category || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{product.unit}</TableCell>
                    <TableCell className="text-right font-medium text-foreground">{formatCurrency(product.price)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {product.cost_price ? formatCurrency(product.cost_price) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {margin !== null ? (
                        <span className={margin >= 30 ? 'text-emerald-600 font-medium' : margin >= 15 ? 'text-amber-600' : 'text-red-500'}>
                          {margin}%
                        </span>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={product.is_active ? 'default' : 'secondary'}>
                        {product.is_active ? 'Hoạt động' : 'Ẩn'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
