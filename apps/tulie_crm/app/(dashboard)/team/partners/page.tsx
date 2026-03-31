import { PartnersClient } from './partners-client'
import { getPartnerRegistrations } from '@/lib/supabase/services/partner-service'
import { Handshake } from 'lucide-react'
import { Button } from '@repo/ui'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PartnersPage() {
    const registrations = await getPartnerRegistrations()

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center border border-border">
                        <Handshake className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                        <h1 className="text-3xl">Đối tác & CTV</h1>
                        <p className="text-sm font-medium text-muted-foreground mt-1">
                            Quản lý, xét duyệt đơn đăng ký Đối tác liên kết
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <a href="https://hoptac.tulie.app" target="_blank" rel="noopener noreferrer">
                            Trang form đăng ký
                        </a>
                    </Button>
                </div>
            </div>

            <PartnersClient initialData={registrations} />
        </div>
    )
}
