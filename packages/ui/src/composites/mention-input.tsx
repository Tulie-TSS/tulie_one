"use client"

import * as React from "react"
import { cn } from "../lib/utils"

/**
 * MentionInput — Text input with @mention autocomplete
 *
 * Used in: Workspace (The Commons — @mention in comments)
 *
 * Usage:
 * ```tsx
 * <MentionInput
 *   users={[
 *     { id: "1", name: "Tung", avatar: "/avatar.jpg" },
 *     { id: "2", name: "Linh" },
 *   ]}
 *   onSubmit={(text, mentions) => postComment(text, mentions)}
 *   placeholder="Write a comment... Use @ to mention"
 * />
 * ```
 */

// ─── Types ───────────────────────────────────────────────

export interface MentionUser {
  id: string
  name: string
  avatar?: string
  role?: string
}

interface MentionInputProps {
  /** Available users to mention */
  users: MentionUser[]
  /** Submit handler with plain text and mentioned user IDs */
  onSubmit?: (text: string, mentionedIds: string[]) => void
  /** Change handler */
  onChange?: (text: string) => void
  /** Placeholder */
  placeholder?: string
  /** Default value */
  defaultValue?: string
  /** Disabled */
  disabled?: boolean
  /** Multiline */
  multiline?: boolean
  className?: string
}

// ─── Component ───────────────────────────────────────────

export function MentionInput({
  users,
  onSubmit,
  onChange,
  placeholder = "Write a comment... Use @ to mention",
  defaultValue = "",
  disabled = false,
  multiline = false,
  className,
}: MentionInputProps) {
  const [text, setText] = React.useState(defaultValue)
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [cursorPos, setCursorPos] = React.useState(0)
  const inputRef = React.useRef<HTMLTextAreaElement | HTMLInputElement>(null)

  const filteredUsers = React.useMemo(() => {
    if (!query) return users.slice(0, 5)
    return users
      .filter((u) => u.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
  }, [users, query])

  function handleTextChange(value: string, selStart: number) {
    setText(value)
    setCursorPos(selStart)
    onChange?.(value)

    // Detect @ trigger
    const before = value.substring(0, selStart)
    const atMatch = before.match(/@(\w*)$/)

    if (atMatch) {
      setQuery(atMatch[1] || "")
      setShowSuggestions(true)
      setSelectedIndex(0)
    } else {
      setShowSuggestions(false)
    }
  }

  function insertMention(user: MentionUser) {
    const before = text.substring(0, cursorPos)
    const after = text.substring(cursorPos)
    const atIndex = before.lastIndexOf("@")
    const newText = before.substring(0, atIndex) + `@${user.name} ` + after

    setText(newText)
    setShowSuggestions(false)
    onChange?.(newText)

    // Refocus
    setTimeout(() => {
      const el = inputRef.current
      if (el) {
        el.focus()
        const pos = atIndex + user.name.length + 2
        el.setSelectionRange(pos, pos)
      }
    }, 0)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, filteredUsers.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        if (filteredUsers[selectedIndex]) {
          insertMention(filteredUsers[selectedIndex])
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false)
      }
    } else if (e.key === "Enter" && !e.shiftKey && !multiline) {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleSubmit() {
    const trimmed = text.trim()
    if (!trimmed) return

    // Extract mentioned IDs
    const mentioned = users.filter((u) =>
      trimmed.includes(`@${u.name}`)
    )
    onSubmit?.(trimmed, mentioned.map((u) => u.id))
    setText("")
  }

  const InputTag = multiline ? "textarea" : "input"

  return (
    <div className={cn("relative", className)}>
      <InputTag
        ref={inputRef as React.RefObject<any>}
        value={text}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          handleTextChange(e.target.value, e.target.selectionStart ?? 0)
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors",
          "placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          multiline && "min-h-[80px] resize-y"
        )}
        rows={multiline ? 3 : undefined}
      />

      {/* Suggestion dropdown */}
      {showSuggestions && filteredUsers.length > 0 && (
        <div
          className="absolute left-0 right-0 bottom-full mb-1 rounded-md border border-border bg-popover shadow-lg z-50 overflow-hidden animate-[slide-in-up_150ms_ease-out]"
          role="listbox"
          aria-label="User suggestions"
        >
          {filteredUsers.map((user, i) => (
            <button
              key={user.id}
              className={cn(
                "flex items-center gap-2.5 w-full px-3 py-2 text-left text-sm transition-colors",
                "hover:bg-muted",
                i === selectedIndex && "bg-muted"
              )}
              onClick={() => insertMention(user)}
              role="option"
              aria-selected={i === selectedIndex}
              type="button"
            >
              {/* Avatar */}
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-medium shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{user.name}</p>
                {user.role && (
                  <p className="text-[10px] text-muted-foreground">{user.role}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
