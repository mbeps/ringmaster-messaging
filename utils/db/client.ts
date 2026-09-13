import { type Collection, type Db, MongoClient, ObjectId } from "mongodb";
import { env } from "@/config/env";
import type { Conversation, Message, User } from "@/types/db";

declare global {
  var _mongoClient: MongoClient | undefined;
}

/**
 * MongoDB document representation of User where _id is ObjectId or string.
 */
export type UserDoc = Omit<User, "id"> & { _id: ObjectId | string };

/**
 * MongoDB document representation of Conversation.
 */
export type ConversationDoc = Omit<Conversation, "id"> & {
  _id: ObjectId | string;
};

/**
 * MongoDB document representation of Message.
 */
export type MessageDoc = Omit<Message, "id"> & { _id: ObjectId | string };

/**
 * Singleton instance of MongoClient to prevent multiple connections
 * during development hot reloads.
 */
const client = globalThis._mongoClient || new MongoClient(env.DATABASE_URL);

if (process.env.NODE_ENV !== "production") {
  globalThis._mongoClient = client;
}

export const mongoClient = client;
export const db: Db = client.db();

/**
 * Helper to convert an ID to an ObjectId when valid, or keep as string.
 */
export function toObjectId(id: string | ObjectId): ObjectId | string {
  if (id instanceof ObjectId) return id;
  if (
    typeof id === "string" &&
    ObjectId.isValid(id) &&
    new ObjectId(id).toString() === id
  ) {
    return new ObjectId(id);
  }
  return id;
}

/**
 * Creates an ID filter that matches both ObjectId and string formats.
 */
export function idFilter(id: string) {
  if (ObjectId.isValid(id) && new ObjectId(id).toString() === id) {
    return { $in: [new ObjectId(id), id] };
  }
  return id;
}

/**
 * Converts a MongoDB document by mapping _id to id: string.
 */
export function fromDoc<T>(doc: any): T {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return {
    ...rest,
    id: _id ? _id.toString() : rest.id,
  } as T;
}

/**
 * Helper to get typed collections.
 */
export function getUsersCollection(targetDb: Db = db): Collection<UserDoc> {
  return targetDb.collection<UserDoc>("User");
}

export function getConversationsCollection(
  targetDb: Db = db,
): Collection<ConversationDoc> {
  return targetDb.collection<ConversationDoc>("Conversation");
}

export function getMessagesCollection(
  targetDb: Db = db,
): Collection<MessageDoc> {
  return targetDb.collection<MessageDoc>("Message");
}

export default db;
