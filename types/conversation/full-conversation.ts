import type { Conversation, User } from "@prisma/client";
import type { FullMessageType } from "@/types/message/full-message";

/**
 * Defines a type to model conversations with some additional information.
 * It contains the standard conversation, a list of users who are part of the conversation and a list of messages in the conversation.
 */
export type FullConversationType = Conversation & {
  users: User[];
  messages: FullMessageType[];
};
