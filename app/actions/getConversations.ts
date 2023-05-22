import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

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
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return [];
  }

  try {
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

    return conversations;
  } catch (error: any) {
    return [];
  }
};

export default getConversations;
