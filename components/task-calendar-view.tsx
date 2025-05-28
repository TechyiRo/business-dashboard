"use client"

import { useState, useEffect } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TaskDayView } from "./task-day-view"

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
}

export function TaskCalendarView({ tasks, employees }: { tasks: Task[]; employees: Employee[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])

  // Filter tasks based on selected employee and date
  useEffect(() => {
    let filtered = [...tasks]

    // Filter by employee
    if (selectedEmployee !== "all") {
      filtered = filtered.filter((task) => task.assignedToId === selectedEmployee)
    }

    // Filter by date if selected
    if (selectedDate) {
      filtered = filtered.filter((task) => {
        const taskDate = new Date(task.date)
        return isSameDay(taskDate, selectedDate)
      })
    }

    setFilteredTasks(filtered)
  }, [tasks, selectedEmployee, selectedDate])

  // Get days in current month
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
    setSelectedDate(null)
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
    setSelectedDate(null)
  }

  // Check if a date has tasks
  const hasTasksOnDate = (date: Date) => {
    return tasks.some((task) => {
      const taskDate = new Date(task.date)
      return isSameDay(taskDate, date) && (selectedEmployee === "all" || task.assignedToId === selectedEmployee)
    })
  }

  // Count tasks on a specific date
  const countTasksOnDate = (date: Date) => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.date)
      return isSameDay(taskDate, date) && (selectedEmployee === "all" || task.assignedToId === selectedEmployee)
    }).length
  }

  // Get emoji based on task status
  const getDateEmoji = (date: Date) => {
    const hasTasksToday = hasTasksOnDate(date)
    const taskCount = countTasksOnDate(date)

    if (hasTasksToday) {
      // Different emojis based on task count
      if (taskCount > 3) return "✅" // Heavy checkmark for many tasks
      if (taskCount > 1) return "✓" // Checkmark for multiple tasks
      return "📋" // Clipboard for single task
    } else {
      // Emoji for days without tasks
      const dayOfWeek = date.getDay()
      // Weekend gets a different emoji
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return "😎" // Cool face for weekends
      }
      return "🙂" // Smile for weekdays
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-64">
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger>
              <SelectValue placeholder="Select Employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium">{format(currentMonth, "MMMM yyyy")}</h3>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-medium py-2">
            {day}
          </div>
        ))}

        {/* Empty cells for days before the first of the month */}
        {Array.from({ length: monthStart.getDay() }).map((_, index) => (
          <div key={`empty-start-${index}`} className="h-24 border rounded-md bg-gray-50"></div>
        ))}

        {/* Calendar days */}
        {daysInMonth.map((day) => {
          const hasTasksToday = hasTasksOnDate(day)
          const taskCount = countTasksOnDate(day)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const dateEmoji = getDateEmoji(day)

          return (
            <div
              key={day.toString()}
              className={`h-24 border rounded-md p-1 transition-colors ${
                isSelected
                  ? "bg-blue-50 border-blue-300"
                  : hasTasksToday
                    ? "bg-green-50 hover:bg-green-100 cursor-pointer"
                    : "bg-white hover:bg-gray-50 cursor-pointer"
              }`}
              onClick={() => setSelectedDate(isSameDay(day, selectedDate) ? null : day)}
            >
              <div className="flex justify-between items-start">
                <span className="font-medium">{format(day, "d")}</span>
                {hasTasksToday && (
                  <span className="text-xs font-medium bg-green-100 text-green-800 rounded-full px-1.5">
                    {taskCount}
                  </span>
                )}
              </div>

              {/* Emoji indicator */}
              <div className="flex justify-center items-center h-12 mt-1">
                <span className="text-2xl" role="img" aria-label={hasTasksToday ? "Has tasks" : "No tasks"}>
                  {dateEmoji}
                </span>
              </div>
            </div>
          )
        })}

        {/* Empty cells for days after the end of the month */}
        {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
          <div key={`empty-end-${index}`} className="h-24 border rounded-md bg-gray-50"></div>
        ))}
      </div>

      {/* Show tasks for selected date */}
      {selectedDate && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Tasks for {format(selectedDate, "MMMM d, yyyy")}</h3>
          <TaskDayView tasks={filteredTasks} date={selectedDate} employees={employees} />
        </div>
      )}
    </div>
  )
}
