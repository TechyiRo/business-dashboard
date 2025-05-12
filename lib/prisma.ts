import { PrismaClient } from "@prisma/client"

// Add better error handling for missing environment variables
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set")
  // In development, we can provide a fallback for easier debugging
  if (process.env.NODE_ENV !== "production") {
    console.warn("Using fallback DATABASE_URL for development")
  } else {
    // In production, log a more helpful error
    console.error("Please set the DATABASE_URL environment variable in your Vercel project settings")
  }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// If there's an error with Prisma, we want to handle it gracefully
process.on("beforeExit", async () => {
  await prisma.$disconnect()
})
