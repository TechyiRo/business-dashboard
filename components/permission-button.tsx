"use client"

import type React from "react"

import { usePermissions } from "@/hooks/use-permissions"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Shield } from "lucide-react"

interface PermissionButtonProps {
  module: string
  action: "create" | "edit" | "delete" | "download"
  children: React.ReactNode
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  onClick?: () => void
  disabled?: boolean
  asChild?: boolean
}

export function PermissionButton({
  module,
  action,
  children,
  className,
  variant = "default",
  size = "default",
  onClick,
  disabled = false,
  asChild = false,
  ...props
}: PermissionButtonProps) {
  const permissions = usePermissions(module)

  const hasPermission = () => {
    switch (action) {
      case "create":
        return permissions.canCreate
      case "edit":
        return permissions.canEdit
      case "delete":
        return permissions.canDelete
      case "download":
        return permissions.canDownload
      default:
        return false
    }
  }

  if (!hasPermission()) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-block">
              <Button
                variant="outline"
                size={size}
                className={`opacity-50 cursor-not-allowed ${className}`}
                disabled={true}
                {...props}
              >
                <Shield className="mr-2 h-4 w-4" />
                {typeof children === "string" ? children : "Restricted"}
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              You don't have permission to {action} in {module}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={onClick}
      disabled={disabled}
      asChild={asChild}
      {...props}
    >
      {children}
    </Button>
  )
}
