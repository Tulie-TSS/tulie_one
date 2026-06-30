'use client'

import { DataTable } from '@/components/shared/data-table'
import { getCustomerColumns } from './customer-columns'
import { UserPlus, Building2, User } from 'lucide-react'
import { deleteCustomers, reassignCustomers } from '@/lib/supabase/services/customer-service'
import { Tabs, TabsList, TabsTrigger } from '@repo/ui'
import { useState } from 'react'

interface CustomerTableClientProps {
    data: any[]
    users: any[]
    defaultTab?: 'business' | 'individual'
    hideTabs?: boolean
    isStudio?: boolean
}

export function CustomerTableClient({
    data,
    users,
    defaultTab = 'business',
    hideTabs = false,
    isStudio = false
}: CustomerTableClientProps) {
    const handleDelete = async (rows: any[]) => {
        const ids = rows.map((r) => r.id)
        await deleteCustomers(ids)
    }

    const handleBulkReassign = async (rows: any[], userId: string) => {
        const ids = rows.map((r) => r.id)
        await reassignCustomers(ids, userId)
    }

    const reassignmentActions = users.map(user => ({
        label: `Giao cho: ${user.full_name}`,
        icon: <UserPlus className="h-4 w-4" />,
        onAction: async (rows: any[]) => handleBulkReassign(rows, user.id)
    }))

    const [activeTab, setActiveTab] = useState<'business' | 'individual'>(defaultTab)

    const filteredData = data.filter(c => c.customer_type === (hideTabs ? defaultTab : activeTab))

    return (
        <div className="space-y-4">
            {!hideTabs && (
                <Tabs defaultValue={defaultTab} className="w-full" onValueChange={(v) => setActiveTab(v as any)}>
                    <TabsList className="bg-muted/50 p-1 h-11 rounded-md">
                        <TabsTrigger value="business" className="rounded-lg px-6 h-9 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Building2 className="w-4 h-4 mr-2" />
                            Doanh nghiệp
                        </TabsTrigger>
                        <TabsTrigger value="individual" className="rounded-lg px-6 h-9 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <User className="w-4 h-4 mr-2" />
                            Cá nhân
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            )}

            <DataTable
                columns={getCustomerColumns(isStudio)}
                data={filteredData}
                searchKey={hideTabs ? (defaultTab === 'business' ? "company_name" : "representative") : (activeTab === 'business' ? "company_name" : "representative")}
                searchPlaceholder={hideTabs ? (defaultTab === 'business' ? "Tìm theo tên công ty..." : "Tìm tên khách hàng...") : (activeTab === 'business' ? "Tìm theo tên công ty..." : "Tìm tên khách hàng...")}
                filters={[]}
                onDelete={handleDelete}
                bulkActions={reassignmentActions}
            />
        </div>
    )
}
