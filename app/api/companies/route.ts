import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const companies = await prisma.company.findMany()
    return NextResponse.json(companies || [])
  } catch (error) {
    console.error("Error fetching companies:", error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const company = await prisma.company.create({
      data,
    })
    return NextResponse.json(company)
  } catch (error) {
    console.error("Error creating company:", error)
    return NextResponse.json({ error: "Error creating company" }, { status: 500 })
  }
}
