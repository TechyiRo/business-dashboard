"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpDown, Download, Edit, FileText, Plus, Trash2, User } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { ProtectedRoute } from "@/components/protected-route"

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

type Employee = {
  id: string
  name: string
  position: string
  email: string
  phone: string
}

function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [deleteEmployeeId, setDeleteEmployeeId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEmployees(employees)
    } else {
      const lowercasedSearch = searchTerm.toLowerCase()
      const filtered = employees.filter(
        (employee) =>
          employee.name.toLowerCase().includes(lowercasedSearch) ||
          employee.position.toLowerCase().includes(lowercasedSearch) ||
          employee.email.toLowerCase().includes(lowercasedSearch) ||
          employee.phone.toLowerCase().includes(lowercasedSearch),
      )
      setFilteredEmployees(filtered)
    }
  }, [searchTerm, employees])

  async function fetchEmployees() {
    try {
      setLoading(true)
      const response = await fetch("/api/employees")
      if (!response.ok) {
        throw new Error("Failed to fetch employees")
      }
      const data = await response.json()
      setEmployees(data)
      setFilteredEmployees(data)
    } catch (error) {
      console.error("Error fetching employees:", error)
      toast({
        title: "Error",
        description: "Failed to load employees. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function deleteEmployee(id: string) {
    try {
      setDeleteError(null)
      const response = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        setDeleteError(data.error || "Failed to delete employee")
        return false
      }

      // Remove the employee from the local state
      const updatedEmployees = employees.filter((employee) => employee.id !== id)
      setEmployees(updatedEmployees)
      setFilteredEmployees(
        searchTerm.trim() === "" ? updatedEmployees : filteredEmployees.filter((employee) => employee.id !== id),
      )

      toast({
        title: "Employee Deleted",
        description: "The employee has been deleted successfully.",
      })

      return true
    } catch (error) {
      console.error("Error deleting employee:", error)
      setDeleteError("An unexpected error occurred")
      return false
    }
  }

  function exportEmployeesToPDF() {
    try {
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(20)
      doc.text("Employees List", 14, 22)

      // Add current date
      const date = new Date().toLocaleDateString()
      doc.setFontSize(10)
      doc.text(`Generated on: ${date}`, 14, 30)

      // Prepare data for table
      const tableColumn = ["Name", "Position", "Email", "Phone"]
      const tableRows = filteredEmployees.map((employee) => [
        employee.name,
        employee.position,
        employee.email,
        employee.phone,
      ])

      // Add table to document
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: "striped",
        headStyles: { fillColor: [237, 28, 36] }, // SP-red color
      })

      // Save the PDF
      doc.save("SP_IT_Technologies_Employees.pdf")

      toast({
        title: "PDF Exported",
        description: "Employees list has been exported to PDF successfully.",
      })
    } catch (error) {
      console.error("Error exporting to PDF:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export employees to PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  function exportEmployeeDetailsToPDF(employee: Employee) {
    try {
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(20)
      doc.text("Employee Details", 14, 22)

      // Add employee information
      const employeeData = [
        ["Name", employee.name],
        ["Position", employee.position],
        ["Email", employee.email],
        ["Phone", employee.phone],
      ]

      autoTable(doc, {
        startY: 30,
        head: [["Field", "Value"]],
        body: employeeData,
        theme: "striped",
        headStyles: { fillColor: [237, 28, 36] }, // SP-red color
      })

      // Save the PDF
      doc.save(`Employee_${employee.name.replace(/\s+/g, "_")}.pdf`)

      toast({
        title: "PDF Exported",
        description: "Employee details have been exported to PDF successfully.",
      })
    } catch (error) {
      console.error("Error exporting to PDF:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export employee details to PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const employeeColumns: ColumnDef<Employee>[] = [
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
      accessorKey: "position",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Position
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const employee = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-more-horizontal"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/employees/edit/${employee.id}`}>
                  <Edit className="mr-2 h-4 w-4 text-blue-500" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setDeleteEmployeeId(employee.id)
                  setIsDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportEmployeeDetailsToPDF(employee)}>
                <FileText className="mr-2 h-4 w-4 text-green-500" />
                Export to PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <ProtectedRoute>
      <main className="container mx-auto p-4 md:p-6">
        <h1 className="mb-6 text-2xl font-bold">Employees</h1>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 animate-fade-in">
            <User className="h-8 w-8 text-sp-red" />
            Employee List
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/employees/add">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-sp-red to-sp-yellow hover:from-sp-red/90 hover:to-sp-yellow/90 transition-all duration-300 hover:shadow-md">
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full sm:w-auto transition-all duration-300 hover:shadow-md"
              onClick={exportEmployeesToPDF}
            >
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
          </div>
        </div>

        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-sp-red/10 to-sp-blue/10">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-sp-red" />
              Employee List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <SearchInput
                placeholder="Search employees by name, position, email, or phone..."
                onChange={setSearchTerm}
                className="max-w-md"
              />
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-sp-red border-t-transparent"></div>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                {searchTerm ? (
                  <>
                    <div className="text-4xl mb-3">🔍</div>
                    <h3 className="text-xl font-medium text-gray-900">No matching employees found</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-3">👥</div>
                    <h3 className="text-xl font-medium text-gray-900">No employees yet</h3>
                    <p className="text-gray-500 mt-2">Add your first employee to get started</p>
                    <Link href="/employees/add" className="mt-4">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Employee
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div className="animate-fade-in">
                <DataTable columns={employeeColumns} data={filteredEmployees} />
                <p className="text-sm text-muted-foreground mt-2">
                  Showing {filteredEmployees.length} of {employees.length} employees
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="animate-fade-in-up">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteError ? (
                  <div className="text-red-500">{deleteError}</div>
                ) : (
                  "This action cannot be undone. This will permanently delete the employee and all associated data."
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              {!deleteError && (
                <AlertDialogAction
                  onClick={async () => {
                    if (deleteEmployeeId) {
                      const success = await deleteEmployee(deleteEmployeeId)
                      if (success) {
                        setDeleteEmployeeId(null)
                      }
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </ProtectedRoute>
  )
}

export default EmployeesPage
