import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPrisma } from "../mocks/prisma";

Object.assign(mockPrisma.message, { create: vi.fn() });
Object.assign(mockPrisma.conversation, { update: vi.fn() });

vi.mock("@/libs/prismadb", () => ({ __esModule: true, default: mockPrisma }));

const { mockPusherTrigger } = vi.hoisted(() => ({ mockPusherTrigger: vi.fn() }));
vi.mock("@/libs/pusher", () => ({
  pusherServer: { trigger: mockPusherTrigger },
}));

const mockGetCurrentUser = vi.fn();
vi.mock("@/actions/getCurrentUser", () => ({
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
    expect(mockPrisma.message.create).not.toHaveBeenCalled();
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
    mockPrisma.message.create.mockResolvedValue(newMessage);
    const updatedConversation = {
      id: "c1",
      users: [
        { id: "me", email: "me@test.com" },
        { id: "other", email: "other@test.com" },
      ],
      messages: [{ id: "m-old" }, newMessage],
    };
    mockPrisma.conversation.update.mockResolvedValue(updatedConversation);

    const res = await post({ message: "hi", conversationId: "c1" });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(newMessage);
    expect(mockPrisma.message.create).toHaveBeenCalledWith({
      include: { seen: true, sender: true },
      data: {
        body: "hi",
        image: undefined,
        conversation: { connect: { id: "c1" } },
        sender: { connect: { id: "me" } },
        seen: { connect: { id: "me" } },
      },
    });
    expect(mockPrisma.conversation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "c1" },
        data: expect.objectContaining({
          messages: { connect: { id: "m-new" } },
        }),
      })
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
    mockPrisma.message.create.mockResolvedValue(newMessage);
    mockPrisma.conversation.update.mockResolvedValue({
      id: "c1",
      users: [],
      messages: [newMessage],
    });

    const res = await post({ image: "https://img/x.png", conversationId: "c1" });

    expect(res.status).toBe(200);
    expect(mockPrisma.message.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          body: undefined,
          image: "https://img/x.png",
        }),
      })
    );
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
    expect(await res.text()).toBe("Required");
    expect(mockPrisma.message.create).not.toHaveBeenCalled();
  });

  it("returns 400 when body is null", async () => {
    mockGetCurrentUser.mockResolvedValue(currentUser);
    const res = await post(null);
    expect(res.status).toBe(400); // zod rejects null before any db call
    expect(mockPrisma.message.create).not.toHaveBeenCalled();
  });

  it("returns 500 when prisma throws", async () => {
    mockGetCurrentUser.mockResolvedValue(currentUser);
    mockPrisma.message.create.mockRejectedValue(new Error("db down"));
    const res = await post({ message: "hi", conversationId: "c1" });
    expect(res.status).toBe(500);
  });
});
