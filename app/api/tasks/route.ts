import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { sendTaskAssignmentEmail } from "@/lib/email-service"

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

    // Create the task
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

    // Send email notification to assigned employee
    try {
      if (task.assignedTo?.email) {
        const emailResult = await sendTaskAssignmentEmail(task.assignedTo.email, task.assignedTo.name, {
          taskName: task.name,
          taskDetails: task.details,
          dueDate: task.date.toISOString(),
          assignedBy: task.assignedBy?.name || "System",
          assignedTo: task.assignedTo.name,
          product: task.product?.name || "N/A",
          company: task.company?.name || "N/A",
          status: task.status,
        })

        if (emailResult.success) {
          console.log(`✅ Email notification sent to ${task.assignedTo.email} for task: ${task.name}`)
        } else {
          console.error(`❌ Failed to send email notification: ${emailResult.error}`)
        }
      } else {
        console.warn(`⚠️ No email address found for assigned employee: ${task.assignedTo?.name}`)
      }
    } catch (emailError) {
      console.error("❌ Error sending task assignment email:", emailError)
      // Don't fail the task creation if email fails
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Error creating task" }, { status: 500 })
  }
}
