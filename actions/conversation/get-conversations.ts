import getCurrentUser from "@/actions/user/get-current-user";
import { conversationRepository } from "@/db/repositories/conversation-repository";
import { getLogger } from "@/lib/logger";

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
 * @returns Returns a list of conversations
 */
export default async function getConversations() {
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
    const conversations = await conversationRepository.findForUser(
      currentUser.id,
    );

    log.debug("Fetched {count} conversations", {
      count: conversations.length,
    });

    return conversations;
  } catch (error) {
    log.error("Failed to fetch conversations: {error}", { error });
    return [];
  }
}
