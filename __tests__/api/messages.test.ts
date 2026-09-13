import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockMessageRepository,
  mockConversationRepository,
  mockPusherTrigger,
  mockGetCurrentUser,
} = vi.hoisted(() => ({
  mockMessageRepository: {
    create: vi.fn(),
  },
  mockConversationRepository: {
    updateLastMessage: vi.fn(),
  },
  mockPusherTrigger: vi.fn(),
  mockGetCurrentUser: vi.fn(),
}));

vi.mock("@/db/repositories/message-repository", () => ({
  messageRepository: mockMessageRepository,
}));

vi.mock("@/db/repositories/conversation-repository", () => ({
  conversationRepository: mockConversationRepository,
}));

vi.mock("@/utils/pusher/server", () => ({
  pusherServer: { trigger: mockPusherTrigger },
}));

vi.mock("@/actions/user/get-current-user", () => ({
  default: (...args: unknown[]) => mockGetCurrentUser(...args),
}));

import { POST } from "@/app/api/messages/route";

const currentUser = { id: "me", email: "me@test.com" };

const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/messages", {
      method: "POST",
      body: JSON.stringify(body),
    })
  );

describe("POST /api/messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const res = await post({ message: "hi", conversationId: "c1" });
    expect(res.status).toBe(401);
    expect(mockMessageRepository.create).not.toHaveBeenCalled();
  });

  it("returns 400 when body has neither message nor image", async () => {
    mockGetCurrentUser.mockResolvedValue(currentUser);
    const res = await post({ conversationId: "c1" });
    expect(res.status).toBe(400);
    expect(await res.text()).toContain("Message or image is required");
  });

  it("creates a message, updates the conversation and triggers pusher", async () => {
    mockGetCurrentUser.mockResolvedValue(currentUser);
    const newMessage = { id: "m-new", body: "hi" };
    mockMessageRepository.create.mockResolvedValue(newMessage);
    const updatedConversation = {
      id: "c1",
      users: [
        { id: "me", email: "me@test.com" },
        { id: "other", email: "other@test.com" },
      ],
      messages: [{ id: "m-old" }, newMessage],
    };
    mockConversationRepository.updateLastMessage.mockResolvedValue(updatedConversation);

    const res = await post({ message: "hi", conversationId: "c1" });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(newMessage);
    expect(mockMessageRepository.create).toHaveBeenCalledWith({
      body: "hi",
      image: undefined,
      conversationId: "c1",
      senderId: "me",
    });
    expect(mockConversationRepository.updateLastMessage).toHaveBeenCalledWith(
      "c1",
      "m-new"
    );
    expect(mockPusherTrigger).toHaveBeenCalledWith(
      "c1",
      "messages:new",
      newMessage
    );
    // conversation:update fired for each user with the last message
    expect(mockPusherTrigger).toHaveBeenCalledWith("me@test.com", "conversation:update", {
      id: "c1",
      messages: [newMessage],
    });
    expect(mockPusherTrigger).toHaveBeenCalledWith(
      "other@test.com",
      "conversation:update",
      { id: "c1", messages: [newMessage] }
    );
  });

  it("sends an image-only message", async () => {
    mockGetCurrentUser.mockResolvedValue(currentUser);
    const newMessage = { id: "m-img", image: "https://img/x.png" };
    mockMessageRepository.create.mockResolvedValue(newMessage);
    mockConversationRepository.updateLastMessage.mockResolvedValue({
      id: "c1",
      users: [],
      messages: [newMessage],
    });

    const res = await post({ image: "https://img/x.png", conversationId: "c1" });

    expect(res.status).toBe(200);
    expect(mockMessageRepository.create).toHaveBeenCalledWith({
      body: undefined,
      image: "https://img/x.png",
      conversationId: "c1",
      senderId: "me",
    });
    expect(mockPusherTrigger).toHaveBeenCalledWith(
      "c1",
      "messages:new",
      newMessage
    );
  });

  it("returns 400 when conversationId is missing", async () => {
    mockGetCurrentUser.mockResolvedValue(currentUser);
    const res = await post({ message: "hi" });
    expect(res.status).toBe(400);
    expect(await res.text()).toBe("Invalid input: expected string, received undefined");
    expect(mockMessageRepository.create).not.toHaveBeenCalled();
  });

  it("returns 400 when body is null", async () => {
    mockGetCurrentUser.mockResolvedValue(currentUser);
    const res = await post(null);
    expect(res.status).toBe(400);
    expect(mockMessageRepository.create).not.toHaveBeenCalled();
  });

  it("returns 500 when repository throws", async () => {
    mockGetCurrentUser.mockResolvedValue(currentUser);
    mockMessageRepository.create.mockRejectedValue(new Error("db down"));
    const res = await post({ message: "hi", conversationId: "c1" });
    expect(res.status).toBe(500);
  });
});
