import prisma from "@/utils/prisma/client";

/**
 * Retrieves a user by their ID.
 *
 * @param id - User's unique identifier
 * @returns User object or null if not found
 */
export default async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user;
  } catch {
    return null;
  }
}
