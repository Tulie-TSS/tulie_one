import { Skeleton } from '@repo/ui'

export default function ProjectsLoading() {
    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div className="space-y-1"><Skeleton className="h-7 w-32" /><Skeleton className="h-4 w-52" /></div>
                <Skeleton className="h-9 w-28 rounded-md" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card p-5 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-3 w-28" />
                            </div>
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-2 w-full rounded-full" />
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
