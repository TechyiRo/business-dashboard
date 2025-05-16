import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function fixInventoryRelations() {
  console.log("Starting inventory relations fix...")

  try {
    // Get all inventory items
    const inventoryItems = await prisma.$queryRaw`
      db.ProductInventory.find({}).forEach(function(item) {
        // Check if productId exists and is valid
        if (!item.productId) {
          print("Item " + item._id + " has no productId");
          db.ProductInventory.updateOne(
            { _id: item._id },
            { $set: { productId: null } }
          );
        } else {
          var product = db.Product.findOne({ _id: item.productId });
          if (!product) {
            print("Item " + item._id + " has invalid productId: " + item.productId);
            db.ProductInventory.updateOne(
              { _id: item._id },
              { $set: { productId: null } }
            );
          }
        }
        
        // Check if companyId exists and is valid
        if (!item.companyId) {
          print("Item " + item._id + " has no companyId");
          db.ProductInventory.updateOne(
            { _id: item._id },
            { $set: { companyId: null } }
          );
        } else {
          var company = db.Company.findOne({ _id: item.companyId });
          if (!company) {
            print("Item " + item._id + " has invalid companyId: " + item.companyId);
            db.ProductInventory.updateOne(
              { _id: item._id },
              { $set: { companyId: null } }
            );
          }
        }
      });
    `

    console.log("Inventory relations fix completed")
  } catch (error) {
    console.error("Error fixing inventory relations:", error)
  } finally {
    await prisma.$disconnect()
  }
}

fixInventoryRelations()
  .then(() => console.log("Script completed"))
  .catch((e) => console.error("Script failed:", e))
