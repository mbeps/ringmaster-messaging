import { NextResponse } from "next/server";
import getCurrentUser from "@/actions/user/get-current-user";
import { getLogger } from "@/lib/logger";
import prisma from "@/utils/prisma/client";
import { pusherServer } from "@/utils/pusher/server";

const log = getLogger(["app", "api", "conversations"]);

interface IParams {
  conversationId?: string;
}

/**
 * A delete request route for deleting a conversation.
 * An error is returned if the current user is not logged in or if the conversation does not exist.
 *
 * @param request (Request): request for deleting a conversation
 * @param param1: conversation ID
 * @returns (NextResponse): response indicating the conversation was deleted or an error
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<IParams> },
) {
  let currentConvId: string | undefined;
  try {
    // extract the conversation ID from the params
    const { conversationId } = await params;
    currentConvId = conversationId;
    // get the current user who is logged in (trying to delete the conversation)
    const currentUser = await getCurrentUser();

    // if the current user is not logged in, return an error
    if (!currentUser?.id) {
      log.warn(
        "Unauthorized attempt to delete conversation (id: {conversationId})",
        {
          conversationId,
        },
      );
      return NextResponse.json(null);
    }

    // find the conversation in the database with the provided conversation ID
    const existingConversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        users: true,
      },
    });

    // if the conversation does not exist, return an error
    if (!existingConversation) {
      log.warn("Conversation not found for deletion (id: {conversationId})", {
        conversationId,
      });
      return new NextResponse("Invalid ID", { status: 400 });
    }

    // if the conversation exists, delete the conversation from the database
    const deletedConversation = await prisma.conversation.deleteMany({
      where: {
        id: conversationId,
        userIds: {
          hasSome: [currentUser.id],
        },
      },
    });

    // Update all connections with deleted conversation in real time
    existingConversation.users.forEach((user) => {
      if (user.email) {
        pusherServer.trigger(
          user.email,
          "conversation:remove",
          existingConversation,
        );
      }
    });

    log.info("Conversation deleted successfully (id: {conversationId})", {
      conversationId,
    });

    return NextResponse.json(deletedConversation);
  } catch (_error) {
    log.error("Failed to delete conversation (id: {conversationId}): {error}", {
      conversationId: currentConvId,
      error: _error instanceof Error ? _error.message : String(_error),
    });
    return NextResponse.json(null);
  }
}
