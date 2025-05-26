import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Setting up work updates...")

  // Create default work tags
  const defaultTags = [
    { name: "Social Work", color: "#3B82F6" },
    { name: "Website Work", color: "#10B981" },
    { name: "Design Work", color: "#8B5CF6" },
    { name: "Development", color: "#F59E0B" },
    { name: "Marketing", color: "#EF4444" },
    { name: "Research", color: "#06B6D4" },
    { name: "Testing", color: "#84CC16" },
    { name: "Documentation", color: "#F97316" },
  ]

  for (const tag of defaultTags) {
    try {
      await prisma.workTag.upsert({
        where: { name: tag.name },
        update: { color: tag.color },
        create: tag,
      })
      console.log(`✓ Created/updated tag: ${tag.name}`)
    } catch (error) {
      console.log(`✗ Failed to create tag ${tag.name}:`, error)
    }
  }

  console.log("Work updates setup completed!")
}

main()
  .catch((e) => {
    console.error("Error setting up work updates:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
