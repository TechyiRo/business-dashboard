import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const workUpdate = await prisma.workUpdate.findUnique({
      where: { id },
      include: {
        employee: true,
        company: true,
      },
    })

    if (!workUpdate) {
      return NextResponse.json({ error: "Work update not found" }, { status: 404 })
    }

    return NextResponse.json(workUpdate)
  } catch (error) {
    console.error("Error fetching work update:", error)
    return NextResponse.json(
      { error: "Failed to fetch work update", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { date, workName, workDetail, workDuration, tags, employeeId, companyId } = body

    // Validate required fields
    if (!date || !workName || !workDetail || !employeeId || workDuration === undefined) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "Date, work name, work detail, work duration, and employee ID are required",
        },
        { status: 400 },
      )
    }

    // Update work update
    const workUpdate = await prisma.workUpdate.update({
      where: { id },
      data: {
        date: new Date(date),
        workName,
        workDetail,
        workDuration,
        tags: tags || [],
        employee: {
          connect: { id: employeeId },
        },
        ...(companyId && {
          company: {
            connect: { id: companyId },
          },
        }),
      },
      include: {
        employee: true,
        company: true,
      },
    })

    return NextResponse.json(workUpdate)
  } catch (error) {
    console.error("Error updating work update:", error)
    return NextResponse.json(
      { error: "Failed to update work update", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Check if work update exists
    const workUpdate = await prisma.workUpdate.findUnique({
      where: { id },
    })

    if (!workUpdate) {
      return NextResponse.json({ error: "Work update not found" }, { status: 404 })
    }

    // Delete work update
    await prisma.workUpdate.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting work update:", error)
    return NextResponse.json(
      { error: "Failed to delete work update", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
