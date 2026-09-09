import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPrisma } from "../../mocks/prisma";

// account delete route needs more model methods than the shared mock provides
Object.assign(mockPrisma.user, { delete: vi.fn() });
Object.assign(mockPrisma.message, {
  deleteMany: vi.fn(),
  update: vi.fn(),
});
Object.assign(mockPrisma.conversation, {
  delete: vi.fn(),
  update: vi.fn(),
});

vi.mock("@/libs/prismadb", () => ({ __esModule: true, default: mockPrisma }));

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
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns 404 when the user does not exist", async () => {
    mockedGetSession.mockResolvedValue({
      user: { email: "me@test.com" },
    });
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const res = await DELETE();
    expect(res.status).toBe(404);
  });

  it("deletes solo conversations and the user", async () => {
    mockedGetSession.mockResolvedValue({
      user: { email: "me@test.com" },
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "me",
      email: "me@test.com",
      messages: [],
      conversations: [{ id: "conv-1" }],
    });
    // solo conversation
    mockPrisma.conversation.findUnique.mockResolvedValue({
      id: "conv-1",
      users: [{ id: "me" }],
      userIds: ["me"],
    });
    mockPrisma.message.findMany.mockResolvedValue([]); // no seen messages

    const res = await DELETE();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(mockPrisma.message.deleteMany).toHaveBeenCalledWith({
      where: { senderId: "me" },
    });
    expect(mockPrisma.message.deleteMany).toHaveBeenCalledWith({
      where: { conversationId: "conv-1" },
    });
    expect(mockPrisma.conversation.delete).toHaveBeenCalledWith({
      where: { id: "conv-1" },
    });
    expect(mockPrisma.user.delete).toHaveBeenCalledWith({
      where: { id: "me" },
    });
  });

  it("removes the user from shared conversations instead of deleting them", async () => {
    mockedGetSession.mockResolvedValue({
      user: { email: "me@test.com" },
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "me",
      email: "me@test.com",
      messages: [],
      conversations: [{ id: "conv-2" }],
    });
    mockPrisma.conversation.findUnique.mockResolvedValue({
      id: "conv-2",
      users: [{ id: "me" }, { id: otherUserId }],
      userIds: ["me", otherUserId],
    });
    mockPrisma.message.findMany.mockResolvedValue([]);

    const res = await DELETE();

    expect(res.status).toBe(200);
    expect(mockPrisma.conversation.delete).not.toHaveBeenCalled();
    expect(mockPrisma.conversation.update).toHaveBeenCalledWith({
      where: { id: "conv-2" },
      data: { userIds: { set: [otherUserId] } },
    });
    expect(mockPrisma.user.delete).toHaveBeenCalled();
  });

  it("removes the user from seenIds of seen messages", async () => {
    mockedGetSession.mockResolvedValue({
      user: { email: "me@test.com" },
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "me",
      email: "me@test.com",
      messages: [],
      conversations: [],
    });
    mockPrisma.message.findMany.mockResolvedValue([
      { id: "msg-1", seenIds: ["me", otherUserId] },
    ]);

    const res = await DELETE();

    expect(res.status).toBe(200);
    expect(mockPrisma.message.update).toHaveBeenCalledWith({
      where: { id: "msg-1" },
      data: { seenIds: { set: [otherUserId] } },
    });
  });

  it("handles mixed solo and shared conversations", async () => {
    mockedGetSession.mockResolvedValue({
      user: { email: "me@test.com" },
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "me",
      email: "me@test.com",
      messages: [],
      conversations: [{ id: "conv-solo" }, { id: "conv-shared" }],
    });
    let call = 0;
    mockPrisma.conversation.findUnique.mockImplementation(() => {
      call += 1;
      return call === 1
        ? Promise.resolve({ id: "conv-solo", users: [{ id: "me" }], userIds: ["me"] })
        : Promise.resolve({
            id: "conv-shared",
            users: [{ id: "me" }, { id: otherUserId }],
            userIds: ["me", otherUserId],
          });
    });
    mockPrisma.message.findMany.mockResolvedValue([]);

    const res = await DELETE();

    expect(res.status).toBe(200);
    expect(mockPrisma.conversation.delete).toHaveBeenCalledTimes(1);
    expect(mockPrisma.conversation.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.delete).toHaveBeenCalled();
  });

  it("skips conversations that disappear mid-deletion", async () => {
    mockedGetSession.mockResolvedValue({
      user: { email: "me@test.com" },
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "me",
      email: "me@test.com",
      messages: [],
      conversations: [{ id: "conv-gone" }],
    });
    mockPrisma.conversation.findUnique.mockResolvedValue(null);
    mockPrisma.message.findMany.mockResolvedValue([]);

    const res = await DELETE();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(mockPrisma.conversation.delete).not.toHaveBeenCalled();
    expect(mockPrisma.user.delete).toHaveBeenCalled();
  });

  it("cleans up multiple seen messages", async () => {
    mockedGetSession.mockResolvedValue({
      user: { email: "me@test.com" },
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "me",
      email: "me@test.com",
      messages: [],
      conversations: [],
    });
    mockPrisma.message.findMany.mockResolvedValue([
      { id: "msg-1", seenIds: ["me"] },
      { id: "msg-2", seenIds: [otherUserId, "me"] },
    ]);

    const res = await DELETE();

    expect(res.status).toBe(200);
    expect(mockPrisma.message.update).toHaveBeenCalledWith({
      where: { id: "msg-1" },
      data: { seenIds: { set: [] } },
    });
    expect(mockPrisma.message.update).toHaveBeenCalledWith({
      where: { id: "msg-2" },
      data: { seenIds: { set: [otherUserId] } },
    });
  });

  it("returns 500 when prisma throws", async () => {
    mockedGetSession.mockResolvedValue({
      user: { email: "me@test.com" },
    });
    mockPrisma.user.findUnique.mockRejectedValue(new Error("db down"));
    const res = await DELETE();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Failed to delete account" });
  });
});
