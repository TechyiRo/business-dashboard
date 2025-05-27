"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { AdvancedRichTextEditor } from "@/components/advanced-rich-text-editor"

// Type definitions
type Employee = {
  id: string
  name: string
}

type Product = {
  id: string
  name: string
}

type Company = {
  id: string
  name: string
}

// Update the formSchema to include the new status
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  details: z.string().min(5, {
    message: "Details must be at least 5 characters.",
  }),
  productId: z.string().min(1, {
    message: "Please select a product.",
  }),
  companyId: z.string().min(1, {
    message: "Please select a company.",
  }),
  date: z.string().min(1, {
    message: "Please select a date.",
  }),
  assignedById: z.string().min(1, {
    message: "Please select who assigned the task.",
  }),
  assignedToId: z.string().min(1, {
    message: "Please select who the task is assigned to.",
  }),
  status: z.enum(["Complete", "Pending", "Working", "Assigned", "Other"] as const, {
    message: "Please select a status.",
  }),
})

// Update the taskStatuses constant to include "Assigned"
const taskStatuses = ["Complete", "Pending", "Working", "Assigned", "Other"] as const

export default function AddTaskPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [taskDetails, setTaskDetails] = useState("")

  // Fetch data for dropdown options
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        const [employeesRes, productsRes, companiesRes] = await Promise.all([
          fetch("/api/employees"),
          fetch("/api/products"),
          fetch("/api/companies"),
        ])

        const employeesData = await employeesRes.json()
        const productsData = await productsRes.json()
        const companiesData = await companiesRes.json()

        setEmployees(employeesData)
        setProducts(productsData)
        setCompanies(companiesData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data for the form.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      details: "",
      productId: "",
      companyId: "",
      date: new Date().toISOString().split("T")[0],
      assignedById: "",
      assignedToId: "",
      status: "Pending",
    },
  })

  // Update form when rich text editor changes
  useEffect(() => {
    form.setValue("details", taskDetails)
  }, [taskDetails, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          details: taskDetails, // Use the rich text content
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add task")
      }

      toast({
        title: "Success!",
        description: "Task added successfully with rich formatting.",
        variant: "default",
      })

      // Reset form and rich text editor
      form.reset()
      setTaskDetails("")

      // Redirect to the tasks page after a short delay
      setTimeout(() => {
        router.push("/tasks")
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("Error adding task:", error)
      toast({
        title: "Error",
        description: "There was a problem adding the task.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center">
        <p>Loading form data...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            <CardTitle>Add Task</CardTitle>
          </div>
          <CardDescription>Create a new task with rich text formatting and assign it to an employee.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Website Redesign" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Details (Rich Text)</FormLabel>
                    <FormControl>
                      <AdvancedRichTextEditor
                        value={taskDetails}
                        onChange={setTaskDetails}
                        placeholder="Enter detailed description with rich formatting..."
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-gray-600 mt-2">
                      ✨ Use the toolbar above to format your text with different fonts, colors, and styles. Click
                      "Steps" to add auto-numbered lists for task procedures.
                    </p>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="assignedById"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned By</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an employee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assignedToId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned To</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an employee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {taskStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Task"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
