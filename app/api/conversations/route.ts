import { NextResponse } from "next/server";
import { ZodError } from "zod";
import getCurrentUser from "@/actions/user/get-current-user";
import { conversationRepository } from "@/db/repositories/conversation-repository";
import { getLogger } from "@/lib/logger";
import { conversationSchema } from "@/schemas/conversation/conversation.schema";
import { pusherServer } from "@/utils/pusher/server";

const log = getLogger(["app", "api", "conversations"]);

/**
 * A post request route to create a new conversation.
 * For group chats:
 *  - A new group conversation is created in the database with the provided name and isGroup
 *  - There is not need to check if the conversation already exists as multiple group chats can have the same name and members
 *
 * For single chats:
 * - If the conversation already exists, return the existing conversation
 * - If the conversation does not exist, create a new conversation in the database with the provided userId
 * - Conversations with the same members are unique so they are checked
 *
 * @param request (Request): The incoming request with conversation data
 * @returns (NextResponse): The response to the request with the conversation data
 */
export async function POST(request: Request) {
  try {
    // current user who is logged in (creating the conversation)
    const currentUser = await getCurrentUser();
    const body = await request.json();
    // destructuring the body to get the userId, isGroup, members, and name
    const { userId, isGroup, members, name } = conversationSchema.parse(body);

    // if the current user is not logged in, return an error
    if (!currentUser?.id || !currentUser?.email) {
      log.warn("Unauthorized attempt to create conversation");
      return new NextResponse("Unauthorized", { status: 400 });
    }

    //^ GROUP CONVERSATIONS
    // if trying to create a group conversation
    if (isGroup) {
      const memberIds = [
        ...(members || []).map((member: { value: string }) => member.value),
        currentUser.id,
      ];

      const newConversation = await conversationRepository.createGroup(
        name || "",
        isGroup,
        memberIds,
      );

      // Update all connections with new conversation
      newConversation.users.forEach((user) => {
        if (user.email) {
          pusherServer.trigger(user.email, "conversation:new", newConversation);
        }
      });

      log.info(
        "Group conversation created successfully (id: {conversationId})",
        { conversationId: newConversation.id },
      );

      return NextResponse.json(newConversation);
    }

    //^ SINGLE CONVERSATIONS
    if (!userId) {
      log.warn("Conversation creation failed: missing userId");
      return new NextResponse("UserId required", { status: 400 });
    }

    // if conversation already exists, return the existing conversation
    const singleConversation =
      await conversationRepository.findSingleBetweenUsers(
        currentUser.id,
        userId,
      );

    if (singleConversation) {
      log.debug(
        "Returning existing single conversation (id: {conversationId})",
        {
          conversationId: singleConversation.id,
        },
      );
      return NextResponse.json(singleConversation);
    }

    // if conversation does not exist, create a new conversation in the database with the provided userId
    const newConversation = await conversationRepository.createSingle(
      currentUser.id,
      userId,
    );

    // Update all connections with new conversation
    newConversation.users.forEach((user) => {
      if (user.email) {
        pusherServer.trigger(user.email, "conversation:new", newConversation);
      }
    });

    log.info(
      "Single conversation created successfully (id: {conversationId})",
      { conversationId: newConversation.id },
    );

    return NextResponse.json(newConversation);
  } catch (error) {
    if (error instanceof ZodError) {
      log.warn("Conversation validation error: {message}", {
        message: error.issues[0]?.message,
      });
      return new NextResponse(error.issues[0].message, { status: 400 });
    }
    log.error("Failed to create conversation: {error}", {
      error: error instanceof Error ? error.message : String(error),
    });
    return new NextResponse("Internal Error", { status: 500 });
  }
}
