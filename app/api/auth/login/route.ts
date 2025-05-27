import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Hardcoded credentials for demo
    const validCredentials = [
      { username: "sp it", password: "SanRo@2019!", role: "ADMIN" },
      { username: "admin", password: "admin123", role: "ADMIN" },
    ]

    const validUser = validCredentials.find((cred) => cred.username === username && cred.password === password)

    if (validUser) {
      // Set authentication cookies
      const cookieStore = await cookies()
      cookieStore.set("authenticated", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60, // 24 hours
      })
      cookieStore.set("userRole", validUser.role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60, // 24 hours
      })
      cookieStore.set("username", username, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60, // 24 hours
      })

      return NextResponse.json({
        success: true,
        message: "Login successful",
        user: {
          username,
          role: validUser.role,
        },
      })
    }

    return NextResponse.json({ success: false, message: "Invalid username or password" }, { status: 401 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during login" }, { status: 500 })
  }
}
