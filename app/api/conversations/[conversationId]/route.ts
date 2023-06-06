import getCurrentUser from "@/actions/getCurrentUser";
import { NextResponse } from "next/server";

import prisma from "@/libs/prismadb";
import { pusherServer } from "@/libs/pusher";

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
  request: Request,
  { params }: { params: IParams }
) {
  try {
    // extract the conversation ID from the params
    const { conversationId } = params;
    // get the current user who is logged in (trying to delete the conversation)
    const currentUser = await getCurrentUser();

    // if the current user is not logged in, return an error
    if (!currentUser?.id) {
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
          existingConversation
        );
      }
    });

    return NextResponse.json(deletedConversation);
  } catch (error) {
    console.log("ERROR CONVERSATION DELETE: ", error);
    return NextResponse.json(null);
  }
}
