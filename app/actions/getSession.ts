import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Get the current session from the server.
 * Uses `getServerSession` from `next-auth` to get the session from the previously defined `authOptions`.
 * This makes it easier to get the session from the server.
 *
 * @returns (Promise<Session | null>): The current session from the server.
 */
export default async function getSession() {
  return await getServerSession(authOptions);
}
