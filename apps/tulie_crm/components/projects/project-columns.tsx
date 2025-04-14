'use client'

import { Project } from '@/types'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@repo/ui'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatDate } from '@/lib/utils/format'
import { DataTableColumnHeader } from '@/components/shared/data-table-column-header'
import Link from 'next/link'
import { ExternalLink, FolderArchive, Globe, Layout, MoreHorizontal } from 'lucide-react'
import { DeleteProjectButton } from './delete-project-button'

export const projectColumns: ColumnDef<Project>[] = [
    {
        accessorKey: 'title',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Dự án" />
        ),
        cell: ({ row }) => {
            const project = row.original
            return (
                <div className="flex flex-col">
                    <Link
                        href={`/projects/${project.id}`}
                        className="font-medium hover:underline text-primary"
                    >
                        {project.title}
                    </Link>
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {project.customer?.company_name}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Trạng thái" />
        ),
        cell: ({ row }) => {
            const status = row.getValue('status') as string
            return (
                <StatusBadge status={status} entityType="project" />
            )
        },
    },
    {
        accessorKey: 'assigned_user.full_name',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Phụ trách" />
        ),
    },
    {
        id: 'doc_stats',
        header: 'Tài liệu',
        cell: ({ row }) => {
            const stats = (row.original as any).doc_stats as { total: number; visible: number; signed: number } | undefined
            if (!stats || stats.total === 0) {
                return <span className="text-xs text-muted-foreground">-</span>
            }
            return (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold tabular-nums">{stats.visible}</span>
                    <span className="text-xs text-muted-foreground">hiện</span>
                </div>
            )
        }
    },
    {
        accessorKey: 'end_date',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Hạn bàn giao" />
        ),
        cell: ({ row }) => {
            const date = row.getValue('end_date') as string
            if (!date) return <span className="text-muted-foreground">-</span>
            return <span>{formatDate(date)}</span>
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const project = row.original
            return (
                <div className="flex justify-end">
                    <DeleteProjectButton projectId={project.id} />
                </div>
            )
        }
    }
]
