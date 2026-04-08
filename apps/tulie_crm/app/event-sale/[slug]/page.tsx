import { getEventSaleByCode } from '@/lib/supabase/services/event-sale-service'
import { getBankAccounts } from '@/lib/supabase/services/settings-service'
import EventSaleClient from '../client'
import { notFound } from 'next/navigation'

async function resolveEventBankAccount(eventData: any) {
  if (eventData.bank_account?.account_no) return eventData

  const accounts = await getBankAccounts()
  if (accounts.length > 0) {
    const studioAccount = accounts.find(
      (a: any) => a.brand?.toLowerCase().includes('studio') || a.is_default
    ) || accounts[0]
    
    eventData.bank_account = {
      bank_name: studioAccount.bank_name || 'MB',
      account_no: studioAccount.account_no || '',
      account_name: studioAccount.account_name || '',
    }
    eventData.hotline = eventData.hotline || studioAccount.phone || ''
  }
  
  return eventData
}

export default async function EventSaleSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  let eventData = await getEventSaleByCode(slug)

  if (!eventData) {
    notFound()
  }

  const resolved = await resolveEventBankAccount(eventData)

  return <EventSaleClient eventData={resolved} />
}
