"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  X,
  Upload,
  Calendar,
  Hash,
  User,
  Building,
  MapPin,
  Phone,
  AlertTriangle,
  FileText,
  Camera,
  Paperclip,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface TaskAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TaskAssignmentModal({ isOpen, onClose }: TaskAssignmentModalProps) {
  const [formData, setFormData] = useState({
    date: "",
    taskId: "",
    name: "",
    companyName: "",
    address: "",
    contactNumber: "",
    priority: "basic",
    issueDescription: "",
  })
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [additionalFile, setAdditionalFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split("T")[0]
      setFormData((prev) => ({
        ...prev,
        date: today,
        taskId: `2019-${Math.floor(Math.random() * 100) + 1}`, // Temporary random ID
      }))
      setSubmitStatus("idle")
      setErrorMessage("")
    }
  }, [isOpen])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (type: "screenshot" | "additional", file: File | null) => {
    if (type === "screenshot") {
      setScreenshot(file)
    } else {
      setAdditionalFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const submitFormData = new FormData()

      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitFormData.append(key, value)
      })

      // Add files
      if (screenshot) {
        submitFormData.append("screenshot", screenshot)
      }
      if (additionalFile) {
        submitFormData.append("additionalFile", additionalFile)
      }

      const response = await fetch("/api/task-assignment", {
        method: "POST",
        body: submitFormData,
      })

      if (response.ok) {
        setSubmitStatus("success")
        setTimeout(() => {
          onClose()
          // Reset form
          setFormData({
            date: "",
            taskId: "",
            name: "",
            companyName: "",
            address: "",
            contactNumber: "",
            priority: "basic",
            issueDescription: "",
          })
          setScreenshot(null)
          setAdditionalFile(null)
        }, 2000)
      } else {
        const errorData = await response.json()
        setErrorMessage(errorData.message || "Failed to submit task")
        setSubmitStatus("error")
      }
    } catch (error) {
      setErrorMessage("Network error. Please try again.")
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Task Assignment</h2>
                <p className="text-sm text-gray-600">Submit your technical support request</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {submitStatus === "success" && (
          <div className="m-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-full" />
              </div>
              <span className="font-medium">Task submitted successfully!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Your request has been sent to our technical team. You will receive a confirmation email shortly.
            </p>
          </div>
        )}

        {/* Error Message */}
        {submitStatus === "error" && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Submission failed</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date and Task ID Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-blue-600" />
                Date
              </Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                required
                className="bg-gray-50"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Hash className="h-4 w-4 text-blue-600" />
                Task ID
              </Label>
              <Input value={formData.taskId} className="bg-gray-50 font-mono" readOnly />
            </div>
          </div>

          {/* Name and Company Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4 text-blue-600" />
                Name *
              </Label>
              <Input
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Building className="h-4 w-4 text-blue-600" />
                Company Name *
              </Label>
              <Input
                placeholder="Enter company name"
                value={formData.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-blue-600" />
              Address *
            </Label>
            <Textarea
              placeholder="Enter complete address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              required
              rows={3}
            />
          </div>

          {/* Contact Number */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Phone className="h-4 w-4 text-blue-600" />
              Contact Number *
            </Label>
            <Input
              type="tel"
              placeholder="Enter contact number"
              value={formData.contactNumber}
              onChange={(e) => handleInputChange("contactNumber", e.target.value)}
              required
            />
          </div>

          {/* Priority */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              Choose Priority *
            </Label>
            <RadioGroup
              value={formData.priority}
              onValueChange={(value) => handleInputChange("priority", value)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="urgent" id="urgent" />
                <Label htmlFor="urgent" className="flex items-center gap-2 cursor-pointer flex-1">
                  <span className="text-lg">🟥</span>
                  <span className="font-medium">Urgent</span>
                  <span className="text-sm text-gray-600">- Critical issue requiring immediate attention</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="basic" id="basic" />
                <Label htmlFor="basic" className="flex items-center gap-2 cursor-pointer flex-1">
                  <span className="text-lg">🟨</span>
                  <span className="font-medium">Basic</span>
                  <span className="text-sm text-gray-600">- Standard priority issue</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="easy" id="easy" />
                <Label htmlFor="easy" className="flex items-center gap-2 cursor-pointer flex-1">
                  <span className="text-lg">🟩</span>
                  <span className="font-medium">Easy</span>
                  <span className="text-sm text-gray-600">- Low priority or general inquiry</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Issue Description */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-blue-600" />
              Describe Issue *
            </Label>
            <Textarea
              placeholder="Please describe the issue in detail..."
              value={formData.issueDescription}
              onChange={(e) => handleInputChange("issueDescription", e.target.value)}
              required
              rows={4}
            />
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Camera className="h-4 w-4 text-blue-600" />
                Attach Screenshot
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange("screenshot", e.target.files?.[0] || null)}
                  className="hidden"
                  id="screenshot-upload"
                />
                <Label htmlFor="screenshot-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">{screenshot ? screenshot.name : "Click to upload screenshot"}</p>
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Paperclip className="h-4 w-4 text-blue-600" />
                Additional File
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  onChange={(e) => handleFileChange("additional", e.target.files?.[0] || null)}
                  className="hidden"
                  id="additional-upload"
                />
                <Label htmlFor="additional-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {additionalFile ? additionalFile.name : "Click to upload file"}
                  </p>
                </Label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Submitting...
                </span>
              ) : (
                "Submit Task"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
