import NewCtvContractClient from './new-ctv-contract-client'
import { getUniqueFreelancers } from '@/lib/supabase/services/contract-service'

export const metadata = {
    title: 'Tạo hợp đồng CTV | Tulie CRM',
}

export default async function NewCtvContractPage() {
    const freelancers = await getUniqueFreelancers()
    return <NewCtvContractClient freelancers={freelancers} />
}
