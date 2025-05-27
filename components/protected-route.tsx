"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Sidebar } from "@/components/sidebar"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      console.log("🔒 ProtectedRoute: Not authenticated, redirecting to login")
      router.replace("/login")
    }
  }, [mounted, isAuthenticated, isLoading, router])

  // Show loading while checking auth or not mounted
  if (!mounted || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render protected content if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  console.log("✅ ProtectedRoute: Authenticated, rendering dashboard with sidebar")

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-0">
        <main className="flex-1 overflow-auto p-6 pt-20 md:pt-6">{children}</main>
      </div>
    </div>
  )
}
