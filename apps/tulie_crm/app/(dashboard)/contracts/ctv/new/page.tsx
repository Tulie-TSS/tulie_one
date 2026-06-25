import NewCtvContractClient from './new-ctv-contract-client'
import { getUniqueFreelancers } from '@/lib/supabase/services/contract-service'

export const metadata = {
    title: 'Tạo mới cộng tác & khoán việc | Tulie CRM',
}

export default async function NewCtvContractPage() {
    const freelancers = await getUniqueFreelancers()
    return <NewCtvContractClient freelancers={freelancers} />
}
