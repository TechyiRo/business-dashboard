import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { getDefaultPermissions, type UserRole, type UserPermissions } from "@/lib/permissions"

export async function checkApiPermission(
  request: NextRequest,
  module: string,
  action: "view" | "create" | "edit" | "delete",
): Promise<{ authorized: boolean; user?: any; error?: string }> {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get("user")

    if (!userCookie) {
      return { authorized: false, error: "Not authenticated" }
    }

    const user = JSON.parse(userCookie.value)

    // Get user permissions from database or use defaults
    let permissions: UserPermissions
    if (user.role === "CUSTOM" && user.customPermissions) {
      permissions = { ...getDefaultPermissions(user.role), ...user.customPermissions }
    } else {
      permissions = getDefaultPermissions(user.role as UserRole)
    }

    // Check specific permission
    const modulePermission = permissions[module as keyof UserPermissions]

    let hasPermission = false
    switch (action) {
      case "view":
        hasPermission = modulePermission === "READ" || modulePermission === "WRITE" || modulePermission === "FULL"
        break
      case "create":
        hasPermission = modulePermission === "WRITE" || modulePermission === "FULL"
        break
      case "edit":
        hasPermission = modulePermission === "WRITE" || modulePermission === "FULL"
        break
      case "delete":
        hasPermission = modulePermission === "FULL"
        break
    }

    return { authorized: hasPermission, user }
  } catch (error) {
    console.error("Permission check error:", error)
    return { authorized: false, error: "Permission check failed" }
  }
}
