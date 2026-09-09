import { describe, expect, it } from "vitest";
import type { FullConversationType, FullMessageType } from "@/types";
import type { Conversation, Message, User } from "@prisma/client";

const user: User = {
  id: "user-1",
  name: "Alice",
  email: "alice@test.com",
  emailVerified: null,
  image: null,
  hashedPassword: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  conversationIds: [],
  messageIds: [],
  seenMessageIds: [],
} as unknown as User;

describe("types", () => {
  it("FullMessageType extends Message with sender and seen users", () => {
    const message: FullMessageType = {
      id: "msg-1",
      body: "hi",
      image: null,
      createdAt: new Date(),
      conversationId: "c1",
      senderId: "user-1",
      seenIds: [],
      sender: user,
      seen: [user],
    } as unknown as FullMessageType;

    expect(message.sender.id).toBe("user-1");
    expect(message.seen).toHaveLength(1);
  });

  it("FullConversationType extends Conversation with users and messages", () => {
    const message = { id: "msg-1", seen: [user], sender: user } as unknown as FullMessageType;
    const conversation: FullConversationType = {
      id: "c1",
      name: null,
      isGroup: false,
      createdAt: new Date(),
      lastMessageAt: new Date(),
      userIds: [],
      messageIds: [],
      users: [user],
      messages: [message],
    } as unknown as FullConversationType;

    expect(conversation.users[0].email).toBe("alice@test.com");
    expect(conversation.messages[0].sender.email).toBe("alice@test.com");
  });
});
