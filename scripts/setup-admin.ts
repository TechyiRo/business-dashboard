import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function setupAdmin() {
  try {
    console.log("Setting up admin user...")

    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { username: "sp it" },
      update: {},
      create: {
        username: "sp it",
        password: "SanRo@2019!", // In production, this should be hashed
        role: "ADMIN",
        isActive: true,
        permissions: {
          create: {
            dashboard: "FULL",
            employees: "FULL",
            products: "FULL",
            inventory: "FULL",
            companies: "FULL",
            tasks: "FULL",
            workUpdates: "FULL",
            reports: "FULL",
            credentials: "FULL",
            settings: "FULL",
            canDownload: true,
            canManageUsers: true,
            canViewAllTasks: true,
            canViewOwnTasks: true,
            canEditOwnTasks: true,
            canEditAllTasks: true,
            canCreateTasks: true,
            canDeleteTasks: true,
          },
        },
      },
      include: {
        permissions: true,
      },
    })

    console.log("✅ Admin user created successfully:")
    console.log("👑 Username:", adminUser.username)
    console.log("🔐 Role:", adminUser.role)
    console.log("⚡ Status:", adminUser.isActive ? "Active" : "Inactive")
  } catch (error) {
    console.error("❌ Error setting up admin user:", error)
  } finally {
    await prisma.$disconnect()
  }
}

setupAdmin()
