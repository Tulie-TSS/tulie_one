'use client'

import Link from 'next/link'
import { MOCK_TASKS } from '@/lib/mock/data'
import { useFocusStore } from '@/lib/stores/focus-store'
import { useLocaleStore } from '@/lib/stores/locale-store'

export default function FocusPage() {
    const { isActive, taskId, startFocus, stopFocus, isPaused, togglePause } = useFocusStore()
    const { t } = useLocaleStore()
    const doingTasks = MOCK_TASKS.filter(task => task.status === 'doing')
    const activeTask = MOCK_TASKS.find(task => task.id === taskId)

    if (isActive && activeTask) {
        return (
            <div className="-m-3 md:-m-5 flex items-center justify-center" style={{ height: 'calc(100vh - var(--header-height))', backgroundColor: 'var(--color-bg)' }}>
                <div className="text-center max-w-lg mx-auto px-6">
                    <div className="mb-6 text-6xl font-mono font-bold" style={{ color: 'var(--color-fg)' }}>
                        {isPaused ? '⏸' : '25:00'}
                    </div>
                    <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-fg)' }}>{activeTask.title}</h2>
                    <p className="mb-8" style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>
                        {activeTask.description}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <button onClick={togglePause}
                            className="px-6 py-3 font-medium cursor-pointer"
                            style={{ backgroundColor: isPaused ? 'var(--color-info)' : 'var(--color-surface)', color: isPaused ? 'white' : 'var(--color-fg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 'var(--text-sm)' }}>
                            {isPaused ? t('focus.resume') : t('focus.pause')}
                        </button>
                        <button className="px-6 py-3 font-medium cursor-pointer"
                            style={{ backgroundColor: 'var(--color-success)', color: 'white', borderRadius: 'var(--radius-md)', border: 'none', fontSize: 'var(--text-sm)' }}>
                            {t('focus.complete')}
                        </button>
                    </div>
                    <button onClick={stopFocus}
                        className="mt-6 cursor-pointer"
                        style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-sm)', background: 'none', border: 'none' }}>
                        {t('focus.exit')}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-fg)' }}>{t('focus.title')}</h1>
                <p style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>{t('focus.selectTask')}</p>
            </div>
            {doingTasks.length === 0 ? (
                <div className="p-12 text-center rounded-xl" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                    <div className="text-4xl mb-4">🎯</div>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--color-fg)' }}>{t('focus.noDoingTasks')}</h3>
                    <p className="mb-4" style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>{t('focus.moveToBoard')}</p>
                    <Link href="/board" className="inline-flex px-4 py-2 no-underline font-medium"
                        style={{ backgroundColor: 'var(--color-info)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
                        {t('focus.goToBoard')}
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doingTasks.map(task => (
                        <div key={task.id} className="p-5 rounded-xl"
                            style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-fg)' }}>{task.title}</h3>
                            {task.description && <p className="mb-4" style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>{task.description}</p>}
                            <button onClick={() => startFocus(task.id)}
                                className="px-4 py-2 font-medium cursor-pointer"
                                style={{ backgroundColor: 'var(--color-info)', color: 'white', borderRadius: 'var(--radius-md)', border: 'none', fontSize: 'var(--text-sm)' }}>
                                {t('focus.start')}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
