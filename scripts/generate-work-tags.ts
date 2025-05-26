import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const defaultWorkTags = [
  { name: "Social Work", color: "bg-blue-500 hover:bg-blue-600" },
  { name: "Website Work", color: "bg-green-500 hover:bg-green-600" },
  { name: "Design Work", color: "bg-purple-500 hover:bg-purple-600" },
  { name: "Development", color: "bg-yellow-500 hover:bg-yellow-600" },
  { name: "Meeting", color: "bg-red-500 hover:bg-red-600" },
  { name: "Research", color: "bg-indigo-500 hover:bg-indigo-600" },
  { name: "Documentation", color: "bg-pink-500 hover:bg-pink-600" },
]

async function main() {
  console.log("Starting to create default work tags...")

  for (const tag of defaultWorkTags) {
    // Check if tag already exists
    const existingTag = await prisma.workTag.findUnique({
      where: {
        name: tag.name,
      },
    })

    if (!existingTag) {
      // Create tag if it doesn't exist
      await prisma.workTag.create({
        data: {
          name: tag.name,
          color: tag.color,
        },
      })
      console.log(`Created tag: ${tag.name}`)
    } else {
      console.log(`Tag already exists: ${tag.name}`)
    }
  }

  console.log("Default work tags created successfully!")
}

main()
  .catch((e) => {
    console.error("Error creating default work tags:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
