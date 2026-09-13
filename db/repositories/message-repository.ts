import { ObjectId } from "mongodb";
import type { Message, User } from "@/types/db";
import type { FullMessageType } from "@/types/message/full-message";
import {
  fromDoc,
  getMessagesCollection,
  idFilter,
  toObjectId,
} from "@/utils/db/client";
import { userRepository } from "./user-repository";

/**
 * Hydrates sender and seen user arrays onto raw message documents.
 */
async function hydrateMessages(rawDocs: any[]): Promise<FullMessageType[]> {
  if (!rawDocs.length) return [];

  const userIdsSet = new Set<string>();
  for (const doc of rawDocs) {
    if (doc.senderId) userIdsSet.add(doc.senderId.toString());
    if (Array.isArray(doc.seenIds)) {
      for (const sId of doc.seenIds) {
        if (sId) userIdsSet.add(sId.toString());
      }
    }
  }

  const users = await userRepository.findManyByIds(Array.from(userIdsSet));
  const userMap = new Map<string, User>();
  for (const user of users) {
    userMap.set(user.id, user);
  }

  return rawDocs.map((doc) => {
    const message = fromDoc<Message>(doc);
    const sender =
      userMap.get(message.senderId) ||
      ({
        id: message.senderId,
        name: null,
        email: "",
        emailVerified: false,
        image: null,
        hashedPassword: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        conversationIds: [],
        seenMessageIds: [],
      } as User);

    const seen = (message.seenIds || [])
      .map((sId) => userMap.get(sId))
      .filter((u): u is User => Boolean(u));

    return {
      ...message,
      sender,
      seen,
    };
  });
}

export const messageRepository = {
  /**
   * Finds all messages for a given conversation ordered by createdAt ascending.
   */
  async findForConversation(
    conversationId: string,
  ): Promise<FullMessageType[]> {
    const collection = getMessagesCollection();
    const filter = {
      $or: [
        { conversationId: conversationId },
        { conversationId: toObjectId(conversationId) as any },
      ],
    };
    const docs = await collection.find(filter).sort({ createdAt: 1 }).toArray();
    return hydrateMessages(docs);
  },

  /**
   * Finds a single message by ID.
   */
  async findById(messageId: string): Promise<FullMessageType | null> {
    const collection = getMessagesCollection();
    const doc = await collection.findOne({ _id: idFilter(messageId) as any });
    if (!doc) return null;
    const [hydrated] = await hydrateMessages([doc]);
    return hydrated || null;
  },

  /**
   * Creates a new message and auto-marks it seen by the sender.
   */
  async create(data: {
    body?: string | null;
    image?: string | null;
    conversationId: string;
    senderId: string;
  }): Promise<FullMessageType> {
    const collection = getMessagesCollection();
    const newId = new ObjectId();
    const now = new Date();

    const newDoc = {
      _id: newId,
      body: data.body || null,
      image: data.image || null,
      createdAt: now,
      conversationId: data.conversationId,
      senderId: data.senderId,
      seenIds: [data.senderId],
    };

    await collection.insertOne(newDoc as any);
    const [created] = await hydrateMessages([newDoc]);
    return created;
  },

  /**
   * Connects/adds a user to the seen list of a message.
   */
  async markSeen(
    messageId: string,
    userId: string,
  ): Promise<FullMessageType | null> {
    const collection = getMessagesCollection();
    await collection.updateOne(
      { _id: idFilter(messageId) as any },
      { $addToSet: { seenIds: userId } as any },
    );
    return this.findById(messageId);
  },

  /**
   * Deletes all messages sent by a specific user.
   */
  async deleteForSender(senderId: string): Promise<number> {
    const collection = getMessagesCollection();
    const result = await collection.deleteMany({
      $or: [{ senderId: senderId }, { senderId: toObjectId(senderId) as any }],
    });
    return result.deletedCount;
  },

  /**
   * Deletes all messages in a specific conversation.
   */
  async deleteForConversation(conversationId: string): Promise<number> {
    const collection = getMessagesCollection();
    const result = await collection.deleteMany({
      $or: [
        { conversationId: conversationId },
        { conversationId: toObjectId(conversationId) as any },
      ],
    });
    return result.deletedCount;
  },

  /**
   * Removes a user ID from all seenIds arrays across all messages.
   */
  async removeSeenUser(userId: string): Promise<void> {
    const collection = getMessagesCollection();
    await collection.updateMany(
      { seenIds: { $in: [userId, toObjectId(userId) as any] } },
      {
        $pull: { seenIds: { $in: [userId, toObjectId(userId) as any] } as any },
      },
    );
  },
};
