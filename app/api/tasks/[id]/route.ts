import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const taskId = params.id
    const data = await request.json()

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data,
      include: {
        product: true,
        company: true,
        assignedBy: true,
        assignedTo: true,
      },
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Error updating task" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const taskId = params.id

    // Check if there's a work detail associated with this task
    const workDetail = await prisma.workDetail.findUnique({
      where: { taskId },
    })

    // If there is, delete it first
    if (workDetail) {
      await prisma.workDetail.delete({
        where: { id: workDetail.id },
      })
    }

    // Then delete the task
    await prisma.task.delete({
      where: { id: taskId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Error deleting task" }, { status: 500 })
  }
}
