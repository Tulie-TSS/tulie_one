import { headers } from 'next/headers'
import { getEventSaleByDomain } from '@/lib/supabase/services/event-sale-service'
import { getBankAccounts } from '@/lib/supabase/services/settings-service'
import EventSaleClient from './client'
import { notFound } from 'next/navigation'

async function resolveEventBankAccount(eventData: any) {
  // If event already has bank_account configured → use it
  if (eventData.bank_account?.account_no) return eventData

  // Fallback: load system bank accounts, find "studio" brand or first available
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

export default async function EventSaleServerPage() {
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const cleanHost = host.split(':')[0]
  
  let eventData = await getEventSaleByDomain(cleanHost)

  if (!eventData) {
    if (cleanHost === 'localhost') {
        return (
            <div className="flex h-screen w-full items-center justify-center p-4 text-center">
                <div className="max-w-md space-y-4">
                    <h1 className="text-xl font-bold">Local Development Mode</h1>
                    <p className="text-muted-foreground">
                        Bạn đang truy cập qua localhost. Hãy vào trang CMS tạo sự kiện và gán subdomain &quot;localhost&quot; để test, hoặc truy cập qua <code>/event-sale/CODE</code>.
                    </p>
                </div>
            </div>
        )
    }
    
    notFound()
  }

  const resolved = await resolveEventBankAccount(eventData)

  return (
    <EventSaleClient eventData={resolved} />
  )
}
