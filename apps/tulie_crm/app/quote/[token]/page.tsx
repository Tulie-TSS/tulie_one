import { Metadata } from 'next'
import { QuotationContent } from './quotation-content'
import QuotePasswordForm from './password-form'
import { getQuotationByToken } from '@/lib/supabase/services/quotation-service'
import { getBrandConfig } from '@/lib/supabase/services/settings-service'
import { getQuotePortalByToken } from '@/lib/supabase/services/quote-portal-service'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

type Props = {
    params: Promise<{ token: string }>
}

async function resolveQuotationData(token: string) {
    if (token.startsWith('p_')) {
        const portal = await getQuotePortalByToken(token)
        if (!portal || !portal.items || portal.items.length === 0) return null
        
        // Use the first item as the main quotation
        const mainQuotation = portal.items[0].quotation
        if (!mainQuotation) return null
        
        // Attach siblings and portal.attachments directly
        const siblings = portal.items.map(item => item.quotation ? {
            ...item.quotation,
            customer: portal.customer,
            is_recommended: item.is_recommended,
            is_default: item.is_default,
            attachments: portal.attachments || [] // Persist portal attachments across all siblings
        } : null).filter(Boolean)
        
        return {
            ...mainQuotation,
            customer: portal.customer,
            siblings,
            attachments: portal.attachments || []
        }
    } else {
        return await getQuotationByToken(token)
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { token } = await params
    const [quotation, brand] = await Promise.all([
        resolveQuotationData(token),
        getBrandConfig()
    ])

    if (!quotation) {
        return {
            title: `Không tìm thấy báo giá - ${brand?.brand_name || 'Tulie CRM'}`
        }
    }

    return {
        title: `Báo giá #${quotation.quotation_number} - ${brand?.brand_name || 'Tulie CRM'}`,
        description: `Xem chi tiết báo giá dành cho ${quotation.customer?.company_name}`,
    }
}

export default async function PublicQuotationPage({ params }: Props) {
    try {
        const { token } = await params
        const [quotation, brandConfig] = await Promise.all([
            resolveQuotationData(token),
            getBrandConfig()
        ])

        if (!quotation) {
            notFound()
        }

        // SECURITY: Check password protection
        if ((quotation as any).password_hash) {
            const { signPortalToken } = await import('@/lib/supabase/services/portal-actions')
            const cookieStore = await cookies()
            const cookieValue = cookieStore.get(`quote_auth_${token}`)?.value
            const expectedValue = await signPortalToken(token)
            const isAuthenticated = cookieValue === expectedValue

            if (!isAuthenticated) {
                return <QuotePasswordForm token={token} customerName={quotation.customer?.company_name || 'Khách hàng'} />
            }
        }

        return <QuotationContent quotation={quotation} brandConfig={brandConfig} />
    } catch (error) {
        console.error('Error rendering public quotation page:', error)
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Đã xảy ra lỗi</h1>
                    <p className="text-muted-foreground">Không thể tải báo giá. Vui lòng thử lại sau.</p>
                </div>
            </div>
        )
    }
}
