import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import CtvForm from './ctv-form'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ token: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { token } = await params
    return {
        title: 'Điền thông tin Hợp đồng CTV — Tulie Agency',
        description: 'Hoàn thiện thông tin cá nhân để ký kết hợp đồng cộng tác viên với Tulie Agency',
        robots: { index: false },
    }
}

async function getContractByToken(token: string) {
    const supabase = createAdminClient()
    const { data } = await supabase
        .from('contracts')
        .select(`
            id, title, contract_number, total_amount, category,
            freelancer_metadata, start_date, end_date, status
        `)
        .eq('public_token', token)
        .eq('category', 'freelancer')
        .single()
    return data
}

export default async function CtvPage({ params }: Props) {
    const { token } = await params
    const contract = await getContractByToken(token)

    if (!contract) notFound()
    if (contract.status === 'cancelled') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="text-center space-y-2">
                    <h1 className="text-xl font-semibold text-slate-800">Hợp đồng đã hủy</h1>
                    <p className="text-slate-500">Hợp đồng này đã bị hủy và không còn hiệu lực.</p>
                </div>
            </div>
        )
    }

    const fMeta = (contract.freelancer_metadata as Record<string, string>) || {}
    const isAlreadySubmitted = !!(fMeta.name && fMeta.cccd && fMeta.bank_account)

    return (
        <CtvForm
            token={token}
            contract={{
                title: contract.title,
                contract_number: contract.contract_number,
                total_amount: contract.total_amount,
                start_date: contract.start_date,
                end_date: contract.end_date,
            }}
            initialData={{
                name: fMeta.name || '',
                cccd: fMeta.cccd || '',
                cccd_date: fMeta.cccd_date || '',
                cccd_place: fMeta.cccd_place || '',
                dob: fMeta.dob || '',
                address: fMeta.address || '',
                contact_address: fMeta.contact_address || '',
                phone: fMeta.phone || '',
                email: fMeta.email || '',
                bank_account: fMeta.bank_account || '',
                bank_account_name: fMeta.bank_account_name || '',
                bank_name: fMeta.bank_name || '',
            }}
            isAlreadySubmitted={isAlreadySubmitted}
        />
    )
}
