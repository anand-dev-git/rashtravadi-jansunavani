import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

// Define protected routes (now handled by client-side AuthGuard)
const protectedRoutes: string[] = [];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Get token from cookies
    const token = request.cookies.get("token")?.value;

    if (!token) {
      // Redirect to login page
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Add user info to headers for use in API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId.toString());
    requestHeaders.set("x-username", payload.username);
    requestHeaders.set("x-role", payload.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
