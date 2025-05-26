import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const workUpdates = await prisma.workUpdate.findMany({
      include: {
        employee: true,
        company: true,
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(workUpdates)
  } catch (error) {
    console.error("Error fetching work updates:", error)

    // Return empty array if database is not ready
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { date, workName, workDetail, workDuration, tags, employeeId, companyId, newTags } = body

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

    // Handle new tags - create them in the database
    if (newTags && newTags.length > 0) {
      try {
        await Promise.all(
          newTags.map(async (tag: { name: string; color: string }) => {
            // Check if tag already exists
            const existingTag = await prisma.workTag.findUnique({
              where: { name: tag.name },
            })

            if (!existingTag) {
              // Create new tag
              await prisma.workTag.create({
                data: {
                  name: tag.name,
                  color: tag.color,
                },
              })
            }
          }),
        )
      } catch (tagError) {
        console.log("Error creating new tags:", tagError)
        // Continue with work update creation even if tag creation fails
      }
    }

    // Combine existing tags with new tag names
    const allTags = [...(tags || []), ...(newTags?.map((tag: any) => tag.name) || [])]

    // Create work update
    const workUpdate = await prisma.workUpdate.create({
      data: {
        date: new Date(date),
        workName,
        workDetail,
        workDuration,
        tags: allTags,
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
    console.error("Error creating work update:", error)
    return NextResponse.json(
      { error: "Failed to create work update", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
