import nodemailer from "nodemailer"

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

// Email templates
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
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/tasks" class="cta-button">
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
    
    Dashboard URL: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/tasks
    
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
    console.log("📧 SMTP Host:", process.env.SMTP_HOST)
    console.log("📧 SMTP Port:", process.env.SMTP_PORT)
    console.log("📧 SMTP User:", process.env.SMTP_USER ? "✅ Set" : "❌ Not set")
    console.log("📧 SMTP Pass:", process.env.SMTP_PASS ? "✅ Set" : "❌ Not set")

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
