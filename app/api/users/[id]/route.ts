import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

// Simple ObjectID validation without MongoDB dependency
function isValidObjectId(id: string): boolean {
  // Check if it's a 24-character hex string or a valid UUID/CUID
  return /^[0-9a-fA-F]{24}$/.test(id) || /^[a-zA-Z0-9_-]+$/.test(id)
}

// Update user (Admin only)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const userRole = cookieStore.get("userRole")?.value
    const username = cookieStore.get("username")?.value

    // Check if user is admin
    if (userRole !== "ADMIN" && username !== "sp it") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Basic ID validation
    if (!id || id.length < 1) {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }

    const { username: newUsername, password, role, permissions, isActive } = await request.json()

    // Validate role if provided
    if (role) {
      const validRoles = ["ADMIN", "FULL_ACCESS", "READ_ONLY", "TASK_USER", "WORK_EDITOR", "VIEWER", "CUSTOM"]
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}` }, { status: 400 })
      }
    }

    const updateData: any = {}
    if (newUsername !== undefined) updateData.username = newUsername
    if (password !== undefined && password !== "") updateData.password = password // In production, hash this
    if (role !== undefined) updateData.role = role
    if (isActive !== undefined) updateData.isActive = isActive

    try {
      // Check if user exists first
      const existingUser = await prisma.user.findUnique({
        where: { id },
        include: { permissions: true },
      })

      if (!existingUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          ...updateData,
          permissions:
            permissions && (role === "CUSTOM" || existingUser.role === "CUSTOM")
              ? {
                  upsert: {
                    create: {
                      dashboard: permissions.dashboard || "NONE",
                      employees: permissions.employees || "NONE",
                      products: permissions.products || "NONE",
                      inventory: permissions.inventory || "NONE",
                      companies: permissions.companies || "NONE",
                      tasks: permissions.tasks || "NONE",
                      workUpdates: permissions.workUpdates || "NONE",
                      reports: permissions.reports || "NONE",
                      credentials: permissions.credentials || "NONE",
                      settings: permissions.settings || "NONE",
                      canDownload: permissions.canDownload || false,
                      canManageUsers: permissions.canManageUsers || false,
                      canViewAllTasks: permissions.canViewAllTasks || false,
                      canViewOwnTasks: permissions.canViewOwnTasks || true,
                      canEditOwnTasks: permissions.canEditOwnTasks || false,
                      canEditAllTasks: permissions.canEditAllTasks || false,
                      canCreateTasks: permissions.canCreateTasks || false,
                      canDeleteTasks: permissions.canDeleteTasks || false,
                    },
                    update: {
                      dashboard: permissions.dashboard || "NONE",
                      employees: permissions.employees || "NONE",
                      products: permissions.products || "NONE",
                      inventory: permissions.inventory || "NONE",
                      companies: permissions.companies || "NONE",
                      tasks: permissions.tasks || "NONE",
                      workUpdates: permissions.workUpdates || "NONE",
                      reports: permissions.reports || "NONE",
                      credentials: permissions.credentials || "NONE",
                      settings: permissions.settings || "NONE",
                      canDownload: permissions.canDownload || false,
                      canManageUsers: permissions.canManageUsers || false,
                      canViewAllTasks: permissions.canViewAllTasks || false,
                      canViewOwnTasks: permissions.canViewOwnTasks || true,
                      canEditOwnTasks: permissions.canEditOwnTasks || false,
                      canEditAllTasks: permissions.canEditAllTasks || false,
                      canCreateTasks: permissions.canCreateTasks || false,
                      canDeleteTasks: permissions.canDeleteTasks || false,
                    },
                  },
                }
              : undefined,
        },
        include: {
          permissions: true,
        },
      })

      return NextResponse.json(user)
    } catch (error: any) {
      console.error("Prisma update error:", error)
      if (error.code === "P2002") {
        return NextResponse.json({ error: "Username already exists" }, { status: 400 })
      }
      if (error.code === "P2025") {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      if (error.code === "P2023") {
        return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
      }
      return NextResponse.json({ error: "Database error: " + error.message }, { status: 500 })
    }
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// Delete user (Admin only)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const userRole = cookieStore.get("userRole")?.value
    const username = cookieStore.get("username")?.value

    // Check if user is admin
    if (userRole !== "ADMIN" && username !== "sp it") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Basic ID validation
    if (!id || id.length < 1) {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }

    try {
      // Check if user exists and prevent deleting admin user
      const existingUser = await prisma.user.findUnique({
        where: { id },
      })

      if (!existingUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      if (existingUser.username === "sp it") {
        return NextResponse.json({ error: "Cannot delete admin user" }, { status: 400 })
      }

      await prisma.user.delete({
        where: { id },
      })

      return NextResponse.json({ message: "User deleted successfully" })
    } catch (error: any) {
      console.error("Prisma delete error:", error)
      if (error.code === "P2025") {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      if (error.code === "P2023") {
        return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
      }
      return NextResponse.json({ error: "Database error: " + error.message }, { status: 500 })
    }
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
