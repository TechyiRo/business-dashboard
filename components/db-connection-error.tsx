"use client"

import { AlertCircle, RefreshCw } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function DbConnectionError() {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Database Authentication Error</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>
          There was an error authenticating with the database. The username or password in the connection string might
          be incorrect.
        </p>
        <div>
          <p className="text-sm font-medium">Possible solutions:</p>
          <ul className="text-sm list-disc pl-5 mt-1">
            <li>Verify the username and password in your MongoDB connection string</li>
            <li>Check if the MongoDB user has the proper permissions</li>
            <li>Ensure special characters in the password are properly URL encoded</li>
            <li>Verify network access settings in MongoDB Atlas to allow connections from Vercel</li>
          </ul>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-fit mt-2 flex items-center gap-2"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-4 w-4" />
          Retry Connection
        </Button>
      </AlertDescription>
    </Alert>
  )
}
