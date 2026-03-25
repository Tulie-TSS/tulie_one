import { getVendors } from '@/lib/supabase/services/vendor-service'
import { Building2, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function VendorsPage() {
  const vendors = await getVendors()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nhà cung cấp</h1>
          <p className="text-muted-foreground">Quản lý thông tin nhà cung cấp và đối tác</p>
        </div>
        <Link
          href="/vendors/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm NCC
        </Link>
      </div>

      {vendors.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-foreground">Chưa có nhà cung cấp nào</h3>
          <p className="mt-2 text-sm text-muted-foreground">Thêm nhà cung cấp đầu tiên</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                    <Building2 className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{vendor.name}</h3>
                    {vendor.contact_name && (
                      <p className="text-sm text-muted-foreground">{vendor.contact_name}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                {vendor.phone && <p>📞 {vendor.phone}</p>}
                {vendor.email && <p>✉️ {vendor.email}</p>}
                {vendor.tax_code && <p>🏢 MST: {vendor.tax_code}</p>}
                {vendor.bank_name && <p>🏦 {vendor.bank_name} - {vendor.bank_account}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
