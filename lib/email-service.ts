import nodemailer from "nodemailer"

// Email configuration with multiple provider support
const createTransporter = () => {
  const emailProvider = process.env.EMAIL_PROVIDER || "gmail"

  // Gmail configuration
  if (emailProvider === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  // Generic SMTP configuration
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  })
}

// Work Update Email Template
export const generateWorkUpdateEmail = (workUpdateData: {
  workName: string
  workDetail: string
  date: string
  workDuration: number
  tags: string[]
  employeeName: string
  companyName?: string
  newTags?: { name: string; color: string }[]
}) => {
  // Format duration in hours and minutes
  const hours = Math.floor(workUpdateData.workDuration / 60)
  const minutes = workUpdateData.workDuration % 60
  const formattedDuration =
    hours > 0
      ? `${hours} hour${hours !== 1 ? "s" : ""} ${minutes > 0 ? `${minutes} minute${minutes !== 1 ? "s" : ""}` : ""}`
      : `${minutes} minute${minutes !== 1 ? "s" : ""}`

  // Format date
  const formattedDate = new Date(workUpdateData.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Strip HTML tags from work details for plain text version
  const plainTextDetails = workUpdateData.workDetail.replace(/<[^>]*>/g, "")

  // Generate tag HTML
  const tagsHtml = workUpdateData.tags
    .map((tag) => {
      return `<span style="display: inline-block; background-color: #f0f0f0; color: #333; padding: 4px 8px; border-radius: 16px; font-size: 12px; margin-right: 6px; margin-bottom: 6px;">${tag}</span>`
    })
    .join(" ")

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Work Update Confirmation</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .email-container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .work-info {
          background-color: #f8f9fa;
          border-left: 4px solid #4CAF50;
          padding: 20px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        .info-row {
          display: flex;
          margin-bottom: 12px;
          align-items: flex-start;
        }
        .info-label {
          font-weight: 600;
          color: #495057;
          min-width: 120px;
          margin-right: 10px;
        }
        .info-value {
          color: #212529;
          flex: 1;
        }
        .work-details {
          background-color: #fff;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .duration-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          background-color: #e9ecef;
          color: #212529;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .tags-container {
          margin-top: 15px;
        }
        @media (max-width: 600px) {
          .info-row {
            flex-direction: column;
          }
          .info-label {
            min-width: auto;
            margin-bottom: 4px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>📝 Work Update Confirmation</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your work update has been recorded</p>
        </div>

        <div class="work-info">
          <div class="info-row">
            <span class="info-label">📋 Work Name:</span>
            <span class="info-value"><strong>${workUpdateData.workName}</strong></span>
          </div>
          <div class="info-row">
            <span class="info-label">👤 Employee:</span>
            <span class="info-value">${workUpdateData.employeeName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">📅 Date:</span>
            <span class="info-value">${formattedDate}</span>
          </div>
          ${
            workUpdateData.companyName
              ? `
          <div class="info-row">
            <span class="info-label">🏢 Company:</span>
            <span class="info-value">${workUpdateData.companyName}</span>
          </div>
          `
              : ""
          }
          <div class="info-row">
            <span class="info-label">⏱️ Duration:</span>
            <span class="info-value"><span class="duration-badge">${formattedDuration}</span></span>
          </div>
          ${
            workUpdateData.tags.length > 0
              ? `
          <div class="info-row">
            <span class="info-label">🏷️ Tags:</span>
            <span class="info-value">
              <div class="tags-container">
                ${tagsHtml}
              </div>
            </span>
          </div>
          `
              : ""
          }
        </div>

        <div class="work-details">
          <h3 style="margin-top: 0; color: #495057;">📝 Work Details:</h3>
          <div style="line-height: 1.6;">
            ${workUpdateData.workDetail}
          </div>
        </div>

        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app"}/work-updates" class="cta-button">
            View Work Updates Dashboard
          </a>
        </div>

        <div class="footer">
          <p><strong>📧 Work Management System</strong></p>
          <p>This is an automated confirmation of your work update submission.</p>
          <p>If you did not submit this work update, please contact your administrator.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
    WORK UPDATE CONFIRMATION
    
    Hello ${workUpdateData.employeeName},
    
    Your work update has been recorded:
    
    Work Name: ${workUpdateData.workName}
    Date: ${formattedDate}
    Duration: ${formattedDuration}
    ${workUpdateData.companyName ? `Company: ${workUpdateData.companyName}` : ""}
    Tags: ${workUpdateData.tags.join(", ")}
    
    Work Details:
    ${plainTextDetails}
    
    You can view all your work updates on the dashboard:
    ${process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app"}/work-updates
    
    ---
    This is an automated confirmation from the Work Management System.
  `

  return {
    html: htmlContent,
    text: textContent,
  }
}

// Send work update confirmation email
export const sendWorkUpdateEmail = async (
  recipientEmail: string,
  recipientName: string,
  workUpdateData: {
    workName: string
    workDetail: string
    date: string
    workDuration: number
    tags: string[]
    employeeName: string
    companyName?: string
    newTags?: { name: string; color: string }[]
  },
) => {
  try {
    console.log("🔄 Sending work update confirmation email...")
    console.log("📧 Recipient:", recipientEmail)
    console.log("📋 Work Update:", workUpdateData.workName)

    const transporter = createTransporter()
    const emailContent = generateWorkUpdateEmail(workUpdateData)

    const mailOptions = {
      from: `"Work Management System" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: `📝 Work Update Confirmation: ${workUpdateData.workName}`,
      text: emailContent.text,
      html: emailContent.html,
    }

    const result = await transporter.sendMail(mailOptions)

    console.log("✅ Work update email sent successfully:", {
      messageId: result.messageId,
      recipient: recipientEmail,
      workName: workUpdateData.workName,
    })

    return {
      success: true,
      messageId: result.messageId,
    }
  } catch (error) {
    console.error("❌ Failed to send work update email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Task Assignment Email Template
export const generateTaskAssignmentEmail = (taskData: {
  taskName: string
  taskDetails: string
  dueDate: string
  assignedBy: string
  assignedTo: string
  product: string
  company: string
  status: string
}) => {
  // Strip HTML tags from task details for plain text version
  const plainTextDetails = taskData.taskDetails.replace(/<[^>]*>/g, "")

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Task Assignment</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .email-container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .task-info {
          background-color: #f8f9fa;
          border-left: 4px solid #667eea;
          padding: 20px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        .info-row {
          display: flex;
          margin-bottom: 12px;
          align-items: flex-start;
        }
        .info-label {
          font-weight: 600;
          color: #495057;
          min-width: 120px;
          margin-right: 10px;
        }
        .info-value {
          color: #212529;
          flex: 1;
        }
        .task-details {
          background-color: #fff;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          background-color: #ffc107;
          color: #212529;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        @media (max-width: 600px) {
          .info-row {
            flex-direction: column;
          }
          .info-label {
            min-width: auto;
            margin-bottom: 4px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>🎯 New Task Assignment</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">You have been assigned a new task</p>
        </div>

        <div class="task-info">
          <div class="info-row">
            <span class="info-label">📋 Task Name:</span>
            <span class="info-value"><strong>${taskData.taskName}</strong></span>
          </div>
          <div class="info-row">
            <span class="info-label">👤 Assigned By:</span>
            <span class="info-value">${taskData.assignedBy}</span>
          </div>
          <div class="info-row">
            <span class="info-label">📅 Due Date:</span>
            <span class="info-value">${new Date(taskData.dueDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</span>
          </div>
          <div class="info-row">
            <span class="info-label">🏢 Company:</span>
            <span class="info-value">${taskData.company}</span>
          </div>
          <div class="info-row">
            <span class="info-label">📦 Product:</span>
            <span class="info-value">${taskData.product}</span>
          </div>
          <div class="info-row">
            <span class="info-label">📊 Status:</span>
            <span class="info-value"><span class="status-badge">${taskData.status}</span></span>
          </div>
        </div>

        <div class="task-details">
          <h3 style="margin-top: 0; color: #495057;">📝 Task Details:</h3>
          <div style="line-height: 1.6;">
            ${taskData.taskDetails}
          </div>
        </div>

        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app"}/tasks" class="cta-button">
            View Task Dashboard
          </a>
        </div>

        <div class="footer">
          <p><strong>📧 Task Management System</strong></p>
          <p>This is an automated notification. Please do not reply to this email.</p>
          <p>If you have any questions about this task, please contact ${taskData.assignedBy} directly.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
    NEW TASK ASSIGNMENT
    
    Hello ${taskData.assignedTo},
    
    You have been assigned a new task:
    
    Task Name: ${taskData.taskName}
    Assigned By: ${taskData.assignedBy}
    Due Date: ${new Date(taskData.dueDate).toLocaleDateString()}
    Company: ${taskData.company}
    Product: ${taskData.product}
    Status: ${taskData.status}
    
    Task Details:
    ${plainTextDetails}
    
    Please log in to the task management system to view more details and update the task status.
    
    Dashboard URL: ${process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app"}/tasks
    
    ---
    This is an automated notification from the Task Management System.
    If you have questions about this task, please contact ${taskData.assignedBy}.
  `

  return {
    html: htmlContent,
    text: textContent,
  }
}

export const sendTaskAssignmentEmail = async (
  recipientEmail: string,
  recipientName: string,
  taskData: {
    taskName: string
    taskDetails: string
    dueDate: string
    assignedBy: string
    assignedTo: string
    product: string
    company: string
    status: string
  },
) => {
  try {
    console.log("🔄 Attempting to send task assignment email...")
    console.log("📧 Recipient:", recipientEmail)
    console.log("📋 Task:", taskData.taskName)
    console.log("🔧 Email Provider:", process.env.EMAIL_PROVIDER || "gmail")

    const transporter = createTransporter()
    const emailContent = generateTaskAssignmentEmail(taskData)

    const mailOptions = {
      from: `"Task Management System" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: `🎯 New Task Assignment: ${taskData.taskName}`,
      text: emailContent.text,
      html: emailContent.html,
    }

    const result = await transporter.sendMail(mailOptions)

    console.log("✅ Task assignment email sent successfully:", {
      messageId: result.messageId,
      recipient: recipientEmail,
      taskName: taskData.taskName,
    })

    return {
      success: true,
      messageId: result.messageId,
    }
  } catch (error) {
    console.error("❌ Failed to send task assignment email:", error)

    // Provide specific error guidance
    if (error instanceof Error) {
      if (error.message.includes("Invalid login") || error.message.includes("BadCredentials")) {
        console.error("🔑 Gmail Authentication Issue - Check your App Password setup")
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Test email configuration
export const testEmailConfiguration = async () => {
  try {
    console.log("🔍 Testing email configuration...")
    console.log("📧 Email Provider:", process.env.EMAIL_PROVIDER || "gmail")
    console.log("📧 SMTP Host:", process.env.SMTP_HOST)
    console.log("📧 SMTP Port:", process.env.SMTP_PORT)
    console.log("📧 SMTP User:", process.env.SMTP_USER ? "✅ Set" : "❌ Not set")
    console.log("📧 SMTP Pass:", process.env.SMTP_PASS ? "✅ Set" : "❌ Not set")

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error("SMTP credentials not configured")
    }

    const transporter = createTransporter()
    await transporter.verify()

    console.log("✅ Email configuration is valid")
    return { success: true }
  } catch (error) {
    console.error("❌ Email configuration error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Send test email function
export const sendTestEmail = async (recipientEmail: string) => {
  try {
    console.log("🧪 Sending test email to:", recipientEmail)

    const transporter = createTransporter()

    const testEmailContent = generateTaskAssignmentEmail({
      taskName: "Test Email - Email System Working!",
      taskDetails: `
        <p><strong>This is a test email</strong> to verify your email configuration is working correctly.</p>
        <p>✅ <span style="color: #28a745;">Email system is functioning properly</span></p>
        <p>🎨 <span style="color: #007bff;">Rich text formatting is working</span></p>
        <p>📧 You should receive this email with proper formatting and styling.</p>
        <ul>
          <li>✅ SMTP connection established</li>
          <li>✅ Email template rendering correctly</li>
          <li>✅ HTML formatting preserved</li>
        </ul>
      `,
      dueDate: new Date().toISOString(),
      assignedBy: "System Administrator",
      assignedTo: "Test User",
      product: "Email System Test",
      company: "SP IT Technologies",
      status: "Testing",
    })

    const mailOptions = {
      from: `"Task Management System" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: "🧪 Test Email - Email System Configuration",
      text: testEmailContent.text,
      html: testEmailContent.html,
    }

    const result = await transporter.sendMail(mailOptions)

    console.log("✅ Test email sent successfully:", {
      messageId: result.messageId,
      recipient: recipientEmail,
    })

    return {
      success: true,
      messageId: result.messageId,
    }
  } catch (error) {
    console.error("❌ Failed to send test email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
