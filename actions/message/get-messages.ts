import { getLogger } from "@/lib/logger";
import prisma from "@/utils/prisma/client";

const log = getLogger(["app", "actions", "messages"]);

/**
 * Gets a list of messages for a given conversation.
 *
 * @param conversationId - conversation ID for which the messages are being retrieved
 * @returns list of messages and users
 */
export default async function getMessages(conversationId: string) {
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
}
