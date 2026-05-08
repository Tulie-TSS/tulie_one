'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Button, Badge,
} from '@repo/ui'

interface WipBlockDialogProps {
  open: boolean
  onClose: () => void
  doingCount: number
  wipLimit: number
  doingTasks: { id: string; title: string }[]
  onCompleteTask: (taskId: string) => void
  onPauseTask: (taskId: string) => void
}

export function WipBlockDialog({
  open,
  onClose,
  doingCount,
  wipLimit,
  doingTasks,
  onCompleteTask,
  onPauseTask,
}: WipBlockDialogProps) {
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [action, setAction] = useState<'complete' | 'pause' | null>(null)

  const handleConfirm = () => {
    if (!selectedTask || !action) return
    if (action === 'complete') onCompleteTask(selectedTask)
    else onPauseTask(selectedTask)
    setSelectedTask(null)
    setAction(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-destructive">🚫</span>
            Đã đạt giới hạn WIP
          </DialogTitle>
          <DialogDescription>
            Bạn đang có <strong>{doingCount}/{wipLimit}</strong> công việc trong Doing.
            Hãy hoàn thành hoặc tạm dừng 1 công việc để mở khóa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Chọn công việc để xử lý:
          </p>
          {doingTasks.map(task => (
            <div
              key={task.id}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedTask === task.id ? 'border-primary bg-primary/5' : 'border-border bg-muted/40 hover:border-primary/30'}`}
              onClick={() => setSelectedTask(task.id)}
            >
              <p className="text-sm font-medium text-foreground line-clamp-2">{task.title}</p>
              {selectedTask === task.id && (
                <div className="flex gap-2 mt-2">
                  <button
                    className={`flex-1 text-xs py-1.5 rounded font-medium transition-colors ${action === 'complete' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                    onClick={(e) => { e.stopPropagation(); setAction('complete') }}
                  >
                    ✓ Hoàn thành
                  </button>
                  <button
                    className={`flex-1 text-xs py-1.5 rounded font-medium transition-colors ${action === 'pause' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                    onClick={(e) => { e.stopPropagation(); setAction('pause') }}
                  >
                    ⏸ Tạm dừng
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Huỷ</Button>
          <Button onClick={handleConfirm} disabled={!selectedTask || !action}>
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
