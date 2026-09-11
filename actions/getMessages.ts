import { getLogger } from "@/lib/logger";
import prisma from "@/libs/prismadb";

const log = getLogger(["app", "actions", "messages"]);

/**
 * Gets a list of messages for a given conversation.
 *
 * @param conversationId (string): conversation for which the messages are being retrieved
 * @returns ((Message & {seen: User[];sender: User;})[]): list of messages and users
 */
const getMessages = async (conversationId: string) => {
  log.debug("Fetching messages for conversation (id: {conversationId})", {
    conversationId,
  });
  try {
    // find the messages in the database for the given conversation
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
      },
      include: {
        sender: true,
        seen: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    log.debug(
      "Fetched {count} messages for conversation (id: {conversationId})",
      {
        conversationId,
        count: messages.length,
      },
    );

    return messages;
  } catch (error) {
    log.error(
      "Failed to fetch messages for conversation (id: {conversationId}): {error}",
      {
        conversationId,
        error,
      },
    );
    return [];
  }
};

export default getMessages;
