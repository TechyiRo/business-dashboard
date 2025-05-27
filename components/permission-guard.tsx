"use client"

import type React from "react"

import { usePermissions } from "@/hooks/use-permissions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PermissionGuardProps {
  module: string
  action?: "view" | "create" | "edit" | "delete"
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGuard({ module, action = "view", children, fallback }: PermissionGuardProps) {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Shield className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">Permission Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to {action} the {module} module.
            </p>
            <p className="text-sm text-gray-500 mb-6">Contact your administrator to request access to this feature.</p>
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
