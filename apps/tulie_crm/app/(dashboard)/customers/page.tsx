import { DataTable } from '@/components/shared/data-table'
import { customerColumns } from '@/components/customers/customer-columns'
import { Button } from '@repo/ui'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@repo/ui'
import { getCustomers } from '@/lib/supabase/services/customer-service'
import { getUsers } from '@/lib/supabase/services/user-service'
import { Plus, Upload, Download, Users } from 'lucide-react'
import Link from 'next/link'
import { CustomerTableClient } from '@/components/customers/customer-table-client'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
    const [customers, users] = await Promise.all([
        getCustomers('business'),
        getUsers(),
    ])

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center border border-border">
                        <Users className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Khách hàng Agency</h1>
                        <p className="text-sm font-medium text-muted-foreground mt-1">
                            Quản lý danh sách khách hàng và thông tin liên hệ cho Agency
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="default" className="rounded-md border-border">
                        <Upload className="h-4 w-4" />
                        Import
                    </Button>
                    <Button variant="outline" size="default" className="rounded-md border-border">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                    <Button asChild size="default" className="rounded-md">
                        <Link href="/customers/new">
                            <Plus className="h-4 w-4" />
                            Thêm khách hàng
                        </Link>
                    </Button>
                </div>
            </div>

            <CustomerTableClient data={customers} users={users} defaultTab="business" hideTabs={true} />
        </div>
    )
}
