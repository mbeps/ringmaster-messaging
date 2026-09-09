import { describe, expect, it, beforeEach, vi } from "vitest";
import { mockPrisma, resetPrismaMocks } from "../mocks/prisma";

vi.mock("@/libs/prismadb", () => ({
  __esModule: true,
  default: mockPrisma,
}));

vi.mock("@/actions/getCurrentUser", () => ({
  __esModule: true,
  default: vi.fn(),
}));

import getConversations from "@/actions/getConversations";
import getCurrentUser from "@/actions/getCurrentUser";

type MockedFn = ReturnType<typeof vi.fn>;
const mockedGetCurrentUser = getCurrentUser as unknown as MockedFn;

describe("getConversations", () => {
  beforeEach(() => {
    resetPrismaMocks();
    mockedGetCurrentUser.mockReset();
  });

  it("returns an empty array when the user is missing", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    const result = await getConversations();

    expect(result).toEqual([]);
    expect(mockPrisma.conversation.findMany).not.toHaveBeenCalled();
  });

  it("returns conversations when the user exists", async () => {
    const mockConversations = [{ id: "1" }];
    mockedGetCurrentUser.mockResolvedValue({ id: "user-1" });
    (mockPrisma.conversation.findMany as any).mockResolvedValue(
      mockConversations
    );

    const result = await getConversations();

    expect(result).toEqual(mockConversations);
    expect(mockPrisma.conversation.findMany).toHaveBeenCalledWith({
      orderBy: { lastMessageAt: "desc" },
      where: { userIds: { has: "user-1" } },
      include: {
        users: true,
        messages: {
          include: {
            sender: true,
            seen: true,
          },
        },
      },
    });
  });

  it("returns an empty array when prisma throws", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "user-1" });
    (mockPrisma.conversation.findMany as any).mockRejectedValue(
      new Error("db")
    );

    const result = await getConversations();

    expect(result).toEqual([]);
  });

  it("returns an empty array when the user has no id", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "" });

    const result = await getConversations();

    expect(result).toEqual([]);
    expect(mockPrisma.conversation.findMany).not.toHaveBeenCalled();
  });

  it("returns an empty array when getCurrentUser resolves to an object without id", async () => {
    mockedGetCurrentUser.mockResolvedValue({ email: "x@test.com" });

    const result = await getConversations();

    expect(result).toEqual([]);
    expect(mockPrisma.conversation.findMany).not.toHaveBeenCalled();
  });

  it("queries conversations ordered by lastMessageAt descending", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "user-9" });
    (mockPrisma.conversation.findMany as any).mockResolvedValue([]);

    await getConversations();

    expect(mockPrisma.conversation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { lastMessageAt: "desc" },
        where: { userIds: { has: "user-9" } },
      })
    );
  });

  it("returns an empty array when the user has no conversations", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "user-1" });
    (mockPrisma.conversation.findMany as any).mockResolvedValue([]);

    const result = await getConversations();

    expect(result).toEqual([]);
  });
});
