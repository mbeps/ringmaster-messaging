import { auth } from "@/auth";

/**
 * Gets the current session from the server.
 * Uses NextAuth v5's auth() function.
 *
 * @returns The current session or null
 */
export default async function getSession() {
  return await auth();
}