"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

type WorkDetail = {
  id: string
  completionDate: string
  status: string
  step1: string
  step2: string | null
  step3: string | null
  additionalSteps: string | null
  taskId: string
  employeeId: string
  employee: {
    name: string
    position: string
  }
  task: {
    name: string
    details: string
    date: string
    status: string
    product: {
      name: string
    }
    company: {
      name: string
    }
    assignedBy: {
      name: string
    }
    assignedTo: {
      name: string
    }
  }
}

export default function ResolveTaskPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [workDetail, setWorkDetail] = useState<WorkDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWorkDetail() {
      try {
        setLoading(true)
        const response = await fetch(`/api/workdetails/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch work detail")
        }
        const data = await response.json()
        setWorkDetail(data)
      } catch (error) {
        console.error("Error fetching work detail:", error)
        toast({
          title: "Error",
          description: "Failed to load task resolution details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWorkDetail()
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center">
        <p>Loading task resolution details...</p>
      </div>
    )
  }

  if (!workDetail) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Task Not Found</CardTitle>
            <CardDescription>The task resolution details could not be found.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/tasks")}>Back to Tasks</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Task Resolution: {workDetail.task.name}</CardTitle>
              <CardDescription>Completed on {new Date(workDetail.completionDate).toLocaleDateString()}</CardDescription>
            </div>
            <Badge variant={workDetail.status === "Smooth" ? "success" : "secondary"} className="text-sm">
              {workDetail.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Task Details</h3>
              <div className="rounded-md border p-4">
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="font-medium">Status:</dt>
                    <dd>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {workDetail.task.status}
                      </Badge>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Product:</dt>
                    <dd>{workDetail.task.product.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Company:</dt>
                    <dd>{workDetail.task.company.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Date:</dt>
                    <dd>{new Date(workDetail.task.date).toLocaleDateString()}</dd>
                  </div>
                  <div className="pt-2">
                    <dt className="font-medium">Description:</dt>
                    <dd className="mt-1">{workDetail.task.details}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Resolution Details</h3>
              <div className="rounded-md border p-4">
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="font-medium">Completed By:</dt>
                    <dd>{workDetail.employee.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Position:</dt>
                    <dd>{workDetail.employee.position}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Completion Date:</dt>
                    <dd>{new Date(workDetail.completionDate).toLocaleDateString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Resolution Status:</dt>
                    <dd>{workDetail.status}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Resolution Steps</h3>

            <div className="space-y-4">
              <div className="rounded-md border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-blue-950/20">
                <div className="flex items-center gap-2 font-medium text-blue-700 dark:text-blue-400">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">1</div>
                  Step 1
                </div>
                <p className="mt-2 text-sm">{workDetail.step1}</p>
              </div>

              {workDetail.step2 && (
                <div className="rounded-md border-l-4 border-green-500 bg-green-50 p-4 dark:bg-green-950/20">
                  <div className="flex items-center gap-2 font-medium text-green-700 dark:text-green-400">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                      2
                    </div>
                    Step 2
                  </div>
                  <p className="mt-2 text-sm">{workDetail.step2}</p>
                </div>
              )}

              {workDetail.step3 && (
                <div className="rounded-md border-l-4 border-purple-500 bg-purple-50 p-4 dark:bg-purple-950/20">
                  <div className="flex items-center gap-2 font-medium text-purple-700 dark:text-purple-400">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-white">
                      3
                    </div>
                    Step 3
                  </div>
                  <p className="mt-2 text-sm">{workDetail.step3}</p>
                </div>
              )}

              {workDetail.additionalSteps && (
                <div className="rounded-md border-l-4 border-amber-500 bg-amber-50 p-4 dark:bg-amber-950/20">
                  <div className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white">
                      +
                    </div>
                    Additional Steps
                  </div>
                  <p className="mt-2 text-sm">{workDetail.additionalSteps}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/tasks")}>
            Back to Tasks
          </Button>
          <Button onClick={() => window.print()}>
            <FileText className="mr-2 h-4 w-4" />
            Print Resolution
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
