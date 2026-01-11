import { auth } from "@/lib/auth";
import prisma from "@/libs/prismadb";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * DELETE handler for deleting a user account and all associated data.
 * This endpoint performs a cascade delete of:
 * - User's messages
 * - Conversations where user is the only member
 * - User's session and account records (handled by Prisma cascade)
 * - The user themselves
 */
export async function DELETE() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        messages: true,
        conversations: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete all messages sent by this user
    await prisma.message.deleteMany({
      where: { senderId: user.id },
    });

    // For each conversation, check if user is the only member
    // If so, delete the conversation and its messages
    for (const conversation of user.conversations) {
      const fullConversation = await prisma.conversation.findUnique({
        where: { id: conversation.id },
        include: { users: true },
      });

      if (fullConversation && fullConversation.users.length <= 1) {
        // Delete all messages in this conversation first
        await prisma.message.deleteMany({
          where: { conversationId: conversation.id },
        });
        // Delete the conversation
        await prisma.conversation.delete({
          where: { id: conversation.id },
        });
      } else if (fullConversation) {
        // Remove user from conversation's userIds
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            userIds: {
              set: fullConversation.userIds.filter((id) => id !== user.id),
            },
          },
        });
      }
    }

    // Remove user from seenIds in all messages they've seen
    const seenMessages = await prisma.message.findMany({
      where: {
        seenIds: { has: user.id },
      },
    });

    for (const message of seenMessages) {
      await prisma.message.update({
        where: { id: message.id },
        data: {
          seenIds: {
            set: message.seenIds.filter((id) => id !== user.id),
          },
        },
      });
    }

    // Delete the user (sessions and accounts will cascade delete via Prisma)
    await prisma.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
