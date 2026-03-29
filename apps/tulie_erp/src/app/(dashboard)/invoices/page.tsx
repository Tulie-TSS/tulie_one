import { getInvoices } from '@/lib/supabase/services/invoice-service'
import { InvoiceList } from './invoice-list'
import { FileText, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function InvoicesPage() {
  const invoices = await getInvoices()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-foreground">Hóa đơn</h1>
          <p className="text-muted-foreground">Quản lý hóa đơn đầu ra và đầu vào</p>
        </div>
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tạo hóa đơn
        </Link>
      </div>
      <InvoiceList invoices={invoices} />
    </div>
  )
}
