import prisma from "@/app/libs/prismadb";
import getSession from "./getSession";
import { User } from "@prisma/client";

/**
 * Gets the user information for the current user who is logged in.
 * If the user is not logged in, returns null.
 *
 * @returns (Promise<User | null>): The user information for the current user who is logged in.
 */
const getCurrentUser = async () => {
  try {
    // gets the user session for the current user who is logged in
    const session = await getSession();

    // if the user is not logged in, return null
    if (!session?.user?.email) {
      return null;
    }

    // find the user in the database with the data from the session
    const currentUser: User | null = await prisma.user.findUnique({
      where: {
        email: session.user.email as string,
      },
    });

    // if the user is not found, return null
    if (!currentUser) {
      return null;
    }

    return currentUser;
  } catch (error: any) {
    // if there is an error, return null
    return null;
  }
};

export default getCurrentUser;
