import { ObjectId } from "mongodb";
import type { FullConversationType } from "@/types/conversation/full-conversation";
import type { Conversation, User } from "@/types/db";
import type { FullMessageType } from "@/types/message/full-message";
import {
  fromDoc,
  getConversationsCollection,
  idFilter,
  toObjectId,
} from "@/utils/db/client";
import { messageRepository } from "./message-repository";
import { userRepository } from "./user-repository";

export const conversationRepository = {
  /**
   * Finds all conversations for a user, sorted by lastMessageAt descending.
   * Hydrates users and messages for each conversation.
   */
  async findForUser(userId: string): Promise<FullConversationType[]> {
    const collection = getConversationsCollection();
    const filter = {
      $or: [{ userIds: userId }, { userIds: toObjectId(userId) as any }],
    };

    const docs = await collection
      .find(filter)
      .sort({ lastMessageAt: -1 })
      .toArray();

    if (!docs.length) return [];

    // Collect all user IDs across conversations
    const allUserIds = new Set<string>();
    for (const doc of docs) {
      if (Array.isArray(doc.userIds)) {
        for (const uId of doc.userIds) {
          if (uId) allUserIds.add(uId.toString());
        }
      }
    }

    const users = await userRepository.findManyByIds(Array.from(allUserIds));
    const userMap = new Map<string, User>();
    for (const user of users) {
      userMap.set(user.id, user);
    }

    const conversations: FullConversationType[] = [];
    for (const doc of docs) {
      const conv = fromDoc<Conversation>(doc);
      const convUsers = (conv.userIds || [])
        .map((uId) => userMap.get(uId))
        .filter((u): u is User => Boolean(u));

      const messages = await messageRepository.findForConversation(conv.id);

      conversations.push({
        ...conv,
        users: convUsers,
        messages,
      });
    }

    return conversations;
  },

  /**
   * Finds a single conversation by its ID.
   */
  async findById(
    conversationId: string,
    options: { includeMessages?: boolean } = {},
  ): Promise<
    (Conversation & { users: User[]; messages?: FullMessageType[] }) | null
  > {
    const collection = getConversationsCollection();
    const doc = await collection.findOne({
      _id: idFilter(conversationId) as any,
    });
    if (!doc) return null;

    const conv = fromDoc<Conversation>(doc);
    const users = await userRepository.findManyByIds(conv.userIds || []);

    const result: Conversation & {
      users: User[];
      messages?: FullMessageType[];
    } = {
      ...conv,
      users,
    };

    if (options.includeMessages) {
      result.messages = await messageRepository.findForConversation(conv.id);
    }

    return result;
  },

  /**
   * Finds an existing direct (1-on-1) conversation between two users.
   */
  async findSingleBetweenUsers(
    user1Id: string,
    user2Id: string,
  ): Promise<(Conversation & { users: User[] }) | null> {
    const collection = getConversationsCollection();
    const u1 = user1Id.toString();
    const u2 = user2Id.toString();
    const u1Obj = toObjectId(user1Id);
    const u2Obj = toObjectId(user2Id);

    const doc = await collection.findOne({
      $or: [
        { userIds: [u1, u2] },
        { userIds: [u2, u1] },
        { userIds: [u1Obj, u2Obj] as any },
        { userIds: [u2Obj, u1Obj] as any },
      ],
      isGroup: { $ne: true },
    });

    if (!doc) return null;
    return this.findById(doc._id.toString());
  },

  /**
   * Creates a group conversation with the given members.
   */
  async createGroup(
    name: string,
    isGroup: boolean,
    memberIds: string[],
  ): Promise<Conversation & { users: User[] }> {
    const collection = getConversationsCollection();
    const newId = new ObjectId();
    const now = new Date();

    const newDoc = {
      _id: newId,
      name,
      isGroup,
      userIds: memberIds,
      messagesIds: [],
      createdAt: now,
      lastMessageAt: now,
    };

    await collection.insertOne(newDoc as any);
    const users = await userRepository.findManyByIds(memberIds);

    return {
      ...fromDoc<Conversation>(newDoc),
      users,
    };
  },

  /**
   * Creates a new direct conversation between two users.
   */
  async createSingle(
    user1Id: string,
    user2Id: string,
  ): Promise<Conversation & { users: User[] }> {
    const collection = getConversationsCollection();
    const newId = new ObjectId();
    const now = new Date();
    const memberIds = [user1Id, user2Id];

    const newDoc = {
      _id: newId,
      name: null,
      isGroup: false,
      userIds: memberIds,
      messagesIds: [],
      createdAt: now,
      lastMessageAt: now,
    };

    await collection.insertOne(newDoc as any);
    const users = await userRepository.findManyByIds(memberIds);

    return {
      ...fromDoc<Conversation>(newDoc),
      users,
    };
  },

  /**
   * Updates lastMessageAt and links a new message to the conversation.
   */
  async updateLastMessage(
    conversationId: string,
    messageId: string,
  ): Promise<Conversation & { users: User[]; messages: FullMessageType[] }> {
    const collection = getConversationsCollection();
    const now = new Date();

    await collection.updateOne(
      { _id: idFilter(conversationId) as any },
      {
        $set: { lastMessageAt: now },
        $addToSet: { messagesIds: messageId } as any,
      },
    );

    const updated = await this.findById(conversationId, {
      includeMessages: true,
    });
    return updated as Conversation & {
      users: User[];
      messages: FullMessageType[];
    };
  },

  /**
   * Deletes a conversation for a user if they are a member.
   */
  async deleteForUser(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    const collection = getConversationsCollection();
    const filter = {
      _id: idFilter(conversationId) as any,
      $or: [{ userIds: userId }, { userIds: toObjectId(userId) as any }],
    };

    const result = await collection.deleteOne(filter);
    if (result.deletedCount > 0) {
      await messageRepository.deleteForConversation(conversationId);
      return true;
    }
    return false;
  },

  /**
   * Direct delete of a conversation by ID.
   */
  async delete(conversationId: string): Promise<boolean> {
    const collection = getConversationsCollection();
    const result = await collection.deleteOne({
      _id: idFilter(conversationId) as any,
    });
    if (result.deletedCount > 0) {
      await messageRepository.deleteForConversation(conversationId);
      return true;
    }
    return false;
  },

  /**
   * Removes a user ID from a conversation's userIds array.
   */
  async removeUserFromConversation(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const collection = getConversationsCollection();
    await collection.updateOne(
      { _id: idFilter(conversationId) as any },
      {
        $pull: {
          userIds: { $in: [userId, toObjectId(userId) as any] } as any,
        },
      },
    );
  },
};
