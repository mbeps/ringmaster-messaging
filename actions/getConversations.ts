import { getLogger } from "@/lib/logger";
import prisma from "@/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

const log = getLogger(["app", "actions", "conversations"]);

/**
 * Gets a list of conversations for the current user.
 * This includes:
 *  - Users that are part of this conversation
 *  - Messages that are part of this conversation
 * The list of messages is sorted in descending order by the last message sent.
 *  This is so that the most recent message is at the top of the list.
 * The user must be logged in to retrieve the list of conversations.
 *
 * @returns {Promise<Conversation[]>} - Returns a list of conversations
 */
const getConversations = async () => {
  log.debug("Fetching conversations for current user");
  // gets the current user who is logged in for which the conversations are being retrieved
  const currentUser = await getCurrentUser();

  // if the current user is not logged in, return an empty array
  if (!currentUser?.id) {
    log.debug("No authenticated user, returning empty conversations list");
    return [];
  }

  try {
    // find the conversations in the database for the current user
    const conversations = await prisma.conversation.findMany({
      orderBy: {
        lastMessageAt: "desc",
      },
      where: {
        userIds: {
          has: currentUser.id,
        },
      },
      include: {
        users: true,
        messages: {
          include: {
            sender: true,
            seen: true, // list of people who saw message
          },
        },
      },
    });

    log.debug("Fetched {count} conversations", {
      count: conversations.length,
    });

    return conversations;
  } catch (error) {
    log.error("Failed to fetch conversations: {error}", { error });
    return [];
  }
};

export default getConversations;
