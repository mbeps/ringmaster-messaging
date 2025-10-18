import prisma from "@/libs/prismadb";

/**
 * Retrieves a user by their email address.
 * 
 * @param email - User's email address
 * @returns User object or null if not found
 */
export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    return user;
  } catch {
    return null;
  }
};

/**
 * Retrieves a user by their ID.
 * 
 * @param id - User's unique identifier
 * @returns User object or null if not found
 */
export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    return user;
  } catch {
    return null;
  }
};