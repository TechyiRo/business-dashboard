"use server"

import { auth } from "@/auth"

export async function checkPermission(permission: string) {
  const session = await auth()
  if (!session) return false

  // Check if the user has the required permission
  // You can implement your permission checking logic here
  // For example, check if the user's role has the permission
  const userRole = session?.user?.role
  if (userRole === "ADMIN") return true

  // Add more granular permission checks here based on the permission string
  // and the user's role or other attributes

  return false
}
