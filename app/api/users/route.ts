import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

// Simple ObjectID validation without MongoDB dependency
function isValidObjectId(id: string): boolean {
  // Check if it's a 24-character hex string
  return /^[0-9a-fA-F]{24}$/.test(id)
}

// Generate a simple ObjectID-like string
function generateObjectId(): string {
  return (
    Math.random().toString(16).substring(2, 10) +
    Math.random().toString(16).substring(2, 10) +
    Math.random().toString(16).substring(2, 8)
  )
}

// Get all users (Admin only)
export async function GET() {
  try {
    const cookieStore = await cookies()
    const userRole = cookieStore.get("userRole")?.value
    const username = cookieStore.get("username")?.value

    // Check if user is admin
    if (userRole !== "ADMIN" && username !== "sp it") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    let users = []
    try {
      users = await prisma.user.findMany({
        include: {
          permissions: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    } catch (error) {
      console.log("Database error:", error)
      console.log("Database not ready, returning hardcoded users")
      // Return hardcoded users if database is not ready
      users = [
        {
          id: generateObjectId(),
          username: "sp it",
          role: "ADMIN",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          permissions: null,
        },
        {
          id: generateObjectId(),
          username: "demo-user",
          role: "READ_ONLY",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          permissions: {
            id: generateObjectId(),
            userId: generateObjectId(),
            dashboard: "READ",
            employees: "READ",
            products: "READ",
            inventory: "READ",
            companies: "READ",
            tasks: "READ",
            workUpdates: "READ",
            reports: "READ",
            credentials: "READ",
            settings: "NONE",
            canDownload: false,
            canManageUsers: false,
            canViewAllTasks: true,
            canViewOwnTasks: true,
            canEditOwnTasks: false,
            canEditAllTasks: false,
            canCreateTasks: false,
            canDeleteTasks: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ]
    }

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// Create new user (Admin only)
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userRole = cookieStore.get("userRole")?.value
    const username = cookieStore.get("username")?.value

    // Check if user is admin
    if (userRole !== "ADMIN" && username !== "sp it") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { username: newUsername, password, role, permissions } = await request.json()

    // Validate required fields
    if (!newUsername || !password || !role) {
      return NextResponse.json({ error: "Username, password, and role are required" }, { status: 400 })
    }

    // Validate role enum
    const validRoles = ["ADMIN", "FULL_ACCESS", "READ_ONLY", "TASK_USER", "WORK_EDITOR", "VIEWER", "CUSTOM"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}` }, { status: 400 })
    }

    try {
      // Create user with permissions
      const user = await prisma.user.create({
        data: {
          username: newUsername,
          password, // In production, hash this password
          role,
          isActive: true,
          permissions:
            permissions && role === "CUSTOM"
              ? {
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
                }
              : undefined,
        },
        include: {
          permissions: true,
        },
      })

      return NextResponse.json(user)
    } catch (error: any) {
      console.error("Prisma error:", error)
      if (error.code === "P2002") {
        return NextResponse.json({ error: "Username already exists" }, { status: 400 })
      }
      return NextResponse.json({ error: "Database error: " + error.message }, { status: 500 })
    }
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
