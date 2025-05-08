import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        product: true,
        company: true,
        assignedBy: true,
        assignedTo: true,
        workDetail: {
          select: {
            id: true,
          },
        },
      },
    })
    return NextResponse.json(tasks || [])
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const task = await prisma.task.create({
      data: {
        name: data.name,
        details: data.details,
        date: new Date(data.date),
        status: data.status,
        productId: data.productId,
        companyId: data.companyId,
        assignedById: data.assignedById,
        assignedToId: data.assignedToId,
      },
      include: {
        product: true,
        company: true,
        assignedBy: true,
        assignedTo: true,
      },
    })
    return NextResponse.json(task)
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Error creating task" }, { status: 500 })
  }
}
