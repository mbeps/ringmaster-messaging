import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockConversationRepository, mockPusherTrigger, mockGetCurrentUser } = vi.hoisted(() => ({
  mockConversationRepository: {
    createGroup: vi.fn(),
    findSingleBetweenUsers: vi.fn(),
    createSingle: vi.fn(),
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
    expect(mockConversationRepository.createGroup).not.toHaveBeenCalled();
    expect(mockConversationRepository.createSingle).not.toHaveBeenCalled();
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
    mockConversationRepository.createGroup.mockResolvedValue(created);

    const res = await post({
      isGroup: true,
      name: "Group",
      members: [{ value: "a" }, { value: "b" }],
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(created);
    expect(mockConversationRepository.createGroup).toHaveBeenCalledWith(
      "Group",
      true,
      ["a", "b", "me"]
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
    mockConversationRepository.findSingleBetweenUsers.mockResolvedValue(existing);

    const res = await post({ userId: "other" });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(existing);
    expect(mockConversationRepository.createSingle).not.toHaveBeenCalled();
    expect(mockConversationRepository.findSingleBetweenUsers).toHaveBeenCalledWith(
      "me",
      "other"
    );
  });

  it("creates a new single conversation when none exists", async () => {
    mockGetCurrentUser.mockResolvedValue(currentUser);
    mockConversationRepository.findSingleBetweenUsers.mockResolvedValue(null);
    const created = {
      id: "conv-2",
      users: [
        { id: "me", email: "me@test.com" },
        { id: "other", email: "other@test.com" },
      ],
    };
    mockConversationRepository.createSingle.mockResolvedValue(created);

    const res = await post({ userId: "other" });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(created);
    expect(mockConversationRepository.createSingle).toHaveBeenCalledWith(
      "me",
      "other"
    );
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

  it("returns 500 when repository throws", async () => {
    mockGetCurrentUser.mockResolvedValue(currentUser);
    mockConversationRepository.findSingleBetweenUsers.mockRejectedValue(new Error("db down"));
    const res = await post({ userId: "other" });
    expect(res.status).toBe(500);
  });

  it("returns 500 when creating a single conversation fails", async () => {
    mockGetCurrentUser.mockResolvedValue(currentUser);
    mockConversationRepository.findSingleBetweenUsers.mockResolvedValue(null);
    mockConversationRepository.createSingle.mockRejectedValue(new Error("db down"));

    const res = await post({ userId: "other" });

    expect(res.status).toBe(500);
    expect(mockPusherTrigger).not.toHaveBeenCalled();
  });

  it("returns 400 for a group without a name", async () => {
    mockGetCurrentUser.mockResolvedValue(currentUser);
    const res = await post({ isGroup: true, members: [{ value: "a" }] });
    expect(res.status).toBe(400);
    expect(mockConversationRepository.createGroup).not.toHaveBeenCalled();
  });

  it("returns 400 for an empty members list in a group", async () => {
    mockGetCurrentUser.mockResolvedValue(currentUser);
    const res = await post({ isGroup: true, name: "Group", members: [] });
    expect(res.status).toBe(400);
    expect(await res.text()).toContain("members are required");
  });
});
