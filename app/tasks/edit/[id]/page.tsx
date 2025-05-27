"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Calendar, Save } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { ProtectedRoute } from "@/components/protected-route"
import { AdvancedRichTextEditor } from "@/components/advanced-rich-text-editor"

type Employee = {
  id: string
  name: string
  position: string
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
  product?: { name: string }
  company?: { name: string }
  assignedBy?: { name: string }
  assignedTo?: { name: string }
}

function EditTaskPageComponent() {
  const router = useRouter()
  const params = useParams()
  const taskId = params.id as string

  const [task, setTask] = useState<Task | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    details: "",
    date: "",
    status: "Pending",
    productId: "",
    companyId: "",
    assignedById: "",
    assignedToId: "",
  })

  const [taskDetails, setTaskDetails] = useState("")

  useEffect(() => {
    if (taskId) {
      fetchTaskData()
      fetchEmployees()
      fetchProducts()
      fetchCompanies()
    }
  }, [taskId])

  async function fetchTaskData() {
    try {
      const response = await fetch(`/api/tasks/${taskId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch task")
      }
      const taskData = await response.json()
      setTask(taskData)

      // Populate form with existing data
      setFormData({
        name: taskData.name || "",
        details: taskData.details || "",
        date: taskData.date ? new Date(taskData.date).toISOString().split("T")[0] : "",
        status: taskData.status || "Pending",
        productId: taskData.productId || "",
        companyId: taskData.companyId || "",
        assignedById: taskData.assignedById || "",
        assignedToId: taskData.assignedToId || "",
      })

      setTaskDetails(taskData.details || "")
    } catch (error) {
      console.error("Error fetching task:", error)
      toast({
        title: "Error",
        description: "Failed to load task data. Please try again.",
        variant: "destructive",
      })
    }
  }

  async function fetchEmployees() {
    try {
      const response = await fetch("/api/employees")
      if (response.ok) {
        const data = await response.json()
        setEmployees(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
    }
  }

  async function fetchProducts() {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  async function fetchCompanies() {
    try {
      const response = await fetch("/api/companies")
      if (response.ok) {
        const data = await response.json()
        setCompanies(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          details: taskDetails, // Use the rich text content
          date: new Date(formData.date).toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      toast({
        title: "Success",
        description: "Task updated successfully!",
      })

      router.push("/tasks")
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  function handleInputChange(field: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p>Loading task data...</p>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Task Not Found</h2>
              <p className="text-gray-600 mb-4">The task you're looking for doesn't exist or has been deleted.</p>
              <Link href="/tasks">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Tasks
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/tasks">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tasks
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Edit Task</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Edit Task Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Task Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter task name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product">Product *</Label>
                <Select value={formData.productId} onValueChange={(value) => handleInputChange("productId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Select value={formData.companyId} onValueChange={(value) => handleInputChange("companyId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedBy">Assigned By *</Label>
                <Select
                  value={formData.assignedById}
                  onValueChange={(value) => handleInputChange("assignedById", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select who assigned this task" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} ({employee.position})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To *</Label>
                <Select
                  value={formData.assignedToId}
                  onValueChange={(value) => handleInputChange("assignedToId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select who to assign this task to" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} ({employee.position})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Working">Working</SelectItem>
                    <SelectItem value="Assigned">Assigned</SelectItem>
                    <SelectItem value="Complete">Complete</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Task Details (Rich Text) *</Label>
              <AdvancedRichTextEditor
                value={taskDetails}
                onChange={setTaskDetails}
                placeholder="Enter detailed description with rich formatting..."
                className="w-full"
              />
              <p className="text-sm text-gray-600 mt-2">
                ✨ Use the toolbar above to format your text with different fonts, colors, and styles. Click "Steps" to
                add auto-numbered lists for task procedures.
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Task
                  </>
                )}
              </Button>
              <Link href="/tasks">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function EditTaskPage() {
  return (
    <ProtectedRoute>
      <EditTaskPageComponent />
    </ProtectedRoute>
  )
}
