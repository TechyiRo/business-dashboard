"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Building2,
  Tag,
  Edit,
  Download,
  FileText,
  MapPin,
  Mail,
  Phone,
} from "lucide-react"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { ProtectedRoute } from "@/components/protected-route"
import { workTags } from "@/lib/data"

// Define work update type
type WorkUpdate = {
  id: string
  date: string
  workName: string
  workDetail: string
  workDuration: number
  tags: string[]
  employeeId: string
  companyId?: string
  employee?: {
    id: string
    name: string
    position: string
    email: string
    phone: string
  }
  company?: {
    id: string
    name: string
    address: string
    contactName: string
    contactEmail: string
    contactPhone: string
  }
  createdAt: string
  updatedAt: string
}

// Create work tag badge variants from the workTags data
const workTagBadgeVariants: Record<string, string> = {}
workTags.forEach((tag) => {
  workTagBadgeVariants[tag.name] = tag.badge
})

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

function WorkUpdateViewPage() {
  const params = useParams()
  const router = useRouter()
  const [workUpdate, setWorkUpdate] = useState<WorkUpdate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchWorkUpdate(params.id as string)
    }
  }, [params.id])

  async function fetchWorkUpdate(id: string) {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/work-updates/${id}`)

      if (!response.ok) {
        // Use mock data if API is not ready
        const mockData: WorkUpdate = {
          id: id,
          date: new Date().toISOString(),
          workName: "Firewall Configuration & Security Setup",
          workDetail: `
            <div>
              <p><strong>Project Overview:</strong></p>
              <p>Configured comprehensive firewall rules for the new network segment to enhance security infrastructure. This involved setting up <span style="color: #ef4444; font-weight: bold;">critical security protocols</span> and implementing <em>advanced threat detection mechanisms</em>.</p>
              
              <p><strong>Tasks Completed:</strong></p>
              <ul>
                <li>Configured <span style="color: #22c55e;">inbound and outbound firewall rules</span></li>
                <li>Set up <strong>intrusion detection system (IDS)</strong></li>
                <li>Implemented <em>network segmentation policies</em></li>
                <li>Configured <span style="color: #6366f1;">VPN access controls</span></li>
                <li>Updated security documentation</li>
              </ul>
              
              <p><strong>Security Enhancements:</strong></p>
              <p>Applied <span style="color: #a855f7; font-weight: bold;">enterprise-grade security measures</span> including:</p>
              <ul>
                <li>Multi-factor authentication setup</li>
                <li>Advanced logging and monitoring</li>
                <li>Automated threat response protocols</li>
              </ul>
              
              <p><strong>Results:</strong></p>
              <p>Successfully enhanced network security by <span style="color: #14b8a6; font-weight: bold;">95%</span> with <em>zero downtime</em> during implementation. All systems are now fully operational with improved protection against cyber threats.</p>
            </div>
          `,
          workDuration: 480, // 8 hours
          tags: ["Firewall", "Security", "Networking Work"],
          employeeId: "emp1",
          companyId: "comp1",
          employee: {
            id: "emp1",
            name: "Rohidas Shinde",
            position: "Senior Network Administrator",
            email: "rohidas.shinde@spittech.com",
            phone: "+91 98765 43210",
          },
          company: {
            id: "comp1",
            name: "TechCorp Solutions Pvt Ltd",
            address: "Plot No. 123, Tech Park, Hinjewadi Phase 2, Pune, Maharashtra 411057",
            contactName: "Rajesh Kumar",
            contactEmail: "rajesh.kumar@techcorp.com",
            contactPhone: "+91 98765 12345",
          },
          createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          updatedAt: new Date().toISOString(),
        }

        setWorkUpdate(mockData)
        toast({
          title: "Using Sample Data",
          description: "Database not ready. Displaying sample work update.",
        })
        return
      }

      const data = await response.json()
      setWorkUpdate(data)
    } catch (error) {
      console.error("Error fetching work update:", error)
      setError("Failed to load work update details")
      toast({
        title: "Error",
        description: "Failed to load work update details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function exportToPDF() {
    if (!workUpdate) return

    try {
      const doc = new jsPDF()

      // Header
      doc.setFontSize(20)
      doc.setTextColor(220, 38, 127) // SP IT Technologies brand color
      doc.text("SP IT Technologies", 14, 22)

      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text("Work Update Details", 14, 35)

      // Work update information
      const workUpdateData = [
        ["Work Name", workUpdate.workName],
        ["Date", format(new Date(workUpdate.date), "PPP")],
        ["Duration", formatDuration(workUpdate.workDuration)],
        ["Tags", workUpdate.tags.join(", ")],
        ["Employee", `${workUpdate.employee?.name || "N/A"} (${workUpdate.employee?.position || "N/A"})`],
        ["Company", workUpdate.company?.name || "N/A"],
        ["Work Detail", workUpdate.workDetail.replace(/<[^>]*>/g, "")], // Strip HTML
        ["Created", format(new Date(workUpdate.createdAt), "PPP 'at' p")],
        ["Last Updated", format(new Date(workUpdate.updatedAt), "PPP 'at' p")],
      ]

      autoTable(doc, {
        startY: 45,
        head: [["Field", "Details"]],
        body: workUpdateData,
        theme: "striped",
        headStyles: { fillColor: [220, 38, 127] },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 40 },
          1: { cellWidth: 140 },
        },
      })

      // Footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(128, 128, 128)
        doc.text(
          `Generated on ${format(new Date(), "PPP 'at' p")} | Page ${i} of ${pageCount}`,
          14,
          doc.internal.pageSize.height - 10,
        )
      }

      doc.save(`WorkUpdate_${workUpdate.id}_${format(new Date(), "yyyy-MM-dd")}.pdf`)

      toast({
        title: "PDF Exported",
        description: "Work update details have been exported successfully.",
      })
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export work update to PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-sp-red border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading work update details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !workUpdate) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Work Update Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error || "The work update you're looking for doesn't exist or has been removed."}
            </p>
            <Button onClick={() => router.push("/work-updates")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Work Updates
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" onClick={() => router.push("/work-updates")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Work Updates
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToPDF}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button asChild>
              <Link href={`/work-updates/edit/${workUpdate.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Work Update
              </Link>
            </Button>
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{workUpdate.workName}</h1>
          <p className="text-muted-foreground">Work Update Details • ID: {workUpdate.id}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Work Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Work Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: workUpdate.workDetail }} />
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Work Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {workUpdate.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={`${workTagBadgeVariants[tag] || workTagBadgeVariants["Other"]} border text-sm px-3 py-1`}
                  >
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(workUpdate.date), "PPP")}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">{formatDuration(workUpdate.workDuration)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employee Information */}
          {workUpdate.employee && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Employee Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">{workUpdate.employee.name}</p>
                  <p className="text-sm text-muted-foreground">{workUpdate.employee.position}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${workUpdate.employee.email}`} className="text-sm text-blue-600 hover:underline">
                      {workUpdate.employee.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${workUpdate.employee.phone}`} className="text-sm text-blue-600 hover:underline">
                      {workUpdate.employee.phone}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company Information */}
          {workUpdate.company && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">{workUpdate.company.name}</p>
                  <div className="flex items-start gap-2 mt-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm text-muted-foreground">{workUpdate.company.address}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Contact Person</p>
                  <p className="text-sm">{workUpdate.company.contactName}</p>
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <a
                        href={`mailto:${workUpdate.company.contactEmail}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {workUpdate.company.contactEmail}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <a
                        href={`tel:${workUpdate.company.contactPhone}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {workUpdate.company.contactPhone}
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Created</p>
                <p className="text-sm">{format(new Date(workUpdate.createdAt), "PPP 'at' p")}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Last Updated</p>
                <p className="text-sm">{format(new Date(workUpdate.updatedAt), "PPP 'at' p")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function WorkUpdateViewPageWrapper() {
  return (
    <ProtectedRoute>
      <WorkUpdateViewPage />
    </ProtectedRoute>
  )
}
