import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function setupMukeshUser() {
  try {
    console.log("Setting up Mukesh user...")

    // First, let's check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: "spit.mukesh" },
    })

    if (existingUser) {
      console.log("User already exists, updating...")

      // Update existing user
      const user = await prisma.user.update({
        where: { username: "spit.mukesh" },
        data: {
          password: "Mukesh@2025!",
          role: "CUSTOM", // Use CUSTOM role since WORK_USER might not exist yet
          isActive: true,
        },
      })

      console.log("User updated:", user)
    } else {
      // Create new user
      const user = await prisma.user.create({
        data: {
          username: "spit.mukesh",
          password: "Mukesh@2025!",
          role: "CUSTOM", // Use CUSTOM role
          isActive: true,
        },
      })

      console.log("User created:", user)
    }

    // Get the user to work with
    const user = await prisma.user.findUnique({
      where: { username: "spit.mukesh" },
    })

    if (!user) {
      throw new Error("Failed to create or find user")
    }

    // Create or update custom permissions for the user
    const permissions = await prisma.userPermission.upsert({
      where: { userId: user.id },
      update: {
        dashboard: "NONE",
        employees: "NONE",
        products: "NONE",
        inventory: "NONE",
        companies: "NONE",
        tasks: "NONE",
        workUpdates: "WRITE",
        reports: "NONE",
        credentials: "NONE",
        settings: "NONE",
        canDownload: false,
        canManageUsers: false,
        canViewOwnWorkUpdates: true,
        canViewAllWorkUpdates: false,
        canEditOwnWorkUpdates: true,
        canEditAllWorkUpdates: false,
        canCreateWorkUpdates: true,
        canDeleteWorkUpdates: false,
        canExportWorkUpdates: false,
        canViewAllTasks: false,
        canViewOwnTasks: false,
        canEditOwnTasks: false,
        canEditAllTasks: false,
        canCreateTasks: false,
        canDeleteTasks: false,
      },
      create: {
        userId: user.id,
        dashboard: "NONE",
        employees: "NONE",
        products: "NONE",
        inventory: "NONE",
        companies: "NONE",
        tasks: "NONE",
        workUpdates: "WRITE",
        reports: "NONE",
        credentials: "NONE",
        settings: "NONE",
        canDownload: false,
        canManageUsers: false,
        canViewOwnWorkUpdates: true,
        canViewAllWorkUpdates: false,
        canEditOwnWorkUpdates: true,
        canEditAllWorkUpdates: false,
        canCreateWorkUpdates: true,
        canDeleteWorkUpdates: false,
        canExportWorkUpdates: false,
        canViewAllTasks: false,
        canViewOwnTasks: false,
        canEditOwnTasks: false,
        canEditAllTasks: false,
        canCreateTasks: false,
        canDeleteTasks: false,
      },
    })

    console.log("Permissions created/updated:", permissions)

    // Create an employee record for Mukesh if it doesn't exist
    try {
      const employee = await prisma.employee.upsert({
        where: { email: "spit.mukesh@example.com" },
        update: {
          name: "Mukesh Kumar",
          position: "IT Specialist",
          phone: "123-456-7890",
        },
        create: {
          name: "Mukesh Kumar",
          position: "IT Specialist",
          email: "spit.mukesh@example.com",
          phone: "123-456-7890",
        },
      })

      console.log("Employee created/updated:", employee)
    } catch (error) {
      console.log("Note: Could not create employee record (table might not exist yet)")
    }

    console.log("✅ Mukesh user setup completed successfully!")
    console.log("Login credentials:")
    console.log("Username: spit.mukesh")
    console.log("Password: Mukesh@2025!")
    console.log("Role: CUSTOM with Work Updates only permissions")
  } catch (error) {
    console.error("Error setting up Mukesh user:", error)
  } finally {
    await prisma.$disconnect()
  }
}

setupMukeshUser()
