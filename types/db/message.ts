/**
 * Core Message entity representing a message sent within a conversation.
 */
export interface Message {
  id: string;
  body: string | null;
  image: string | null;
  createdAt: Date;
  seenIds: string[];
  conversationId: string;
  senderId: string;
}
