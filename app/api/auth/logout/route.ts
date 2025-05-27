import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()

    // Clear all authentication cookies
    cookieStore.delete("authenticated")
    cookieStore.delete("userRole")
    cookieStore.delete("username")

    return NextResponse.json({ success: true, message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during logout" }, { status: 500 })
  }
}
