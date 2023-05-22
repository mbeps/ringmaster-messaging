import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

/**
 * Gets a conversations and all of its data including:
 *  - Users that are part of this conversation
 *  - Messages that are part of this conversation
 * The user must be logged in to retrieve the conversation.
 *
 * @param conversationId (string): conversation ID for the conversation to be retrieved
 * @returns conversation (object): conversation object with all of its data
 */
const getConversationById = async (conversationId: string) => {
  try {
    // get the current user who is logged in (for which the conversation is being retrieved)
    const currentUser = await getCurrentUser();

    // if the current user is not logged in, return an error
    if (!currentUser?.email) {
      return null;
    }

    // find the conversation in the database with the provided conversation ID
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        users: true,
      },
    });

    return conversation;
  } catch (error: any) {
    console.log("SERVER_ERROR: ", error);
    return null;
  }
};

export default getConversationById;
