import { NextResponse } from "next/server"

export async function GET() {
  // Don't expose the actual DATABASE_URL value for security reasons
  // Just check if it exists and return a status
  const hasDbUrl = !!process.env.DATABASE_URL

  return NextResponse.json({
    environment: process.env.NODE_ENV || "unknown",
    databaseUrlConfigured: hasDbUrl,
    vercelEnvironment: process.env.VERCEL_ENV || "not-vercel",
    timestamp: new Date().toISOString(),
  })
}
