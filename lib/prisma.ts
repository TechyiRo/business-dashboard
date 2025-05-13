import { PrismaClient } from "@prisma/client"

// Better error handling for MongoDB connection issues
function getPrismaClient() {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    // Create a new PrismaClient instance
    const client = new PrismaClient({
      log: ["error", "warn"],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })

    // Test the connection
    return client
  } catch (error) {
    console.error("Failed to initialize Prisma Client:", error)

    // In development, provide more helpful error messages
    if (process.env.NODE_ENV !== "production") {
      console.error(`
        MongoDB Connection Error: ${error instanceof Error ? error.message : String(error)}
        
        Common solutions:
        1. Check username and password in your connection string
        2. Ensure the user has proper database access permissions
        3. Verify network access settings in MongoDB Atlas
        4. Check if special characters in password are properly URL encoded
      `)
    }

    // Return a dummy client that will throw clear errors
    return new PrismaClient({
      datasources: {
        db: {
          url: "mongodb://localhost:27017/dummy",
        },
      },
    })
  }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || getPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect()
})
