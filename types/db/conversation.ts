/**
 * Core Conversation entity representing a 1-on-1 or group chat.
 */
export interface Conversation {
  id: string;
  createdAt: Date;
  lastMessageAt: Date;
  name: string | null;
  isGroup: boolean | null;
  messagesIds: string[];
  userIds: string[];
}
