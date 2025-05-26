"use client"

import { useState } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from "date-fns"
import { ChevronLeft, ChevronRight, Calendar, CheckCircle, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { workTags } from "@/lib/data"

// Work update type
type WorkUpdate = {
  id: string
  date: string
  workName: string
  workDetail: string
  workDuration: number
  tags: string[]
  employeeId: string
  companyId?: string
  employee?: {
    id: string
    name: string
    position: string
    email: string
    phone: string
  }
  company?: {
    id: string
    name: string
    address: string
    contactName: string
    contactEmail: string
    contactPhone: string
  }
  createdAt: string
  updatedAt: string
}

// Create work tag badge variants
const workTagBadgeVariants: Record<string, string> = {}
workTags.forEach((tag) => {
  workTagBadgeVariants[tag.name] = tag.badge
})

interface WorkCalendarProps {
  workUpdates: WorkUpdate[]
  selectedEmployee: string
  onDateSelect: (date: Date, updates: WorkUpdate[]) => void
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export function WorkCalendar({ workUpdates, selectedEmployee, onDateSelect }: WorkCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)

  // Filter work updates by selected employee
  const filteredUpdates =
    selectedEmployee === "all" ? workUpdates : workUpdates.filter((update) => update.employeeId === selectedEmployee)

  // Get work updates for a specific date
  const getWorkUpdatesForDate = (date: Date): WorkUpdate[] => {
    return filteredUpdates.filter((update) => isSameDay(new Date(update.date), date))
  }

  // Get calendar days
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Add padding days for proper calendar layout
  const startDay = monthStart.getDay()
  const paddingDays = Array.from({ length: startDay }, (_, i) => {
    const date = new Date(monthStart)
    date.setDate(date.getDate() - (startDay - i))
    return date
  })

  const endDay = monthEnd.getDay()
  const endPaddingDays = Array.from({ length: 6 - endDay }, (_, i) => {
    const date = new Date(monthEnd)
    date.setDate(date.getDate() + (i + 1))
    return date
  })

  const allDays = [...paddingDays, ...calendarDays, ...endPaddingDays]

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    const updatesForDate = getWorkUpdatesForDate(date)
    onDateSelect(date, updatesForDate)
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-sp-red/10 via-sp-blue/10 to-sp-yellow/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Calendar className="h-6 w-6" />📅 Work Updates Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("prev")}
                className="hover:bg-sp-red/10 transition-colors duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-lg font-semibold min-w-[200px] text-center">{format(currentDate, "MMMM yyyy")}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("next")}
                className="hover:bg-sp-blue/10 transition-colors duration-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {allDays.map((date, index) => {
              const updatesForDate = getWorkUpdatesForDate(date)
              const hasUpdates = updatesForDate.length > 0
              const isCurrentMonth = isSameMonth(date, currentDate)
              const isTodayDate = isToday(date)
              const isSelected = selectedDate && isSameDay(date, selectedDate)
              const isHovered = hoveredDate && isSameDay(date, hoveredDate)

              return (
                <div
                  key={index}
                  className={`
                    relative min-h-[80px] p-2 rounded-lg border-2 cursor-pointer transition-all duration-300 transform
                    ${isCurrentMonth ? "opacity-100" : "opacity-30"}
                    ${isTodayDate ? "border-sp-red bg-sp-red/5 shadow-lg" : "border-gray-200"}
                    ${isSelected ? "border-sp-blue bg-sp-blue/10 scale-105" : ""}
                    ${isHovered ? "scale-102 shadow-md" : ""}
                    ${hasUpdates ? "bg-green-50 hover:bg-green-100" : "bg-gray-50 hover:bg-gray-100"}
                    hover:shadow-lg hover:scale-102
                  `}
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => setHoveredDate(date)}
                  onMouseLeave={() => setHoveredDate(null)}
                >
                  {/* Date number */}
                  <div
                    className={`
                    text-sm font-semibold mb-1
                    ${isTodayDate ? "text-sp-red" : isCurrentMonth ? "text-foreground" : "text-muted-foreground"}
                  `}
                  >
                    {format(date, "d")}
                  </div>

                  {/* Status indicator */}
                  {isCurrentMonth && (
                    <div className="absolute top-1 right-1">
                      {hasUpdates ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600 animate-pulse" />
                          <span className="text-xs">✅</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-xs">❌</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Work updates summary */}
                  {isCurrentMonth && (
                    <div className="space-y-1">
                      {hasUpdates ? (
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-green-700 flex items-center gap-1">
                            <span>📝</span>
                            {updatesForDate.length} update{updatesForDate.length > 1 ? "s" : ""}
                          </div>
                          {updatesForDate.slice(0, 2).map((update, idx) => (
                            <div key={idx} className="text-xs text-gray-600 truncate">
                              {update.workName}
                            </div>
                          ))}
                          {updatesForDate.length > 2 && (
                            <div className="text-xs text-blue-600 font-medium">+{updatesForDate.length - 2} more</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-red-500 font-medium flex items-center gap-1">
                          <span>⚠️</span>
                          No Updates
                        </div>
                      )}
                    </div>
                  )}

                  {/* Today indicator */}
                  {isTodayDate && (
                    <div className="absolute bottom-1 left-1 text-xs bg-sp-red text-white px-1 rounded animate-bounce">
                      Today
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Calendar Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>✅ Has Updates</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>❌ No Updates</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-sp-red/20 border-2 border-sp-red rounded"></div>
              <span>📅 Today</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-sp-blue/20 border-2 border-sp-blue rounded"></div>
              <span>🎯 Selected</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
