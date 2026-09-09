import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPrisma } from "../mocks/prisma";

Object.assign(mockPrisma.conversation, { create: vi.fn() });

vi.mock("@/libs/prismadb", () => ({ __esModule: true, default: mockPrisma }));

const { mockPusherTrigger } = vi.hoisted(() => ({ mockPusherTrigger: vi.fn() }));
export { mockPusherTrigger };
vi.mock("@/libs/pusher", () => ({
  pusherServer: { trigger: mockPusherTrigger },
}));

const mockGetCurrentUser = vi.fn();
vi.mock("@/actions/getCurrentUser", () => ({
  default: (...args: unknown[]) => mockGetCurrentUser(...args),
}));

import { POST } from "@/app/api/conversations/route";

const currentUser = { id: "me", email: "me@test.com" };

const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/conversations", {
      method: "POST",
      body: JSON.stringify(body),
    })
  );

describe("POST /api/conversations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const res = await post({ userId: "other" });
    expect(res.status).toBe(400);
    expect(mockPrisma.conversation.create).not.toHaveBeenCalled();
  });

  it("returns 400 on zod validation failure (group without members)", async () => {
    mockGetCurrentUser.mockResolvedValue(currentUser);
    const res = await post({ isGroup: true, name: "Group" });
    expect(res.status).toBe(400);
    expect(await res.text()).toContain("members are required");
  });

  it("creates a group conversation and triggers pusher for each member", async () => {
    mockGetCurrentUser.mockResolvedValue(currentUser);
    const created = {
      id: "conv-g",
      name: "Group",
      isGroup: true,
      users: [
        { id: "a", email: "a@test.com" },
        { id: "b", email: null },
        { id: "me", email: "me@test.com" },
      ],
    };
    mockPrisma.conversation.create.mockResolvedValue(created);

    const res = await post({
      isGroup: true,
      name: "Group",
      members: [{ value: "a" }, { value: "b" }],
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(created);
    expect(mockPrisma.conversation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Group",
          isGroup: true,
          users: {
            connect: [
              { id: "a" },
              { id: "b" },
              { id: "me" },
            ],
          },
        }),
      })
    );
    // only users with an email get a pusher event
    expect(mockPusherTrigger).toHaveBeenCalledTimes(2);
    expect(mockPusherTrigger).toHaveBeenCalledWith(
      "a@test.com",
      "conversation:new",
      created
    );
  });

  it("returns 400 for single chat when userId is missing", async () => {
    mockGetCurrentUser.mockResolvedValue(currentUser);
    const res = await post({});
    expect(res.status).toBe(400);
    expect(await res.text()).toBe("UserId required");
  });

  it("returns the existing single conversation when one already exists", async () => {
    mockGetCurrentUser.mockResolvedValue(currentUser);
    const existing = { id: "conv-1", users: [] };
    mockPrisma.conversation.findMany.mockResolvedValue([existing]);

    const res = await post({ userId: "other" });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(existing);
    expect(mockPrisma.conversation.create).not.toHaveBeenCalled();
    expect(mockPrisma.conversation.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { userIds: { equals: ["me", "other"] } },
          { userIds: { equals: ["other", "me"] } },
        ],
      },
    });
  });

  it("creates a new single conversation when none exists", async () => {
    mockGetCurrentUser.mockResolvedValue(currentUser);
    mockPrisma.conversation.findMany.mockResolvedValue([]);
    const created = {
      id: "conv-2",
      users: [
        { id: "me", email: "me@test.com" },
        { id: "other", email: "other@test.com" },
      ],
    };
    mockPrisma.conversation.create.mockResolvedValue(created);

    const res = await post({ userId: "other" });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(created);
    expect(mockPrisma.conversation.create).toHaveBeenCalledWith({
      data: { users: { connect: [{ id: "me" }, { id: "other" }] } },
      include: { users: true },
    });
    expect(mockPusherTrigger).toHaveBeenCalledWith(
      "me@test.com",
      "conversation:new",
      created
    );
    expect(mockPusherTrigger).toHaveBeenCalledWith(
      "other@test.com",
      "conversation:new",
      created
    );
  });

  it("returns 500 when prisma throws", async () => {
    mockGetCurrentUser.mockResolvedValue(currentUser);
    mockPrisma.conversation.findMany.mockRejectedValue(new Error("db down"));
    const res = await post({ userId: "other" });
    expect(res.status).toBe(500);
  });

  it("returns 500 when creating a single conversation fails", async () => {
    mockGetCurrentUser.mockResolvedValue(currentUser);
    mockPrisma.conversation.findMany.mockResolvedValue([]);
    mockPrisma.conversation.create.mockRejectedValue(new Error("db down"));

    const res = await post({ userId: "other" });

    expect(res.status).toBe(500);
    expect(mockPusherTrigger).not.toHaveBeenCalled();
  });

  it("returns 400 for a group without a name", async () => {
    mockGetCurrentUser.mockResolvedValue(currentUser);
    const res = await post({ isGroup: true, members: [{ value: "a" }] });
    expect(res.status).toBe(400);
    expect(mockPrisma.conversation.create).not.toHaveBeenCalled();
  });

  it("returns 400 for an empty members list in a group", async () => {
    mockGetCurrentUser.mockResolvedValue(currentUser);
    const res = await post({ isGroup: true, name: "Group", members: [] });
    expect(res.status).toBe(400);
    expect(await res.text()).toContain("members are required");
  });
});
