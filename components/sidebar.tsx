"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Building2, Home, Package, Settings, ShoppingBag, Users } from "lucide-react"

import { cn } from "@/lib/utils"

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
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-background md:block md:w-64">
      <div className="flex h-full flex-col">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Business Manager</h2>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
