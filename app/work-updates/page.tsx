"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  ArrowUpDown,
  Calendar,
  Download,
  Edit,
  MoreHorizontal,
  Plus,
  Tag,
  Trash2,
  FileText,
  BarChart,
  Users,
} from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SearchInput } from "@/components/search-input"
import { ProtectedRoute } from "@/components/protected-route"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

// Create work tag chart colors from the workTags data
const workTagChartColors: Record<string, string> = {}
workTags.forEach((tag) => {
  // Extract color from the color class (e.g., "bg-red-500" -> "#ef4444")
  const colorMap: Record<string, string> = {
    "bg-red-500": "#ef4444",
    "bg-blue-500": "#3b82f6",
    "bg-green-500": "#22c55e",
    "bg-purple-500": "#a855f7",
    "bg-yellow-500": "#eab308",
    "bg-indigo-500": "#6366f1",
    "bg-pink-500": "#ec4899",
    "bg-teal-500": "#14b8a6",
    "bg-orange-500": "#f97316",
    "bg-cyan-500": "#06b6d4",
    "bg-gray-500": "#6b7280",
  }
  workTagChartColors[tag.name] = colorMap[tag.color] || "#6b7280"
})

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

function WorkUpdatesPage() {
  const [workUpdates, setWorkUpdates] = useState<WorkUpdate[]>([])
  const [filteredWorkUpdates, setFilteredWorkUpdates] = useState<WorkUpdate[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [deleteWorkUpdateId, setDeleteWorkUpdateId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("list")

  useEffect(() => {
    fetchWorkUpdates()
    fetchEmployees()
    fetchCompanies()
  }, [])

  useEffect(() => {
    let filtered = workUpdates

    // Filter by employee
    if (selectedEmployee !== "all") {
      filtered = filtered.filter((update) => update.employeeId === selectedEmployee)
    }

    // Filter by search term
    if (searchTerm.trim() !== "") {
      const lowercasedSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (update) =>
          update.workName.toLowerCase().includes(lowercasedSearch) ||
          update.workDetail.toLowerCase().includes(lowercasedSearch) ||
          update.tags.some((tag) => tag.toLowerCase().includes(lowercasedSearch)) ||
          (update.employee?.name && update.employee.name.toLowerCase().includes(lowercasedSearch)) ||
          (update.company?.name && update.company.name.toLowerCase().includes(lowercasedSearch)),
      )
    }

    setFilteredWorkUpdates(filtered)
  }, [searchTerm, selectedEmployee, workUpdates])

  async function fetchWorkUpdates() {
    try {
      setLoading(true)
      const response = await fetch("/api/work-updates")

      if (!response.ok) {
        // Use enhanced mock data if API is not ready
        const mockData: WorkUpdate[] = [
          {
            id: "1",
            date: new Date().toISOString(),
            workName: "Firewall Configuration",
            workDetail:
              "<p><strong>Configured firewall rules</strong> for the new network segment. <span style='color: #ef4444;'>Critical security updates</span> were applied to ensure <em>maximum protection</em>.</p>",
            workDuration: 480, // 8 hours
            tags: ["Firewall", "Security"],
            employeeId: "emp1",
            companyId: "comp1",
            employee: {
              id: "emp1",
              name: "Rohidas Shinde",
              position: "Network Administrator",
              email: "rohidas.shinde@example.com",
              phone: "123-456-7890",
            },
            company: {
              id: "comp1",
              name: "TechCorp Solutions",
              address: "123 Tech Park, Mumbai",
              contactName: "Rajesh Kumar",
              contactEmail: "rajesh.kumar@techcorp.com",
              contactPhone: "456-789-0123",
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "2",
            date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            workName: "Server Maintenance",
            workDetail:
              "<p>Performed routine maintenance on <strong>production servers</strong>. Updated system patches and <span style='color: #22c55e;'>optimized performance</span>.</p>",
            workDuration: 240, // 4 hours
            tags: ["Server", "Visit"],
            employeeId: "emp2",
            companyId: "comp2",
            employee: {
              id: "emp2",
              name: "Priya Sharma",
              position: "System Administrator",
              email: "priya.sharma@example.com",
              phone: "234-567-8901",
            },
            company: {
              id: "comp2",
              name: "InfoSys Ltd",
              address: "456 Business District, Pune",
              contactName: "Sunita Desai",
              contactEmail: "sunita.desai@infosys.com",
              contactPhone: "567-890-1234",
            },
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: "3",
            date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            workName: "Wi-Fi Network Setup",
            workDetail:
              "<p>Installed and configured <strong>Wi-Fi access points</strong> throughout the office. <span style='color: #6366f1;'>Network coverage improved by 95%</span> with <em>seamless roaming</em>.</p>",
            workDuration: 360, // 6 hours
            tags: ["Wi-Fi", "AP", "Networking Work"],
            employeeId: "emp1",
            companyId: "comp3",
            employee: {
              id: "emp1",
              name: "Rohidas Shinde",
              position: "Network Administrator",
              email: "rohidas.shinde@example.com",
              phone: "123-456-7890",
            },
            company: {
              id: "comp3",
              name: "Digital Enterprises",
              address: "789 IT Hub, Bangalore",
              contactName: "Vikram Singh",
              contactEmail: "vikram.singh@digital.com",
              contactPhone: "678-901-2345",
            },
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: "4",
            date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            workName: "Domain Controller Setup",
            workDetail:
              "<p>Configured <strong>Active Directory Domain Controller</strong> for centralized authentication. <span style='color: #a855f7;'>ADDC services</span> are now fully operational with <em>redundancy</em>.</p>",
            workDuration: 420, // 7 hours
            tags: ["Domain", "ADDC", "Security"],
            employeeId: "emp3",
            companyId: "comp1",
            employee: {
              id: "emp3",
              name: "Amit Patil",
              position: "Security Specialist",
              email: "amit.patil@example.com",
              phone: "345-678-9012",
            },
            company: {
              id: "comp1",
              name: "TechCorp Solutions",
              address: "123 Tech Park, Mumbai",
              contactName: "Rajesh Kumar",
              contactEmail: "rajesh.kumar@techcorp.com",
              contactPhone: "456-789-0123",
            },
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            updatedAt: new Date(Date.now() - 259200000).toISOString(),
          },
          {
            id: "5",
            date: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
            workName: "Network Switch Configuration",
            workDetail:
              "<p>Configured <strong>managed switches</strong> for VLAN segmentation. <span style='color: #14b8a6;'>Network performance</span> improved significantly with <em>proper traffic management</em>.</p>",
            workDuration: 300, // 5 hours
            tags: ["Switch", "Networking Work"],
            employeeId: "emp2",
            companyId: "comp2",
            employee: {
              id: "emp2",
              name: "Priya Sharma",
              position: "System Administrator",
              email: "priya.sharma@example.com",
              phone: "234-567-8901",
            },
            company: {
              id: "comp2",
              name: "InfoSys Ltd",
              address: "456 Business District, Pune",
              contactName: "Sunita Desai",
              contactEmail: "sunita.desai@infosys.com",
              contactPhone: "567-890-1234",
            },
            createdAt: new Date(Date.now() - 345600000).toISOString(),
            updatedAt: new Date(Date.now() - 345600000).toISOString(),
          },
        ]

        setWorkUpdates(mockData)
        setFilteredWorkUpdates(mockData)
        toast({
          title: "Using Sample Data",
          description: "Database not ready. Using sample data for demonstration.",
        })
        return
      }

      const data = await response.json()
      setWorkUpdates(Array.isArray(data) ? data : [])
      setFilteredWorkUpdates(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching work updates:", error)
      toast({
        title: "Error",
        description: "Failed to load work updates. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function fetchEmployees() {
    try {
      const response = await fetch("/api/employees")
      if (!response.ok) {
        // Mock employees data
        const mockEmployees = [
          {
            id: "emp1",
            name: "Rohidas Shinde",
            position: "Network Administrator",
            email: "rohidas.shinde@example.com",
            phone: "123-456-7890",
          },
          {
            id: "emp2",
            name: "Priya Sharma",
            position: "System Administrator",
            email: "priya.sharma@example.com",
            phone: "234-567-8901",
          },
          {
            id: "emp3",
            name: "Amit Patil",
            position: "Security Specialist",
            email: "amit.patil@example.com",
            phone: "345-678-9012",
          },
        ]
        setEmployees(mockEmployees)
        return
      }
      const data = await response.json()
      setEmployees(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching employees:", error)
    }
  }

  async function fetchCompanies() {
    try {
      const response = await fetch("/api/companies")
      if (!response.ok) {
        // Mock companies data
        const mockCompanies = [
          {
            id: "comp1",
            name: "TechCorp Solutions",
            address: "123 Tech Park, Mumbai",
            contactName: "Rajesh Kumar",
            contactEmail: "rajesh.kumar@techcorp.com",
            contactPhone: "456-789-0123",
          },
          {
            id: "comp2",
            name: "InfoSys Ltd",
            address: "456 Business District, Pune",
            contactName: "Sunita Desai",
            contactEmail: "sunita.desai@infosys.com",
            contactPhone: "567-890-1234",
          },
          {
            id: "comp3",
            name: "Digital Enterprises",
            address: "789 IT Hub, Bangalore",
            contactName: "Vikram Singh",
            contactEmail: "vikram.singh@digital.com",
            contactPhone: "678-901-2345",
          },
        ]
        setCompanies(mockCompanies)
        return
      }
      const data = await response.json()
      setCompanies(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching companies:", error)
    }
  }

  async function deleteWorkUpdate(id: string) {
    try {
      const response = await fetch(`/api/work-updates/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete work update")
      }

      // Remove the work update from the local state
      const updatedWorkUpdates = workUpdates.filter((update) => update.id !== id)
      setWorkUpdates(updatedWorkUpdates)
      setFilteredWorkUpdates(
        searchTerm.trim() === "" ? updatedWorkUpdates : filteredWorkUpdates.filter((update) => update.id !== id),
      )

      toast({
        title: "Work Update Deleted",
        description: "The work update has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting work update:", error)
      toast({
        title: "Error",
        description: "Failed to delete work update. Please try again.",
        variant: "destructive",
      })
    }
  }

  function exportWorkUpdateToPDF(workUpdate: WorkUpdate) {
    try {
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(20)
      doc.text("Work Update Details", 14, 22)

      // Add work update information
      const workUpdateData = [
        ["Date", format(new Date(workUpdate.date), "PPP")],
        ["Work Name", workUpdate.workName],
        ["Work Detail", workUpdate.workDetail.replace(/<[^>]*>/g, "")], // Strip HTML tags for PDF
        ["Work Duration", formatDuration(workUpdate.workDuration)],
        ["Tags", workUpdate.tags.join(", ")],
        ["Employee", workUpdate.employee?.name || "N/A"],
        ["Company", workUpdate.company?.name || "N/A"],
        ["Created At", format(new Date(workUpdate.createdAt), "PPP")],
      ]

      autoTable(doc, {
        startY: 30,
        head: [["Field", "Value"]],
        body: workUpdateData,
        theme: "striped",
      })

      // Save the PDF
      doc.save(`WorkUpdate_${workUpdate.id}.pdf`)

      toast({
        title: "PDF Exported",
        description: "Work update has been exported to PDF successfully.",
      })
    } catch (error) {
      console.error("Error exporting work update to PDF:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export work update to PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  function exportAllWorkUpdatesToPDF() {
    try {
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(20)
      doc.text("Work Updates List", 14, 22)

      // Add current date
      const date = new Date().toLocaleDateString()
      doc.setFontSize(10)
      doc.text(`Generated on: ${date}`, 14, 30)

      // Prepare data for table
      const tableColumn = ["Date", "Work Name", "Duration", "Tags", "Employee", "Company"]
      const tableRows = filteredWorkUpdates.map((update) => [
        format(new Date(update.date), "PP"),
        update.workName,
        formatDuration(update.workDuration),
        update.tags.join(", "),
        update.employee?.name || "N/A",
        update.company?.name || "N/A",
      ])

      // Add table to document
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: "striped",
      })

      // Save the PDF
      doc.save("SP_IT_Technologies_WorkUpdates.pdf")

      toast({
        title: "PDF Exported",
        description: "Work updates list has been exported to PDF successfully.",
      })
    } catch (error) {
      console.error("Error exporting to PDF:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export work updates to PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Prepare data for charts
  const workTagData = (() => {
    const tagCounts: Record<string, number> = {}
    filteredWorkUpdates.forEach((update) => {
      update.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    return Object.entries(tagCounts).map(([name, value]) => ({
      name,
      value,
      color: workTagChartColors[name] || workTagChartColors["Other"],
    }))
  })()

  const workDurationByTagData = (() => {
    const tagDurations: Record<string, number> = {}
    filteredWorkUpdates.forEach((update) => {
      update.tags.forEach((tag) => {
        tagDurations[tag] = (tagDurations[tag] || 0) + update.workDuration
      })
    })

    return Object.entries(tagDurations).map(([name, minutes]) => ({
      name,
      hours: Math.round((minutes / 60) * 10) / 10, // Convert to hours with 1 decimal
      color: workTagChartColors[name] || workTagChartColors["Other"],
    }))
  })()

  const workByEmployeeData = (() => {
    const employeeDurations: Record<string, number> = {}
    filteredWorkUpdates.forEach((update) => {
      const employeeName = update.employee?.name || "Unknown"
      employeeDurations[employeeName] = (employeeDurations[employeeName] || 0) + update.workDuration
    })

    return Object.entries(employeeDurations).map(([name, minutes], index) => ({
      name,
      hours: Math.round((minutes / 60) * 10) / 10, // Convert to hours with 1 decimal
      color: Object.values(workTagChartColors)[index % Object.values(workTagChartColors).length],
    }))
  })()

  const workByCompanyData = (() => {
    const companyDurations: Record<string, number> = {}
    filteredWorkUpdates.forEach((update) => {
      const companyName = update.company?.name || "No Company"
      companyDurations[companyName] = (companyDurations[companyName] || 0) + update.workDuration
    })

    return Object.entries(companyDurations).map(([name, minutes], index) => ({
      name,
      hours: Math.round((minutes / 60) * 10) / 10, // Convert to hours with 1 decimal
      color: Object.values(workTagChartColors)[index % Object.values(workTagChartColors).length],
    }))
  })()

  const workColumns: ColumnDef<WorkUpdate>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => format(new Date(row.original.date), "PP"),
    },
    {
      accessorKey: "workName",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Work Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "workDetail",
      header: "Work Detail",
      cell: ({ row }) => {
        const detail = row.original.workDetail
        // Strip HTML tags and truncate for table display
        const plainText = detail.replace(/<[^>]*>/g, "")
        return plainText.length > 50 ? `${plainText.substring(0, 50)}...` : plainText
      },
    },
    {
      accessorKey: "workDuration",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Duration
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => formatDuration(row.original.workDuration),
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => {
        const tags = row.original.tags
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={`${workTagBadgeVariants[tag] || workTagBadgeVariants["Other"]} border`}
              >
                <Tag className="mr-1 h-3 w-3" />
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="outline" className="border-gray-300">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "employee",
      header: "Employee",
      cell: ({ row }) => row.original.employee?.name || "N/A",
    },
    {
      accessorKey: "company",
      header: "Company",
      cell: ({ row }) => row.original.company?.name || "N/A",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const workUpdate = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/work-updates/edit/${workUpdate.id}`}>
                  <Edit className="mr-2 h-4 w-4 text-blue-500" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setDeleteWorkUpdateId(workUpdate.id)
                  setIsDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportWorkUpdateToPDF(workUpdate)}>
                <Download className="mr-2 h-4 w-4 text-green-500" />
                Export to PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Animation configuration for charts
  const animationProps = {
    animationBegin: 0,
    animationDuration: 1500,
    animationEasing: "ease-out" as const,
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Daily Work Updates 📝</h1>
          <p className="text-muted-foreground">Track and manage daily work activities</p>
        </div>
        <div className="flex gap-2">
          <Link href="/work-updates/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Work Update
            </Button>
          </Link>
          <Button variant="outline" onClick={exportAllWorkUpdatesToPDF}>
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">
            <FileText className="mr-2 h-4 w-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="charts">
            <BarChart className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Work Updates ({filteredWorkUpdates.length})
              </CardTitle>
              <div className="flex gap-2 items-center">
                {/* Employee Filter */}
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <SearchInput placeholder="Search work updates..." value={searchTerm} onChange={setSearchTerm} />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-24">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-sp-red border-t-transparent"></div>
                </div>
              ) : (
                <DataTable columns={workColumns} data={filteredWorkUpdates} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Work by Tag Chart */}
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
              <CardHeader className="bg-gradient-to-r from-sp-red/10 to-sp-blue/10">
                <CardTitle>Work Updates by Tag 🏷️</CardTitle>
                <CardDescription>Distribution of work updates by tag</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  {workTagData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart {...animationProps}>
                        <Pie
                          data={workTagData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {workTagData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Work Duration by Tag Chart */}
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
              <CardHeader className="bg-gradient-to-r from-sp-blue/10 to-sp-yellow/10">
                <CardTitle>Hours by Tag ⏱️</CardTitle>
                <CardDescription>Total hours spent on each work tag</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  {workDurationByTagData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={workDurationByTagData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                        {...animationProps}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="hours" name="Hours">
                          {workDurationByTagData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Work by Employee Chart */}
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
              <CardHeader className="bg-gradient-to-r from-sp-yellow/10 to-sp-red/10">
                <CardTitle>Hours by Employee 👥</CardTitle>
                <CardDescription>Total hours logged by each employee</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  {workByEmployeeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={workByEmployeeData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                        {...animationProps}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="hours" name="Hours">
                          {workByEmployeeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Work by Company Chart */}
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
              <CardHeader className="bg-gradient-to-r from-sp-green/10 to-sp-purple/10">
                <CardTitle>Hours by Company 🏢</CardTitle>
                <CardDescription>Total hours logged for each company</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  {workByCompanyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={workByCompanyData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                        {...animationProps}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="hours" name="Hours">
                          {workByCompanyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the work update and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteWorkUpdateId) {
                  deleteWorkUpdate(deleteWorkUpdateId)
                  setDeleteWorkUpdateId(null)
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function WorkUpdatesPageWrapper() {
  return (
    <ProtectedRoute>
      <WorkUpdatesPage />
    </ProtectedRoute>
  )
}
