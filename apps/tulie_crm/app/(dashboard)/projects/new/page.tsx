import { getCustomers } from '@/lib/supabase/services/customer-service'
import NewProjectClient from './new-project-client'

export const dynamic = 'force-dynamic'

export default async function NewProjectPage() {
    const customers = await getCustomers('business')

    return <NewProjectClient customers={customers} />
}
