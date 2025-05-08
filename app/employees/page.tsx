"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpDown, Plus, User } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"

type Employee = {
  id: string
  name: string
  position: string
  email: string
  phone: string
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
]

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEmployees() {
      try {
        setLoading(true)
        const response = await fetch("/api/employees")
        if (!response.ok) {
          throw new Error("Failed to fetch employees")
        }
        const data = await response.json()
        setEmployees(data)
      } catch (error) {
        console.error("Error fetching employees:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Employees</h1>
        <Link href="/employees/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Employee List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <p>Loading employees...</p>
            </div>
          ) : (
            <DataTable columns={employeeColumns} data={employees} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
