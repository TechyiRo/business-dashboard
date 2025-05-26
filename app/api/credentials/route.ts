import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("companyId")

    let credentials
    if (companyId) {
      // Get credentials for specific company
      credentials = await prisma.credential.findMany({
        where: { companyId },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    } else {
      // Get all credentials
      credentials = await prisma.credential.findMany({
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    }

    return NextResponse.json(credentials || [])
  } catch (error) {
    console.error("Error fetching credentials:", error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { companyId, credentialName, username, password, other, isPasswordReadOnly } = body

    // Validate required fields
    if (!companyId || !credentialName) {
      return NextResponse.json({ error: "Company and credential name are required" }, { status: 400 })
    }

    const credential = await prisma.credential.create({
      data: {
        companyId,
        credentialName,
        username: username || null,
        password: password || null,
        other: other || null,
        isPasswordReadOnly: isPasswordReadOnly || false,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(credential)
  } catch (error) {
    console.error("Error creating credential:", error)
    return NextResponse.json({ error: "Failed to create credential" }, { status: 500 })
  }
}
