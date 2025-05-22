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
      const authCookie = Cookies.get("authenticated")
      setIsAuthenticated(!!authCookie)
      setIsLoading(false)

      // If not authenticated and not on login page, redirect to login
      if (!authCookie && pathname !== "/login") {
        router.push("/login")
      }

      // If authenticated and on login page, redirect to dashboard
      if (authCookie && pathname === "/login") {
        router.push("/")
      }
    }

    checkAuth()
  }, [pathname, router])

  const login = async (username: string, password: string) => {
    setIsLoading(true)

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
  }

  const logout = () => {
    // Remove authentication cookie
    Cookies.remove("authenticated")
    setIsAuthenticated(false)
    router.push("/login")
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
