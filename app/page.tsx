"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowUpDown,
  Building2,
  CheckCircle,
  CircleOff,
  Clock,
  ClockIcon,
  Package,
  Plus,
  Users,
  Wrench,
} from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Bar,
  BarChart,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DbConnectionError } from "@/components/db-connection-error"

// Type definitions
type Employee = {
  id: string
  name: string
  position: string
  email: string
  phone: string
}

type Product = {
  id: string
  name: string
  category: string
}

type Company = {
  id: string
  name: string
  address: string
  contactName: string
  contactEmail: string
  contactPhone: string
}

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
  product?: Product
  company?: Company
  assignedBy?: Employee
  assignedTo?: Employee
}

// Custom colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

// Employee columns
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

// Product columns
const productColumns: ColumnDef<Product>[] = [
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
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
]

// Company columns
const companyColumns: ColumnDef<Company>[] = [
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
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "contactName",
    header: "Contact Name",
  },
  {
    accessorKey: "contactEmail",
    header: "Contact Email",
  },
  {
    accessorKey: "contactPhone",
    header: "Contact Phone",
  },
]

// Task columns
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
      const status = row.original.status

      switch (status) {
        case "Complete":
          return (
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Complete
            </div>
          )
        case "Pending":
          return (
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-yellow-500" /> Pending
            </div>
          )
        case "Working":
          return (
            <div className="flex items-center">
              <Wrench className="mr-2 h-4 w-4 text-blue-500" /> Working
            </div>
          )
        default:
          return (
            <div className="flex items-center">
              <CircleOff className="mr-2 h-4 w-4 text-gray-500" /> {status}
            </div>
          )
      }
    },
  },
  {
    accessorKey: "assignedTo",
    header: "Assigned To",
    cell: ({ row }) => row.original.assignedTo?.name || "N/A",
  },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [dbError, setDbError] = useState(false)

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setDbError(false)

        const [employeesRes, productsRes, companiesRes, tasksRes] = await Promise.all([
          fetch("/api/employees"),
          fetch("/api/products"),
          fetch("/api/companies"),
          fetch("/api/tasks"),
        ])

        if (!employeesRes.ok || !productsRes.ok || !companiesRes.ok || !tasksRes.ok) {
          setDbError(true)
          throw new Error("One or more API requests failed")
        }

        const employeesData = await employeesRes.json()
        const productsData = await productsRes.json()
        const companiesData = await companiesRes.json()
        const tasksData = await tasksRes.json()

        setEmployees(Array.isArray(employeesData) ? employeesData : [])
        setProducts(Array.isArray(productsData) ? productsData : [])
        setCompanies(Array.isArray(companiesData) ? companiesData : [])
        setTasks(Array.isArray(tasksData) ? tasksData : [])
      } catch (error) {
        console.error("Error fetching data:", error)
        setDbError(true)
        // Set default empty arrays to prevent errors
        setEmployees([])
        setProducts([])
        setCompanies([])
        setTasks([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Prepare data for charts
  const taskStatusData = [
    { name: "Complete", value: Array.isArray(tasks) ? tasks.filter((task) => task.status === "Complete").length : 0 },
    { name: "Pending", value: Array.isArray(tasks) ? tasks.filter((task) => task.status === "Pending").length : 0 },
    { name: "Working", value: Array.isArray(tasks) ? tasks.filter((task) => task.status === "Working").length : 0 },
    {
      name: "Other",
      value: Array.isArray(tasks)
        ? tasks.filter((task) => !["Complete", "Pending", "Working"].includes(task.status)).length
        : 0,
    },
  ]

  const productCategoryData = Array.isArray(products)
    ? products.reduce(
        (acc, product) => {
          const categoryIndex = acc.findIndex((item) => item.name === product.category)
          if (categoryIndex >= 0) {
            acc[categoryIndex].value++
          } else {
            acc.push({ name: product.category, value: 1 })
          }
          return acc
        },
        [] as { name: string; value: number }[],
      )
    : []

  const taskByCompanyData =
    Array.isArray(companies) && Array.isArray(tasks)
      ? companies.map((company) => ({
          name: company.name,
          tasks: tasks.filter((task) => task.companyId === company.id).length,
        }))
      : []

  return (
    <div className="flex flex-col p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Business Dashboard</h1>
      </div>

      {dbError && <DbConnectionError />}

      <div className="mt-6">
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          {/* Dashboard Overview with Charts */}
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{employees.length}</div>
                  <p className="text-xs text-muted-foreground">Team members in the organization</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.length}</div>
                  <p className="text-xs text-muted-foreground">Products in the catalog</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{companies.length}</div>
                  <p className="text-xs text-muted-foreground">Client companies registered</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                  <ClockIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tasks.filter((task) => task.status !== "Complete").length}</div>
                  <p className="text-xs text-muted-foreground">Tasks still in progress</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mt-6">
              {/* Task Status Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Task Status</CardTitle>
                  <CardDescription>Distribution of tasks by status</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taskStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {taskStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Product by Category Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Products by Category</CardTitle>
                  <CardDescription>Distribution of products by category</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={productCategoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {productCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tasks by Company Chart */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Tasks by Company</CardTitle>
                <CardDescription>Number of tasks assigned to each company</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={taskByCompanyData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="tasks" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Employees</CardTitle>
                <Link href="/employees/add">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Employee
                  </Button>
                </Link>
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
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Products</CardTitle>
                <Link href="/products/add">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-24">
                    <p>Loading products...</p>
                  </div>
                ) : (
                  <DataTable columns={productColumns} data={products} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Companies</CardTitle>
                <Link href="/companies/add">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Company
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-24">
                    <p>Loading companies...</p>
                  </div>
                ) : (
                  <DataTable columns={companyColumns} data={companies} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Tasks</CardTitle>
                <div className="flex gap-2">
                  <Link href="/tasks/add">
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Task
                    </Button>
                  </Link>
                  <Link href="/tasks/complete">
                    <Button size="sm" variant="outline">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete Task
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-24">
                    <p>Loading tasks...</p>
                  </div>
                ) : (
                  <DataTable columns={taskColumns} data={tasks} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
