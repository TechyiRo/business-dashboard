"use client"

import { format } from "date-fns"
import Link from "next/link"
import { Calendar, Clock, User, Building2, Tag, Edit, Eye, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

interface DayViewProps {
  selectedDate: Date | null
  workUpdates: WorkUpdate[]
  onClose: () => void
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export function DayView({ selectedDate, workUpdates, onClose }: DayViewProps) {
  if (!selectedDate) return null

  const totalDuration = workUpdates.reduce((sum, update) => sum + update.workDuration, 0)
  const totalHours = Math.floor(totalDuration / 60)
  const totalMins = totalDuration % 60

  return (
    <Card className="mt-6 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="bg-gradient-to-r from-sp-blue/10 via-sp-yellow/10 to-sp-red/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />📋 {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Link href="/work-updates/add">
              <Button size="sm" className="bg-sp-red hover:bg-sp-red/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Update
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={onClose}>
              ✖️ Close
            </Button>
          </div>
        </div>

        {/* Day Summary */}
        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">📊 Total Updates:</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {workUpdates.length}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">⏱️ Total Time:</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {totalHours}h {totalMins}m
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {workUpdates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Work Updates</h3>
            <p className="text-muted-foreground mb-4">
              No work updates were added on {format(selectedDate, "MMMM d, yyyy")}
            </p>
            <div className="flex items-center justify-center gap-2 text-red-500 font-medium">
              <span>⚠️</span>
              <span>Pending Work Updates</span>
            </div>
            <Link href="/work-updates/add" className="mt-4 inline-block">
              <Button className="bg-sp-red hover:bg-sp-red/90">
                <Plus className="mr-2 h-4 w-4" />
                Add First Update
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {workUpdates.map((update, index) => (
              <Card
                key={update.id}
                className="overflow-hidden hover:shadow-md transition-all duration-300 animate-in fade-in-50"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1 flex items-center gap-2">
                        <span>📝</span>
                        {update.workName}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(update.workDuration)}
                        </div>
                        {update.employee && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {update.employee.name}
                          </div>
                        )}
                        {update.company && (
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {update.company.name}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 ml-4">
                      <Link href={`/work-updates/view/${update.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-green-100">
                          <Eye className="h-4 w-4 text-green-600" />
                        </Button>
                      </Link>
                      <Link href={`/work-updates/edit/${update.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-100">
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Work detail preview */}
                  <div className="mb-3">
                    <div
                      className="text-sm text-muted-foreground line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html:
                          update.workDetail.length > 150
                            ? update.workDetail.substring(0, 150) + "..."
                            : update.workDetail,
                      }}
                    />
                  </div>

                  {/* Tags */}
                  {update.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {update.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className={`${workTagBadgeVariants[tag] || workTagBadgeVariants["Other"]} border text-xs`}
                        >
                          <Tag className="mr-1 h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
