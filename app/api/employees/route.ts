import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const employees = await prisma.employee.findMany()
    return NextResponse.json(employees || [])
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const employee = await prisma.employee.create({
      data,
    })
    return NextResponse.json(employee)
  } catch (error) {
    console.error("Error creating employee:", error)
    return NextResponse.json({ error: "Error creating employee" }, { status: 500 })
  }
}
