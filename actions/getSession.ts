import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Gets the current session from the server using Better Auth.
 *
 * @returns The current session or null
 */
export default async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}