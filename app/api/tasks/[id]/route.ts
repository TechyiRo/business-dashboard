import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { sendTaskAssignmentEmail } from "@/lib/email-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const taskId = params.id

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        product: true,
        company: true,
        assignedBy: true,
        assignedTo: true,
        workDetail: true,
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json({ error: "Error fetching task" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const taskId = params.id
    const data = await request.json()

    // Get the current task to check if assignedTo changed
    const currentTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignedTo: true,
      },
    })

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

    // Send email notification if the task was reassigned to a different person
    try {
      const wasReassigned = currentTask?.assignedToId !== updatedTask.assignedToId

      if (wasReassigned && updatedTask.assignedTo?.email) {
        const emailResult = await sendTaskAssignmentEmail(updatedTask.assignedTo.email, updatedTask.assignedTo.name, {
          taskName: updatedTask.name,
          taskDetails: updatedTask.details,
          dueDate: updatedTask.date.toISOString(),
          assignedBy: updatedTask.assignedBy?.name || "System",
          assignedTo: updatedTask.assignedTo.name,
          product: updatedTask.product?.name || "N/A",
          company: updatedTask.company?.name || "N/A",
          status: updatedTask.status,
        })

        if (emailResult.success) {
          console.log(`✅ Reassignment email sent to ${updatedTask.assignedTo.email} for task: ${updatedTask.name}`)
        } else {
          console.error(`❌ Failed to send reassignment email: ${emailResult.error}`)
        }
      }
    } catch (emailError) {
      console.error("❌ Error sending task reassignment email:", emailError)
      // Don't fail the task update if email fails
    }

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
