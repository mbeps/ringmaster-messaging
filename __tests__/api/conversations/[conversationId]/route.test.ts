import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPrisma } from "../../../mocks/prisma";

Object.assign(mockPrisma.conversation, {
  deleteMany: vi.fn(),
});

vi.mock("@/libs/prismadb", () => ({ __esModule: true, default: mockPrisma }));

const { mockPusherTrigger } = vi.hoisted(() => ({ mockPusherTrigger: vi.fn() }));
vi.mock("@/libs/pusher", () => ({
  pusherServer: { trigger: mockPusherTrigger },
}));

const mockGetCurrentUser = vi.fn();
vi.mock("@/actions/getCurrentUser", () => ({
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
    expect(mockPrisma.conversation.findUnique).not.toHaveBeenCalled();
  });

  it("returns 400 when the conversation does not exist", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "me" });
    mockPrisma.conversation.findUnique.mockResolvedValue(null);
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
    mockPrisma.conversation.findUnique.mockResolvedValue(existing);
    const deleted = { count: 1 };
    mockPrisma.conversation.deleteMany.mockResolvedValue(deleted);

    const res = await DELETE(new Request("http://localhost/x"), params("c1"));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(deleted);
    expect(mockPrisma.conversation.deleteMany).toHaveBeenCalledWith({
      where: { id: "c1", userIds: { hasSome: ["me"] } },
    });
    // only users with an email get a pusher event
    expect(mockPusherTrigger).toHaveBeenCalledTimes(1);
    expect(mockPusherTrigger).toHaveBeenCalledWith(
      "me@test.com",
      "conversation:remove",
      existing
    );
  });

  it("returns null json when deleteMany throws", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "me" });
    mockPrisma.conversation.findUnique.mockResolvedValue({
      id: "c1",
      users: [],
    });
    mockPrisma.conversation.deleteMany.mockRejectedValue(
      new Error("db down")
    );
    const res = await DELETE(new Request("http://localhost/x"), params("c1"));
    expect(res.status).toBe(200);
    expect(await res.json()).toBeNull();
  });

  it("returns null json when prisma throws", async () => {
    mockGetCurrentUser.mockRejectedValue(new Error("db down"));
    const res = await DELETE(new Request("http://localhost/x"), params("c1"));
    expect(res.status).toBe(200);
    expect(await res.json()).toBeNull();
  });
});
