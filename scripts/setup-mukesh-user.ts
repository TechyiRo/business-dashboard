import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function setupMukeshUser() {
  try {
    console.log("Setting up Mukesh user...")

    // Create the user with WORK_USER role
    const user = await prisma.user.upsert({
      where: { username: "spit.mukesh" },
      update: {
        password: "Mukesh@2025!",
        role: "WORK_USER", // Now this role exists in the enum
        isActive: true,
      },
      create: {
        username: "spit.mukesh",
        password: "Mukesh@2025!",
        role: "WORK_USER", // Now this role exists in the enum
        isActive: true,
      },
    })

    console.log("User created/updated:", user)

    // Create custom permissions for the user
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

    // Create an employee record for Mukesh
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
      console.log("Note: Could not create employee record:", error)
    }

    console.log("✅ Mukesh user setup completed successfully!")
    console.log("Login credentials:")
    console.log("Username: spit.mukesh")
    console.log("Password: Mukesh@2025!")
    console.log("Role: WORK_USER (Work Updates only)")
    console.log("Permissions: Can view/edit own work updates only")
  } catch (error) {
    console.error("Error setting up Mukesh user:", error)
  } finally {
    await prisma.$disconnect()
  }
}

setupMukeshUser()
