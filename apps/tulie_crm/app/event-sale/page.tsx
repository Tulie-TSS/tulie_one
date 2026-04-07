import { headers } from 'next/headers'
import { getEventSaleByDomain } from '@/lib/supabase/services/event-sale-service'
import EventSaleClient from './client'
import { notFound } from 'next/navigation'

export default async function EventSaleServerPage() {
  const headersList = await headers()
  const host = headersList.get('host') || ''
  
  // Clean host (remove port if local)
  const cleanHost = host.split(':')[0]
  
  // For local development testing, we can fallback to search subdomain if provided in query or just load the first event if we want.
  // But relying strictly on domain matching is safest.
  const eventData = await getEventSaleByDomain(cleanHost)

  if (!eventData) {
    // Show 404 or a default Tulie fallback if no event is mapped to this domain
    // During local dev (localhost), maybe developer hasn't mapped the domain in DB.
    if (cleanHost === 'localhost') {
        return (
            <div className="flex h-screen w-full items-center justify-center p-4 text-center">
                <div className="max-w-md space-y-4">
                    <h1 className="text-xl font-bold">Local Development Mode</h1>
                    <p className="text-muted-foreground">
                        Bạn đang truy cập qua localhost. Hãy vào trang CMS tạo sự kiện và gán subdomain &quot;localhost&quot; để test, hoặc truy cập qua subdomain giả lập.
                    </p>
                </div>
            </div>
        )
    }
    
    notFound()
  }

  return (
    <EventSaleClient eventData={eventData} />
  )
}
