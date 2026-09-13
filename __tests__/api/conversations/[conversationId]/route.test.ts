import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockConversationRepository, mockPusherTrigger, mockGetCurrentUser } = vi.hoisted(() => ({
  mockConversationRepository: {
    findById: vi.fn(),
    deleteForUser: vi.fn(),
  },
  mockPusherTrigger: vi.fn(),
  mockGetCurrentUser: vi.fn(),
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

import { DELETE } from "@/app/api/conversations/[conversationId]/route";

const params = (id: string) => ({
  params: Promise.resolve({ conversationId: id }),
});

describe("DELETE /api/conversations/[conversationId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null json when unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const res = await DELETE(new Request("http://localhost/x"), params("c1"));
    expect(res.status).toBe(200);
    expect(await res.json()).toBeNull();
    expect(mockConversationRepository.findById).not.toHaveBeenCalled();
  });

  it("returns 400 when the conversation does not exist", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "me" });
    mockConversationRepository.findById.mockResolvedValue(null);
    const res = await DELETE(new Request("http://localhost/x"), params("c1"));
    expect(res.status).toBe(400);
    expect(await res.text()).toBe("Invalid ID");
  });

  it("deletes the conversation and triggers pusher", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "me" });
    const existing = {
      id: "c1",
      users: [
        { id: "me", email: "me@test.com" },
        { id: "other", email: null },
      ],
    };
    mockConversationRepository.findById.mockResolvedValue(existing);
    mockConversationRepository.deleteForUser.mockResolvedValue(true);

    const res = await DELETE(new Request("http://localhost/x"), params("c1"));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ count: 1 });
    expect(mockConversationRepository.deleteForUser).toHaveBeenCalledWith("c1", "me");
    // only users with an email get a pusher event
    expect(mockPusherTrigger).toHaveBeenCalledTimes(1);
    expect(mockPusherTrigger).toHaveBeenCalledWith(
      "me@test.com",
      "conversation:remove",
      existing
    );
  });

  it("returns null json when deleteForUser throws", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "me" });
    mockConversationRepository.findById.mockResolvedValue({
      id: "c1",
      users: [],
    });
    mockConversationRepository.deleteForUser.mockRejectedValue(
      new Error("db down")
    );
    const res = await DELETE(new Request("http://localhost/x"), params("c1"));
    expect(res.status).toBe(200);
    expect(await res.json()).toBeNull();
  });

  it("returns null json when user fetch throws", async () => {
    mockGetCurrentUser.mockRejectedValue(new Error("db down"));
    const res = await DELETE(new Request("http://localhost/x"), params("c1"));
    expect(res.status).toBe(200);
    expect(await res.json()).toBeNull();
  });
});
