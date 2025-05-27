import { NextResponse } from "next/server"
import { sendTaskAssignmentEmail } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { recipientEmail, recipientName, taskData } = body

    if (!recipientEmail || !recipientName || !taskData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sendTaskAssignmentEmail(recipientEmail, recipientName, taskData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
        messageId: result.messageId,
      })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
