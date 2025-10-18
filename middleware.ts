import { auth } from "@/auth";

/**
 * NextAuth v5 middleware for protecting routes.
 * Redirects unauthenticated users to the sign-in page.
 */
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  
  const protectedRoutes = ["/users", "/conversations"];
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  if (!isLoggedIn && isProtectedRoute) {
    return Response.redirect(new URL("/", req.url));
  }

  return null;
});

/**
 * Matcher configuration for middleware.
 * Protects /users and /conversations routes and all their sub-routes.
 */
export const config = {
  matcher: ["/users/:path*", "/conversations/:path*"],
};