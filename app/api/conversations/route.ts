import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";

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
    const { userId, isGroup, members, name } = body;

    // if the current user is not logged in, return an error
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 400 });
    }

    // if trying to create a group conversation, but there are no members (or enough members) or no name,
    // return an error
    if (isGroup && (!members || members.length < 2 || !name)) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    //^ GROUP CONVERSATIONS
    // if trying to create a group conversation
    if (isGroup) {
      // create a new conversation in the database with the provided name and isGroup
      const newConversation = await prisma.conversation.create({
        data: {
          name,
          isGroup,
          users: {
            // automatically adds members to the group
            connect: [
              ...members.map((member: { value: string }) => ({
                id: member.value,
              })),
              {
                id: currentUser.id,
              },
            ],
          },
        },
        // for the user IDs, it gets the user data (not just ID)
        include: {
          users: true,
        },
      });

      // Update all connections with new conversation
      newConversation.users.forEach((user) => {
        if (user.email) {
          pusherServer.trigger(user.email, "conversation:new", newConversation);
        }
      });

      return NextResponse.json(newConversation);
    }

    //^ SINGLE CONVERSATIONS
    // if conversation already exists, return the existing conversation
    const existingConversations = await prisma.conversation.findMany({
      where: {
        OR: [
          {
            userIds: {
              equals: [currentUser.id, userId],
            },
          },
          {
            userIds: {
              equals: [userId, currentUser.id],
            },
          },
        ],
      },
    });

    const singleConversation = existingConversations[0];

    if (singleConversation) {
      return NextResponse.json(singleConversation);
    }

    // if conversation does not exist, create a new conversation in the database with the provided userId
    const newConversation = await prisma.conversation.create({
      data: {
        users: {
          connect: [
            {
              id: currentUser.id,
            },
            {
              id: userId,
            },
          ],
        },
      },
      include: {
        users: true,
      },
    });

    // Update all connections with new conversation
    newConversation.users.map((user) => {
      if (user.email) {
        pusherServer.trigger(user.email, "conversation:new", newConversation);
      }
    });

    return NextResponse.json(newConversation);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
