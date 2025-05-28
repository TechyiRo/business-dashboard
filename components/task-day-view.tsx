"use client"

import { format } from "date-fns"
import { CheckCircle, Clock, Wrench, AlertCircle, CircleOff } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { RichTextDisplay } from "./rich-text-display"

type Employee = {
  id: string
  name: string
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
  workDetail?: {
    id: string
  }
}

export function TaskDayView({ tasks, date, employees }: { tasks: Task[]; date: Date; employees: Employee[] }) {
  // Get status icon based on task status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Complete":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "Working":
        return <Wrench className="h-4 w-4 text-blue-500" />
      case "Assigned":
        return <AlertCircle className="h-4 w-4 text-purple-500" />
      default:
        return <CircleOff className="h-4 w-4 text-gray-500" />
    }
  }

  // If no tasks for the selected date
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">No tasks scheduled for {format(date, "MMMM d, yyyy")}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white pb-2">
            <CardTitle className="text-lg">{task.name}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Details:</h4>
                <RichTextDisplay content={task.details} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Status:</h4>
                  <div className="flex items-center">
                    {getStatusIcon(task.status)}
                    <span className="ml-2">{task.status}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Assigned To:</h4>
                  <span>{task.assignedTo?.name || "Unassigned"}</span>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Product:</h4>
                  <span>{task.product?.name || "N/A"}</span>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Company:</h4>
                  <span>{task.company?.name || "N/A"}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-gray-50 flex justify-end gap-2 py-2">
            <Link href={`/tasks/edit/${task.id}`}>
              <Button variant="outline" size="sm">
                Edit Task
              </Button>
            </Link>
            {task.status !== "Complete" && (
              <Link href={`/tasks/complete?taskId=${task.id}`}>
                <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                  Mark Complete
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
