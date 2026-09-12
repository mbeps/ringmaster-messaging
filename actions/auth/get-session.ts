import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getLogger } from "@/lib/logger";

const log = getLogger(["app", "actions", "auth"]);

/**
 * Gets the current session from the server using Better Auth.
 *
 * @returns The current session or null
 */
export default async function getSession() {
  log.debug("Fetching auth session");
  return await auth.api.getSession({
    headers: await headers(),
  });
}
