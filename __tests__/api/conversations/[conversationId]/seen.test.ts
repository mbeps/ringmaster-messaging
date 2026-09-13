import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockConversationRepository,
  mockMessageRepository,
  mockPusherTrigger,
  mockGetCurrentUser,
} = vi.hoisted(() => ({
  mockConversationRepository: {
    findById: vi.fn(),
  },
  mockMessageRepository: {
    markSeen: vi.fn(),
  },
  mockPusherTrigger: vi.fn(),
  mockGetCurrentUser: vi.fn(),
}));

vi.mock("@/db/repositories/conversation-repository", () => ({
  conversationRepository: mockConversationRepository,
}));

vi.mock("@/db/repositories/message-repository", () => ({
  messageRepository: mockMessageRepository,
}));

vi.mock("@/utils/pusher/server", () => ({
  pusherServer: { trigger: mockPusherTrigger },
}));

vi.mock("@/actions/user/get-current-user", () => ({
  default: (...args: unknown[]) => mockGetCurrentUser(...args),
}));

import { POST } from "@/app/api/conversations/[conversationId]/seen/route";

const call = (conversationId: string) =>
  POST(new Request("http://localhost/x"), {
    params: Promise.resolve({ conversationId }),
  });

describe("POST /api/conversations/[conversationId]/seen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const res = await call("c1");
    expect(res.status).toBe(401);
    expect(mockConversationRepository.findById).not.toHaveBeenCalled();
  });

  it("returns 401 when the user has an id but no email", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "me" });
    const res = await call("c1");
    expect(res.status).toBe(401);
    expect(mockConversationRepository.findById).not.toHaveBeenCalled();
  });

  it("returns 400 when the conversation does not exist", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "me", email: "me@test.com" });
    mockConversationRepository.findById.mockResolvedValue(null);
    const res = await call("c1");
    expect(res.status).toBe(400);
    expect(await res.text()).toBe("Invalid ID");
  });

  it("returns the conversation when there are no messages", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "me", email: "me@test.com" });
    const conversation = { id: "c1", messages: [], users: [] };
    mockConversationRepository.findById.mockResolvedValue(conversation);

    const res = await call("c1");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(conversation);
    expect(mockMessageRepository.markSeen).not.toHaveBeenCalled();
  });

  it("marks the last message seen and triggers pusher events", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "me", email: "me@test.com" });
    const lastMessage = { id: "m2", seenIds: ["other"] };
    const conversation = {
      id: "c1",
      users: [{ id: "me" }],
      messages: [{ id: "m1", seenIds: [] }, lastMessage],
    };
    mockConversationRepository.findById.mockResolvedValue(conversation);
    const updatedMessage = { ...lastMessage, seenIds: ["other", "me"] };
    mockMessageRepository.markSeen.mockResolvedValue(updatedMessage);

    const res = await call("c1");

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Success");
    expect(mockMessageRepository.markSeen).toHaveBeenCalledWith("m2", "me");
    expect(mockPusherTrigger).toHaveBeenCalledWith(
      "me@test.com",
      "conversation:update",
      { id: "c1", messages: [updatedMessage] }
    );
    expect(mockPusherTrigger).toHaveBeenCalledWith(
      "c1",
      "message:update",
      updatedMessage
    );
  });

  it("skips message:update pusher event when user already saw the message", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "me", email: "me@test.com" });
    const conversation = {
      id: "c1",
      users: [],
      messages: [{ id: "m1", seenIds: ["me"] }],
    };
    mockConversationRepository.findById.mockResolvedValue(conversation);
    mockMessageRepository.markSeen.mockResolvedValue(conversation.messages[0]);

    const res = await call("c1");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(conversation);
    expect(mockPusherTrigger).toHaveBeenCalledTimes(1); // only conversation:update
  });

  it("returns 500 when repository throws", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "me", email: "me@test.com" });
    mockConversationRepository.findById.mockRejectedValue(new Error("db down"));
    const res = await call("c1");
    expect(res.status).toBe(500);
  });
});
