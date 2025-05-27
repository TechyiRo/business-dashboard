"use client"

import { useAuth } from "@/context/auth-context"
import { getPermissions } from "@/lib/permissions"

export function usePermissions(module: string) {
  const { user } = useAuth()

  if (!user) {
    return {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canDownload: false,
      canExport: false,
    }
  }

  return getPermissions(user.role as any, module, user.permissions)
}
