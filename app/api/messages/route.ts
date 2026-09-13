import { NextResponse } from "next/server";
import { ZodError } from "zod";
import getCurrentUser from "@/actions/user/get-current-user";
import { conversationRepository } from "@/db/repositories/conversation-repository";
import { messageRepository } from "@/db/repositories/message-repository";
import { getLogger } from "@/lib/logger";
import { messageSchema } from "@/schemas/message/message.schema";
import { pusherServer } from "@/utils/pusher/server";

const log = getLogger(["app", "api", "messages"]);

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
    const { message, image, conversationId } = messageSchema.parse(body);

    if (!currentUser?.id || !currentUser?.email) {
      log.warn("Unauthorized attempt to send message");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // creates a new message in the database using the message, image, and conversation ID
    const newMessage = await messageRepository.create({
      body: message,
      image: image,
      conversationId: conversationId,
      senderId: currentUser.id,
    });

    // updates the conversation lastMessageAt and messagesIds list
    const updatedConversation = await conversationRepository.updateLastMessage(
      conversationId,
      newMessage.id,
    );

    // Update all connections with new message in real time
    await pusherServer.trigger(conversationId, "messages:new", newMessage);

    // find the last message in the conversation
    const messages = updatedConversation.messages || [];
    const lastMessage = messages[messages.length - 1] || newMessage;

    // updates the status of the last message to seen and notifies the other user in real time
    updatedConversation.users.forEach((user) => {
      if (user.email) {
        pusherServer.trigger(user.email, "conversation:update", {
          id: conversationId,
          messages: [lastMessage],
        });
      }
    });

    log.info(
      "Message sent successfully (id: {messageId}, conversationId: {conversationId})",
      {
        messageId: newMessage.id,
        conversationId,
      },
    );

    return NextResponse.json(newMessage);
  } catch (error) {
    if (error instanceof ZodError) {
      log.warn("Message validation failed: {message}", {
        message: error.issues[0]?.message,
      });
      return new NextResponse(error.issues[0].message, { status: 400 });
    }
    log.error("Failed to send message: {error}", {
      error: error instanceof Error ? error.message : String(error),
    });
    return new NextResponse("Error", { status: 500 });
  }
}
