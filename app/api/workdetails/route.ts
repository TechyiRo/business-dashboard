import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const workDetails = await prisma.workDetail.findMany({
      include: {
        task: true,
        employee: true,
      },
    })
    return NextResponse.json(workDetails)
  } catch (error) {
    console.error("Error fetching work details:", error)
    return NextResponse.json({ error: "Error fetching work details" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // First update the task status to "Complete"
    await prisma.task.update({
      where: { id: data.taskId },
      data: { status: "Complete" },
    })

    // Then create the work detail
    const workDetail = await prisma.workDetail.create({
      data: {
        completionDate: new Date(data.completionDate),
        status: data.status,
        step1: data.step1,
        step2: data.step2 || null,
        step3: data.step3 || null,
        additionalSteps: data.additionalSteps || null,
        taskId: data.taskId,
        employeeId: data.employeeId,
      },
      include: {
        task: true,
        employee: true,
      },
    })

    return NextResponse.json(workDetail)
  } catch (error) {
    console.error("Error creating work detail:", error)
    return NextResponse.json({ error: "Error creating work detail" }, { status: 500 })
  }
}
