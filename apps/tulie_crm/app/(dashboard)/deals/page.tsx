import { Suspense } from 'react'
import { getDeals } from '@/lib/supabase/services/deal-service'
import { DealList } from '@/components/deals/deal-list'
import { Button } from '@repo/ui'
import { Plus, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@repo/ui'

export default async function DealsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center border border-border">
                        <TrendingUp className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Cơ hội (Deals)</h1>
                        <p className="text-sm font-medium text-muted-foreground mt-1">
                            Quản lý phễu bán hàng (Pipeline) và các cơ hội tiềm năng.
                        </p>
                    </div>
                </div>
                <Button asChild className="rounded-md">
                    <Link href="/deals/new">
                        <Plus className="h-4 w-4" />
                        Tạo cơ hội mới
                    </Link>
                </Button>
            </div>

            <Suspense fallback={<DealSkeleton />}>
                <DealDataWrapper />
            </Suspense>
        </div>
    )
}

async function DealDataWrapper() {
    const deals = await getDeals(undefined, 'agency')
    return <DealList initialData={deals} />
}

function DealSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="w-[300px]" />
            </div>
            <div className="border rounded-md">
                <div className="h-12 border-b bg-muted/50" />
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 border-b px-4 flex items-center gap-4">
                        <Skeleton className="h-4 w-full" />
                    </div>
                ))}
            </div>
        </div>
    )
}
