"use client"

import * as React from "react"
import { cn } from "../lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "../components/avatar"
import { Badge } from "../components/badge"
import { Button } from "../components/button"

/**
 * CommentThread — Threaded comments with reply support
 *
 * Used in: Workspace (The Commons — task comments)
 * Follows GitHub/Linear comment thread pattern.
 *
 * Usage:
 * ```tsx
 * <CommentThread
 *   comments={comments}
 *   onReply={(parentId, content) => addReply(parentId, content)}
 *   onPin={(id) => pinComment(id)}
 * />
 * ```
 */

// ─── Types ───────────────────────────────────────────────

export type CommentType = "general" | "decision" | "blocker" | "handoff"

export interface Comment {
  id: string
  content: string
  type: CommentType
  user: { name: string; avatar?: string }
  timestamp: string
  isPinned?: boolean
  replies?: Comment[]
}

interface CommentThreadProps {
  comments: Comment[]
  onReply?: (parentId: string, content: string) => void
  onPin?: (commentId: string) => void
  onDelete?: (commentId: string) => void
  className?: string
}

// ─── Type Badge ──────────────────────────────────────────

const typeBadgeMap: Record<CommentType, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  general: { label: "Comment", variant: "secondary" },
  decision: { label: "Decision", variant: "default" },
  blocker: { label: "Blocker", variant: "destructive" },
  handoff: { label: "Handoff", variant: "outline" },
}

// ─── Component ───────────────────────────────────────────

export function CommentThread({
  comments,
  onReply,
  onPin,
  onDelete,
  className,
}: CommentThreadProps) {
  return (
    <div className={cn("space-y-0", className)} role="feed" aria-label="Comments">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
          onPin={onPin}
          onDelete={onDelete}
          depth={0}
        />
      ))}
    </div>
  )
}

// ─── Comment Item ────────────────────────────────────────

function CommentItem({
  comment,
  onReply,
  onPin,
  onDelete,
  depth,
}: {
  comment: Comment
  onReply?: (parentId: string, content: string) => void
  onPin?: (commentId: string) => void
  onDelete?: (commentId: string) => void
  depth: number
}) {
  const [showReply, setShowReply] = React.useState(false)
  const [replyText, setReplyText] = React.useState("")
  const badgeInfo = typeBadgeMap[comment.type]

  function handleSubmitReply() {
    const trimmed = replyText.trim()
    if (trimmed && onReply) {
      onReply(comment.id, trimmed)
      setReplyText("")
      setShowReply(false)
    }
  }

  return (
    <article
      className={cn(
        "py-3 group",
        depth > 0 && "ml-8 border-l-2 border-border pl-4",
        comment.isPinned && "bg-warning/5 rounded-md px-3 -mx-1"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-1.5">
        <Avatar className="h-6 w-6 shrink-0">
          {comment.user.avatar && (
            <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
          )}
          <AvatarFallback className="text-[9px]">
            {comment.user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{comment.user.name}</span>
        {comment.type !== "general" && (
          <Badge variant={badgeInfo.variant} className="text-[10px] h-4 px-1.5">
            {badgeInfo.label}
          </Badge>
        )}
        {comment.isPinned && (
          <span className="text-[10px] text-warning-foreground font-medium">📌 Pinned</span>
        )}
        <span className="text-[10px] text-muted-foreground ml-auto">{comment.timestamp}</span>
      </div>

      {/* Content */}
      <div className="text-sm text-foreground leading-relaxed pl-8 whitespace-pre-wrap">
        {comment.content}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 pl-8 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {onReply && depth < 2 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-muted-foreground"
            onClick={() => setShowReply(!showReply)}
          >
            Reply
          </Button>
        )}
        {onPin && comment.type === "decision" && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-muted-foreground"
            onClick={() => onPin(comment.id)}
          >
            {comment.isPinned ? "Unpin" : "Pin"}
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(comment.id)}
          >
            Delete
          </Button>
        )}
      </div>

      {/* Reply input */}
      {showReply && (
        <div className="pl-8 mt-2 flex gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmitReply()
              }
              if (e.key === "Escape") setShowReply(false)
            }}
            placeholder="Write a reply..."
            className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            autoFocus
          />
          <Button size="sm" className="h-8" onClick={handleSubmitReply} disabled={!replyText.trim()}>
            Reply
          </Button>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-1">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onPin={onPin}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </article>
  )
}
