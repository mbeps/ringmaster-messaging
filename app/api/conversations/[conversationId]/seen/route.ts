import { NextResponse } from "next/server";

import getCurrentUser from "@/actions/getCurrentUser";
import { pusherServer } from "@/libs/pusher";
import prisma from "@/libs/prismadb";

interface IParams {
  conversationId?: string;
}

/**
 * A post request route for marking a message as seen.
 * Updates the seen status of the message in real time.
 * The user who sees the message is the one who is logged in and part of the conversation.
 *
 * @param request (Request)
 * @param param1 ({ params: IParams }):
 * @returns (NextResponse)
 */
export async function POST(request: Request, { params }: { params: IParams }) {
  try {
    // Get current user who is logged in (sees the message)
    const currentUser = await getCurrentUser();
    // conversation where the message is
    const { conversationId } = params;

    // If the current user is not logged in, return an error
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find existing conversation
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        messages: {
          include: {
            seen: true,
          },
        },
        users: true,
      },
    });

    // If the conversation does not exist, return an error
    if (!conversation) {
      return new NextResponse("Invalid ID", { status: 400 });
    }

    // Find last message in the conversation
    const lastMessage = conversation.messages[conversation.messages.length - 1];

    // If there is no last message, return the conversation
    if (!lastMessage) {
      return NextResponse.json(conversation);
    }

    // Update seen of last message
    const updatedMessage = await prisma.message.update({
      where: {
        id: lastMessage.id,
      },
      include: {
        sender: true,
        seen: true,
      },
      data: {
        seen: {
          connect: {
            id: currentUser.id,
          },
        },
      },
    });

    // Update all connections with new seen message in real time
    await pusherServer.trigger(currentUser.email, "conversation:update", {
      id: conversationId,
      messages: [updatedMessage],
    });

    // If user has already seen the message, no need to go further
    if (lastMessage.seenIds.indexOf(currentUser.id) !== -1) {
      return NextResponse.json(conversation);
    }

    // Update last message seen
    await pusherServer.trigger(
      conversationId!,
      "message:update",
      updatedMessage
    );

    return new NextResponse("Success");
  } catch (error) {
    console.log("ERROR_MESSAGES_SEEN: ", error);
    return new NextResponse("Error", { status: 500 });
  }
}
