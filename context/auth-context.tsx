"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Cookies from "js-cookie"

type AuthContextType = {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()
  const pathname = usePathname()

  // Check authentication status on initial load
  useEffect(() => {
    const checkAuth = () => {
      try {
        const authCookie = Cookies.get("authenticated")
        const isAuth = authCookie === "true"
        setIsAuthenticated(isAuth)
        setIsLoading(false)

        // Only redirect if we're sure about the auth state
        if (!isAuth && pathname !== "/login") {
          router.replace("/login")
        } else if (isAuth && pathname === "/login") {
          router.replace("/")
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setIsAuthenticated(false)
        setIsLoading(false)
      }
    }

    // Small delay to prevent flashing
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [pathname, router])

  const login = async (username: string, password: string) => {
    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check credentials (hardcoded for this example)
      if (username === "sp it" && password === "SanRo@2019!") {
        // Set authentication cookie
        Cookies.set("authenticated", "true", { expires: 1 }) // Expires in 1 day
        setIsAuthenticated(true)
        setIsLoading(false)
        return { success: true, message: "Login successful" }
      } else {
        setIsLoading(false)
        return { success: false, message: "Invalid username or password" }
      }
    } catch (error) {
      setIsLoading(false)
      return { success: false, message: "An error occurred during login" }
    }
  }

  const logout = () => {
    // Remove authentication cookie
    Cookies.remove("authenticated")
    setIsAuthenticated(false)
    router.replace("/login")
  }

  return <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
