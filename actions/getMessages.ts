import prisma from "@/libs/prismadb";

/**
 * Gets a list of messages for a given conversation.
 *
 * @param conversationId (string): conversation for which the messages are being retrieved
 * @returns ((Message & {seen: User[];sender: User;})[]): list of messages and users
 */
const getMessages = async (conversationId: string) => {
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

    return messages;
  } catch (error: any) {
    return [];
  }
};

export default getMessages;
