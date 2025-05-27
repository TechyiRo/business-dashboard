import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function fixUserRoles() {
  try {
    console.log("🔧 Fixing user roles and data...")

    // Update any invalid roles to valid ones
    const invalidRoles = await prisma.user.findMany({
      where: {
        role: {
          notIn: ["ADMIN", "FULL_ACCESS", "READ_ONLY", "TASK_USER", "WORK_EDITOR", "VIEWER", "CUSTOM"],
        },
      },
    })

    console.log(`Found ${invalidRoles.length} users with invalid roles`)

    for (const user of invalidRoles) {
      console.log(`Fixing user: ${user.username} with role: ${user.role}`)

      // Map old roles to new ones
      let newRole = "READ_ONLY" // default

      if (user.role === "WORK_EDITOR" || user.role === "EDITOR") {
        newRole = "WORK_EDITOR"
      } else if (user.role === "VIEWER") {
        newRole = "READ_ONLY"
      } else if (user.role === "ADMIN") {
        newRole = "ADMIN"
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { role: newRole as any },
      })

      console.log(`✅ Updated ${user.username} to role: ${newRole}`)
    }

    // Ensure admin user exists
    const adminUser = await prisma.user.findFirst({
      where: { username: "sp it" },
    })

    if (!adminUser) {
      console.log("Creating admin user...")
      await prisma.user.create({
        data: {
          username: "sp it",
          password: "SanRo@2019!", // In production, hash this
          role: "ADMIN",
          isActive: true,
        },
      })
      console.log("✅ Admin user created")
    } else {
      console.log("✅ Admin user already exists")
    }

    console.log("🎉 User roles fixed successfully!")
  } catch (error) {
    console.error("❌ Error fixing user roles:", error)
  } finally {
    await prisma.$disconnect()
  }
}

fixUserRoles()
