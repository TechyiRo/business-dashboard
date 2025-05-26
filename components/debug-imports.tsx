"use client"

import { Sidebar } from "@/components/sidebar"
import { DoorAnimation } from "@/components/door-animation"
import { useAuth } from "@/context/auth-context"

export function DebugImports() {
  console.log("Sidebar component:", Sidebar)
  console.log("DoorAnimation component:", DoorAnimation)
  console.log("useAuth hook:", useAuth)

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3 className="font-bold">Import Debug Info:</h3>
      <ul className="mt-2 space-y-1">
        <li>Sidebar: {typeof Sidebar}</li>
        <li>DoorAnimation: {typeof DoorAnimation}</li>
        <li>useAuth: {typeof useAuth}</li>
      </ul>
    </div>
  )
}
