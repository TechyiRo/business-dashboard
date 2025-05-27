"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, User, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { AnimatedBackground } from "@/components/animated-background"
import { useAuth } from "@/context/auth-context"

// Dev mode flag - set to false for production
const DEV_MODE = process.env.NODE_ENV === "development"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [showDevCredentials, setShowDevCredentials] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, login, isLoading, redirectError, clearRedirectError } = useAuth()

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle authentication state changes
  useEffect(() => {
    if (mounted && !isLoading) {
      if (isAuthenticated) {
        console.log("✅ User authenticated - should redirect to dashboard")
        if (!loginSuccess) {
          setLoginSuccess(true)
        }
      }
    }
  }, [mounted, isAuthenticated, isLoading, loginSuccess])

  // Handle redirect errors
  useEffect(() => {
    if (redirectError) {
      console.log("❌ Redirect error detected")
      setLoginSuccess(false)
      toast({
        title: "Redirect Issue",
        description:
          "Login was successful, but there was an issue redirecting to the dashboard. Please try the manual redirect button below.",
        variant: "destructive",
        duration: 8000,
      })
    }
  }, [redirectError, toast])

  // Show loading while checking auth
  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  // Show redirecting state if authenticated and no redirect error
  if (isAuthenticated && loginSuccess && !redirectError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 animate-pulse" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Login Successful!</h2>
            <p className="text-sm text-gray-500 mt-1">Redirecting to the main dashboard...</p>
          </div>
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"></div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    clearRedirectError()

    try {
      console.log("🔐 Submitting login form")
      const result = await login(username, password)

      if (result.success) {
        console.log("✅ Login successful")
        setLoginSuccess(true)

        toast({
          title: "Login Successful! ✅",
          description: "Redirecting to the main dashboard...",
          duration: 2000,
        })
      } else {
        console.log("❌ Login failed:", result.message)
        setError(result.message)
        toast({
          title: "Login Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("❌ Login error:", err)
      const errorMessage = "An error occurred. Please try again."
      setError(errorMessage)
      toast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetryLogin = () => {
    console.log("🔄 Retrying login after redirect failure")
    clearRedirectError()
    setLoginSuccess(false)
    setError("")
    setUsername("")
    setPassword("")
  }

  const handleManualRedirect = () => {
    console.log("🔄 Manual redirect to dashboard")
    clearRedirectError()

    // Try multiple redirect methods
    try {
      router.push("/")

      // Fallback with window.location
      setTimeout(() => {
        window.location.href = "/"
      }, 1000)
    } catch (error) {
      console.error("❌ Manual redirect failed:", error)
      window.location.href = "/"
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <AnimatedBackground />

      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md transform rounded-xl bg-white/95 p-8 shadow-xl border border-white/20 transition-all duration-500 hover:scale-[1.01] backdrop-blur-sm">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-blue-100 p-3">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome to SP IT Technologies</h1>
            <p className="mt-2 text-sm text-gray-600">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success message */}
            {loginSuccess && !redirectError && (
              <div className="bg-green-50 text-green-700 text-sm p-4 rounded-lg border border-green-200 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Login successful!</p>
                  <p className="text-xs mt-1">Redirecting to the main dashboard...</p>
                </div>
              </div>
            )}

            {/* Redirect failure message with manual redirect option */}
            {redirectError && (
              <div className="bg-orange-50 text-orange-800 text-sm p-4 rounded-lg border border-orange-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Redirect Issue</p>
                    <p className="text-xs mt-1 mb-3">
                      Login was successful, but there was an issue redirecting to the dashboard. You can try the manual
                      redirect button below or contact support.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleManualRedirect}
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs"
                      >
                        <ArrowRight className="h-3 w-3 mr-1" />
                        Go to Dashboard
                      </Button>
                      <button
                        type="button"
                        onClick={handleRetryLogin}
                        className="text-xs font-medium text-orange-700 hover:text-orange-900 underline"
                      >
                        Try logging in again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-50 text-red-700 text-sm p-4 rounded-lg border border-red-200 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="h-4 w-4" />
                Username
              </Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                disabled={isSubmitting || (loginSuccess && !redirectError)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Lock className="h-4 w-4" />
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
                  className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                  disabled={isSubmitting || (loginSuccess && !redirectError)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  disabled={isSubmitting || (loginSuccess && !redirectError)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:shadow-lg"
              disabled={isSubmitting || (loginSuccess && !redirectError)}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Logging in...
                </span>
              ) : loginSuccess && !redirectError ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Redirecting...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Dev credentials - only shown in development mode */}
          {DEV_MODE && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowDevCredentials(!showDevCredentials)}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                {showDevCredentials ? "Hide" : "Show"} Dev Credentials
              </button>

              {showDevCredentials && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Development Credentials:</p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>
                      <strong>Username:</strong> sp it
                    </p>
                    <p>
                      <strong>Password:</strong> SanRo@2019!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername("sp it")
                      setPassword("SanRo@2019!")
                    }}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Auto-fill credentials
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
