"use client"

import { useEffect, useState } from "react"

interface DoorAnimationProps {
  isActive: boolean
  onAnimationComplete?: () => void
}

export function DoorAnimation({ isActive, onAnimationComplete }: DoorAnimationProps) {
  const [leftDoorClass, setLeftDoorClass] = useState("translate-x-[-100%]")
  const [rightDoorClass, setRightDoorClass] = useState("translate-x-[100%]")

  useEffect(() => {
    if (isActive) {
      // Start with doors open
      setLeftDoorClass("translate-x-[-100%]")
      setRightDoorClass("translate-x-[100%]")

      // After a small delay, close the doors
      const timer1 = setTimeout(() => {
        setLeftDoorClass("translate-x-0")
        setRightDoorClass("translate-x-0")
      }, 100)

      // After animation completes, call the callback
      const timer2 = setTimeout(() => {
        if (onAnimationComplete) {
          onAnimationComplete()
        }
      }, 1000) // Match this with the CSS transition duration

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [isActive, onAnimationComplete])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className={`absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-sp-red to-sp-yellow transition-transform duration-800 ease-in-out ${leftDoorClass}`}
      />
      <div
        className={`absolute inset-y-0 right-0 w-1/2 bg-gradient-to-r from-sp-yellow to-sp-red transition-transform duration-800 ease-in-out ${rightDoorClass}`}
      />
      <div className="z-10 text-white text-2xl font-bold animate-pulse">Logging out...</div>
    </div>
  )
}
