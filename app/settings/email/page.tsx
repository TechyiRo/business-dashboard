"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Mail, Send, Settings, CheckCircle } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"

function EmailSettingsPageComponent() {
  const [testEmail, setTestEmail] = useState("")
  const [isTesting, setIsTesting] = useState(false)
  const [isTestingConfig, setIsTestingConfig] = useState(false)

  const testEmailConfiguration = async () => {
    setIsTestingConfig(true)
    try {
      const response = await fetch("/api/test-email-config", {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "✅ Email Configuration Valid",
          description: "SMTP settings are configured correctly.",
        })
      } else {
        toast({
          title: "❌ Email Configuration Error",
          description: result.error || "Failed to validate email configuration.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "❌ Configuration Test Failed",
        description: "Unable to test email configuration.",
        variant: "destructive",
      })
    } finally {
      setIsTestingConfig(false)
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to send the test email.",
        variant: "destructive",
      })
      return
    }

    setIsTesting(true)
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmail: testEmail,
          recipientName: "Test User",
          taskData: {
            taskName: "Test Task Assignment",
            taskDetails:
              "<p>This is a <strong>test task</strong> with <span style='color: #ff0000;'>rich formatting</span> to verify the email notification system is working correctly.</p><ol><li>First step</li><li>Second step</li><li>Third step</li></ol>",
            dueDate: new Date().toISOString(),
            assignedBy: "System Administrator",
            assignedTo: "Test User",
            product: "Test Product",
            company: "Test Company",
            status: "Pending",
          },
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "✅ Test Email Sent",
          description: `Test email sent successfully to ${testEmail}`,
        })
      } else {
        toast({
          title: "❌ Email Send Failed",
          description: result.error || "Failed to send test email.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "❌ Test Email Failed",
        description: "Unable to send test email.",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Mail className="h-8 w-8" />
          Email Settings
        </h1>
        <p className="text-gray-600 mt-2">Configure and test email notifications for task assignments</p>
      </div>

      <div className="grid gap-6">
        {/* Email Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Email Configuration
            </CardTitle>
            <CardDescription>Test your SMTP configuration to ensure email notifications work properly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>SMTP Host</Label>
                  <p className="text-sm text-gray-600">{process.env.SMTP_HOST || "Not configured"}</p>
                </div>
                <div>
                  <Label>SMTP Port</Label>
                  <p className="text-sm text-gray-600">{process.env.SMTP_PORT || "Not configured"}</p>
                </div>
                <div>
                  <Label>SMTP User</Label>
                  <p className="text-sm text-gray-600">{process.env.SMTP_USER || "Not configured"}</p>
                </div>
                <div>
                  <Label>SMTP Password</Label>
                  <p className="text-sm text-gray-600">{process.env.SMTP_PASS ? "Configured" : "Not configured"}</p>
                </div>
              </div>

              <Button onClick={testEmailConfiguration} disabled={isTestingConfig}>
                {isTestingConfig ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                    Testing Configuration...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Test Configuration
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Test Email
            </CardTitle>
            <CardDescription>
              Send a test task assignment email to verify the email template and delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="testEmail">Test Email Address</Label>
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>

              <Button onClick={sendTestEmail} disabled={isTesting || !testEmail}>
                {isTesting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                    Sending Test Email...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Test Email
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Template Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Email Template Features</CardTitle>
            <CardDescription>The task assignment emails include the following features:</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">📧 Email Content:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Professional HTML template</li>
                  <li>• Task name and description</li>
                  <li>• Due date and priority</li>
                  <li>• Assigned by information</li>
                  <li>• Company and product details</li>
                  <li>• Rich text formatting preserved</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">🎨 Design Features:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Responsive design</li>
                  <li>• Professional branding</li>
                  <li>• Clear call-to-action button</li>
                  <li>• Mobile-friendly layout</li>
                  <li>• Plain text fallback</li>
                  <li>• Automatic sending on assignment</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function EmailSettingsPage() {
  return (
    <ProtectedRoute>
      <EmailSettingsPageComponent />
    </ProtectedRoute>
  )
}
