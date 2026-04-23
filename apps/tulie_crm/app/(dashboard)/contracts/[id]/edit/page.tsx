import { getContractById } from '@/lib/supabase/services/contract-service'
import { getCustomers } from '@/lib/supabase/services/customer-service'
import { getQuotations } from '@/lib/supabase/services/quotation-service'
import { getProjects } from '@/lib/supabase/services/project-service'
import { notFound } from 'next/navigation'
import { ContractForm } from '@/components/contracts/contract-form'

interface EditContractPageProps {
    params: { id: string }
}

export default async function EditContractPage({ params }: any) {
    const { id } = await params
    const supabase = await createClient()
    
    // Fetch data and user profile in parallel
    const [contract, customers, quotations, projects, { data: { user } }] = await Promise.all([
        getContractById(id),
        getCustomers(),
        getQuotations(),
        getProjects(),
        supabase.auth.getUser()
    ])

    if (!contract) {
        notFound()
    }

    // Get user profile for role checking
    let userRole = 'staff'
    if (user) {
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()
        userRole = profile?.role || 'staff'
    }

    return (
        <ContractForm
            contract={contract}
            customers={customers}
            quotations={quotations}
            projects={projects}
            userRole={userRole}
        />
    )
}
