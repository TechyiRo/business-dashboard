"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowUpDown,
  CheckCircle,
  CircleOff,
  Clock,
  Download,
  FileSearch,
  MoreHorizontal,
  Plus,
  ShoppingBag,
  Trash2,
  Wrench,
  UserCheck,
  Edit,
  Calendar,
  List,
} from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { RichTextDisplay } from "@/components/rich-text-display"
import { TaskCalendarView } from "@/components/task-calendar-view"

type Task = {
  id: string
  name: string
  details: string
  date: string
  status: string
  productId: string
  companyId: string
  assignedById: string
  assignedToId: string
  product?: { name: string }
  company?: { name: string }
  assignedBy?: { name: string }
  assignedTo?: { name: string }
  workDetail?: {
    id: string
  }
}

type Employee = {
  id: string
  name: string
  position: string
  email: string
  phone: string
}

function TasksPageComponent() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")

  useEffect(() => {
    fetchTasks()
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTasks(tasks)
    } else {
      const lowercasedSearch = searchTerm.toLowerCase()
      const filtered = tasks.filter((task) => {
        // Strip HTML for searching
        const stripHtml = (html: string) => {
          if (typeof document !== "undefined") {
            const tmp = document.createElement("div")
            tmp.innerHTML = html
            return tmp.textContent || tmp.innerText || ""
          }
          return html.replace(/<[^>]*>/g, "")
        }

        const plainDetails = stripHtml(task.details || "")

        return (
          task.name.toLowerCase().includes(lowercasedSearch) ||
          plainDetails.toLowerCase().includes(lowercasedSearch) ||
          task.status.toLowerCase().includes(lowercasedSearch) ||
          task.product?.name?.toLowerCase().includes(lowercasedSearch) ||
          task.company?.name?.toLowerCase().includes(lowercasedSearch) ||
          task.assignedBy?.name?.toLowerCase().includes(lowercasedSearch) ||
          task.assignedTo?.name?.toLowerCase().includes(lowercasedSearch)
        )
      })
      setFilteredTasks(filtered)
    }
  }, [searchTerm, tasks])

  async function fetchTasks() {
    try {
      setLoading(true)
      const response = await fetch("/api/tasks")
      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }
      const data = await response.json()
      setTasks(Array.isArray(data) ? data : [])
      setFilteredTasks(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast({
        title: "Error",
        description: "Failed to load tasks. Please try again.",
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
        throw new Error("Failed to fetch employees")
      }
      const data = await response.json()
      setEmployees(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching employees:", error)
      toast({
        title: "Error",
        description: "Failed to load employees. Please try again.",
        variant: "destructive",
      })
    }
  }

  async function updateTaskStatus(taskId: string, newStatus: string) {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update task status")
      }

      // Update the local state
      const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
      setTasks(updatedTasks)
      setFilteredTasks(
        searchTerm.trim() === ""
          ? updatedTasks
          : updatedTasks.filter((task) => {
              const lowercasedSearch = searchTerm.toLowerCase()
              const stripHtml = (html: string) => {
                const tmp = document.createElement("div")
                tmp.innerHTML = html
                return tmp.textContent || tmp.innerText || ""
              }
              const plainDetails = stripHtml(task.details)

              return (
                task.name.toLowerCase().includes(lowercasedSearch) ||
                plainDetails.toLowerCase().includes(lowercasedSearch) ||
                task.status.toLowerCase().includes(lowercasedSearch) ||
                task.product?.name?.toLowerCase().includes(lowercasedSearch) ||
                task.company?.name?.toLowerCase().includes(lowercasedSearch) ||
                task.assignedBy?.name?.toLowerCase().includes(lowercasedSearch) ||
                task.assignedTo?.name?.toLowerCase().includes(lowercasedSearch)
              )
            }),
      )

      toast({
        title: "Status Updated",
        description: "Task status has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating task status:", error)
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      })
    }
  }

  async function deleteTask(taskId: string) {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      // Remove the task from the local state
      const updatedTasks = tasks.filter((task) => task.id !== taskId)
      setTasks(updatedTasks)
      setFilteredTasks(searchTerm.trim() === "" ? updatedTasks : filteredTasks.filter((task) => task.id !== taskId))

      toast({
        title: "Task Deleted",
        description: "The task has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
    }
  }

  function exportTaskToPDF(task: Task) {
    try {
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(20)
      doc.text("Task Details", 14, 22)

      // Strip HTML for PDF export
      const stripHtml = (html: string) => {
        const tmp = document.createElement("div")
        tmp.innerHTML = html
        return tmp.textContent || tmp.innerText || ""
      }

      // Add task information
      const taskData = [
        ["Task Name", task.name],
        ["Details", stripHtml(task.details)],
        ["Status", task.status],
        ["Product", task.product?.name || "N/A"],
        ["Company", task.company?.name || "N/A"],
        ["Assigned By", task.assignedBy?.name || "N/A"],
        ["Assigned To", task.assignedTo?.name || "N/A"],
        ["Date", new Date(task.date).toLocaleDateString()],
      ]

      autoTable(doc, {
        startY: 30,
        head: [["Field", "Value"]],
        body: taskData,
        theme: "striped",
      })

      // Save the PDF
      doc.save(`Task_${task.id}.pdf`)

      toast({
        title: "PDF Exported",
        description: "Task has been exported to PDF successfully.",
      })
    } catch (error) {
      console.error("Error exporting task to PDF:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export task to PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  function exportAllTasksToPDF() {
    try {
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(20)
      doc.text("Tasks List", 14, 22)

      // Add current date
      const date = new Date().toLocaleDateString()
      doc.setFontSize(10)
      doc.text(`Generated on: ${date}`, 14, 30)

      // Strip HTML for PDF export
      const stripHtml = (html: string) => {
        const tmp = document.createElement("div")
        tmp.innerHTML = html
        return tmp.textContent || tmp.innerText || ""
      }

      // Prepare data for table
      const tableColumn = ["Name", "Details", "Status", "Product", "Company", "Assigned To"]
      const tableRows = filteredTasks.map((task) => [
        task.name,
        stripHtml(task.details).substring(0, 50) + (stripHtml(task.details).length > 50 ? "..." : ""),
        task.status,
        task.product?.name || "N/A",
        task.company?.name || "N/A",
        task.assignedTo?.name || "N/A",
      ])

      // Add table to document
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: "striped",
      })

      // Save the PDF
      doc.save("SP_IT_Technologies_Tasks.pdf")

      toast({
        title: "PDF Exported",
        description: "Tasks list has been exported to PDF successfully.",
      })
    } catch (error) {
      console.error("Error exporting to PDF:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export tasks to PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const taskColumns: ColumnDef<Task>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "details",
      header: "Details",
      cell: ({ row }) => {
        const task = row.original
        return <RichTextDisplay content={task.details} maxLength={100} />
      },
    },
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }) => row.original.product?.name || "N/A",
    },
    {
      accessorKey: "company",
      header: "Company",
      cell: ({ row }) => row.original.company?.name || "N/A",
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const task = row.original

        return (
          <Select defaultValue={task.status} onValueChange={(value) => updateTaskStatus(task.id, value)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue>
                {task.status === "Complete" && (
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Complete
                  </div>
                )}
                {task.status === "Pending" && (
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-yellow-500" /> Pending
                  </div>
                )}
                {task.status === "Working" && (
                  <div className="flex items-center">
                    <Wrench className="mr-2 h-4 w-4 text-blue-500" /> Working
                  </div>
                )}
                {task.status === "Assigned" && (
                  <div className="flex items-center">
                    <UserCheck className="mr-2 h-4 w-4 text-purple-500" /> Assigned
                  </div>
                )}
                {!["Complete", "Pending", "Working", "Assigned"].includes(task.status) && (
                  <div className="flex items-center">
                    <CircleOff className="mr-2 h-4 w-4 text-gray-500" /> {task.status}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Complete">
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Complete
                </div>
              </SelectItem>
              <SelectItem value="Pending">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-yellow-500" /> Pending
                </div>
              </SelectItem>
              <SelectItem value="Working">
                <div className="flex items-center">
                  <Wrench className="mr-2 h-4 w-4 text-blue-500" /> Working
                </div>
              </SelectItem>
              <SelectItem value="Assigned">
                <div className="flex items-center">
                  <UserCheck className="mr-2 h-4 w-4 text-purple-500" /> Assigned
                </div>
              </SelectItem>
              <SelectItem value="Other">
                <div className="flex items-center">
                  <CircleOff className="mr-2 h-4 w-4 text-gray-500" /> Other
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        )
      },
    },
    {
      accessorKey: "assignedTo",
      header: "Assigned To",
      cell: ({ row }) => row.original.assignedTo?.name || "N/A",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const task = row.original

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
                <Link href={`/tasks/edit/${task.id}`}>
                  <Edit className="mr-2 h-4 w-4 text-blue-500" />
                  Edit Task
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setDeleteTaskId(task.id)
                  setIsDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportTaskToPDF(task)}>
                <Download className="mr-2 h-4 w-4 text-blue-500" />
                Export to PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {task.status === "Complete" && task.workDetail ? (
                <DropdownMenuItem asChild>
                  <Link href={`/tasks/resolve/${task.id}`}>
                    <FileSearch className="mr-2 h-4 w-4 text-green-500" />
                    Resolve Task
                  </Link>
                </DropdownMenuItem>
              ) : task.status !== "Complete" ? (
                <DropdownMenuItem asChild>
                  <Link href={`/tasks/complete?taskId=${task.id}`}>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Mark as Complete
                  </Link>
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <div className="flex gap-2">
          <Link href="/tasks/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </Link>
          <Link href="/tasks/complete">
            <Button variant="outline">
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Task
            </Button>
          </Link>
          <Button variant="outline" onClick={exportAllTasksToPDF}>
            <Download className="mr-2 h-4 w-4" />
            Export All to PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Task List
          </CardTitle>
          <div className="flex items-center gap-4">
            <SearchInput
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex border rounded-md overflow-hidden">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="rounded-none"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4 mr-1" />
                List
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "ghost"}
                size="sm"
                className="rounded-none"
                onClick={() => setViewMode("calendar")}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Calendar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <p>Loading tasks...</p>
            </div>
          ) : viewMode === "list" ? (
            <DataTable columns={taskColumns} data={filteredTasks} />
          ) : (
            <TaskCalendarView tasks={filteredTasks} employees={employees} />
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTaskId) {
                  deleteTask(deleteTaskId)
                  setDeleteTaskId(null)
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

export default function TasksPage() {
  return (
    <ProtectedRoute>
      <TasksPageComponent />
    </ProtectedRoute>
  )
}
