"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, User, Wifi, Shield, Server, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth-context"
import { AnimatedITBackground } from "@/components/animated-it-background"
import { TaskAssignmentModal } from "@/components/task-assignment-modal"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [showTaskModal, setShowTaskModal] = useState(false)

  const { isAuthenticated, isLoading, login } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-slate-600 font-medium">Initializing secure connection...</p>
        </div>
      </div>
    )
  }

  // Don't show login form if authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-pulse flex justify-center mb-4">
            <Shield className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800">Secure connection established</h2>
          <p className="text-slate-600 mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const success = await login(username, password)

      if (success) {
        router.push("/")
      } else {
        setError("Invalid credentials. Access denied.")
      }
    } catch (err) {
      setError("Connection failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <AnimatedITBackground />

      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 p-8 relative overflow-hidden">
            {/* Subtle tech pattern overlay */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-4 right-4">
                <Server className="h-8 w-8 text-blue-600" />
              </div>
              <div className="absolute bottom-4 left-4">
                <Wifi className="h-6 w-6 text-blue-600" />
              </div>
              <div className="absolute top-1/2 right-8 transform -translate-y-1/2">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8 relative z-10">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-4 shadow-lg">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">SP IT Technologies</h1>
              <p className="text-slate-600 text-sm">Secure Network Access Portal</p>
              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-500">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Network Status: Online</span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <User className="h-4 w-4 text-blue-600" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Lock className="h-4 w-4 text-blue-600" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 pr-10 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Secure Login
                  </span>
                )}
              </Button>
            </form>

            {/* Task Assignment Section */}
            <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200/50 relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <ClipboardList className="h-5 w-5 text-orange-600" />
                <p className="text-sm font-medium text-orange-800">Need Technical Support?</p>
              </div>
              <p className="text-xs text-orange-700 mb-3">
                Submit a task assignment request without login. Our technical team will assist you promptly.
              </p>
              <Button
                type="button"
                onClick={() => setShowTaskModal(true)}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-medium py-2 transition-all duration-200"
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                Assign Task
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-slate-500">Protected by enterprise-grade security protocols</p>
          </div>
        </div>
      </div>

      {/* Task Assignment Modal */}
      <TaskAssignmentModal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} />
    </div>
  )
}
