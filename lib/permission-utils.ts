// Centralized permission checking utilities

export function hasPermission(user: any, module: string, action = "view"): boolean {
  if (!user) {
    console.log("No user provided to hasPermission")
    return false
  }

  console.log(
    `Checking permission for user: ${user.username}, role: ${user.role}, module: ${module}, action: ${action}`,
  )

  // Admin always has all permissions
  if (user.role === "ADMIN") {
    console.log("User is admin, granting permission")
    return true
  }

  // FULL_ACCESS role has all permissions except user management
  if (user.role === "FULL_ACCESS") {
    console.log("User has FULL_ACCESS role, granting permission")
    return true
  }

  // Check custom permissions
  if (user.permissions && typeof user.permissions === "object") {
    const modulePermission = user.permissions[module]
    console.log(`Module ${module} permission: ${modulePermission}`)

    if (modulePermission === "FULL") return true
    if (modulePermission === "WRITE" && ["view", "create", "edit"].includes(action)) return true
    if (modulePermission === "READ" && action === "view") return true
  }

  // Check role-based permissions
  switch (user.role) {
    case "WORK_EDITOR":
      if (module === "workUpdates" && ["view", "create", "edit"].includes(action)) return true
      if (
        ["dashboard", "employees", "products", "companies", "tasks", "reports", "credentials", "inventory"].includes(
          module,
        ) &&
        action === "view"
      )
        return true
      break
    case "READ_ONLY":
    case "VIEWER":
      if (action === "view") return true
      break
    case "TASK_USER":
      if (module === "tasks") return true
      break
  }

  console.log(`Permission denied for user ${user.username}, module ${module}, action ${action}`)
  return false
}

export async function getCurrentUser() {
  try {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")
    const authenticatedCookie = cookieStore.get("authenticated")
    const userRoleCookie = cookieStore.get("userRole")
    const usernameCookie = cookieStore.get("username")

    console.log("getCurrentUser - Session cookie exists:", !!sessionCookie)
    console.log("getCurrentUser - Authenticated cookie:", authenticatedCookie?.value)

    // Try session cookie first
    if (sessionCookie) {
      try {
        const sessionData = JSON.parse(sessionCookie.value)
        console.log("getCurrentUser - Session data:", sessionData)

        // Try to get fresh user data from database
        try {
          const { prisma } = await import("@/lib/prisma")
          const user = await prisma.user.findUnique({
            where: { id: sessionData.userId },
          })

          if (user) {
            console.log("getCurrentUser - User from database:", user.username)
            // Parse permissions
            let permissions = {}
            if (user.permissions) {
              try {
                permissions = typeof user.permissions === "string" ? JSON.parse(user.permissions) : user.permissions
              } catch (error) {
                console.error("Error parsing permissions:", error)
                permissions = {}
              }
            }

            return {
              id: user.id,
              username: user.username,
              role: user.role,
              permissions: permissions,
            }
          }
        } catch (dbError) {
          console.error("Database error in getCurrentUser:", dbError)
        }

        // Use session data if database is unavailable
        console.log("getCurrentUser - Using session fallback")
        let permissions = {}
        if (sessionData.permissions) {
          try {
            permissions =
              typeof sessionData.permissions === "string"
                ? JSON.parse(sessionData.permissions)
                : sessionData.permissions
          } catch (error) {
            console.error("Error parsing session permissions:", error)
            permissions = {}
          }
        }

        return {
          id: sessionData.userId,
          username: sessionData.username,
          role: sessionData.role,
          permissions: permissions,
        }
      } catch (error) {
        console.error("Error parsing session in getCurrentUser:", error)
      }
    }

    // Fallback to individual cookies
    if (authenticatedCookie?.value === "true" && userRoleCookie && usernameCookie) {
      console.log("getCurrentUser - Using fallback cookies")
      return {
        id: "fallback-" + usernameCookie.value,
        username: usernameCookie.value,
        role: userRoleCookie.value,
        permissions: {},
      }
    }

    console.log("getCurrentUser - No valid user found")
    return null
  } catch (error) {
    console.error("Error in getCurrentUser:", error)
    return null
  }
}
