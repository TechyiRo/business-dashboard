"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

export function ClearCookies() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Only clear cookies on initial load for testing purposes
    if (typeof window !== "undefined" && window.sessionStorage.getItem("initial-load") !== "true") {
      // Clear the auth cookie
      document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      window.sessionStorage.setItem("initial-load", "true")

      // If we're not already on the login page, redirect there
      if (pathname !== "/login") {
        router.push("/login")
      }
    }
  }, [pathname, router])

  return null
}
