"use client"

import * as React from "react"
import { cn } from "../lib/utils"
import { Button } from "../components/button"

/**
 * CodeBlock — Syntax-highlighted code display
 *
 * Used in: Workforce (AI agent code output)
 * Lightweight code block with copy button and optional language label.
 * Uses CSS-based syntax theme (no heavy dependencies like Shiki/Prism).
 *
 * Usage:
 * ```tsx
 * <CodeBlock language="typescript" title="auth.ts">
 *   {`const token = await getToken();\nconsole.log(token);`}
 * </CodeBlock>
 * ```
 */

interface CodeBlockProps {
  /** Code content */
  children: string
  /** Language label */
  language?: string
  /** Optional title/filename */
  title?: string
  /** Show line numbers */
  showLineNumbers?: boolean
  /** Max height before scroll */
  maxHeight?: string
  className?: string
}

export function CodeBlock({
  children,
  language,
  title,
  showLineNumbers = false,
  maxHeight = "400px",
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false)
  const lines = children.split("\n")

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(children)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const textarea = document.createElement("textarea")
      textarea.value = children
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-zinc-950 text-zinc-100 overflow-hidden",
        "dark:bg-zinc-900 dark:border-zinc-700",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2">
          {/* Traffic light dots */}
          <div className="flex gap-1.5" aria-hidden="true">
            <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          </div>
          {title && (
            <span className="text-[11px] font-mono text-zinc-400">{title}</span>
          )}
          {language && !title && (
            <span className="text-[11px] font-mono text-zinc-500">{language}</span>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleCopy}
          className="h-6 w-6 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700"
          aria-label="Copy code"
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
          )}
        </Button>
      </div>

      {/* Code content */}
      <div className="overflow-auto" style={{ maxHeight }}>
        <pre className="p-4 text-[13px] leading-relaxed font-mono">
          <code>
            {lines.map((line, i) => (
              <div key={i} className="flex">
                {showLineNumbers && (
                  <span className="select-none text-right w-8 pr-4 text-zinc-600 shrink-0 tabular-nums">
                    {i + 1}
                  </span>
                )}
                <span className="flex-1 whitespace-pre">{line || " "}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  )
}
