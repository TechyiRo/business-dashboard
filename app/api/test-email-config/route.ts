import { NextResponse } from "next/server"
import { testEmailConfiguration } from "@/lib/email-service"

export async function POST() {
  try {
    const result = await testEmailConfiguration()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email configuration is valid",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error testing email configuration:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to test email configuration",
      },
      { status: 500 },
    )
  }
}
