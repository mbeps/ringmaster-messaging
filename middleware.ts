/**
 * Contains code that runs before a request is completed.
 * Can be used to modify the response by rewriting, redirecting, modifying the request or response headers, or responding directly.
 * Runs before cached content and routes are matched.
 */

import { withAuth } from "next-auth/middleware";

/**
 * Defines the middleware that will be used for the pages that are defined in the config.
 * The root page is the sign in page.
 */
export default withAuth({
  pages: {
    signIn: "/",
  },
});

/**
 * Protects the pages that are defined in the config.
 * If the user is not authenticated, and they try to access a protected page, they will be redirected to the sign in page.
 */
export const config = {
  matcher: ["/users/:path*", "/conversations/:path*"],
};
