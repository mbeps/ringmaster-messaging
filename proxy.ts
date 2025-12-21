import { auth } from "@/auth";
import { PROTECTED_ROUTES, ROUTES } from "@/libs/routes";

/**
 * Next.js 16 proxy function (formerly middleware).
 * Handles request interception at the network boundary.
 * Redirects unauthenticated users to the sign-in page.
 */
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  if (!isLoggedIn && isProtectedRoute) {
    return Response.redirect(new URL(ROUTES.AUTH, req.url));
  }

  return null;
});

/**
 * Matcher configuration for proxy.
 * Protects /users and /conversations routes and all their sub-routes.
 */
export const config = {
  matcher: ["/users/:path*", "/conversations/:path*"],
};
