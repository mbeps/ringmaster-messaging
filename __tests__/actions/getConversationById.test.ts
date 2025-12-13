import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockPrisma, resetPrismaMocks } from "../mocks/prisma";

vi.mock("@/libs/prismadb", () => ({
  __esModule: true,
  default: mockPrisma,
}));

vi.mock("@/actions/getCurrentUser", () => ({
  __esModule: true,
  default: vi.fn(),
}));

import getConversationById from "@/actions/getConversationById";
import getCurrentUser from "@/actions/getCurrentUser";

type MockedFn = ReturnType<typeof vi.fn>;
const mockedGetCurrentUser = getCurrentUser as unknown as MockedFn;

describe("getConversationById", () => {
  beforeEach(() => {
    resetPrismaMocks();
    mockedGetCurrentUser.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when the user is not authenticated", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    const result = await getConversationById("test-id");

    expect(result).toBeNull();
    expect(mockPrisma.conversation.findUnique).not.toHaveBeenCalled();
  });

  it("returns the conversation when the user is authenticated", async () => {
    const mockConversation = { id: "abc", users: [] };
    mockedGetCurrentUser.mockResolvedValue({ email: "user@test.com" });
    (mockPrisma.conversation.findUnique as any).mockResolvedValue(
      mockConversation
    );

    const result = await getConversationById("abc");

    expect(result).toEqual(mockConversation);
    expect(mockPrisma.conversation.findUnique).toHaveBeenCalledWith({
      where: { id: "abc" },
      include: { users: true },
    });
  });

  it("returns null and logs when prisma throws", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    mockedGetCurrentUser.mockResolvedValue({ email: "user@test.com" });
    (mockPrisma.conversation.findUnique as any).mockRejectedValue(
      new Error("db error")
    );

    const result = await getConversationById("abc");

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      "SERVER_ERROR: ",
      new Error("db error")
    );
  });
});
