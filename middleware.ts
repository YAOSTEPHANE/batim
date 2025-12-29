import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Routes publiques
    if (path === "/login") {
      if (token) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
      return NextResponse.next()
    }

    // Protection des routes
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const userRole = (token as any).role

    // Routes admin uniquement
    if (
      (path.startsWith("/users") || path.startsWith("/settings")) &&
      userRole !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Routes admin et stock manager
    if (
      (path.startsWith("/products") ||
        path.startsWith("/suppliers") ||
        path.startsWith("/purchases") ||
        path.startsWith("/reports")) &&
      userRole !== "ADMIN" &&
      userRole !== "STOCK_MANAGER"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Autoriser l'accès à /login même sans token
        if (req.nextUrl.pathname === "/login") {
          return true
        }
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/pos/:path*",
    "/suppliers/:path*",
    "/purchases/:path*",
    "/reports/:path*",
    "/users/:path*",
    "/settings/:path*",
  ],
}




