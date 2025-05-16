import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSession } from "@/lib/auth"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Define middleware execution order
const middlewareOrder = ["storePath", "handleAuth", "handleRateLimit", "handleCors"]

export async function middleware(request: NextRequest) {
  let response = NextResponse.next()

  // Skip API routes and static files
  if (
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/_static") ||
    request.nextUrl.pathname.includes(".")
  ) {
    return response
  }

  // Add CSRF protection for non-GET requests
  // if (request.method !== "GET" && !request.nextUrl.pathname.startsWith("/api/auth")) {
  //   const csrfToken = request.headers.get("X-CSRF-Token")
  //   const storedToken = request.cookies.get("csrf-token")?.value

  //   if (!csrfToken || !storedToken || csrfToken !== storedToken) {
  //     return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 })
  //   }
  // }

  // For GET requests, set a CSRF token cookie if it doesn't exist
  if (request.method === "GET" && !request.cookies.has("csrf-token")) {
    const token = generateCsrfToken()
    response.cookies.set("csrf-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })
  }

  // Execute middleware in order
  for (const middleware of middlewareOrder) {
    switch (middleware) {
      case "storePath":
        response = await storePathMiddleware(request, response)
        break
      case "handleAuth":
        response = await handleAuthMiddleware(request, response)
        break
      case "handleRateLimit":
        response = await handleRateLimitMiddleware(request, response)
        break
      case "handleCors":
        response = await handleCorsMiddleware(request, response)
        break
    }
  }

  // Add security headers to the response
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  // Add Content-Security-Policy in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'",
    )
  }

  return response
}

// Store current path for redirect after login
async function storePathMiddleware(request: NextRequest, response: NextResponse) {
  // Set the current path in a cookie
  response.cookies.set("path", request.nextUrl.pathname, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  })

  return response
}

async function handleAuthMiddleware(request: NextRequest, response: NextResponse) {
  response = NextResponse.next()

  const protectedPaths = ["/dashboard", "/admin", "/superadmin", "/profile", "/parishioner"]
  const pathname = request.nextUrl.pathname
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path))

  const sessionToken = request.cookies.get("userId")?.value
  const sessionRole = request.cookies.get("role")?.value

  const isLoginPath = pathname.startsWith("/login")

  // Redirect logged-in users away from login
  if (isLoginPath && sessionToken) {
    const redirectUrl = getRoleHomePage(sessionRole)
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  if (!isProtected) return response

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 🧠 Role-based Access Control (RBAC)
  const roleBasedAccess: Record<string, RegExp[]> = {
    SUPERADMIN: [/^\/superadmin/, /^\/admin/, /^\/profile/],
    ADMIN: [/^\/admin/, /^\/admin\/profile/],
    PARISHIONER: [/^\/dashboard/, /^\/profile/, /^\/parishioner/],
  }

  const allowedRoutes = roleBasedAccess[sessionRole || ""] || []

  const isAllowed = allowedRoutes.some((regex) => regex.test(pathname))

  if (!isAllowed) {
    return NextResponse.redirect(new URL(getRoleHomePage(sessionRole), request.url))
  }

  return response
}

function getRoleHomePage(role?: string) {
  switch (role) {
    case "SUPERADMIN":
      return "/superadmin/dashboard"
    case "ADMIN":
      return "/admin/dashboard"
    case "PARISHIONER":
      return "/dashboard"
    default:
      return "/"
  }
}
// Handle authentication checks
// async function handleAuthMiddleware(request: NextRequest, response: NextResponse) {
//   const protectedPaths = ["/dashboard", "/admin", "/superadmin", "/profile"]
//   const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))
//   const isLoginPath = request.nextUrl.pathname.startsWith("/login")
//   const sessionToken = request.cookies.get("userId")?.value
//   const sessionRole = request.cookies.get("role")?.value

//   if (isLoginPath && sessionToken) {
    
//     let redirectUrl: string; 

//     switch (sessionRole) {
//       case "SUPERADMIN":
//         redirectUrl = "/superadmin/dashboard";
//         break;
//       case "ADMIN":
//         redirectUrl = "/admin/dashboard";
//         break;
//       case "PARISHIONER":
//         redirectUrl = "/dashboard"; // or maybe "/parishioner/home" if you want to customize it further
//         break;
//       default:
//         redirectUrl = "/"; // fallback route
//     }
//     return NextResponse.redirect(new URL(redirectUrl, request.url));
//   }

  
//   if (!isProtectedPath) return response

  

//   if (!sessionToken) {
//     const url = new URL("/login", request.url)
//     url.searchParams.set("redirectTo", request.nextUrl.pathname)
//     return NextResponse.redirect(url)
//   }

//   return response
// }

// Handle rate limiting
async function handleRateLimitMiddleware(request: NextRequest, response: NextResponse) {
  // In a real implementation, you would check rate limits here
  // This is a placeholder for demonstration

  return response
}

// Handle CORS
async function handleCorsMiddleware(request: NextRequest, response: NextResponse) {
  // Add CORS headers for API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  }

  return response
}

// Generate CSRF token using Web Crypto API (available in Edge Runtime)
function generateCsrfToken(): string {
  // Create a random array of 16 bytes (128 bits)
  const array = new Uint8Array(16)

  // Fill with random values using the Web Crypto API
  crypto.getRandomValues(array)

  // Convert to hex string
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

