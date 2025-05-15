import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Instead of trying to filter out invalid items first (which causes the error),
    // we'll directly fetch all inventory items and handle any potential issues
    const inventoryItems = await prisma.productInventory.findMany({
      include: {
        product: true,
        company: true,
      },
    })

    // Filter out any items with null relations on the JavaScript side
    const validItems = inventoryItems.filter((item) => item.product !== null && item.company !== null)

    return NextResponse.json(validItems)
  } catch (error) {
    console.error("Error fetching inventory items:", error)
    return NextResponse.json({ error: "Failed to fetch inventory items" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Verify that the product and company exist before creating the inventory item
    const [product, company] = await Promise.all([
      prisma.product.findUnique({ where: { id: data.productId } }),
      prisma.company.findUnique({ where: { id: data.companyId } }),
    ])

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    const inventoryItem = await prisma.productInventory.create({
      data: {
        productName: data.productName,
        serialNumber: data.serialNumber,
        status: data.status,
        imageUrl: data.imageUrl,
        productId: data.productId,
        companyId: data.companyId,
      },
      include: {
        product: true,
        company: true,
      },
    })
    return NextResponse.json(inventoryItem)
  } catch (error) {
    console.error("Error creating inventory item:", error)
    return NextResponse.json({ error: "Error creating inventory item" }, { status: 500 })
  }
}
