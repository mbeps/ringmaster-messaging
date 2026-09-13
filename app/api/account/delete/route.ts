import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { conversationRepository } from "@/db/repositories/conversation-repository";
import { messageRepository } from "@/db/repositories/message-repository";
import { userRepository } from "@/db/repositories/user-repository";
import { auth } from "@/lib/auth";
import { getLogger } from "@/lib/logger";

const log = getLogger(["app", "api", "account"]);

/**
 * DELETE handler for deleting a user account and all associated data.
 * This endpoint performs a cascade delete of:
 * - User's messages
 * - Conversations where user is the only member
 * - User's session and account records
 * - The user themselves
 */
export async function DELETE() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.email) {
      log.warn("Unauthorized attempt to delete account");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await userRepository.findByEmail(session.user.email);

    if (!user) {
      log.warn("Account not found for deletion");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete all messages sent by this user
    await messageRepository.deleteForSender(user.id);

    // Fetch conversations this user belongs to
    const userConversations = await conversationRepository.findForUser(user.id);

    // For each conversation, check if user is the only member
    for (const conversation of userConversations) {
      if (conversation.users.length <= 1) {
        await conversationRepository.delete(conversation.id);
      } else {
        await conversationRepository.removeUserFromConversation(
          conversation.id,
          user.id,
        );
      }
    }

    // Remove user from seenIds in all messages they've seen
    await messageRepository.removeSeenUser(user.id);

    // Delete the user and cascading sessions/accounts
    await userRepository.delete(user.id);

    log.info(
      "User account and associated data deleted successfully (userId: {userId})",
      { userId: user.id },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error("Error deleting account: {error}", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 },
    );
  }
}
