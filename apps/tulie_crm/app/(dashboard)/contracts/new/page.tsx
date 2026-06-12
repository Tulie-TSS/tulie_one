import { getCustomers } from '@/lib/supabase/services/customer-service'
import { getQuotations } from '@/lib/supabase/services/quotation-service'
import { getProjects } from '@/lib/supabase/services/project-service'
import NewContractClient from './new-contract-client'

export default async function NewContractPage() {
    const [customers, quotations, projects] = await Promise.all([
        getCustomers('business'),
        getQuotations(),
        getProjects()
    ])

    return (
        <NewContractClient
            initialCustomers={customers}
            initialQuotations={quotations}
            initialProjects={projects}
        />
    )
}
