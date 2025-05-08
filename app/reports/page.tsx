"use client"

import { useEffect, useState } from "react"
import { BarChart3, PieChart } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Custom colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

type Task = {
  id: string
  name: string
  status: string
  companyId: string
  company?: { name: string }
}

type Product = {
  id: string
  name: string
  category: string
}

type Company = {
  id: string
  name: string
}

export default function ReportsPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [tasksRes, productsRes, companiesRes] = await Promise.all([
          fetch("/api/tasks"),
          fetch("/api/products"),
          fetch("/api/companies"),
        ])

        if (!tasksRes.ok || !productsRes.ok || !companiesRes.ok) {
          throw new Error("One or more API requests failed")
        }

        const tasksData = await tasksRes.json()
        const productsData = await productsRes.json()
        const companiesData = await companiesRes.json()

        setTasks(Array.isArray(tasksData) ? tasksData : [])
        setProducts(Array.isArray(productsData) ? productsData : [])
        setCompanies(Array.isArray(companiesData) ? companiesData : [])
      } catch (error) {
        console.error("Error fetching data:", error)
        // Set default empty arrays to prevent errors
        setTasks([])
        setProducts([])
        setCompanies([])
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

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-screen">
        <p>Loading reports...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>

      <Tabs defaultValue="task-status">
        <TabsList className="mb-6">
          <TabsTrigger value="task-status">Task Status</TabsTrigger>
          <TabsTrigger value="product-categories">Product Categories</TabsTrigger>
          <TabsTrigger value="company-tasks">Tasks by Company</TabsTrigger>
        </TabsList>

        <TabsContent value="task-status">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                <CardTitle>Task Status Distribution</CardTitle>
              </div>
              <CardDescription>Overview of tasks by their current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
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
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="product-categories">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                <CardTitle>Product Categories</CardTitle>
              </div>
              <CardDescription>Distribution of products by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
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
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company-tasks">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <CardTitle>Tasks by Company</CardTitle>
              </div>
              <CardDescription>Number of tasks assigned to each company</CardDescription>
            </CardHeader>
            <CardContent>
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
      </Tabs>
    </div>
  )
}
