"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
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
  Boxes,
  AlertCircle,
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

type InventoryItem = {
  id: string
  productName: string
  serialNumber: string
  status: string
}

// Custom colors for charts - using a more accessible color palette
const STATUS_COLORS = {
  Complete: "#22c55e", // Green
  Pending: "#f59e0b", // Amber
  Working: "#3b82f6", // Blue
  Assigned: "#8b5cf6", // Purple
  Other: "#94a3b8", // Slate
}

// Company colors - using a colorblind-friendly palette
const COMPANY_COLORS = [
  "#003f5c", // Dark blue
  "#58508d", // Purple
  "#bc5090", // Pink
  "#ff6361", // Red
  "#ffa600", // Yellow
]

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
        case "Assigned":
          return (
            <div className="flex items-center">
              <AlertCircle className="mr-2 h-4 w-4 text-purple-500" /> Assigned
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

// Custom tooltip for the Tasks by Company chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
        <p className="font-medium">{label}</p>
        <p className="text-sm">{`Tasks: ${payload[0].value}`}</p>
      </div>
    )
  }

  return null
}

// Custom legend for the Task Status chart
const CustomLegend = (props: any) => {
  const { payload } = props

  return (
    <ul className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center">
          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
          <span className="text-xs">{entry.value}</span>
        </li>
      ))}
    </ul>
  )
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dbError, setDbError] = useState(false)

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setDbError(false)

        const [employeesRes, productsRes, companiesRes, tasksRes, inventoryRes] = await Promise.all([
          fetch("/api/employees"),
          fetch("/api/products"),
          fetch("/api/companies"),
          fetch("/api/tasks"),
          fetch("/api/inventory"),
        ])

        if (!employeesRes.ok || !productsRes.ok || !companiesRes.ok || !tasksRes.ok) {
          setDbError(true)
          throw new Error("One or more API requests failed")
        }

        const employeesData = await employeesRes.json()
        const productsData = await productsRes.json()
        const companiesData = await companiesRes.json()
        const tasksData = await tasksRes.json()
        const inventoryData = await inventoryRes.json()

        setEmployees(Array.isArray(employeesData) ? employeesData : [])
        setProducts(Array.isArray(productsData) ? productsData : [])
        setCompanies(Array.isArray(companiesData) ? companiesData : [])
        setTasks(Array.isArray(tasksData) ? tasksData : [])
        setInventoryItems(Array.isArray(inventoryData) ? inventoryData : [])
      } catch (error) {
        console.error("Error fetching data:", error)
        setDbError(true)
        // Set default empty arrays to prevent errors
        setEmployees([])
        setProducts([])
        setCompanies([])
        setTasks([])
        setInventoryItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Prepare data for charts
  const taskStatusData = [
    {
      name: "Complete",
      value: Array.isArray(tasks) ? tasks.filter((task) => task.status === "Complete").length : 0,
      color: STATUS_COLORS.Complete,
    },
    {
      name: "Pending",
      value: Array.isArray(tasks) ? tasks.filter((task) => task.status === "Pending").length : 0,
      color: STATUS_COLORS.Pending,
    },
    {
      name: "Working",
      value: Array.isArray(tasks) ? tasks.filter((task) => task.status === "Working").length : 0,
      color: STATUS_COLORS.Working,
    },
    {
      name: "Assigned",
      value: Array.isArray(tasks) ? tasks.filter((task) => task.status === "Assigned").length : 0,
      color: STATUS_COLORS.Assigned,
    },
    {
      name: "Other",
      value: Array.isArray(tasks)
        ? tasks.filter((task) => !["Complete", "Pending", "Working", "Assigned"].includes(task.status)).length
        : 0,
      color: STATUS_COLORS.Other,
    },
  ].filter((item) => item.value > 0) // Only show statuses that have tasks

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
      ? companies.map((company, index) => ({
          name: company.name,
          tasks: tasks.filter((task) => task.companyId === company.id).length,
          color: COMPANY_COLORS[index % COMPANY_COLORS.length],
        }))
      : []

  const inventoryStatusData = [
    {
      name: "RENT",
      value: Array.isArray(inventoryItems) ? inventoryItems.filter((item) => item.status === "RENT").length : 0,
    },
    {
      name: "SELL",
      value: Array.isArray(inventoryItems) ? inventoryItems.filter((item) => item.status === "SELL").length : 0,
    },
  ]

  // Animation configuration for charts
  const animationProps = {
    animationBegin: 0,
    animationDuration: 1500,
    animationEasing: "ease-out",
  }

  return (
    <div className="flex flex-col p-4 md:p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-lg">
            <Image
              src="/images/sp-it-logo.png"
              alt="SP IT Technologies"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <h1 className="text-2xl font-bold md:text-3xl">SP IT Technologies</h1>
        </div>
        <Link href="/inventory">
          <Button className="w-full bg-gradient-to-r from-sp-red to-sp-yellow hover:from-sp-red/90 hover:to-sp-yellow/90 sm:w-auto">
            <Boxes className="mr-2 h-4 w-4" />
            PRODUCT INVENTORY
          </Button>
        </Link>
      </div>

      {dbError && <DbConnectionError />}

      <div className="mt-6">
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="products" className="hidden md:block">
              Products
            </TabsTrigger>
            <TabsTrigger value="companies" className="hidden md:block">
              Companies
            </TabsTrigger>
            <TabsTrigger value="tasks" className="hidden md:block">
              Tasks
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Overview with Charts */}
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-sp-red/10 to-sp-red/5 pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-sp-red" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{employees.length}</div>
                  <p className="text-xs text-muted-foreground">Team members in the organization</p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-sp-blue/10 to-sp-blue/5 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-sp-blue" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.length}</div>
                  <p className="text-xs text-muted-foreground">Products in the catalog</p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-sp-yellow/10 to-sp-yellow/5 pb-2">
                  <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
                  <Building2 className="h-4 w-4 text-sp-yellow" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{companies.length}</div>
                  <p className="text-xs text-muted-foreground">Client companies registered</p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-green-100 to-green-50 pb-2">
                  <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                  <ClockIcon className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tasks.filter((task) => task.status !== "Complete").length}</div>
                  <p className="text-xs text-muted-foreground">Tasks still in progress</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {/* Task Status Chart */}
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
                <CardHeader className="bg-gradient-to-r from-sp-red/10 to-sp-blue/10">
                  <CardTitle>Task Status 📊</CardTitle>
                  <CardDescription>Distribution of tasks by status</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart {...animationProps}>
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
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend content={<CustomLegend />} layout="horizontal" verticalAlign="bottom" align="center" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Inventory Status Chart */}
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
                <CardHeader className="bg-gradient-to-r from-sp-blue/10 to-sp-yellow/10">
                  <CardTitle>Inventory Status 📦</CardTitle>
                  <CardDescription>Distribution of inventory items by status</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart {...animationProps}>
                        <Pie
                          data={inventoryStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#5B5DA8" /> {/* RENT - Blue */}
                          <Cell fill="#F7941D" /> {/* SELL - Yellow */}
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
            <Card className="mt-6 overflow-hidden transition-all duration-300 hover:shadow-md">
              <CardHeader className="bg-gradient-to-r from-sp-yellow/10 to-sp-red/10">
                <CardTitle>Tasks by Company 🏢</CardTitle>
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
                      {...animationProps}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="tasks">
                        {taskByCompanyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Color legend for companies */}
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Company Color Legend:</h4>
                  <div className="flex flex-wrap gap-4">
                    {taskByCompanyData.map((company, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className="w-4 h-4 rounded mr-2"
                          style={{ backgroundColor: company.color }}
                          aria-hidden="true"
                        />
                        <span className="text-xs">{company.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="mt-6">
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-sp-red/10 to-sp-blue/10">
                <CardTitle>Employees 👥</CardTitle>
                <Link href="/employees/add">
                  <Button size="sm" className="bg-sp-red hover:bg-sp-red/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Employee
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-24">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-sp-red border-t-transparent"></div>
                  </div>
                ) : (
                  <DataTable columns={employeeColumns} data={employees} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-sp-blue/10 to-sp-yellow/10">
                <CardTitle>Products 📦</CardTitle>
                <Link href="/products/add">
                  <Button size="sm" className="bg-sp-blue hover:bg-sp-blue/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-24">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-sp-blue border-t-transparent"></div>
                  </div>
                ) : (
                  <DataTable columns={productColumns} data={products} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies" className="mt-6">
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-sp-yellow/10 to-sp-red/10">
                <CardTitle>Companies 🏢</CardTitle>
                <Link href="/companies/add">
                  <Button size="sm" className="bg-sp-yellow hover:bg-sp-yellow/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Company
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-24">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-sp-yellow border-t-transparent"></div>
                  </div>
                ) : (
                  <DataTable columns={companyColumns} data={companies} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-green-100 to-green-50">
                <CardTitle>Tasks ✅</CardTitle>
                <div className="flex gap-2">
                  <Link href="/tasks/add">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
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
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
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
