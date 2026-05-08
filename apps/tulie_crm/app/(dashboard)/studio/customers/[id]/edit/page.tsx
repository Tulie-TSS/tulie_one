import { getCustomerById } from '@/lib/supabase/services/customer-service'
import { notFound } from 'next/navigation'
import { CustomerForm } from '@/components/customers/customer-form'

interface StudioEditCustomerPageProps {
    params: { id: string }
}

export default async function StudioEditCustomerPage({ params }: any) {
    const { id } = await params
    const customer = await getCustomerById(id)

    if (!customer) {
        notFound()
    }

    return <CustomerForm customer={customer} isStudio={true} />
}
