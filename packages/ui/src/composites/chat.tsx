import * as React from "react"
import { cn } from "../lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "../components/avatar"

/**
 * Chat Components — Message bubble, input, thread list
 *
 * Used in: Workforce (AI agent chat), Workspace (comments)
 * Follows Linear/Slack/ChatGPT message pattern.
 */

// ═══════════════════════════════════════════
// ChatBubble
// ═══════════════════════════════════════════

export interface ChatUser {
  name: string
  avatar?: string
  isBot?: boolean
}

interface ChatBubbleProps {
  /** Message content (supports markdown/html) */
  content: React.ReactNode
  /** Sender info */
  user: ChatUser
  /** Timestamp */
  timestamp?: string
  /** Is this the current user's message? */
  isOwn?: boolean
  /** Is the AI thinking/streaming? */
  isStreaming?: boolean
  /** Additional actions (copy, edit, etc.) */
  actions?: React.ReactNode
  className?: string
}

export function ChatBubble({
  content,
  user,
  timestamp,
  isOwn = false,
  isStreaming = false,
  actions,
  className,
}: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "flex gap-3 py-3 px-2 group",
        isOwn && "flex-row-reverse",
        className
      )}
    >
      {/* Avatar */}
      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
        {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
        <AvatarFallback className={cn("text-[10px]", user.isBot && "bg-primary text-primary-foreground")}>
          {user.isBot ? "AI" : user.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className={cn("flex-1 min-w-0 space-y-1", isOwn && "items-end")}>
        {/* Header */}
        <div className={cn("flex items-baseline gap-2", isOwn && "flex-row-reverse")}>
          <span className="text-sm font-medium">{user.name}</span>
          {timestamp && (
            <span className="text-[10px] text-muted-foreground">{timestamp}</span>
          )}
        </div>

        {/* Message body */}
        <div
          className={cn(
            "rounded-lg px-3 py-2 text-sm leading-relaxed max-w-[85%]",
            isOwn
              ? "bg-primary text-primary-foreground ml-auto"
              : "bg-muted text-foreground",
            isStreaming && "animate-pulse"
          )}
        >
          {content}
          {isStreaming && (
            <span className="inline-flex ml-1">
              <TypingDots />
            </span>
          )}
        </div>

        {/* Actions (visible on hover) */}
        {actions && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// TypingDots
// ═══════════════════════════════════════════

export function TypingDots({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label="Typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-current opacity-40"
          style={{
            animation: `typing-dots 1.4s infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </span>
  )
}

// ═══════════════════════════════════════════
// ChatThreadList
// ═══════════════════════════════════════════

export interface ChatThread {
  id: string
  title: string
  preview?: string
  timestamp: string
  unreadCount?: number
  user?: ChatUser
  isActive?: boolean
}

interface ChatThreadListProps {
  threads: ChatThread[]
  activeThreadId?: string
  onThreadClick?: (threadId: string) => void
  onNewThread?: () => void
  className?: string
}

export function ChatThreadList({
  threads,
  activeThreadId,
  onThreadClick,
  onNewThread,
  className,
}: ChatThreadListProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0">
        <h3 className="text-sm font-semibold">Conversations</h3>
        {onNewThread && (
          <button
            onClick={onNewThread}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="New conversation"
            type="button"
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
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </button>
        )}
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto" role="list" aria-label="Conversation threads">
        {threads.map((thread) => {
          const isActive = thread.id === activeThreadId

          return (
            <button
              key={thread.id}
              className={cn(
                "flex items-start gap-3 w-full px-3 py-2.5 text-left transition-colors border-b border-border last:border-0",
                "hover:bg-muted/50",
                isActive && "bg-muted"
              )}
              onClick={() => onThreadClick?.(thread.id)}
              type="button"
              aria-current={isActive ? "true" : undefined}
            >
              {/* Avatar */}
              {thread.user && (
                <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                  {thread.user.avatar && (
                    <AvatarImage src={thread.user.avatar} alt={thread.user.name} />
                  )}
                  <AvatarFallback className={cn("text-[9px]", thread.user.isBot && "bg-primary text-primary-foreground")}>
                    {thread.user.isBot ? "AI" : thread.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "text-sm truncate",
                      thread.unreadCount ? "font-semibold" : "font-medium"
                    )}
                  >
                    {thread.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {thread.timestamp}
                  </span>
                </div>
                {thread.preview && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {thread.preview}
                  </p>
                )}
              </div>

              {/* Unread badge */}
              {thread.unreadCount && thread.unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground shrink-0">
                  {thread.unreadCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
