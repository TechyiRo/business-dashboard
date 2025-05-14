import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Error fetching product" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const product = await prisma.product.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json(product)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Error updating product" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if product is used in any tasks
    const tasks = await prisma.task.findMany({
      where: { productId: params.id },
    })

    // Check if product is used in any inventory items
    const inventoryItems = await prisma.productInventory.findMany({
      where: { productId: params.id },
    })

    // If product is used in tasks or inventory items, return error
    if (tasks.length > 0 || inventoryItems.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete product. Product is used in tasks or inventory items.",
          tasks: tasks.length,
          inventoryItems: inventoryItems.length,
        },
        { status: 400 },
      )
    }

    // Delete product if not used in any tasks or inventory items
    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Error deleting product" }, { status: 500 })
  }
}
