import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockUserRepository,
  mockConversationRepository,
  mockMessageRepository,
} = vi.hoisted(() => ({
  mockUserRepository: {
    findByEmail: vi.fn(),
    delete: vi.fn(),
  },
  mockConversationRepository: {
    findForUser: vi.fn(),
    delete: vi.fn(),
    removeUserFromConversation: vi.fn(),
  },
  mockMessageRepository: {
    deleteForSender: vi.fn(),
    removeSeenUser: vi.fn(),
  },
}));

vi.mock("@/db/repositories/user-repository", () => ({
  userRepository: mockUserRepository,
}));

vi.mock("@/db/repositories/conversation-repository", () => ({
  conversationRepository: mockConversationRepository,
}));

vi.mock("@/db/repositories/message-repository", () => ({
  messageRepository: mockMessageRepository,
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

import { DELETE } from "@/app/api/account/delete/route";
import { auth } from "@/lib/auth";

const mockedGetSession = auth.api.getSession as ReturnType<typeof vi.fn>;

const otherUserId = "other-user";

describe("DELETE /api/account/delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when there is no session", async () => {
    mockedGetSession.mockResolvedValue(null);
    const res = await DELETE();
    expect(res.status).toBe(401);
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
  });

  it("returns 404 when the user does not exist", async () => {
    mockedGetSession.mockResolvedValue({
      user: { email: "me@test.com" },
    });
    mockUserRepository.findByEmail.mockResolvedValue(null);
    const res = await DELETE();
    expect(res.status).toBe(404);
  });

  it("deletes solo conversations and the user", async () => {
    mockedGetSession.mockResolvedValue({
      user: { email: "me@test.com" },
    });
    mockUserRepository.findByEmail.mockResolvedValue({
      id: "me",
      email: "me@test.com",
    });
    // solo conversation where user is only member
    mockConversationRepository.findForUser.mockResolvedValue([
      {
        id: "conv-1",
        users: [{ id: "me" }],
        userIds: ["me"],
      },
    ]);

    const res = await DELETE();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(mockMessageRepository.deleteForSender).toHaveBeenCalledWith("me");
    expect(mockConversationRepository.delete).toHaveBeenCalledWith("conv-1");
    expect(mockMessageRepository.removeSeenUser).toHaveBeenCalledWith("me");
    expect(mockUserRepository.delete).toHaveBeenCalledWith("me");
  });

  it("removes the user from shared conversations instead of deleting them", async () => {
    mockedGetSession.mockResolvedValue({
      user: { email: "me@test.com" },
    });
    mockUserRepository.findByEmail.mockResolvedValue({
      id: "me",
      email: "me@test.com",
    });
    mockConversationRepository.findForUser.mockResolvedValue([
      {
        id: "conv-2",
        users: [{ id: "me" }, { id: otherUserId }],
        userIds: ["me", otherUserId],
      },
    ]);

    const res = await DELETE();

    expect(res.status).toBe(200);
    expect(mockConversationRepository.delete).not.toHaveBeenCalled();
    expect(
      mockConversationRepository.removeUserFromConversation
    ).toHaveBeenCalledWith("conv-2", "me");
    expect(mockUserRepository.delete).toHaveBeenCalledWith("me");
  });

  it("removes the user from seenIds of seen messages", async () => {
    mockedGetSession.mockResolvedValue({
      user: { email: "me@test.com" },
    });
    mockUserRepository.findByEmail.mockResolvedValue({
      id: "me",
      email: "me@test.com",
    });
    mockConversationRepository.findForUser.mockResolvedValue([]);

    const res = await DELETE();

    expect(res.status).toBe(200);
    expect(mockMessageRepository.removeSeenUser).toHaveBeenCalledWith("me");
  });

  it("handles mixed solo and shared conversations", async () => {
    mockedGetSession.mockResolvedValue({
      user: { email: "me@test.com" },
    });
    mockUserRepository.findByEmail.mockResolvedValue({
      id: "me",
      email: "me@test.com",
    });
    mockConversationRepository.findForUser.mockResolvedValue([
      { id: "conv-solo", users: [{ id: "me" }], userIds: ["me"] },
      {
        id: "conv-shared",
        users: [{ id: "me" }, { id: otherUserId }],
        userIds: ["me", otherUserId],
      },
    ]);

    const res = await DELETE();

    expect(res.status).toBe(200);
    expect(mockConversationRepository.delete).toHaveBeenCalledWith("conv-solo");
    expect(
      mockConversationRepository.removeUserFromConversation
    ).toHaveBeenCalledWith("conv-shared", "me");
    expect(mockUserRepository.delete).toHaveBeenCalledWith("me");
  });

  it("returns 500 when repository throws", async () => {
    mockedGetSession.mockResolvedValue({
      user: { email: "me@test.com" },
    });
    mockUserRepository.findByEmail.mockRejectedValue(new Error("db down"));
    const res = await DELETE();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Failed to delete account" });
  });
});
