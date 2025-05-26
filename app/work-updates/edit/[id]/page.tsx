"use client"

import type React from "react"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon, LucideTag, X, Plus, Palette } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ProtectedRoute } from "@/components/protected-route"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RichTextEditor } from "@/components/rich-text-editor"
import { workTags } from "@/lib/data"

// Define available colors for custom tags
const availableColors = [
  { name: "Red", value: "bg-red-500 hover:bg-red-600", badge: "bg-red-100 text-red-800 hover:bg-red-200" },
  { name: "Blue", value: "bg-blue-500 hover:bg-blue-600", badge: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
  { name: "Green", value: "bg-green-500 hover:bg-green-600", badge: "bg-green-100 text-green-800 hover:bg-green-200" },
  {
    name: "Purple",
    value: "bg-purple-500 hover:bg-purple-600",
    badge: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  },
  {
    name: "Yellow",
    value: "bg-yellow-500 hover:bg-yellow-600",
    badge: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  },
  {
    name: "Indigo",
    value: "bg-indigo-500 hover:bg-indigo-600",
    badge: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
  },
  { name: "Pink", value: "bg-pink-500 hover:bg-pink-600", badge: "bg-pink-100 text-pink-800 hover:bg-pink-200" },
  { name: "Teal", value: "bg-teal-500 hover:bg-teal-600", badge: "bg-teal-100 text-teal-800 hover:bg-teal-200" },
  {
    name: "Orange",
    value: "bg-orange-500 hover:bg-orange-600",
    badge: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  },
  { name: "Cyan", value: "bg-cyan-500 hover:bg-cyan-600", badge: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200" },
  { name: "Gray", value: "bg-gray-500 hover:bg-gray-600", badge: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
  {
    name: "Emerald",
    value: "bg-emerald-500 hover:bg-emerald-600",
    badge: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
  },
]

interface WorkTag {
  id?: string
  name: string
  color: string
  badge: string
}

function EditWorkUpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params) // Using React.use() for Next.js 15 compatibility
  const [date, setDate] = useState<Date>(new Date())
  const [workName, setWorkName] = useState("")
  const [workDetail, setWorkDetail] = useState("")
  const [workDurationHours, setWorkDurationHours] = useState("")
  const [workDurationMinutes, setWorkDurationMinutes] = useState("")
  const [selectedTags, setSelectedTags] = useState<WorkTag[]>([])
  const [employeeId, setEmployeeId] = useState("")
  const [companyId, setCompanyId] = useState("")
  const [employees, setEmployees] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [tags, setTags] = useState<WorkTag[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState(availableColors[0].value)
  const [newTagBadgeColor, setNewTagBadgeColor] = useState(availableColors[0].badge)
  const [tagSearchValue, setTagSearchValue] = useState("")

  useEffect(() => {
    fetchWorkUpdate()
    fetchEmployees()
    fetchCompanies()
    initializeTags()
  }, [id])

  function initializeTags() {
    // Convert workTags from data file to the format expected by the component
    const initialTags: WorkTag[] = workTags.map((tag) => ({
      name: tag.name,
      color: tag.color,
      badge: tag.badge,
    }))
    setTags(initialTags)
  }

  async function fetchWorkUpdate() {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/work-updates/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch work update")
      }
      const data = await response.json()

      // Set form data
      setDate(new Date(data.date))
      setWorkName(data.workName)
      setWorkDetail(data.workDetail)

      // Calculate hours and minutes
      const totalMinutes = data.workDuration
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      setWorkDurationHours(hours.toString())
      setWorkDurationMinutes(minutes.toString())

      // Convert tag names to WorkTag objects
      const tagObjects: WorkTag[] = (data.tags || []).map((tagName: string) => {
        const existingTag = workTags.find((tag) => tag.name === tagName)
        return existingTag
          ? {
              name: existingTag.name,
              color: existingTag.color,
              badge: existingTag.badge,
            }
          : {
              name: tagName,
              color: "bg-gray-500 hover:bg-gray-600",
              badge: "bg-gray-100 text-gray-800 hover:bg-gray-200",
            }
      })
      setSelectedTags(tagObjects)

      setEmployeeId(data.employeeId)
      setCompanyId(data.companyId || "")
    } catch (error) {
      console.error("Error fetching work update:", error)
      toast({
        title: "Error",
        description: "Failed to load work update. Please try again.",
        variant: "destructive",
      })
      router.push("/work-updates")
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchEmployees() {
    try {
      const response = await fetch("/api/employees")
      if (!response.ok) {
        throw new Error("Failed to fetch employees")
      }
      const data = await response.json()
      setEmployees(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching employees:", error)
      toast({
        title: "Error",
        description: "Failed to load employees. Please try again.",
        variant: "destructive",
      })
    }
  }

  async function fetchCompanies() {
    try {
      const response = await fetch("/api/companies")
      if (!response.ok) {
        throw new Error("Failed to fetch companies")
      }
      const data = await response.json()
      setCompanies(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching companies:", error)
      toast({
        title: "Error",
        description: "Failed to load companies. Please try again.",
        variant: "destructive",
      })
    }
  }

  function handleTagSelection(tag: WorkTag) {
    // Check if tag is already selected
    const isSelected = selectedTags.some((t) => t.name === tag.name)

    if (isSelected) {
      // Remove tag
      setSelectedTags((prev) => prev.filter((t) => t.name !== tag.name))
    } else {
      // Add tag
      setSelectedTags((prev) => [...prev, tag])
    }

    setTagSearchValue("")
  }

  function handleAddTag() {
    if (!newTagName.trim()) {
      toast({
        title: "Validation Error",
        description: "Tag name is required.",
        variant: "destructive",
      })
      return
    }

    // Check if tag already exists
    const tagExists = tags.some((tag) => tag.name.toLowerCase() === newTagName.toLowerCase())
    if (tagExists) {
      toast({
        title: "Validation Error",
        description: "A tag with this name already exists.",
        variant: "destructive",
      })
      return
    }

    // Create new tag
    const newTag: WorkTag = {
      name: newTagName.trim(),
      color: newTagColor,
      badge: newTagBadgeColor,
    }

    // Add to tags list
    setTags((prev) => [...prev, newTag])

    // Add to selected tags
    setSelectedTags((prev) => [...prev, newTag])

    // Reset form
    setNewTagName("")
    setNewTagColor(availableColors[0].value)
    setNewTagBadgeColor(availableColors[0].badge)
    setIsTagDialogOpen(false)

    toast({
      title: "Success",
      description: "Custom tag created and added successfully.",
    })
  }

  function handleColorSelection(color: (typeof availableColors)[0]) {
    setNewTagColor(color.value)
    setNewTagBadgeColor(color.badge)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validate form
    if (!date || !workName || !workDetail || !employeeId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Convert hours and minutes to total minutes
    const hours = Number.parseInt(workDurationHours) || 0
    const minutes = Number.parseInt(workDurationMinutes) || 0
    const totalMinutes = hours * 60 + minutes

    if (totalMinutes <= 0) {
      toast({
        title: "Validation Error",
        description: "Work duration must be greater than 0.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/work-updates/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: date.toISOString(),
          workName,
          workDetail,
          workDuration: totalMinutes,
          tags: selectedTags.map((tag) => tag.name),
          employeeId,
          companyId: companyId || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Failed to update work update")
      }

      toast({
        title: "Success",
        description: "Work update has been updated successfully.",
      })

      router.push("/work-updates")
    } catch (error) {
      console.error("Error updating work update:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update work update. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sp-red border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Work Update</h1>
        <p className="text-muted-foreground">Update the details of your work activity</p>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Work Update Details</CardTitle>
          <CardDescription>Edit the details of your daily work activity</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            {/* Work Name */}
            <div className="space-y-2">
              <Label htmlFor="workName">Work Name</Label>
              <Input
                id="workName"
                placeholder="Enter work name"
                value={workName}
                onChange={(e) => setWorkName(e.target.value)}
                required
              />
            </div>

            {/* Work Detail with Rich Text Editor */}
            <div className="space-y-2">
              <Label htmlFor="workDetail">Work Detail</Label>
              <RichTextEditor
                value={workDetail}
                onChange={setWorkDetail}
                placeholder="Enter detailed description of your work..."
                className="min-h-[200px]"
              />
            </div>

            {/* Work Duration */}
            <div className="space-y-2">
              <Label>Work Duration</Label>
              <div className="flex gap-2">
                <div className="w-1/2">
                  <Label htmlFor="workDurationHours" className="text-xs">
                    Hours
                  </Label>
                  <Input
                    id="workDurationHours"
                    type="number"
                    min="0"
                    placeholder="Hours"
                    value={workDurationHours}
                    onChange={(e) => setWorkDurationHours(e.target.value)}
                    required
                  />
                </div>
                <div className="w-1/2">
                  <Label htmlFor="workDurationMinutes" className="text-xs">
                    Minutes
                  </Label>
                  <Input
                    id="workDurationMinutes"
                    type="number"
                    min="0"
                    max="59"
                    placeholder="Minutes"
                    value={workDurationMinutes}
                    onChange={(e) => setWorkDurationMinutes(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Work Tags */}
            <div className="space-y-4">
              <Label>Work Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map((tag) => (
                  <Badge key={tag.name} className={tag.badge}>
                    <LucideTag className="mr-1 h-3 w-3" />
                    {tag.name}
                    <button
                      type="button"
                      className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring"
                      onClick={() => handleTagSelection(tag)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      Select tags
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search tag..."
                        value={tagSearchValue}
                        onValueChange={setTagSearchValue}
                      />
                      <CommandList>
                        <CommandEmpty>No tag found.</CommandEmpty>
                        <CommandGroup>
                          <ScrollArea className="h-72">
                            {tags.map((tag) => (
                              <CommandItem key={tag.name} value={tag.name} onSelect={() => handleTagSelection(tag)}>
                                <div className="flex items-center">
                                  <Badge className={tag.badge}>
                                    <LucideTag className="mr-1 h-3 w-3" />
                                    {tag.name}
                                  </Badge>
                                  {selectedTags.some((t) => t.name === tag.name) && (
                                    <span className="ml-auto flex h-4 w-4 items-center justify-center">✓</span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </ScrollArea>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Custom Tag</DialogTitle>
                      <DialogDescription>Create a new tag with custom color for your work update.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="newTagName">Tag Name</Label>
                        <Input
                          id="newTagName"
                          placeholder="Enter tag name"
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tag Color</Label>
                        <div className="grid grid-cols-6 gap-2">
                          {availableColors.map((color) => (
                            <button
                              key={color.name}
                              type="button"
                              className={cn(
                                "h-10 w-10 rounded-md border-2 flex items-center justify-center",
                                color.value,
                                newTagColor === color.value
                                  ? "border-primary ring-2 ring-primary"
                                  : "border-transparent",
                              )}
                              onClick={() => handleColorSelection(color)}
                              aria-label={`Select ${color.name} color`}
                            >
                              <Palette className="h-4 w-4 text-white" />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Preview</Label>
                        <div className="flex items-center">
                          <Badge className={newTagBadgeColor}>
                            <LucideTag className="mr-1 h-3 w-3" />
                            {newTagName || "Tag Preview"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddTag}>Add Tag</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Employee */}
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee</Label>
              <Select value={employeeId} onValueChange={setEmployeeId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Employees</SelectLabel>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} - {employee.position}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="companyId">Company (Optional)</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Companies</SelectLabel>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/work-updates")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Update Work Update"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default function EditWorkUpdatePageWrapper({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ProtectedRoute>
      <EditWorkUpdatePage params={params} />
    </ProtectedRoute>
  )
}
