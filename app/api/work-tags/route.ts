import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const tags = await prisma.workTag.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error("Error fetching work tags:", error)

    // Return default tags if database is not ready
    const defaultTags = [
      { id: "1", name: "Social Work", color: "#3B82F6", createdAt: new Date(), updatedAt: new Date() },
      { id: "2", name: "Website Work", color: "#10B981", createdAt: new Date(), updatedAt: new Date() },
      { id: "3", name: "Design Work", color: "#8B5CF6", createdAt: new Date(), updatedAt: new Date() },
      { id: "4", name: "Development", color: "#F59E0B", createdAt: new Date(), updatedAt: new Date() },
      { id: "5", name: "Marketing", color: "#EF4444", createdAt: new Date(), updatedAt: new Date() },
      { id: "6", name: "Research", color: "#06B6D4", createdAt: new Date(), updatedAt: new Date() },
      { id: "7", name: "Testing", color: "#84CC16", createdAt: new Date(), updatedAt: new Date() },
      { id: "8", name: "Documentation", color: "#F97316", createdAt: new Date(), updatedAt: new Date() },
    ]

    return NextResponse.json(defaultTags)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, color } = body

    if (!name || !color) {
      return NextResponse.json({ error: "Name and color are required" }, { status: 400 })
    }

    const tag = await prisma.workTag.create({
      data: {
        name,
        color,
      },
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error("Error creating work tag:", error)
    return NextResponse.json(
      { error: "Failed to create work tag", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
