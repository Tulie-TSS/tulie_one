import { Skeleton } from '@repo/ui'

export default function InvoicesLoading() {
    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div className="space-y-1"><Skeleton className="h-7 w-28" /><Skeleton className="h-4 w-44" /></div>
                <Skeleton className="h-9 w-32 rounded-md" />
            </div>
            {/* Stats row */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-lg border p-4 space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-7 w-24" />
                    </div>
                ))}
            </div>
            <div className="rounded-lg border overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b flex gap-4">
                    {[5, 7, 3, 5, 4, 3].map((w, i) => <Skeleton key={i} className={`h-4 w-${w * 8}`} />)}
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="px-4 py-3.5 flex items-center gap-4 border-b last:border-0">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-36 flex-1" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
            </div>
        </div>
    )
}
