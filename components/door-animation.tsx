"use client"

import { useEffect, useState } from "react"

interface DoorAnimationProps {
  isActive: boolean
  onAnimationComplete: () => void
}

export function DoorAnimation({ isActive, onAnimationComplete }: DoorAnimationProps) {
  const [animationComplete, setAnimationComplete] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isActive) {
      // Wait for animation to complete before calling the callback
      timeout = setTimeout(() => {
        setAnimationComplete(true)
        onAnimationComplete()
      }, 800) // Match this with the CSS animation duration
    } else {
      setAnimationComplete(false)
    }

    return () => {
      clearTimeout(timeout)
    }
  }, [isActive, onAnimationComplete])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Left door */}
      <div className="absolute inset-y-0 left-0 w-1/2 bg-sp-red animate-door-left" />

      {/* Right door */}
      <div className="absolute inset-y-0 right-0 w-1/2 bg-sp-red animate-door-right" />

      {/* Logout message */}
      <div className="relative z-10 text-white text-xl font-bold">Logging out...</div>
    </div>
  )
}
