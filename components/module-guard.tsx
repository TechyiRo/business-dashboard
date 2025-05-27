"use client"

import type React from "react"

import { usePermissions } from "@/hooks/use-permissions"
import { Shield, EyeOff } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ModuleGuardProps {
  module: string
  action?: "view" | "create" | "edit" | "delete"
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ModuleGuard({ module, action = "view", children, fallback }: ModuleGuardProps) {
  const permissions = usePermissions(module)

  const hasPermission = () => {
    switch (action) {
      case "view":
        return permissions.canView
      case "create":
        return permissions.canCreate
      case "edit":
        return permissions.canEdit
      case "delete":
        return permissions.canDelete
      default:
        return false
    }
  }

  if (!hasPermission()) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <EyeOff className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to {action} {module}.
            </p>
            <p className="text-sm text-gray-500 mb-4">Contact your administrator for access.</p>
            <Button asChild variant="outline">
              <Link href="/">
                <Shield className="mr-2 h-4 w-4" />
                Return to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
