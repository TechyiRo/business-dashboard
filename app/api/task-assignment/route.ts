import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendTaskAssignmentEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract form fields
    const name = formData.get("name") as string
    const companyName = formData.get("companyName") as string
    const address = formData.get("address") as string
    const contactNumber = formData.get("contactNumber") as string
    const priority = formData.get("priority") as string
    const issueDescription = formData.get("issueDescription") as string

    // Properly handle the date - use current date if not provided
    const dateString = formData.get("date") as string
    const date = dateString ? new Date(dateString) : new Date()

    console.log("📅 Date received:", dateString)
    console.log("📅 Date converted:", date)

    // Get files (optional)
    const screenshot = formData.get("screenshot") as File | null
    const additionalFile = formData.get("additionalFile") as File | null

    console.log("📎 Screenshot:", screenshot ? screenshot.name : "None")
    console.log("📄 Additional file:", additionalFile ? additionalFile.name : "None")

    // Generate unique task ID
    try {
      const lastTask = await prisma.taskAssignment.findFirst({
        orderBy: { createdAt: "desc" },
      })

      const nextNumber = lastTask ? Number.parseInt(lastTask.taskId.split("-")[1]) + 1 : 1
      const uniqueTaskId = `2019-${nextNumber}`

      console.log("🆔 Generated task ID:", uniqueTaskId)

      // Prepare data for database (files are optional)
      const taskData = {
        date,
        taskId: uniqueTaskId,
        name,
        companyName,
        address,
        contactNumber,
        priority,
        issueDescription,
        // Only include file URLs if files are provided
        ...(screenshot && { screenshotUrl: `uploads/${uniqueTaskId}-screenshot-${screenshot.name}` }),
        ...(additionalFile && { additionalFileUrl: `uploads/${uniqueTaskId}-additional-${additionalFile.name}` }),
      }

      // Save to database
      const task = await prisma.taskAssignment.create({
        data: taskData,
      })

      console.log("✅ Task created successfully:", task.id)

      // Send email notification
      try {
        await sendTaskAssignmentEmail({
          date,
          taskId: uniqueTaskId,
          name,
          companyName,
          address,
          contactNumber,
          priority,
          issueDescription,
          screenshot,
          additionalFile,
        })
        console.log("✅ Task assignment email sent successfully")
      } catch (emailError) {
        console.error("❌ Failed to send email:", emailError)
        // Continue even if email fails
      }

      return NextResponse.json({
        success: true,
        message: "Task submitted successfully! We will contact you soon.",
        taskId: uniqueTaskId,
      })
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        {
          success: false,
          message: "Database error. Please try again.",
          error: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Task assignment error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit task. Please try again.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
