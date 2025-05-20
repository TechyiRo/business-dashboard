"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { BarChart3, Building2, Home, Package, Settings, ShoppingBag, Users, Menu, X, Boxes, LogOut } from "lucide-react"
import Cookies from "js-cookie"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DoorAnimation } from "./door-animation"

const menuItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Employees",
    href: "/employees",
    icon: Users,
  },
  {
    name: "Products",
    href: "/products",
    icon: Package,
  },
  {
    name: "Product Inventory",
    href: "/inventory",
    icon: Boxes,
  },
  {
    name: "Companies",
    href: "/companies",
    icon: Building2,
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: ShoppingBag,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = () => {
    setIsLoggingOut(true)
    // The actual logout and redirect will happen after animation completes
  }

  const completeLogout = () => {
    // Remove authentication cookie
    Cookies.remove("authenticated")
    // Redirect to login page
    router.push("/login")
  }

  return (
    <>
      {/* Door closing animation */}
      <DoorAnimation isActive={isLoggingOut} onAnimationComplete={completeLogout} />

      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 z-40 flex items-center p-4 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-sp-red hover:bg-sp-red/10"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-center border-b px-6 py-4">
            <div className="relative h-12 w-full max-w-[180px]">
              <Image
                src="/images/sp-it-logo.png"
                alt="SP IT Technologies"
                fill
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto py-6">
            <nav className="grid items-start px-4 text-sm font-medium">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
                      isActive
                        ? "bg-gradient-to-r from-sp-red to-sp-yellow text-white"
                        : "text-gray-600 hover:bg-gray-100",
                    )}
                  >
                    <item.icon
                      className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-400 group-hover:text-sp-red")}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="border-t p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-sp-blue to-sp-red text-white">
                  SP
                </div>
                <div>
                  <p className="text-sm font-medium">SP IT Technologies</p>
                  <p className="text-xs text-gray-500">Business Management</p>
                </div>
              </div>

              {/* Logout button */}
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 border-sp-red/20 text-sp-red hover:bg-sp-red/10 hover:text-sp-red"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
