"use client"

import * as React from "react"
import { useState, useRef } from "react"

import { cn } from "../lib/utils"

function Card({
  className,
  size = "default",
  glow,
  children,
  ...props
}: React.ComponentProps<"div"> & { 
  size?: "default" | "sm"
  glow?: "coral" | "emerald" | "blue" | "violet"
}) {
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Track target coordinates
  const targetCoords = useRef({ x: 0, y: 0 })
  // Track current animation state (lerp)
  const currentCoords = useRef({ x: 0, y: 0 })
  const animationFrameId = useRef<number | null>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    targetCoords.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    targetCoords.current = { x, y }
    currentCoords.current = { x, y }
    setCoords({ x, y })
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  React.useEffect(() => {
    if (!isHovered) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
        animationFrameId.current = null
      }
      return
    }

    const animate = () => {
      // Easing factor: lower means slower/more inertia (0.08 provides smooth lag/inertia)
      const easeFactor = 0.08
      const dx = targetCoords.current.x - currentCoords.current.x
      const dy = targetCoords.current.y - currentCoords.current.y

      currentCoords.current.x += dx * easeFactor
      currentCoords.current.y += dy * easeFactor

      setCoords({
        x: currentCoords.current.x,
        y: currentCoords.current.y
      })

      animationFrameId.current = requestAnimationFrame(animate)
    }

    animationFrameId.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [isHovered])

  // Soft, subtle (alpha 0.09) colors for a premium, non-distracting glow
  const spotlightColor = {
    coral: "rgba(255, 110, 50, 0.09)",
    emerald: "rgba(16, 185, 129, 0.09)",
    blue: "rgba(59, 130, 246, 0.09)",
    violet: "rgba(139, 92, 246, 0.09)",
  }[glow || "coral"]

  return (
    <div
      ref={containerRef}
      data-slot="card"
      data-size={size}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group/card relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-white/70 dark:bg-zinc-950/60 backdrop-blur-xl py-4 text-sm text-card-foreground border border-white/50 dark:border-zinc-900/30 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 duration-300 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-3xl *:[img:last-child]:rounded-b-3xl",
        className
      )}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Tracking Gradient with smooth inertia and fade transitions */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-500 z-10",
          isHovered ? "opacity-100" : "opacity-0"
        )}
        style={{
          background: `radial-gradient(300px circle at ${coords.x}px ${coords.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />

      {/* Ambient background glow */}
      {glow && (
        <div 
          className={cn(
            "absolute -bottom-8 -right-8 w-36 h-36 rounded-full blur-[40px] pointer-events-none opacity-80 z-0",
            glow === "coral" && "bg-glow-coral",
            glow === "emerald" && "bg-glow-emerald",
            glow === "blue" && "bg-glow-blue",
            glow === "violet" && "bg-glow-violet"
          )}
        />
      )}
      {children}
    </div>
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-[inherit] px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-lg font-semibold leading-none ", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4 group-data-[size=sm]/card:px-3", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center rounded-b-[inherit] border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
