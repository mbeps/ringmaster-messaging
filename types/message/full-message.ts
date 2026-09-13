import type { Message, User } from "@/types/db";

/**
 * Defines a type to model messages with some additional information.
 * It contains the standard message, the sender of the message and a list of users who have seen the message.
 */
export type FullMessageType = Message & {
  sender: User;
  seen: User[];
};
