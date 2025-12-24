import { NextResponse } from "next/server";
import getCurrentUser from "@/actions/getCurrentUser";
import prisma from "@/libs/prismadb";
import { pusherServer } from "@/libs/pusher";
import { MessageSchema } from "@/schema/MessageSchema";
import { ZodError } from "zod";

/**
 * A post request route to create a new message.
 * The user to send the message must be logged in.
 * All the users are updated in real time with the new message and its status.
 *
 * @param request (Request): text, image, conversationId
 * @returns (NextResponse): the message created
 */
export async function POST(request: Request) {
  try {
    // get current user who is logged in (sends the message)
    const currentUser = await getCurrentUser();
    const body = await request.json();
    // extract the message, image, and conversation ID from the body of the request
    const { message, image, conversationId } = MessageSchema.parse(body);

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // creates a new message in the database using the message, image, and conversation ID
    const newMessage = await prisma.message.create({
      include: {
        seen: true,
        sender: true,
      },
      data: {
        body: message,
        image: image,
        conversation: {
          connect: { id: conversationId },
        },
        sender: {
          connect: { id: currentUser.id },
        },
        seen: {
          connect: {
            id: currentUser.id, // sender automatically sees the message they sent
          },
        },
      },
    });

    // find the conversation in the database with the provided conversation ID
    const updatedConversation = await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessageAt: new Date(),
        messages: {
          connect: {
            id: newMessage.id,
          },
        },
      },
      include: {
        users: true,
        messages: {
          include: {
            seen: true,
          },
        },
      },
    });

    // Update all connections with new message in real time
    await pusherServer.trigger(conversationId, "messages:new", newMessage);

    // find the last message in the conversation
    const lastMessage =
      updatedConversation.messages[updatedConversation.messages.length - 1];

    // updates the status of the last message to seen and notifies the other user in real time
    updatedConversation.users.map((user) => {
      pusherServer.trigger(user.email!, "conversation:update", {
        id: conversationId,
        messages: [lastMessage],
      });
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    if (error instanceof ZodError) {
      return new NextResponse(error.errors[0].message, { status: 400 });
    }
    return new NextResponse("Error", { status: 500 });
  }
}
