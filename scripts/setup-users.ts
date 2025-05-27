import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function setupUsers() {
  try {
    console.log("Setting up users...")

    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { username: "sp it" },
      update: {},
      create: {
        username: "sp it",
        password: "SanRo@2019!", // In production, this should be hashed
        role: "ADMIN",
      },
    })

    // Create work editor user
    const workEditorUser = await prisma.user.upsert({
      where: { username: "sp-it@work" },
      update: {},
      create: {
        username: "sp-it@work",
        password: "SanRo@2019", // In production, this should be hashed
        role: "WORK_EDITOR",
      },
    })

    console.log("✅ Users created successfully:")
    console.log("👑 Admin:", adminUser.username, "- Role:", adminUser.role)
    console.log("✏️ Work Editor:", workEditorUser.username, "- Role:", workEditorUser.role)
  } catch (error) {
    console.error("❌ Error setting up users:", error)
  } finally {
    await prisma.$disconnect()
  }
}

setupUsers()
