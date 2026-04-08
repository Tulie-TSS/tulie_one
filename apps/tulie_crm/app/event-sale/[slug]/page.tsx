import { getEventSaleByCode } from '@/lib/supabase/services/event-sale-service'
import EventSaleClient from '../client'
import { notFound } from 'next/navigation'

export default async function EventSaleSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const eventData = await getEventSaleByCode(slug)

  if (!eventData) {
    notFound()
  }

  return <EventSaleClient eventData={eventData} />
}
