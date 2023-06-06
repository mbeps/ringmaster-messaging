import prisma from "@/app/libs/prismadb";
import getSession from "./getSession";

/**
 * Gets a list of all the users that exist in the platform.
 * This excludes the current user who is logged in as the current user cannot message themselves.
 * User must be logged in to get the list of users.
 *
 * @returns (User[]) - Returns a list of users that exist in the platform
 */
const getUsers = async () => {
  // gets the user session for the current user who is logged in
  const session = await getSession();

  // if the user is not logged in, return an empty array
  if (!session?.user?.email) {
    return [];
  }

  try {
    // find the users in the database excluding the current user
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        NOT: {
          email: session.user.email,
        },
      },
    });

    return users;
  } catch (error: any) {
    return [];
  }
};

export default getUsers;
