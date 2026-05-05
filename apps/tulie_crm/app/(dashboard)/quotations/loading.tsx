import { Skeleton } from '@repo/ui'

export default function QuotationsLoading() {
    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div className="space-y-1"><Skeleton className="h-7 w-32" /><Skeleton className="h-4 w-48" /></div>
                <Skeleton className="h-9 w-32 rounded-md" />
            </div>
            <div className="flex gap-3">
                <Skeleton className="h-9 w-56 rounded-md" />
                <Skeleton className="h-9 w-28 rounded-md" />
            </div>
            <div className="rounded-lg border overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b flex gap-4">
                    {[4, 7, 3, 5, 4].map((w, i) => <Skeleton key={i} className={`h-4 w-${w * 8}`} />)}
                </div>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="px-4 py-3.5 flex items-center gap-4 border-b last:border-0">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-48 flex-1" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </div>
        </div>
    )
}
