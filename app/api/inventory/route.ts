import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Use a simpler query that doesn't rely on relations
    const inventoryItems = await prisma.productInventory.findMany()

    // Then manually fetch the related products and companies
    const itemsWithRelations = await Promise.all(
      inventoryItems.map(async (item) => {
        let product = null
        let company = null

        // Only try to fetch product if productId exists
        if (item.productId) {
          try {
            product = await prisma.product.findUnique({
              where: { id: item.productId },
            })
          } catch (e) {
            console.error(`Error fetching product for item ${item.id}:`, e)
          }
        }

        // Only try to fetch company if companyId exists
        if (item.companyId) {
          try {
            company = await prisma.company.findUnique({
              where: { id: item.companyId },
            })
          } catch (e) {
            console.error(`Error fetching company for item ${item.id}:`, e)
          }
        }

        return {
          ...item,
          product,
          company,
        }
      }),
    )

    return NextResponse.json(itemsWithRelations)
  } catch (error) {
    console.error("Error fetching inventory items:", error)
    return NextResponse.json({ error: "Failed to fetch inventory items" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Verify that the product and company exist before creating the inventory item
    let productExists = false
    let companyExists = false

    if (data.productId) {
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
      })
      productExists = !!product
    }

    if (data.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: data.companyId },
      })
      companyExists = !!company
    }

    // Create the inventory item with validated relations
    const inventoryItem = await prisma.productInventory.create({
      data: {
        productName: data.productName,
        serialNumber: data.serialNumber,
        status: data.status,
        imageUrl: data.imageUrl,
        productId: productExists ? data.productId : null,
        companyId: companyExists ? data.companyId : null,
      },
    })

    // Manually fetch the related product and company
    let product = null
    let company = null

    if (inventoryItem.productId) {
      product = await prisma.product.findUnique({
        where: { id: inventoryItem.productId },
      })
    }

    if (inventoryItem.companyId) {
      company = await prisma.company.findUnique({
        where: { id: inventoryItem.companyId },
      })
    }

    return NextResponse.json({
      ...inventoryItem,
      product,
      company,
    })
  } catch (error) {
    console.error("Error creating inventory item:", error)
    return NextResponse.json({ error: "Error creating inventory item" }, { status: 500 })
  }
}
