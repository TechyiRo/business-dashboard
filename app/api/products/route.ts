import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const products = await prisma.product.findMany()
    return NextResponse.json(products || [])
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const product = await prisma.product.create({
      data,
    })
    return NextResponse.json(product)
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Error creating product" }, { status: 500 })
  }
}
