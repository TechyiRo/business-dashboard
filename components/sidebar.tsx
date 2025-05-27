"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Building2,
  Home,
  Package,
  Settings,
  ShoppingBag,
  Users,
  Menu,
  X,
  Boxes,
  LogOut,
  FileText,
  Shield,
  Mail,
} from "lucide-react"
import { useAuth } from "@/context/auth-context"

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
    name: "Work Updates",
    href: "/work-updates",
    icon: FileText,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    name: "Credentials",
    href: "/credentials",
    icon: Shield,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    submenu: [
      {
        name: "General",
        href: "/settings",
        icon: Settings,
      },
      {
        name: "Email Settings",
        href: "/settings/email",
        icon: Mail,
      },
    ],
  },
  {
    name: "Logout",
    href: "#logout",
    icon: LogOut,
    className: "text-red-600 hover:bg-red-50",
    iconClassName: "text-red-600",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { logout } = useAuth()

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
    // The actual logout will happen after animation completes
  }

  const completeLogout = () => {
    logout()
  }

  console.log("🔍 Sidebar component rendering...")

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
          className="text-red-600 hover:bg-red-50"
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
          "fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0 border-r border-gray-200",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex items-center justify-center border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-600 to-red-600">
            <div className="relative h-12 w-full max-w-[180px]">
              <Image
                src="/images/sp-it-logo.png"
                alt="SP IT Technologies"
                fill
                style={{ objectFit: "contain" }}
                priority
                className="filter brightness-0 invert"
              />
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 overflow-auto py-6">
            <nav className="grid items-start px-4 text-sm font-medium">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
                const isLogout = item.href === "#logout"

                return (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all mb-1",
                        isActive && !isLogout
                          ? "bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100 hover:text-blue-600",
                        item.className,
                      )}
                      onClick={(e) => {
                        if (isLogout) {
                          e.preventDefault()
                          handleLogout()
                        }
                      }}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5",
                          isActive && !isLogout ? "text-white" : "text-gray-500 group-hover:text-blue-600",
                          item.iconClassName,
                        )}
                      />
                      {item.name}
                    </Link>

                    {/* Submenu for Settings */}
                    {item.submenu && (pathname?.startsWith("/settings") || isActive) && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.submenu.map((subItem) => {
                          const isSubActive = pathname === subItem.href
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={cn(
                                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all",
                                isSubActive
                                  ? "bg-blue-50 text-blue-600 font-medium"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-600",
                              )}
                            >
                              <subItem.icon className="h-4 w-4" />
                              {subItem.name}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>

          {/* Footer Section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-blue-50 to-red-50 px-3 py-2 border border-gray-200">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-red-600 text-white text-sm font-bold">
                SP
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">SP IT Technologies</p>
                <p className="text-xs text-gray-500">Business Management</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
