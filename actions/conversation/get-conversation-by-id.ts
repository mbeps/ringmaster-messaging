import { unstable_rethrow } from "next/navigation";
import getCurrentUser from "@/actions/user/get-current-user";
import { getLogger } from "@/lib/logger";
import prisma from "@/utils/prisma/client";

const log = getLogger(["app", "actions", "conversations"]);

/**
 * Gets a conversation and all of its data including:
 *  - Users that are part of this conversation
 *  - Messages that are part of this conversation
 * The user must be logged in to retrieve the conversation.
 *
 * @param conversationId - conversation ID for the conversation to be retrieved
 * @returns conversation object with all of its data or null
 */
export default async function getConversationById(conversationId: string) {
  log.debug("Fetching conversation by ID (id: {conversationId})", {
    conversationId,
  });

  // get the current user who is logged in (for which the conversation is being retrieved)
  const currentUser = await getCurrentUser();

  // if the current user is not logged in, return null
  if (!currentUser?.email) {
    return null;
  }

  try {
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
  } catch (error) {
    unstable_rethrow(error);
    log.error(
      "Failed to fetch conversation by ID (id: {conversationId}): {error}",
      {
        conversationId,
        error,
      },
    );
    return null;
  }
}
