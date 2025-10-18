import { auth } from "@/auth";
import prisma from "@/libs/prismadb";

/**
 * Gets the current authenticated user with full details from database.
 * 
 * @returns User object or null if not authenticated
 */
export default async function getCurrentUser() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return null;
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      }
    });

    if (!currentUser) {
      return null;
    }

    return currentUser;
  } catch (error: any) {
    return null;
  }
}