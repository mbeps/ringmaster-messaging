import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPrisma } from "../../../mocks/prisma";

Object.assign(mockPrisma.message, { update: vi.fn() });

vi.mock("@/libs/prismadb", () => ({ __esModule: true, default: mockPrisma }));

const { mockPusherTrigger } = vi.hoisted(() => ({ mockPusherTrigger: vi.fn() }));
vi.mock("@/libs/pusher", () => ({
  pusherServer: { trigger: mockPusherTrigger },
}));

const mockGetCurrentUser = vi.fn();
vi.mock("@/actions/getCurrentUser", () => ({
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
    expect(mockPrisma.conversation.findUnique).not.toHaveBeenCalled();
  });

  it("returns 401 when the user has an id but no email", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "me" });
    const res = await call("c1");
    expect(res.status).toBe(401);
    expect(mockPrisma.conversation.findUnique).not.toHaveBeenCalled();
  });

  it("returns 400 when the conversation does not exist", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "me", email: "me@test.com" });
    mockPrisma.conversation.findUnique.mockResolvedValue(null);
    const res = await call("c1");
    expect(res.status).toBe(400);
    expect(await res.text()).toBe("Invalid ID");
  });

  it("returns the conversation when there are no messages", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "me", email: "me@test.com" });
    const conversation = { id: "c1", messages: [], users: [] };
    mockPrisma.conversation.findUnique.mockResolvedValue(conversation);

    const res = await call("c1");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(conversation);
    expect(mockPrisma.message.update).not.toHaveBeenCalled();
  });

  it("marks the last message seen and triggers pusher events", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "me", email: "me@test.com" });
    const lastMessage = { id: "m2", seenIds: ["other"] };
    const conversation = {
      id: "c1",
      users: [{ id: "me" }],
      messages: [{ id: "m1", seenIds: [] }, lastMessage],
    };
    mockPrisma.conversation.findUnique.mockResolvedValue(conversation);
    const updatedMessage = { ...lastMessage, seenIds: ["other", "me"] };
    mockPrisma.message.update.mockResolvedValue(updatedMessage);

    const res = await call("c1");

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Success");
    expect(mockPrisma.message.update).toHaveBeenCalledWith({
      where: { id: "m2" },
      include: { sender: true, seen: true },
      data: { seen: { connect: { id: "me" } } },
    });
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
    mockPrisma.conversation.findUnique.mockResolvedValue(conversation);
    mockPrisma.message.update.mockResolvedValue(conversation.messages[0]);

    const res = await call("c1");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(conversation);
    expect(mockPusherTrigger).toHaveBeenCalledTimes(1); // only conversation:update
  });

  it("returns 500 when prisma throws", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "me", email: "me@test.com" });
    mockPrisma.conversation.findUnique.mockRejectedValue(new Error("db down"));
    const res = await call("c1");
    expect(res.status).toBe(500);
  });
});
