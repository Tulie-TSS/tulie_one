'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from '@repo/ui'
import { Badge } from '@repo/ui'
import { Button } from '@repo/ui'
import { CheckCircle2, Eye } from 'lucide-react'
import { Project, ProjectWorkItem } from '@/types'
import { formatDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import { useState, useMemo, useEffect } from 'react'
import { DocumentEditorDialog } from './document-editor-dialog'

interface ProjectDocumentationSetProps {
    project: Project
    workItems: ProjectWorkItem[]
}

export function ProjectDocumentationSet({ project, workItems }: ProjectDocumentationSetProps) {
    const [viewingDocId, setViewingDocId] = useState<string | null>(null)
    const [realDocs, setRealDocs] = useState<any[]>([])

    // Fetch real contract documents to synchronize status
    useEffect(() => {
        const contracts = project.contracts || []
        if (contracts.length === 0) return
        
        Promise.all(contracts.map((c: any) => 
            fetch(`/api/contracts/${c.id}/documents`).then(r => r.ok ? r.json() : { documents: [] })
        )).then(results => {
            const flattened = results.flatMap(r => r.documents || [])
            setRealDocs(flattened)
        }).catch(err => console.error("Error fetching docs", err))
    }, [project.contracts])

    // Aggregate docs from all work items
    const allDocs = useMemo(() => {
        const docs: any[] = []
        workItems.forEach(item => {
            if (item.required_documents) {
                (item.required_documents as any[]).forEach(doc => {
                    const matchingDocs = realDocs.filter(rd => 
                        (doc.type && rd.type === doc.type) || 
                        (doc.title && rd.title === doc.title)
                    )
                    
                    const priorityMap: Record<string, number> = { signed: 4, sent: 3, pending: 2, draft: 1 }
                    let highestDoc = matchingDocs[0]
                    matchingDocs.forEach(md => {
                        if ((priorityMap[md.status] || 0) > (priorityMap[highestDoc?.status] || 0)) {
                            highestDoc = md
                        }
                    })

                    const realDocStatus = highestDoc ? highestDoc.status : doc.status
                    const realDocId = highestDoc ? highestDoc.id : doc.generated_doc_id

                    docs.push({
                        ...doc,
                        status: realDocStatus,
                        generated_doc_id: realDocId,
                        workItemTitle: item.title,
                        workItemId: item.id
                    })
                })
            }
        })
        return docs
    }, [workItems, realDocs])

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 border-b border-transparent">
                <div className="space-y-1.5 flex-1 pr-4">
                    <CardTitle className="text-base font-semibold leading-none tracking-tight">Bộ chứng từ dự án</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground pt-1">Lộ trình hoàn thiện hồ sơ pháp lý và thủ tục cho toàn bộ dự án.</CardDescription>
                </div>
                <div className="shrink-0">
                    <Badge variant="secondary" className="shadow-sm">
                        {allDocs.filter(d => d.status === 'signed').length}/{allDocs.length} hoàn thành
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y">
                    {allDocs.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground text-sm">
                            Chưa có chứng từ nào được gán cho các hạng mục dự án.
                        </div>
                    ) : (
                        allDocs.map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors group">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={cn(
                                        "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-medium",
                                        doc.status === 'signed'
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground"
                                    )}>
                                        {doc.status === 'signed' ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={cn(
                                            "text-sm font-medium truncate",
                                            doc.status === 'signed' && "text-muted-foreground line-through"
                                        )}>{doc.title}</p>
                                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                                            {doc.workItemTitle}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    {doc.date && (
                                        <span className="text-xs text-muted-foreground tabular-nums hidden md:inline">
                                            {formatDate(doc.date)}
                                        </span>
                                    )}
                                    <Badge variant={doc.status === 'signed' ? 'default' : 'outline'}>
                                        {doc.status === 'signed' ? "Hoàn thành" : "Chờ xử lý"}
                                    </Badge>
                                    {doc.generated_doc_id && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => setViewingDocId(doc.generated_doc_id)}
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>

            <DocumentEditorDialog
                docId={viewingDocId}
                onClose={() => setViewingDocId(null)}
            />
        </Card>
    )
}
