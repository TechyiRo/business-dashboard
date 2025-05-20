import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This is a simplified middleware for demo purposes
// In a real application, you would use a proper authentication system
export function middleware(request: NextRequest) {
  // Check if the user is accessing a protected route
  const isProtectedRoute = !request.nextUrl.pathname.startsWith("/login")

  // For demo purposes, we'll use a cookie to simulate authentication
  const isAuthenticated = request.cookies.has("authenticated")

  // If trying to access a protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If already authenticated and trying to access login page
  if (request.nextUrl.pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
