"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import Cookies from "js-cookie"

type AuthContextType = {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  isLoading: boolean
  redirectError: boolean
  clearRedirectError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Constants for better reliability
const AUTH_COOKIE_NAME = "sp_it_authenticated"
const AUTH_CHECK_DELAY = 150
const REDIRECT_TIMEOUT = 3000

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [redirectError, setRedirectError] = useState<boolean>(false)
  const [authCheckComplete, setAuthCheckComplete] = useState<boolean>(false)
  const redirectAttemptRef = useRef<{ timestamp: number; targetPath: string } | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Clear redirect error
  const clearRedirectError = useCallback(() => {
    setRedirectError(false)
    redirectAttemptRef.current = null
  }, [])

  // Enhanced cookie management
  const setAuthCookie = useCallback(() => {
    try {
      Cookies.set(AUTH_COOKIE_NAME, "true", {
        expires: 1,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      })
      console.log("✅ Auth cookie set successfully")
      return true
    } catch (error) {
      console.error("❌ Failed to set auth cookie:", error)
      return false
    }
  }, [])

  const getAuthCookie = useCallback(() => {
    try {
      const cookie = Cookies.get(AUTH_COOKIE_NAME)
      console.log("🔍 Auth cookie value:", cookie)
      return cookie === "true"
    } catch (error) {
      console.error("❌ Failed to read auth cookie:", error)
      return false
    }
  }, [])

  const removeAuthCookie = useCallback(() => {
    try {
      Cookies.remove(AUTH_COOKIE_NAME, { path: "/" })
      console.log("🗑️ Auth cookie removed")
    } catch (error) {
      console.error("❌ Failed to remove auth cookie:", error)
    }
  }, [])

  // Enhanced redirect function with better error detection
  const performRedirect = useCallback(
    (path: string, reason: string) => {
      console.log(`🔄 Attempting redirect to ${path} - Reason: ${reason}`)

      // Record the redirect attempt
      redirectAttemptRef.current = {
        timestamp: Date.now(),
        targetPath: path,
      }

      try {
        // Try multiple redirect methods for better compatibility
        if (path === "/") {
          // For dashboard redirect, try window.location as fallback
          router.push("/")

          // Fallback using window.location after a short delay
          setTimeout(() => {
            if (redirectAttemptRef.current && pathname === "/login") {
              console.log("🔄 Router.push failed, trying window.location")
              window.location.href = "/"
            }
          }, 1000)
        } else {
          router.replace(path)
        }
      } catch (error) {
        console.error("❌ Router redirect failed:", error)
        // Try window.location as last resort
        try {
          window.location.href = path
        } catch (locationError) {
          console.error("❌ Window.location redirect also failed:", locationError)
          setRedirectError(true)
        }
      }
    },
    [router, pathname],
  )

  // Monitor for failed redirects
  useEffect(() => {
    if (redirectAttemptRef.current) {
      const { timestamp, targetPath } = redirectAttemptRef.current
      const timeSinceRedirect = Date.now() - timestamp

      // Check if we're still on the wrong page after the timeout
      if (timeSinceRedirect > REDIRECT_TIMEOUT) {
        if (targetPath === "/" && pathname === "/login") {
          console.error("❌ Redirect to dashboard failed - still on login page after timeout")
          setRedirectError(true)
          redirectAttemptRef.current = null
        } else if (targetPath === "/login" && pathname !== "/login") {
          console.error("❌ Redirect to login failed - not on login page after timeout")
          redirectAttemptRef.current = null
        }
      }
    }
  }, [pathname])

  // Set up redirect timeout monitoring
  useEffect(() => {
    if (redirectAttemptRef.current) {
      const timer = setTimeout(() => {
        if (redirectAttemptRef.current) {
          const { targetPath } = redirectAttemptRef.current

          if (targetPath === "/" && pathname === "/login") {
            console.error("❌ Redirect timeout: Still on login page after successful login")
            setRedirectError(true)
          }

          redirectAttemptRef.current = null
        }
      }, REDIRECT_TIMEOUT)

      return () => clearTimeout(timer)
    }
  }, [redirectAttemptRef.current, pathname])

  // Initial authentication check
  useEffect(() => {
    const checkInitialAuth = () => {
      console.log("🔍 Performing initial auth check...")

      try {
        const isAuth = getAuthCookie()
        console.log("📊 Initial auth state:", { isAuth, pathname })

        setIsAuthenticated(isAuth)
        setIsLoading(false)
        setAuthCheckComplete(true)

        // Handle redirects based on auth state and current path
        if (isAuth && pathname === "/login") {
          console.log("✅ User authenticated but on login page - redirecting to dashboard")
          performRedirect("/", "User already authenticated")
        } else if (!isAuth && pathname !== "/login") {
          console.log("❌ User not authenticated - redirecting to login")
          performRedirect("/login", "User not authenticated")
        } else {
          console.log("✅ User on correct page for auth state")
        }
      } catch (error) {
        console.error("❌ Initial auth check failed:", error)
        setIsAuthenticated(false)
        setIsLoading(false)
        setAuthCheckComplete(true)
      }
    }

    // Delay to prevent hydration issues
    const timer = setTimeout(checkInitialAuth, AUTH_CHECK_DELAY)
    return () => clearTimeout(timer)
  }, [pathname, getAuthCookie, performRedirect])

  // Login function with enhanced error handling
  const login = async (username: string, password: string) => {
    console.log("🔐 Starting login process...")
    setIsLoading(true)
    setRedirectError(false)
    clearRedirectError()

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Validate credentials
      if (username === "sp it" && password === "SanRo@2019!") {
        console.log("✅ Credentials validated successfully")

        // Set authentication cookie
        const cookieSet = setAuthCookie()
        if (!cookieSet) {
          throw new Error("Failed to set authentication cookie")
        }

        // Update state
        setIsAuthenticated(true)
        setIsLoading(false)

        console.log("✅ Login successful - preparing redirect")

        // Perform redirect with delay for better UX
        setTimeout(() => {
          performRedirect("/", "Successful login")
        }, 800)

        return { success: true, message: "Login successful" }
      } else {
        console.log("❌ Invalid credentials provided")
        setIsLoading(false)
        return { success: false, message: "Invalid username or password" }
      }
    } catch (error) {
      console.error("❌ Login process failed:", error)
      setIsLoading(false)
      return {
        success: false,
        message: error instanceof Error ? error.message : "An error occurred during login",
      }
    }
  }

  // Logout function
  const logout = useCallback(() => {
    console.log("🚪 Logging out user...")
    removeAuthCookie()
    setIsAuthenticated(false)
    setRedirectError(false)
    clearRedirectError()
    performRedirect("/login", "User logout")
  }, [removeAuthCookie, performRedirect, clearRedirectError])

  // Debug logging for state changes
  useEffect(() => {
    if (authCheckComplete) {
      console.log("📊 Auth state update:", {
        isAuthenticated,
        isLoading,
        pathname,
        redirectError,
        cookieValue: getAuthCookie(),
        redirectAttempt: redirectAttemptRef.current,
      })
    }
  }, [isAuthenticated, isLoading, pathname, redirectError, authCheckComplete, getAuthCookie])

  const contextValue = {
    isAuthenticated,
    login,
    logout,
    isLoading,
    redirectError,
    clearRedirectError,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
