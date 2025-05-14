import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: params.id },
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json({ error: "Error fetching company" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const company = await prisma.company.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json(company)
  } catch (error) {
    console.error("Error updating company:", error)
    return NextResponse.json({ error: "Error updating company" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if company is used in any tasks
    const tasks = await prisma.task.findMany({
      where: { companyId: params.id },
    })

    // Check if company is used in any inventory items
    const inventoryItems = await prisma.productInventory.findMany({
      where: { companyId: params.id },
    })

    // If company is used in tasks or inventory items, return error
    if (tasks.length > 0 || inventoryItems.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete company. Company is used in tasks or inventory items.",
          tasks: tasks.length,
          inventoryItems: inventoryItems.length,
        },
        { status: 400 },
      )
    }

    // Delete company if not used in any tasks or inventory items
    await prisma.company.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting company:", error)
    return NextResponse.json({ error: "Error deleting company" }, { status: 500 })
  }
}
