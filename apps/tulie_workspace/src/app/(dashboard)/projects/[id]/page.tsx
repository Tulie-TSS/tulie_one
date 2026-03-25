import Link from 'next/link'
import { MOCK_PROJECTS, MOCK_TASKS } from '@/lib/mock/data'
import { notFound } from 'next/navigation'
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '@/lib/constants/task-status'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const project = MOCK_PROJECTS.find(p => p.id === id)
    if (!project) return notFound()
    const tasks = MOCK_TASKS.filter(t => t.project_id === id)

    return (
        <div>
            <Link href="/projects" className="inline-flex items-center gap-1 no-underline mb-4" style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>← Quay lại Dự án</Link>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-fg)' }}>{project.name}</h1>
                    {project.description && <p style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>{project.description}</p>}
                </div>
                <span className="px-3 py-1 rounded-full font-semibold" style={{ fontSize: 'var(--text-xs)', backgroundColor: project.status === 'active' ? 'var(--color-success-bg)' : 'var(--color-surface)', color: project.status === 'active' ? 'var(--color-success)' : 'var(--color-fg-secondary)' }}>{project.status}</span>
            </div>
            <div className="mb-6">
                <h2 className="font-semibold mb-3" style={{ color: 'var(--color-fg)' }}>Tasks ({tasks.length})</h2>
                <div className="space-y-2">
                    {tasks.map(task => (
                        <Link key={task.id} href={`/tasks/${task.id}`} className="flex items-center gap-4 p-3 no-underline" style={{ backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                            <span className="px-2 py-0.5 rounded-full flex-shrink-0 font-semibold" style={{ backgroundColor: `color-mix(in srgb, ${TASK_STATUS_COLORS[task.status]} 15%, transparent)`, color: TASK_STATUS_COLORS[task.status], fontSize: 'var(--text-xs)' }}>{TASK_STATUS_LABELS[task.status]}</span>
                            <span className="flex-1 truncate font-medium" style={{ color: 'var(--color-fg)', fontSize: 'var(--text-sm)' }}>{task.title}</span>
                            <span style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-xs)' }}>{task.estimated_effort_hours}h</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
