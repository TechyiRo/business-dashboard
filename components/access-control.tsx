"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { canAccessModule } from "@/lib/permissions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface AccessControlProps {
  module: string
  children: React.ReactNode
  redirectTo?: string
}

export function AccessControl({ module, children, redirectTo = "/work-updates" }: AccessControlProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const hasAccess = () => {
    if (!user || !isAuthenticated) return false
    return canAccessModule(user.role as any, module, user.permissions)
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasAccess()) {
      // For WORK_USER, redirect to work-updates if they try to access other modules
      if (user?.role === "WORK_USER" && module !== "workUpdates") {
        router.push("/work-updates")
      }
    }
  }, [user, isAuthenticated, isLoading, router, module])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sp-red border-t-transparent"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.push("/login")
    return null
  }

  // Show access denied for unauthorized users
  if (!hasAccess()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Shield className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You do not have permission to access this module.</p>
            <p className="text-sm text-gray-500 mb-6">Contact your administrator to request access to this feature.</p>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href={redirectTo}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
