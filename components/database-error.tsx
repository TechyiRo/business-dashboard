"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface DatabaseErrorProps {
  title: string
  description: string
  retryAction?: () => void
}

export function DatabaseError({ title, description, retryAction }: DatabaseErrorProps) {
  return (
    <Card className="mx-auto max-w-md border-red-200 shadow-md">
      <CardHeader className="bg-red-50 text-red-700">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-6 w-6" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription className="text-red-600">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4 text-sm">
          <p>This could be due to one of the following reasons:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Database connection issue</li>
            <li>Missing or invalid data in the database</li>
            <li>Prisma schema mismatch with database structure</li>
            <li>Server-side error during data processing</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t bg-gray-50 p-4">
        {retryAction && (
          <Button
            onClick={retryAction}
            className="bg-gradient-to-r from-sp-blue to-sp-red hover:from-sp-blue/90 hover:to-sp-red/90"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
