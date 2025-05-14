import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const inventoryItems = await prisma.productInventory.findMany({
      include: {
        product: true,
        company: true,
      },
    })
    return NextResponse.json(inventoryItems || [])
  } catch (error) {
    console.error("Error fetching inventory items:", error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
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
