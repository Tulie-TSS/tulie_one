"use client"

import { Sonner } from "../components/sonner"

function Toaster() {
  return (
    <Sonner
      position="top-right"
      richColors
      closeButton
      duration={4000}
    />
  )
}

export { Toaster }
