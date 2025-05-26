import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const credential = await prisma.credential.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!credential) {
      return NextResponse.json({ error: "Credential not found" }, { status: 404 })
    }

    return NextResponse.json(credential)
  } catch (error) {
    console.error("Error fetching credential:", error)
    return NextResponse.json({ error: "Failed to fetch credential" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { companyId, credentialName, username, password, other, isPasswordReadOnly } = body

    // Validate required fields
    if (!companyId || !credentialName) {
      return NextResponse.json({ error: "Company and credential name are required" }, { status: 400 })
    }

    const credential = await prisma.credential.update({
      where: { id },
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
    console.error("Error updating credential:", error)
    return NextResponse.json({ error: "Failed to update credential" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Check if credential exists
    const credential = await prisma.credential.findUnique({
      where: { id },
    })

    if (!credential) {
      return NextResponse.json({ error: "Credential not found" }, { status: 404 })
    }

    // Delete credential
    await prisma.credential.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting credential:", error)
    return NextResponse.json({ error: "Failed to delete credential" }, { status: 500 })
  }
}
