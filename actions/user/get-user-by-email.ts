import prisma from "@/utils/prisma/client";

/**
 * Retrieves a user by their email address.
 *
 * @param email - User's email address
 * @returns User object or null if not found
 */
export default async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  } catch {
    return null;
  }
}
