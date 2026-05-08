import { getCustomers } from '@/lib/supabase/services/customer-service'
import { getUsers } from '@/lib/supabase/services/user-service'
import { Plus, Upload, Download, Users, Camera } from 'lucide-react'
import { Button } from '@repo/ui'
import Link from 'next/link'
import { CustomerTableClient } from '@/components/customers/customer-table-client'
import { RetailCustomerSyncButton } from '@/components/studio/customer-sync-button'

export const dynamic = 'force-dynamic'

export default async function StudioCustomersPage() {
    const [customers, users] = await Promise.all([
        getCustomers('individual'),
        getUsers(),
    ])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 rounded-md bg-muted flex items-center justify-center">
                        <Camera className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Khách hàng Studio</h1>
                        <p className="text-[14px] text-muted-foreground">
                            Quản lý danh sách khách hàng cá nhân cho khối Studio
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <RetailCustomerSyncButton />
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                        Xuất file
                    </Button>
                    <Button asChild className="px-6 h-10">
                        <Link href="/studio/new?step=customer">
                            <Plus className="h-4 w-4" />
                            Thêm khách hàng
                        </Link>
                    </Button>
                </div>
            </div>

            <CustomerTableClient data={customers} users={users} defaultTab="individual" hideTabs={true} isStudio={true} />
        </div>
    )
}
