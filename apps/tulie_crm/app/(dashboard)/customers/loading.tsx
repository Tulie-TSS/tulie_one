import { Skeleton } from '@repo/ui'

export default function CustomersLoading() {
    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div className="space-y-1"><Skeleton className="h-7 w-36" /><Skeleton className="h-4 w-48" /></div>
                <Skeleton className="h-9 w-36 rounded-md" />
            </div>
            <div className="flex gap-3">
                <Skeleton className="h-9 w-64 rounded-md" />
                <Skeleton className="h-9 w-28 rounded-md" />
            </div>
            <div className="rounded-lg border overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b flex gap-4">
                    {[6, 8, 5, 5, 4].map((w, i) => <Skeleton key={i} className={`h-4 w-${w * 8}`} />)}
                </div>
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="px-4 py-3.5 flex items-center gap-4 border-b last:border-0">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-40 flex-1" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-7 w-7 rounded-md" />
                    </div>
                ))}
            </div>
        </div>
    )
}
