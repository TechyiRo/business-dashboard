import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const authenticated = cookieStore.get("authenticated")?.value
    const userRole = cookieStore.get("userRole")?.value
    const username = cookieStore.get("username")?.value

    if (authenticated === "true" && userRole && username) {
      return NextResponse.json({
        authenticated: true,
        user: {
          username,
          role: userRole,
        },
      })
    }

    return NextResponse.json({
      authenticated: false,
      user: null,
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({
      authenticated: false,
      user: null,
    })
  }
}
