"use client"

import { AlertCircle } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function DatabaseError() {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Database Connection Error</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>
          There was an error connecting to the database. Please check your database connection settings and try again.
        </p>
        <div>
          <p className="text-sm font-medium">Possible solutions:</p>
          <ul className="text-sm list-disc pl-5 mt-1">
            <li>Verify your DATABASE_URL in the .env file</li>
            <li>Check if your MongoDB instance is running</li>
            <li>Ensure your IP address is whitelisted in MongoDB Atlas</li>
            <li>
              Run <code className="bg-muted px-1 py-0.5 rounded">npx prisma generate</code> to update the Prisma client
            </li>
          </ul>
        </div>
        <Button variant="outline" size="sm" className="w-fit mt-2" onClick={() => window.location.reload()}>
          Retry Connection
        </Button>
      </AlertDescription>
    </Alert>
  )
}
