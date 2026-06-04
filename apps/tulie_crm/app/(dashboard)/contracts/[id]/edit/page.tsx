import { getContractById } from '@/lib/supabase/services/contract-service'
import { getCustomers } from '@/lib/supabase/services/customer-service'
import { getQuotations } from '@/lib/supabase/services/quotation-service'
import { getProjects } from '@/lib/supabase/services/project-service'
import { notFound } from 'next/navigation'
import { ContractForm } from '@/components/contracts/contract-form'
import { createClient } from '@/lib/supabase/server'

interface EditContractPageProps {
    params: { id: string }
}

export default async function EditContractPage({ params }: any) {
    const { id } = await params
    const supabase = await createClient()
    
    // Fetch critical data first
    const [contract, customers, quotations, projects] = await Promise.all([
        getContractById(id),
        getCustomers('business'),
        getQuotations(),
        getProjects()
    ])

    if (!contract) {
        notFound()
    }

    // Get user profile for role checking (non-critical, fallback to 'staff')
    let userRole = 'staff'
    try {
        const { data: authData } = await supabase.auth.getUser()
        if (authData?.user) {
            const { data: profile } = await supabase
                .from('users')
                .select('role')
                .eq('id', authData.user.id)
                .maybeSingle()
            if (profile?.role) {
                userRole = profile.role
            }
        }
    } catch (err) {
        console.warn('Failed to fetch user role for contract edit:', err)
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
