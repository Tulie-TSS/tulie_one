import { Header } from "@/components/layouts/header";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    FileText,
    Upload,
    Search,
    File,
    FileType,
} from "lucide-react";
import { mockDocuments, formatFileSize, timeAgo } from "@/lib/mock-data";
import type { DocType, DocStatus } from "@/lib/mock-data";

const typeIcons: Record<DocType, typeof FileText> = {
    pdf: File,
    docx: FileType,
    txt: FileText,
    markdown: FileText,
};

const statusStyles: Record<DocStatus, { label: string; className: string }> = {
    ready: { label: "Indexed", className: "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm font-semibold px-2.5 py-1" },
    processing: { label: "Processing", className: "bg-amber-50 text-amber-600 border-amber-200 shadow-sm font-semibold px-2.5 py-1 animate-pulse" },
    failed: { label: "Failed", className: "bg-rose-50 text-rose-600 border-rose-200 shadow-sm font-semibold px-2.5 py-1" },
};

export default function KnowledgePage() {
    return (
        <>
            <Header title="Knowledge base" />
            <div className="max-w-6xl mx-auto">
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                            Knowledge base
                        </h2>
                        <p className="text-[14px] font-medium text-muted-foreground mt-1.5">
                            {mockDocuments.length} documents · {mockDocuments.reduce((s, d) => s + d.chunkCount, 0)} chunks indexed
                        </p>
                    </div>
                    <Button className="h-10 px-5 bg-primary hover:bg-primary/95 text-primary-foreground shadow-md shadow-primary/20 text-[13px] font-bold gap-2 transition-all hover:-translate-y-0.5">
                        <Upload className="h-4.5 w-4.5" />
                        Upload document
                    </Button>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search documents..."
                        className="pl-11 h-11 bg-white border-border/60 shadow-sm text-[14px] transition-all focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl"
                    />
                </div>

                {/* Document Table */}
                <Card className="card-elevated border-transparent overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/40 bg-zinc-50/50">
                                        <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Document</th>
                                        <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Type</th>
                                        <th className="text-right px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Size</th>
                                        <th className="text-right px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Chunks</th>
                                        <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                        <th className="text-right px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Uploaded</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockDocuments.map((doc) => {
                                        const Icon = typeIcons[doc.type];
                                        const statusInfo = statusStyles[doc.status];
                                        return (
                                            <tr
                                                key={doc.id}
                                                className="border-b border-border/40 hover:bg-zinc-50/50 transition-colors group cursor-pointer"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 shadow-sm group-hover:scale-105 transition-transform">
                                                            <Icon className="h-5 w-5 text-indigo-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[14px] font-bold text-foreground group-hover:text-primary transition-colors">
                                                                {doc.title}
                                                            </p>
                                                            <p className="text-[12px] font-medium text-muted-foreground mt-0.5">
                                                                {doc.fileName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 border-border text-muted-foreground px-2 py-0.5">
                                                        {doc.type}
                                                    </Badge>
                                                </td>
                                                <td className="px-5 py-4 text-right text-[13px] font-semibold text-muted-foreground">
                                                    {formatFileSize(doc.fileSize)}
                                                </td>
                                                <td className="px-5 py-4 text-right text-[13px] font-semibold text-muted-foreground">
                                                    {doc.chunkCount || "—"}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <Badge variant="outline" className={`text-[10px] ${statusInfo.className}`}>
                                                        {statusInfo.label}
                                                    </Badge>
                                                </td>
                                                <td className="px-5 py-4 text-right text-[12px] font-medium text-muted-foreground">
                                                    {timeAgo(doc.createdAt)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
