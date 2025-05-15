import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function fixInventoryData() {
  console.log("Starting inventory data fix...")

  try {
    // 1. Find all inventory items
    const allInventoryItems = await prisma.productInventory.findMany()
    console.log(`Found ${allInventoryItems.length} inventory items`)

    // 2. Check each item for valid product and company references
    let fixedCount = 0
    let deletedCount = 0

    for (const item of allInventoryItems) {
      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })

      // Check if company exists
      const company = await prisma.company.findUnique({
        where: { id: item.companyId },
      })

      if (!product || !company) {
        console.log(
          `Deleting orphaned inventory item: ${item.id} (Product: ${product ? "Found" : "Missing"}, Company: ${company ? "Found" : "Missing"})`,
        )

        // Delete the orphaned record
        await prisma.productInventory.delete({
          where: { id: item.id },
        })

        deletedCount++
      } else {
        console.log(`Inventory item ${item.id} has valid references`)
        fixedCount++
      }
    }

    console.log("Inventory data fix completed:")
    console.log(`- ${fixedCount} valid items`)
    console.log(`- ${deletedCount} orphaned items deleted`)
  } catch (error) {
    console.error("Error fixing inventory data:", error)
  } finally {
    await prisma.$disconnect()
  }
}

fixInventoryData()
  .then(() => console.log("Script completed"))
  .catch((e) => console.error("Script failed:", e))
