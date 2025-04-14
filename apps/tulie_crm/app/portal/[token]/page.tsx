import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PortalContent from './portal-content'
import PortalPasswordForm from './password-form'
import { getPortalDataByToken } from '@/lib/supabase/services/portal-service'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

type Props = {
    params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { token } = await params
    const data = await getPortalDataByToken(token)

    if (!data) {
        return {
            title: 'Không tìm thấy thông tin - Tulie Agency'
        }
    }

    return {
        title: `Dự án: ${data.customer?.company_name || 'Khách hàng'} - Tulie Agency`,
        description: `Theo dõi tiến độ triển khai dành cho ${data.customer?.company_name}`,
    }
}

export default async function PublicPortalPage({ params }: Props) {
    try {
        const { token } = await params
        const data = await getPortalDataByToken(token)

        if (!data) {
            notFound()
        }

        // Check for password protection 
        const dAny = data as any
        const portalPasswordHash = dAny.contract?.password_hash || dAny.quotation?.password_hash || dAny.project?.password_hash
        const financialPasswordHash = dAny.contract?.financial_password_hash || dAny.quotation?.financial_password_hash || dAny.project?.financial_password_hash

        let isPortalAuthenticated = true
        let isFinancialAuthenticated = true
        let hasFinancialPassword = !!financialPasswordHash

        if (portalPasswordHash) {
            const { signPortalToken } = await import('@/lib/supabase/services/portal-actions')
            const cookieStore = await cookies()
            const cookieValue = cookieStore.get(`portal_auth_${token}`)?.value
            const expectedValue = await signPortalToken(token)
            isPortalAuthenticated = cookieValue === expectedValue
        }

        if (financialPasswordHash) {
            const { signPortalToken } = await import('@/lib/supabase/services/portal-actions')
            const cookieStore = await cookies()
            const cookieValue = cookieStore.get(`finance_auth_${token}`)?.value
            const expectedValue = await signPortalToken(token)
            isFinancialAuthenticated = cookieValue === expectedValue
        }

        if (!isPortalAuthenticated) {
            return <PortalPasswordForm token={token} companyName={data.customer?.company_name} type="portal" />
        }

        return <PortalContent data={data} token={token} isFinancialAuthenticated={isFinancialAuthenticated} hasFinancialPassword={hasFinancialPassword} companyName={data.customer?.company_name} />
    } catch (error: any) {
        // Re-throw Next.js internal errors (notFound, redirect)
        if (error?.digest?.startsWith('NEXT_NOT_FOUND') || error?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error
        }
        console.error('Error rendering portal page:', error)
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Đã xảy ra lỗi</h1>
                    <p className="text-muted-foreground">Không thể tải trang portal. Vui lòng thử lại sau.</p>
                </div>
            </div>
        )
    }
}
