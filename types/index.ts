import { Conversation, Message, User } from "@prisma/client";

/**
 * Defines a type to model messages with some additional information.
 * It contains th standard message, the sender of the message and a list of users who have seen the message.
 */
export type FullMessageType = Message & {
  sender: User;
  seen: User[];
};

/**
 * Defines a type to model conversations with some additional information.
 * It contains the standard conversation, a list of users who are part of the conversation and a list of messages in the conversation.
 */
export type FullConversationType = Conversation & {
  users: User[];
  messages: FullMessageType[];
};
