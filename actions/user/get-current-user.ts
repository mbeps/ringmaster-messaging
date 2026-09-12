import { headers } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { auth } from "@/lib/auth";
import { getLogger } from "@/lib/logger";
import prisma from "@/utils/prisma/client";

const log = getLogger(["app", "actions", "user"]);

/**
 * Gets the current authenticated user with full details from database.
 *
 * @returns User object or null if not authenticated
 */
export default async function getCurrentUser() {
  log.debug("Fetching current user");
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.email) {
      return null;
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!currentUser) {
      return null;
    }

    log.debug("Current user fetched (userId: {userId})", {
      userId: currentUser.id,
    });
    return currentUser;
  } catch (error) {
    unstable_rethrow(error);
    log.error("Failed to fetch current user: {error}", { error });
    return null;
  }
}
