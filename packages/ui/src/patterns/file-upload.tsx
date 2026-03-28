"use client"

import * as React from "react"
import { cn } from "../lib/utils"
import { Button } from "../components/button"
import { Progress } from "../components/progress"

/**
 * FileUpload — Drag & drop file upload with preview
 *
 * Used in: CRM (contracts, documents), Workforce (knowledge base),
 * Workspace (attachments), ERP (invoices)
 *
 * Features:
 * - Drag & drop zone
 * - Click to browse
 * - File type validation
 * - Size limit validation
 * - Upload progress
 * - File list with remove
 *
 * Usage:
 * ```tsx
 * <FileUpload
 *   accept={{ "image/*": [".png", ".jpg"], "application/pdf": [".pdf"] }}
 *   maxSize={10 * 1024 * 1024} // 10MB
 *   maxFiles={5}
 *   onFilesChange={(files) => console.log(files)}
 * />
 * ```
 */

// ─── Types ───────────────────────────────────────────────

export interface UploadFile {
  id: string
  file: File
  name: string
  size: number
  type: string
  progress?: number
  status: "pending" | "uploading" | "done" | "error"
  error?: string
  url?: string
}

interface FileUploadProps {
  /** Accepted MIME types */
  accept?: Record<string, string[]>
  /** Max file size in bytes */
  maxSize?: number
  /** Max number of files */
  maxFiles?: number
  /** Allow multiple files */
  multiple?: boolean
  /** Current files (controlled) */
  value?: UploadFile[]
  /** Callback when files change */
  onFilesChange?: (files: UploadFile[]) => void
  /** Custom upload handler */
  onUpload?: (file: File) => Promise<{ url: string }>
  /** Disabled state */
  disabled?: boolean
  /** Placeholder text */
  placeholder?: string
  /** Description text */
  description?: string
  className?: string
}

// ─── Helpers ─────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

const fileIconMap: Record<string, string> = {
  "image": "🖼",
  "application/pdf": "📄",
  "text": "📝",
  "video": "🎬",
  "audio": "🎵",
}

function getFileIcon(type: string): string {
  for (const [key, icon] of Object.entries(fileIconMap)) {
    if (type.startsWith(key)) return icon
  }
  return "📎"
}

// ─── Component ───────────────────────────────────────────

export function FileUpload({
  accept,
  maxSize = 50 * 1024 * 1024, // 50MB default
  maxFiles = 10,
  multiple = true,
  value,
  onFilesChange,
  onUpload,
  disabled = false,
  placeholder = "Drag & drop files here, or click to browse",
  description,
  className,
}: FileUploadProps) {
  const [files, setFiles] = React.useState<UploadFile[]>(value || [])
  const [isDragging, setIsDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const dragCounter = React.useRef(0)

  // Sync controlled value
  React.useEffect(() => {
    if (value) setFiles(value)
  }, [value])

  const acceptString = accept
    ? Object.entries(accept)
        .flatMap(([mime, exts]) => [mime, ...exts])
        .join(",")
    : undefined

  function validateFile(file: File): string | null {
    if (file.size > maxSize) {
      return `File too large (max ${formatBytes(maxSize)})`
    }
    if (accept) {
      const validTypes = Object.keys(accept)
      const validExts = Object.values(accept).flat()
      const isValidType = validTypes.some((t) =>
        t.endsWith("/*") ? file.type.startsWith(t.replace("/*", "")) : file.type === t
      )
      const ext = "." + file.name.split(".").pop()?.toLowerCase()
      const isValidExt = validExts.some((e) => e.toLowerCase() === ext)
      if (!isValidType && !isValidExt) {
        return `File type not accepted`
      }
    }
    return null
  }

  function addFiles(newFiles: FileList | File[]) {
    const fileArray = Array.from(newFiles)
    const remaining = maxFiles - files.length
    const toAdd = fileArray.slice(0, remaining)

    const uploadFiles: UploadFile[] = toAdd.map((file) => {
      const error = validateFile(file)
      return {
        id: generateId(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: error ? "error" : "pending",
        error: error || undefined,
      }
    })

    const updated = [...files, ...uploadFiles]
    setFiles(updated)
    onFilesChange?.(updated)

    // Auto-upload valid files
    if (onUpload) {
      uploadFiles
        .filter((f) => f.status === "pending")
        .forEach((f) => handleUpload(f, updated))
    }
  }

  async function handleUpload(uploadFile: UploadFile, currentFiles: UploadFile[]) {
    if (!onUpload) return

    const updateFile = (id: string, updates: Partial<UploadFile>) => {
      setFiles((prev) => {
        const next = prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
        onFilesChange?.(next)
        return next
      })
    }

    updateFile(uploadFile.id, { status: "uploading", progress: 0 })

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        updateFile(uploadFile.id, {
          progress: Math.min(90, (uploadFile.progress || 0) + 20),
        })
      }, 200)

      const result = await onUpload(uploadFile.file)

      clearInterval(progressInterval)
      updateFile(uploadFile.id, {
        status: "done",
        progress: 100,
        url: result.url,
      })
    } catch (err) {
      updateFile(uploadFile.id, {
        status: "error",
        error: err instanceof Error ? err.message : "Upload failed",
      })
    }
  }

  function removeFile(id: string) {
    const updated = files.filter((f) => f.id !== id)
    setFiles(updated)
    onFilesChange?.(updated)
  }

  // Drag handlers
  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current = 0
    setIsDragging(false)
    if (!disabled && e.dataTransfer.files.length) {
      addFiles(e.dataTransfer.files)
    }
  }

  const canAddMore = files.length < maxFiles

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone */}
      {canAddMore && (
        <div
          className={cn(
            "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40 hover:bg-muted/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragEnter={handleDragEnter}
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Upload files"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              inputRef.current?.click()
            }
          }}
        >
          {/* Upload icon */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
          </div>

          <div className="text-center">
            <p className="text-sm font-medium">{placeholder}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Max {formatBytes(maxSize)} per file · {files.length}/{maxFiles} files
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={acceptString}
            multiple={multiple}
            disabled={disabled}
            onChange={(e) => {
              if (e.target.files?.length) {
                addFiles(e.target.files)
                e.target.value = "" // reset
              }
            }}
            className="hidden"
            aria-hidden="true"
          />
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2" role="list" aria-label="Uploaded files">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-3 rounded-md border border-border bg-card p-2.5 text-sm animate-[slide-in-up_200ms_ease-out]"
            >
              {/* File icon */}
              <span className="text-base shrink-0" aria-hidden="true">
                {getFileIcon(file.type)}
              </span>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {formatBytes(file.size)}
                  </span>
                  {file.status === "error" && (
                    <span className="text-xs text-destructive">{file.error}</span>
                  )}
                  {file.status === "done" && (
                    <span className="text-xs text-success-foreground">Uploaded</span>
                  )}
                </div>
                {file.status === "uploading" && file.progress !== undefined && (
                  <Progress value={file.progress} className="h-1 mt-1.5" />
                )}
              </div>

              {/* Remove button */}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(file.id)
                }}
                aria-label={`Remove ${file.name}`}
                className="text-muted-foreground hover:text-destructive shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
