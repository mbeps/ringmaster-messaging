import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PROTECTED_ROUTES, ROUTES } from "@/libs/routes";

/**
 * Middleware (formerly proxy.ts) to handle protected routes.
 * Checks for Better Auth session token in cookies.
 * Note: Does not verify token validity vs DB (Edge runtime limitation), just presence.
 * Real validation happens in Layout/Page via auth.api.getSession.
 */
export default function middleware(req: NextRequest) {
  // Check for session token (Adjust cookie name if needed, e.g. __Secure- for prod)
  // Better Auth default is "better-auth.session_token"
  const sessionToken = req.cookies.get("better-auth.session_token") || req.cookies.get("__Secure-better-auth.session_token");
  const isLoggedIn = !!sessionToken;
  
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL(ROUTES.AUTH, req.url));
  }

  return NextResponse.next();
}

/**
 * Matcher configuration.
 * Protects /users and /conversations routes and all their sub-routes.
 */
export const config = {
  matcher: ["/users/:path*", "/conversations/:path*"],
};
