"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { CirclePlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

type Task = {
  id: string
  name: string
  details: string
  status: string
  product: { name: string }
  company: { name: string }
  assignedTo: { name: string }
}

type Employee = {
  id: string
  name: string
}

const formSchema = z.object({
  taskId: z.string().min(1, {
    message: "Please select a task.",
  }),
  completionDate: z.string().min(1, {
    message: "Please select a completion date.",
  }),
  employeeId: z.string().min(1, {
    message: "Please select an employee.",
  }),
  status: z.enum(["Non-Issue", "Issue", "Complex", "Smooth", "Hard", "Other"], {
    message: "Please select a status.",
  }),
  step1: z.string().min(5, {
    message: "Step 1 must be at least 5 characters.",
  }),
  step2: z.string().optional(),
  step3: z.string().optional(),
  additionalSteps: z.string().optional(),
})

const completionStatuses = ["Non-Issue", "Issue", "Complex", "Smooth", "Hard", "Other"]

export default function CompleteTaskPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSteps, setActiveSteps] = useState<number[]>([1])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taskId: searchParams.get("taskId") || "",
      completionDate: new Date().toISOString().split("T")[0],
      employeeId: "",
      status: "Smooth",
      step1: "",
      step2: "",
      step3: "",
      additionalSteps: "",
    },
  })

  // Watch the step values to determine when to show the next step
  const step1Value = form.watch("step1")
  const step2Value = form.watch("step2")
  const step3Value = form.watch("step3")

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [tasksRes, employeesRes] = await Promise.all([fetch("/api/tasks"), fetch("/api/employees")])

        if (!tasksRes.ok || !employeesRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const tasksData = await tasksRes.json()
        const employeesData = await employeesRes.json()

        // Filter tasks to only show incomplete tasks
        const incompleteTasks = Array.isArray(tasksData)
          ? tasksData.filter((task: Task) => task.status !== "Complete")
          : []

        setTasks(incompleteTasks)
        setEmployees(Array.isArray(employeesData) ? employeesData : [])

        // If a taskId is provided in the URL, select that task
        const taskId = searchParams.get("taskId")
        if (taskId) {
          const task = incompleteTasks.find((t: Task) => t.id === taskId)
          if (task) {
            setSelectedTask(task)
            form.setValue("taskId", taskId)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchParams, form])

  // Show next step when current step has content
  useEffect(() => {
    if (step1Value && step1Value.length >= 5 && !activeSteps.includes(2)) {
      setActiveSteps([...activeSteps, 2])
    }
    if (step2Value && step2Value.length >= 5 && !activeSteps.includes(3)) {
      setActiveSteps([...activeSteps, 3])
    }
  }, [step1Value, step2Value, activeSteps])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // Prepare the steps array
      const steps = [values.step1]
      if (values.step2) steps.push(values.step2)
      if (values.step3) steps.push(values.step3)
      if (values.additionalSteps) steps.push(values.additionalSteps)

      // Create the work detail
      const workDetailResponse = await fetch("/api/workdetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId: values.taskId,
          completionDate: values.completionDate,
          employeeId: values.employeeId,
          status: values.status,
          step1: values.step1,
          step2: values.step2 || null,
          step3: values.step3 || null,
          additionalSteps: values.additionalSteps || null,
        }),
      })

      if (!workDetailResponse.ok) {
        throw new Error("Failed to complete task")
      }

      toast({
        title: "Task completed",
        description: "The task has been marked as completed.",
      })

      router.push("/tasks")
    } catch (error) {
      console.error("Error completing task:", error)
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleTaskChange(taskId: string) {
    const task = tasks.find((t) => t.id === taskId)
    setSelectedTask(task || null)
    form.setValue("taskId", taskId)
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
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Complete Task</CardTitle>
          <CardDescription>Mark a task as complete and provide resolution details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="taskId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task</FormLabel>
                      <Select onValueChange={(value) => handleTaskChange(value)} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a task" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tasks.map((task) => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.name}
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
                  name="completionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Completion Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {selectedTask && (
                <div className="bg-muted p-4 rounded-md mb-4">
                  <h3 className="font-medium mb-2">Task Details</h3>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {selectedTask.name}
                    </div>
                    <div>
                      <span className="font-medium">Product:</span> {selectedTask.product?.name}
                    </div>
                    <div>
                      <span className="font-medium">Company:</span> {selectedTask.company?.name}
                    </div>
                    <div>
                      <span className="font-medium">Assigned To:</span> {selectedTask.assignedTo?.name}
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium">Details:</span> {selectedTask.details}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Completed By</FormLabel>
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Completion Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {completionStatuses.map((status) => (
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
              </div>

              <div>
                <h3 className="mb-4 text-lg font-medium">Steps to Resolve</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="step1" className="border-l-4 border-blue-500">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">
                          1
                        </span>
                        Step 1
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <FormField
                        control={form.control}
                        name="step1"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder="Describe the first step taken"
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  {activeSteps.includes(2) && (
                    <AccordionItem value="step2" className="border-l-4 border-green-500">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center">
                          <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">
                            2
                          </span>
                          Step 2
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <FormField
                          control={form.control}
                          name="step2"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe the second step taken"
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {activeSteps.includes(3) && (
                    <AccordionItem value="step3" className="border-l-4 border-purple-500">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center">
                          <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">
                            3
                          </span>
                          Step 3
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <FormField
                          control={form.control}
                          name="step3"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe the third step taken"
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {activeSteps.includes(3) && step3Value && step3Value.length >= 5 && (
                    <AccordionItem value="additionalSteps" className="border-l-4 border-amber-500">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center">
                          <span className="bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">
                            +
                          </span>
                          Additional Steps
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <FormField
                          control={form.control}
                          name="additionalSteps"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe any additional steps taken"
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>

                {!activeSteps.includes(2) && step1Value && step1Value.length >= 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setActiveSteps([...activeSteps, 2])}
                  >
                    <CirclePlus className="mr-2 h-4 w-4" />
                    Add Step 2
                  </Button>
                )}

                {activeSteps.includes(2) && !activeSteps.includes(3) && step2Value && step2Value.length >= 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setActiveSteps([...activeSteps, 3])}
                  >
                    <CirclePlus className="mr-2 h-4 w-4" />
                    Add Step 3
                  </Button>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Mark as Complete"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
