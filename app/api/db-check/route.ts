import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Try a simple query to check if the database is connected
    const productsCount = await prisma.product.count()
    const companiesCount = await prisma.company.count()
    const employeesCount = await prisma.employee.count()
    const tasksCount = await prisma.task.count()
    const inventoryCount = await prisma.productInventory.count()

    return NextResponse.json({
      status: "connected",
      counts: {
        products: productsCount,
        companies: companiesCount,
        employees: employeesCount,
        tasks: tasksCount,
        inventory: inventoryCount,
      },
    })
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown database error",
      },
      { status: 500 },
    )
  }
}
