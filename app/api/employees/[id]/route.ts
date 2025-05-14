import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error("Error fetching employee:", error)
    return NextResponse.json({ error: "Error fetching employee" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const employee = await prisma.employee.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json(employee)
  } catch (error) {
    console.error("Error updating employee:", error)
    return NextResponse.json({ error: "Error updating employee" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if employee is assigned to any tasks
    const tasksAssignedBy = await prisma.task.findMany({
      where: { assignedById: params.id },
    })

    const tasksAssignedTo = await prisma.task.findMany({
      where: { assignedToId: params.id },
    })

    const workDetails = await prisma.workDetail.findMany({
      where: { employeeId: params.id },
    })

    // If employee is assigned to tasks or work details, return error
    if (tasksAssignedBy.length > 0 || tasksAssignedTo.length > 0 || workDetails.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete employee. Employee is assigned to tasks or work details.",
          tasksAssignedBy: tasksAssignedBy.length,
          tasksAssignedTo: tasksAssignedTo.length,
          workDetails: workDetails.length,
        },
        { status: 400 },
      )
    }

    // Delete employee if not assigned to any tasks
    await prisma.employee.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting employee:", error)
    return NextResponse.json({ error: "Error deleting employee" }, { status: 500 })
  }
}
