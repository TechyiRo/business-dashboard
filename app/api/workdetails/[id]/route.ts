import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // First try to find the work detail directly by ID
    let workDetail = await prisma.workDetail.findUnique({
      where: { id: params.id },
      include: {
        task: {
          include: {
            product: true,
            company: true,
            assignedBy: true,
            assignedTo: true,
          },
        },
        employee: true,
      },
    })

    // If not found, try to find by taskId
    if (!workDetail) {
      workDetail = await prisma.workDetail.findUnique({
        where: { taskId: params.id },
        include: {
          task: {
            include: {
              product: true,
              company: true,
              assignedBy: true,
              assignedTo: true,
            },
          },
          employee: true,
        },
      })
    }

    if (!workDetail) {
      return NextResponse.json({ error: "Work detail not found" }, { status: 404 })
    }

    return NextResponse.json(workDetail)
  } catch (error) {
    console.error("Error fetching work detail:", error)
    return NextResponse.json({ error: "Error fetching work detail" }, { status: 500 })
  }
}
