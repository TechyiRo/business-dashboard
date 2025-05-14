import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const inventoryItem = await prisma.productInventory.findUnique({
      where: { id: params.id },
      include: {
        product: true,
        company: true,
      },
    })

    if (!inventoryItem) {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 })
    }

    return NextResponse.json(inventoryItem)
  } catch (error) {
    console.error("Error fetching inventory item:", error)
    return NextResponse.json({ error: "Error fetching inventory item" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const inventoryItem = await prisma.productInventory.update({
      where: { id: params.id },
      data,
      include: {
        product: true,
        company: true,
      },
    })
    return NextResponse.json(inventoryItem)
  } catch (error) {
    console.error("Error updating inventory item:", error)
    return NextResponse.json({ error: "Error updating inventory item" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.productInventory.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting inventory item:", error)
    return NextResponse.json({ error: "Error deleting inventory item" }, { status: 500 })
  }
}
