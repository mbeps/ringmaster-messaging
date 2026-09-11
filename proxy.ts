import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getLogger } from "@/lib/logger";
import { ROUTES } from "@/libs/routes";

const log = getLogger(["app", "middleware"]);

/**
 * Protected routes that require authentication.
 * Kept in middleware proxy to separate route definitions from access control.
 */
export const PROTECTED_ROUTES = [
  ROUTES.USERS.path,
  ROUTES.CONVERSATIONS.path,
  ROUTES.PROFILE.path,
] as const;

/**
 * Middleware (formerly proxy.ts) to handle protected routes.
 * Checks for Better Auth session token in cookies.
 * Note: Does not verify token validity vs DB (Edge runtime limitation), just presence.
 * Real validation happens in Layout/Page via auth.api.getSession.
 */
export default function middleware(req: NextRequest) {
  // Check for session token (Adjust cookie name if needed, e.g. __Secure- for prod)
  // Better Auth default is "better-auth.session_token"
  const sessionToken =
    req.cookies.get("better-auth.session_token") ||
    req.cookies.get("__Secure-better-auth.session_token");
  const isLoggedIn = !!sessionToken;

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) =>
      req.nextUrl.pathname === route ||
      req.nextUrl.pathname.startsWith(`${route}/`),
  );

  log.debug("Checking route access for '{path}'", {
    path: req.nextUrl.pathname,
  });

  if (!isLoggedIn && isProtectedRoute) {
    log.info(
      "Redirecting unauthenticated request for '{path}' to '{redirect}'",
      {
        path: req.nextUrl.pathname,
        redirect: ROUTES.AUTH.path,
      },
    );
    return NextResponse.redirect(new URL(ROUTES.AUTH.path, req.url));
  }

  log.debug("Access granted for '{path}'", {
    path: req.nextUrl.pathname,
  });
  return NextResponse.next();
}

/**
 * Matcher configuration.
 * Protects /users and /conversations routes and all their sub-routes.
 */
export const config = {
  matcher: ["/users/:path*", "/conversations/:path*"],
};
